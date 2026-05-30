import axios from "axios";
import * as https from "https";
import * as http from "http";
import { URL } from "url";

const AUDD_URL = "https://api.audd.io/";
const SEGMENT_LIMIT_BYTES = 300_000;
const FETCH_TIMEOUT_MS = 10_000;
const AUDD_TIMEOUT_MS = 15_000;
const MAX_REDIRECTS = 10;
const USER_AGENT = "RadioApp/1.0";

interface FetchResult {
  contentType: string;
  finalUrl: string;
  body: Buffer;
}

function fetchBytes(startUrl: string, maxBytes: number): Promise<FetchResult | null> {
  return new Promise((resolve) => {
    let settled = false;
    let redirectCount = 0;
    let activeReq: http.ClientRequest | null = null;
    const chunks: Buffer[] = [];
    let totalBytes = 0;
    let contentType = "";
    let finalUrl = startUrl;

    const timer = setTimeout(() => settle(null), FETCH_TIMEOUT_MS);

    function settle(body: Buffer | null) {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      activeReq?.destroy();
      resolve(body ? { contentType, finalUrl, body } : null);
    }

    function attempt(url: string) {
      if (redirectCount > MAX_REDIRECTS) { settle(null); return; }

      let parsed: URL;
      try { parsed = new URL(url); } catch { settle(null); return; }

      finalUrl = url;
      const lib = parsed.protocol === "https:" ? https : http;

      activeReq = lib.request(
        {
          hostname: parsed.hostname,
          port: parsed.port || (parsed.protocol === "https:" ? 443 : 80),
          path: parsed.pathname + parsed.search,
          method: "GET",
          headers: { "User-Agent": USER_AGENT },
        },
        (res) => {
          if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400) {
            res.resume();
            const location = res.headers["location"];
            if (!location) { settle(null); return; }
            redirectCount++;
            attempt(new URL(location, url).toString());
            return;
          }

          contentType = (res.headers["content-type"] as string) ?? "";

          res.on("data", (chunk: Buffer) => {
            chunks.push(chunk);
            totalBytes += chunk.length;
            if (totalBytes >= maxBytes) settle(Buffer.concat(chunks));
          });

          res.on("error", () => settle(null));
          res.on("end", () => settle(chunks.length > 0 ? Buffer.concat(chunks) : null));
        }
      );

      activeReq.on("error", () => settle(null));
      activeReq.end();
    }

    attempt(startUrl);
  });
}

function isHls(contentType: string, url: string): boolean {
  return contentType.includes("mpegurl") || url.includes(".m3u8");
}

function parseLastSegmentUrl(playlist: string, playlistUrl: string): string | null {
  const segments = playlist
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"));

  const last = segments[segments.length - 1];
  if (!last) return null;

  try {
    return new URL(last, playlistUrl).toString();
  } catch {
    return null;
  }
}

async function downloadAudioChunk(streamUrl: string): Promise<Buffer | null> {
  let currentUrl = streamUrl;

  // Follow up to 3 levels of HLS playlists before expecting actual audio
  for (let depth = 0; depth < 3; depth++) {
    const result = await fetchBytes(currentUrl, SEGMENT_LIMIT_BYTES);
    if (!result) return null;

    if (!isHls(result.contentType, result.finalUrl)) {
      return result.body.length > 1000 ? result.body : null;
    }

    const nextUrl = parseLastSegmentUrl(result.body.toString("utf8"), result.finalUrl);
    if (!nextUrl) { console.log(`[AudD] HLS depth=${depth}: no segments in playlist`); return null; }

    console.log(`[AudD] HLS depth=${depth}: ${nextUrl}`);
    currentUrl = nextUrl;
  }

  return null;
}

type AuddResult = { artist: string; title: string };
type AuddResponse = { status: "success" | "error"; result: AuddResult | null };

export async function recognizeSong(streamUrl: string): Promise<string | null> {
  const token = process.env["AUDD_API_TOKEN"];
  if (!token) return null;

  const audioChunk = await downloadAudioChunk(streamUrl);
  if (!audioChunk) { console.log("[AudD] failed to get audio chunk"); return null; }

  console.log(`[AudD] sending ${audioChunk.length} bytes to AudD...`);

  try {
    const form = new FormData();
    form.append("api_token", token);
    form.append("file", new Blob([new Uint8Array(audioChunk)]), "stream");

    const response = await axios.post<AuddResponse>(AUDD_URL, form, {
      timeout: AUDD_TIMEOUT_MS,
    });

    console.log("[AudD] response:", JSON.stringify(response.data));
    const result = response.data?.result;
    if (!result) return null;
    return `${result.artist} — ${result.title}`;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.log("[AudD] error:", msg);
    return null;
  }
}

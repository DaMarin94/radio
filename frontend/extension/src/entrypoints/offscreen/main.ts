import type { BackgroundMessage, OffscreenMessage } from '../../lib/messages';
import { StreamRetry } from '@radio/shared';

function isOffscreenMessage(m: unknown): m is OffscreenMessage {
  return typeof m === 'object' && m !== null && (m as Record<string, unknown>).target === 'offscreen';
}

const audio = document.getElementById('radio-audio') as HTMLAudioElement;
const retry = new StreamRetry();
let currentUrl: string | null = null;

function sendBuffering(buffering: boolean) {
  browser.runtime.sendMessage({ target: 'background', type: 'AUDIO_STATUS', buffering } satisfies BackgroundMessage).catch(() => {});
}

const scheduleRetry = () => {
  if (!currentUrl) return;
  const url = currentUrl;
  sendBuffering(true);
  retry.schedule(() => {
    audio.src = url;
    audio.play().catch(console.error);
  });
};

audio.addEventListener('loadstart', () => sendBuffering(true));
audio.addEventListener('waiting', () => sendBuffering(true));
audio.addEventListener('stalled', () => sendBuffering(true));
audio.addEventListener('playing', () => {
  retry.reset();
  sendBuffering(false);
});
audio.addEventListener('error', scheduleRetry);
audio.addEventListener('ended', scheduleRetry);

browser.runtime.onMessage.addListener((msg) => {
  if (!isOffscreenMessage(msg)) return;

  if (msg.type === 'AUDIO_PLAY') {
    retry.reset();
    currentUrl = msg.url;
    audio.volume = msg.volume;
    if (audio.src !== msg.url) audio.src = msg.url;
    audio.play().catch(console.error);
  } else if (msg.type === 'AUDIO_PAUSE') {
    retry.reset();
    currentUrl = null;
    audio.pause();
  } else if (msg.type === 'AUDIO_SET_VOLUME') {
    audio.volume = msg.volume;
  }
});

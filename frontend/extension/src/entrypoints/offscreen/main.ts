import type { OffscreenMessage } from '../../lib/messages';
import { StreamRetry } from '@radio/shared';

function isOffscreenMessage(m: unknown): m is OffscreenMessage {
  return typeof m === 'object' && m !== null && (m as Record<string, unknown>).target === 'offscreen';
}

const audio = document.getElementById('radio-audio') as HTMLAudioElement;
const retry = new StreamRetry();
let currentUrl: string | null = null;

const scheduleRetry = () => {
  if (!currentUrl) return;
  const url = currentUrl;
  retry.schedule(() => {
    audio.src = url;
    audio.play().catch(console.error);
  });
};

audio.addEventListener('error', scheduleRetry);
audio.addEventListener('ended', scheduleRetry);
audio.addEventListener('playing', () => retry.reset());

browser.runtime.onMessage.addListener((msg) => {
  if (!isOffscreenMessage(msg)) return;

  if (msg.type === 'AUDIO_PLAY') {
    retry.reset();
    currentUrl = msg.url;
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

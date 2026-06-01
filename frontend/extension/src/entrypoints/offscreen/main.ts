import type { OffscreenMessage } from '../../lib/messages';

function isOffscreenMessage(m: unknown): m is OffscreenMessage {
  return typeof m === 'object' && m !== null && (m as Record<string, unknown>).target === 'offscreen';
}

const audio = document.getElementById('radio-audio') as HTMLAudioElement;

browser.runtime.onMessage.addListener((msg) => {
  if (!isOffscreenMessage(msg)) return;

  if (msg.type === 'AUDIO_PLAY') {
    if (audio.src !== msg.url) audio.src = msg.url;
    audio.play().catch(console.error);
  } else if (msg.type === 'AUDIO_PAUSE') {
    audio.pause();
  } else if (msg.type === 'AUDIO_SET_VOLUME') {
    audio.volume = msg.volume;
  }
});

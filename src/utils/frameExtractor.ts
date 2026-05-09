import type { ExtractedFrame, VideoInfo } from '../types';

export type { ExtractedFrame, VideoInfo };

export async function extractFrames(
  file: File,
  count = 8,
  onProgress?: (pct: number) => void
): Promise<{ frames: ExtractedFrame[]; info: VideoInfo }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.src = url;
    video.muted = true;
    video.preload = 'metadata';

    video.addEventListener('error', () => reject(new Error('Falha ao carregar vídeo')));

    video.addEventListener('loadedmetadata', async () => {
      const duration = video.duration;
      const width = video.videoWidth;
      const height = video.videoHeight;

      const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
      const g = gcd(width, height);
      const aspect = `${width / g}:${height / g}`;

      const info: VideoInfo = {
        fileName: file.name,
        width,
        height,
        duration,
        fps: 30,
        aspect,
      };

      const canvas = document.createElement('canvas');
      canvas.width = Math.min(width, 640);
      canvas.height = Math.round((canvas.width / width) * height);
      const ctx = canvas.getContext('2d')!;

      const frames: ExtractedFrame[] = [];
      const interval = duration / (count + 1);

      for (let i = 0; i < count; i++) {
        const time = interval * (i + 1);
        await seekToTime(video, time);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        frames.push({
          id: `frame-${i}`,
          timeSeconds: time,
          dataUrl,
        });
        onProgress?.((i + 1) / count * 100);
      }

      URL.revokeObjectURL(url);
      resolve({ frames, info });
    });
  });
}

function seekToTime(video: HTMLVideoElement, time: number): Promise<void> {
  return new Promise((resolve) => {
    const onSeeked = () => {
      video.removeEventListener('seeked', onSeeked);
      setTimeout(resolve, 80);
    };
    video.addEventListener('seeked', onSeeked);
    video.currentTime = time;
  });
}

export function formatDuration(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

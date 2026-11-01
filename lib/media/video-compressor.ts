/**
 * Client-Side Video Compressor & Optimizer
 * Compresses raw video in browser using HTML5 Video + Canvas + MediaRecorder
 * Decreases payload size significantly before sending over network.
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  bitrate?: number; // e.g., 1_000_000 for 1 Mbps
  fps?: number;
}

export async function compressVideo(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const {
    maxWidth = 1280,
    maxHeight = 720,
    bitrate = 1_200_000,
    fps = 30,
  } = options;

  // If browser doesn't support MediaRecorder or Canvas capture, return original file safely
  if (typeof window === "undefined" || !("MediaRecorder" in window)) {
    return file;
  }

  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const objectUrl = URL.createObjectURL(file);
    video.src = objectUrl;
    video.muted = true;
    video.playsInline = true;

    video.onloadedmetadata = async () => {
      let width = video.videoWidth || 1280;
      let height = video.videoHeight || 720;

      // Scale down proportionally if larger than maximums
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      if (height > maxHeight) {
        width = Math.round((width * maxHeight) / height);
        height = maxHeight;
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        URL.revokeObjectURL(objectUrl);
        return resolve(file);
      }

      const stream = canvas.captureStream(fps);

      let mimeType = "video/webm;codecs=vp9";
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = "video/webm;codecs=vp8";
      }
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = "video/webm";
      }
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = "video/mp4";
      }

      let mediaRecorder: MediaRecorder;
      try {
        mediaRecorder = new MediaRecorder(stream, {
          mimeType,
          videoBitsPerSecond: bitrate,
        });
      } catch {
        URL.revokeObjectURL(objectUrl);
        return resolve(file); // Fallback to original
      }

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        URL.revokeObjectURL(objectUrl);
        const compressedBlob = new Blob(chunks, { type: mimeType });

        // If compressed file is actually smaller, use it; otherwise use original
        if (compressedBlob.size > 0 && compressedBlob.size < file.size) {
          const extension = mimeType.includes("mp4") ? ".mp4" : ".webm";
          const compressedFile = new File(
            [compressedBlob],
            file.name.replace(/\.[^/.]+$/, "") + "-compressed" + extension,
            { type: mimeType }
          );
          resolve(compressedFile);
        } else {
          resolve(file);
        }
      };

      mediaRecorder.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(file);
      };

      video.play().catch(() => resolve(file));

      function drawFrame() {
        if (!video.paused && !video.ended) {
          ctx!.drawImage(video, 0, 0, width, height);
          requestAnimationFrame(drawFrame);
        }
      }

      video.onplay = () => {
        mediaRecorder.start();
        drawFrame();
      };

      video.onended = () => {
        if (mediaRecorder.state !== "inactive") {
          mediaRecorder.stop();
        }
      };
    };

    video.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };
  });
}


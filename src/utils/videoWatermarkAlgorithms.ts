// Video Watermarking using Image DCT+QIM+DWT+SVD algorithms
// Applies watermark every 30 frames (1 second at 30fps) across 3 adjacent frames

import { WatermarkProcessor, type WatermarkKey } from './watermarkAlgorithms';

export class VideoWatermarkProcessor {
  // Extract frames from video at specified interval
  static async extractFrames(
    videoFile: File,
    frameInterval: number = 30
  ): Promise<{ frames: ImageData[]; fps: number; width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      const frames: ImageData[] = [];
      let currentFrame = 0;
      const url = URL.createObjectURL(videoFile);
      
      video.onloadedmetadata = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const fps = 30; // Assume 30fps, adjust if needed
        const duration = video.duration;
        const totalFrames = Math.floor(duration * fps);
        
        const captureFrame = () => {
          if (currentFrame >= totalFrames) {
            URL.revokeObjectURL(url);
            resolve({
              frames,
              fps,
              width: video.videoWidth,
              height: video.videoHeight
            });
            return;
          }
          
          video.currentTime = currentFrame / fps;
        };
        
        video.onseeked = () => {
          ctx.drawImage(video, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          frames.push(imageData);
          
          currentFrame += frameInterval;
          captureFrame();
        };
        
        captureFrame();
      };
      
      video.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Error loading video'));
      };
      
      video.src = url;
      video.load();
    });
  }

  // Embed watermark in video
  static async embedWatermark(
    videoFile: File,
    key: WatermarkKey,
    onProgress?: (progress: number) => void
  ): Promise<Blob> {
    // Extract frames every 30 frames
    const { frames, fps, width, height } = await this.extractFrames(videoFile, 30);
    
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }

    // Process video frame by frame
    const video = document.createElement('video');
    const url = URL.createObjectURL(videoFile);
    
    return new Promise((resolve, reject) => {
      video.onloadedmetadata = async () => {
        const mediaRecorder = await this.createMediaRecorder(canvas, video);
        const chunks: Blob[] = [];
        
        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            chunks.push(e.data);
          }
        };
        
        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'video/webm' });
          URL.revokeObjectURL(url);
          resolve(blob);
        };
        
        mediaRecorder.start();
        
        let currentFrame = 0;
        const totalFrames = Math.floor(video.duration * fps);
        let watermarkedImageData: ImageData | null = null;
        let watermarkFrameIndex = 0;
        
        const processFrame = async () => {
          if (currentFrame >= totalFrames) {
            mediaRecorder.stop();
            return;
          }
          
          video.currentTime = currentFrame / fps;
          
          await new Promise<void>((resolveSeeked) => {
            video.onseeked = async () => {
              ctx.drawImage(video, 0, 0, width, height);
              let frameData = ctx.getImageData(0, 0, width, height);
              
              // Apply watermark every 30 frames, repeated across 3 frames
              const frameInCycle = currentFrame % 30;
              
              if (frameInCycle === 0) {
                // This is a watermark frame, embed watermark
                watermarkedImageData = await WatermarkProcessor.embedWatermark(frameData, key);
                frameData = watermarkedImageData;
                watermarkFrameIndex = 0;
              } else if (frameInCycle === 1 || frameInCycle === 2) {
                // Repeat the same watermark for adjacent frames
                if (watermarkedImageData) {
                  frameData = watermarkedImageData;
                }
              }
              // For other frames (3-29), use original frame without watermark
              
              ctx.putImageData(frameData, 0, 0);
              
              currentFrame++;
              if (onProgress) {
                onProgress((currentFrame / totalFrames) * 100);
              }
              
              resolveSeeked();
            };
          });
          
          // Continue to next frame
          setTimeout(processFrame, 1000 / fps);
        };
        
        processFrame();
      };
      
      video.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Error processing video'));
      };
      
      video.src = url;
      video.load();
    });
  }

  // Create MediaRecorder for video reconstruction
  private static async createMediaRecorder(
    canvas: HTMLCanvasElement,
    video: HTMLVideoElement
  ): Promise<MediaRecorder> {
    const stream = canvas.captureStream(30); // 30 fps
    
    // Try to add audio from original video
    try {
      const videoStream = (video as any).captureStream?.();
      if (videoStream) {
        const audioTracks = videoStream.getAudioTracks();
        audioTracks.forEach((track: MediaStreamTrack) => {
          stream.addTrack(track);
        });
      }
    } catch (e) {
      console.warn('Could not capture audio from video:', e);
    }
    
    return new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp9',
      videoBitsPerSecond: 2500000
    });
  }

  // Verify watermark in video
  static async verifyWatermark(
    videoFile: File,
    key: WatermarkKey
  ): Promise<{ isWatermarked: boolean; confidence: number; frameResults: number[] }> {
    // Extract frames every 30 frames
    const { frames } = await this.extractFrames(videoFile, 30);
    
    const frameResults: number[] = [];
    let totalConfidence = 0;
    
    // Verify watermark in each extracted frame
    for (const frame of frames) {
      const result = await WatermarkProcessor.extractWatermark(frame, key);
      frameResults.push(result.confidence);
      totalConfidence += result.confidence;
    }
    
    const avgConfidence = totalConfidence / frames.length;
    const isWatermarked = avgConfidence > 0.65; // Same threshold as image
    
    return {
      isWatermarked,
      confidence: avgConfidence,
      frameResults
    };
  }
}

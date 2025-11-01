// Audio Watermarking Algorithms Implementation
// Implements: LSB, Amplitude Modulation, Echo Hiding, Spread Spectrum

export interface AudioWatermarkKey {
  seed: string;
  strength: number;
  delay: number; // for echo hiding
  spreadFactor: number; // for spread spectrum
}

export interface AudioVerificationResult {
  isWatermarked: boolean;
  confidence: number;
  ber: number; // Bit Error Rate
  correlation: number;
  snr: number; // Signal-to-Noise Ratio
  algorithmScores: {
    lsb: number;
    am: number;
    echo: number;
    spreadSpectrum: number;
  };
}

export class AudioWatermarkProcessor {
  // Generate pseudo-random binary watermark from key
  static generateBinaryWatermark(key: AudioWatermarkKey, length: number): number[] {
    const watermark: number[] = [];
    let seed = 0;
    for (let i = 0; i < key.seed.length; i++) {
      seed += key.seed.charCodeAt(i) * (i + 1);
    }
    
    for (let i = 0; i < length; i++) {
      seed = (seed * 9301 + 49297) % 233280;
      watermark.push(seed / 233280 > 0.5 ? 1 : 0);
    }
    
    return watermark;
  }

  // 1. LSB (Least Significant Bit) Substitution
  static embedLSB(audioData: Float32Array, watermark: number[], strength: number = 0.01): Float32Array {
    const watermarked = new Float32Array(audioData.length);
    const sampleInterval = Math.floor(audioData.length / watermark.length);
    
    for (let i = 0; i < audioData.length; i++) {
      watermarked[i] = audioData[i];
      
      const bitIndex = Math.floor(i / sampleInterval);
      if (bitIndex < watermark.length) {
        // Convert to 16-bit integer representation
        const sample16 = Math.round(audioData[i] * 32768);
        // Modify LSB based on watermark bit
        const modifiedSample = (sample16 & ~1) | watermark[bitIndex];
        // Convert back to float with strength factor
        watermarked[i] = audioData[i] + (modifiedSample - sample16) / 32768 * strength;
      }
    }
    
    return watermarked;
  }

  static extractLSB(audioData: Float32Array, watermarkLength: number): number[] {
    const extractedBits: number[] = [];
    const sampleInterval = Math.floor(audioData.length / watermarkLength);
    
    for (let i = 0; i < watermarkLength; i++) {
      const sampleIndex = i * sampleInterval;
      if (sampleIndex < audioData.length) {
        const sample16 = Math.round(audioData[sampleIndex] * 32768);
        extractedBits.push(sample16 & 1);
      }
    }
    
    return extractedBits;
  }

  // 2. Amplitude Modulation (AM) Watermarking
  static embedAM(audioData: Float32Array, watermark: number[], strength: number = 0.05): Float32Array {
    const watermarked = new Float32Array(audioData.length);
    const blockSize = Math.floor(audioData.length / watermark.length);
    
    for (let i = 0; i < watermark.length; i++) {
      const start = i * blockSize;
      const end = Math.min(start + blockSize, audioData.length);
      
      // Calculate block average amplitude
      let avgAmplitude = 0;
      for (let j = start; j < end; j++) {
        avgAmplitude += Math.abs(audioData[j]);
      }
      avgAmplitude /= (end - start);
      
      // Modulate amplitude based on watermark bit
      const modulation = watermark[i] === 1 ? (1 + strength) : (1 - strength);
      for (let j = start; j < end; j++) {
        watermarked[j] = audioData[j] * modulation;
      }
    }
    
    return watermarked;
  }

  static extractAM(audioData: Float32Array, watermarkLength: number, originalAvgAmplitude: number = 0.1): number[] {
    const extractedBits: number[] = [];
    const blockSize = Math.floor(audioData.length / watermarkLength);
    
    for (let i = 0; i < watermarkLength; i++) {
      const start = i * blockSize;
      const end = Math.min(start + blockSize, audioData.length);
      
      let blockAmplitude = 0;
      for (let j = start; j < end; j++) {
        blockAmplitude += Math.abs(audioData[j]);
      }
      blockAmplitude /= (end - start);
      
      // Determine bit based on amplitude comparison
      extractedBits.push(blockAmplitude > originalAvgAmplitude ? 1 : 0);
    }
    
    return extractedBits;
  }

  // 3. Echo Hiding
  static embedEcho(audioData: Float32Array, watermark: number[], delay: number = 100, strength: number = 0.3): Float32Array {
    const watermarked = new Float32Array(audioData.length);
    const blockSize = Math.floor(audioData.length / watermark.length);
    
    // Copy original data
    for (let i = 0; i < audioData.length; i++) {
      watermarked[i] = audioData[i];
    }
    
    for (let i = 0; i < watermark.length; i++) {
      const start = i * blockSize;
      const echoDelay = watermark[i] === 1 ? delay : delay * 2;
      
      for (let j = start; j < Math.min(start + blockSize, audioData.length); j++) {
        const echoIndex = j + echoDelay;
        if (echoIndex < audioData.length) {
          watermarked[echoIndex] += audioData[j] * strength;
        }
      }
    }
    
    return watermarked;
  }

  static extractEcho(audioData: Float32Array, watermarkLength: number, delay: number = 100): number[] {
    const extractedBits: number[] = [];
    const blockSize = Math.floor(audioData.length / watermarkLength);
    
    for (let i = 0; i < watermarkLength; i++) {
      const start = i * blockSize;
      const end = Math.min(start + blockSize, audioData.length);
      
      let correlation1 = 0;
      let correlation2 = 0;
      let count = 0;
      
      for (let j = start; j < end; j++) {
        const index1 = j + delay;
        const index2 = j + delay * 2;
        
        if (index1 < audioData.length) {
          correlation1 += audioData[j] * audioData[index1];
          count++;
        }
        if (index2 < audioData.length) {
          correlation2 += audioData[j] * audioData[index2];
        }
      }
      
      if (count > 0) {
        correlation1 /= count;
        correlation2 /= count;
      }
      
      extractedBits.push(correlation1 > correlation2 ? 1 : 0);
    }
    
    return extractedBits;
  }

  // 4. Spread Spectrum (SS) Watermarking
  static embedSpreadSpectrum(audioData: Float32Array, watermark: number[], key: AudioWatermarkKey): Float32Array {
    const watermarked = new Float32Array(audioData.length);
    const chipRate = Math.floor(audioData.length / watermark.length);
    
    // Generate spreading code
    const spreadingCode = this.generateSpreadingCode(key, chipRate);
    
    for (let i = 0; i < audioData.length; i++) {
      watermarked[i] = audioData[i];
      
      const bitIndex = Math.floor(i / chipRate);
      if (bitIndex < watermark.length) {
        const spreadIndex = i % chipRate;
        const spreadValue = spreadingCode[spreadIndex];
        const bitValue = watermark[bitIndex] === 1 ? 1 : -1;
        
        watermarked[i] += bitValue * spreadValue * key.strength;
      }
    }
    
    return watermarked;
  }

  static extractSpreadSpectrum(audioData: Float32Array, watermarkLength: number, key: AudioWatermarkKey): number[] {
    const extractedBits: number[] = [];
    const chipRate = Math.floor(audioData.length / watermarkLength);
    const spreadingCode = this.generateSpreadingCode(key, chipRate);
    
    for (let i = 0; i < watermarkLength; i++) {
      const start = i * chipRate;
      const end = Math.min(start + chipRate, audioData.length);
      
      let correlation = 0;
      for (let j = start; j < end; j++) {
        const spreadIndex = j - start;
        if (spreadIndex < spreadingCode.length) {
          correlation += audioData[j] * spreadingCode[spreadIndex];
        }
      }
      
      extractedBits.push(correlation > 0 ? 1 : 0);
    }
    
    return extractedBits;
  }

  private static generateSpreadingCode(key: AudioWatermarkKey, length: number): number[] {
    const code: number[] = [];
    let seed = 0;
    
    for (let i = 0; i < key.seed.length; i++) {
      seed += key.seed.charCodeAt(i);
    }
    
    for (let i = 0; i < length; i++) {
      seed = (seed * 1103515245 + 12345) % 2147483648;
      code.push((seed / 2147483648) * 2 - 1);
    }
    
    return code;
  }

  // Main embed function - combines all algorithms
  static async embedWatermark(
    audioBuffer: AudioBuffer,
    key: AudioWatermarkKey
  ): Promise<AudioBuffer> {
    const audioContext = new OfflineAudioContext(
      audioBuffer.numberOfChannels,
      audioBuffer.length,
      audioBuffer.sampleRate
    );
    
    const channelData = audioBuffer.getChannelData(0);
    const watermarkLength = 64; // Standard watermark length
    const watermark = this.generateBinaryWatermark(key, watermarkLength);
    
    // Apply all four algorithms sequentially
    let watermarked = this.embedLSB(channelData, watermark, key.strength * 0.5);
    watermarked = this.embedAM(watermarked, watermark, key.strength);
    watermarked = this.embedEcho(watermarked, watermark, key.delay, key.strength);
    watermarked = this.embedSpreadSpectrum(watermarked, watermark, key);
    
    // Create new audio buffer with watermarked data
    const newBuffer = audioContext.createBuffer(
      audioBuffer.numberOfChannels,
      audioBuffer.length,
      audioBuffer.sampleRate
    );
    
    // Create a new Float32Array with ArrayBuffer to satisfy TypeScript
    const watermarkedBuffer = new Float32Array(watermarked.length);
    watermarkedBuffer.set(watermarked);
    newBuffer.copyToChannel(watermarkedBuffer, 0);
    
    // Copy other channels if stereo
    for (let i = 1; i < audioBuffer.numberOfChannels; i++) {
      newBuffer.copyToChannel(audioBuffer.getChannelData(i), i);
    }
    
    return newBuffer;
  }

  // Main extraction and verification function
  static async extractAndVerifyWatermark(
    audioBuffer: AudioBuffer,
    key: AudioWatermarkKey
  ): Promise<AudioVerificationResult> {
    const channelData = audioBuffer.getChannelData(0);
    const watermarkLength = 64;
    const originalWatermark = this.generateBinaryWatermark(key, watermarkLength);
    
    // Extract using all four algorithms
    const lsbBits = this.extractLSB(channelData, watermarkLength);
    const amBits = this.extractAM(channelData, watermarkLength);
    const echoBits = this.extractEcho(channelData, watermarkLength, key.delay);
    const ssBits = this.extractSpreadSpectrum(channelData, watermarkLength, key);
    
    // Calculate metrics for each algorithm
    const lsbScore = this.calculateSimilarity(originalWatermark, lsbBits);
    const amScore = this.calculateSimilarity(originalWatermark, amBits);
    const echoScore = this.calculateSimilarity(originalWatermark, echoBits);
    const ssScore = this.calculateSimilarity(originalWatermark, ssBits);
    
    // Average all scores
    const avgCorrelation = (lsbScore.correlation + amScore.correlation + echoScore.correlation + ssScore.correlation) / 4;
    const avgBER = (lsbScore.ber + amScore.ber + echoScore.ber + ssScore.ber) / 4;
    
    // Calculate SNR (simplified)
    const snr = this.calculateSNR(channelData, key.strength);
    
    // Decision: watermark is valid if average correlation > threshold
    const threshold = 0.65;
    const isWatermarked = avgCorrelation > threshold;
    
    return {
      isWatermarked,
      confidence: avgCorrelation,
      ber: avgBER,
      correlation: avgCorrelation,
      snr,
      algorithmScores: {
        lsb: lsbScore.correlation,
        am: amScore.correlation,
        echo: echoScore.correlation,
        spreadSpectrum: ssScore.correlation
      }
    };
  }

  private static calculateSimilarity(original: number[], extracted: number[]): { correlation: number; ber: number } {
    let matches = 0;
    const length = Math.min(original.length, extracted.length);
    
    for (let i = 0; i < length; i++) {
      if (original[i] === extracted[i]) {
        matches++;
      }
    }
    
    const correlation = matches / length;
    const ber = (length - matches) / length; // Bit Error Rate
    
    return { correlation, ber };
  }

  private static calculateSNR(audioData: Float32Array, noiseLevel: number): number {
    let signalPower = 0;
    for (let i = 0; i < audioData.length; i++) {
      signalPower += audioData[i] * audioData[i];
    }
    signalPower /= audioData.length;
    
    const noisePower = noiseLevel * noiseLevel;
    const snr = 10 * Math.log10(signalPower / noisePower);
    
    return snr;
  }

  // Generate key from seed string
  static generateKey(seedString: string): AudioWatermarkKey {
    return {
      seed: seedString,
      strength: 0.08,
      delay: 100,
      spreadFactor: 2.0
    };
  }

  // Convert AudioBuffer to WAV Blob for download
  static async audioBufferToWav(audioBuffer: AudioBuffer): Promise<Blob> {
    const numberOfChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;
    
    const bytesPerSample = bitDepth / 8;
    const blockAlign = numberOfChannels * bytesPerSample;
    
    const data = new Float32Array(audioBuffer.length * numberOfChannels);
    for (let channel = 0; channel < numberOfChannels; channel++) {
      const channelData = audioBuffer.getChannelData(channel);
      for (let i = 0; i < audioBuffer.length; i++) {
        data[i * numberOfChannels + channel] = channelData[i];
      }
    }
    
    const dataLength = data.length * bytesPerSample;
    const buffer = new ArrayBuffer(44 + dataLength);
    const view = new DataView(buffer);
    
    // Write WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + dataLength, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);
    writeString(36, 'data');
    view.setUint32(40, dataLength, true);
    
    // Write audio data
    const volume = 0.8;
    let offset = 44;
    for (let i = 0; i < data.length; i++) {
      const sample = Math.max(-1, Math.min(1, data[i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
      offset += 2;
    }
    
    return new Blob([buffer], { type: 'audio/wav' });
  }
}

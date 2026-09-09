// audio-processor.js

class AudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.audioData = [];
    this.bufferSize = 2048;
    this.initialized = false;
    
    this.port.onmessage = (event) => {
      // Receive PCM data from main thread to play
      if (event.data.audio) {
        const float32Array = this.int16ToFloat32(event.data.audio);
        this.audioData.push(float32Array);
      }
    };
  }

  // Convert Int16Array (from Gemini) to Float32Array (for Web Audio)
  int16ToFloat32(int16Array) {
    const float32Array = new Float32Array(int16Array.length);
    for (let i = 0; i < int16Array.length; i++) {
      float32Array[i] = int16Array[i] / 32768.0;
    }
    return float32Array;
  }

  // Convert Float32Array (from mic) to Int16Array (for Gemini)
  float32ToInt16(float32Array) {
    const int16Array = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
      let s = Math.max(-1, Math.min(1, float32Array[i]));
      int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return int16Array;
  }

  process(inputs, outputs, parameters) {
    // --- OUTPUT (Playback) ---
    const output = outputs[0];
    const channel = output[0];
    
    if (this.audioData.length > 0) {
      const currentBuffer = this.audioData[0];
      const lengthToCopy = Math.min(channel.length, currentBuffer.length);
      
      for (let i = 0; i < lengthToCopy; i++) {
        channel[i] = currentBuffer[i];
      }
      
      if (currentBuffer.length > lengthToCopy) {
        this.audioData[0] = currentBuffer.subarray(lengthToCopy);
      } else {
        this.audioData.shift();
      }
    }

    // --- INPUT (Recording) ---
    const input = inputs[0];
    if (input.length > 0 && input[0].length > 0) {
      const inputChannel = input[0];
      const pcm16 = this.float32ToInt16(inputChannel);
      this.port.postMessage({ buffer: pcm16 });
    }

    return true;
  }
}

registerProcessor('audio-processor', AudioProcessor);

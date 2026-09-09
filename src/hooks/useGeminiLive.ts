import { useState, useRef, useCallback } from 'react';

type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';

// Base64 to ArrayBuffer converter
const base64ToArrayBuffer = (base64: string) => {
  const binaryString = window.atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

// ArrayBuffer to Base64 converter
const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
};

export const useGeminiLive = (systemInstruction: string) => {
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioWorkletNodeRef = useRef<AudioWorkletNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const connect = useCallback(async () => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_api_key_here') {
      setError('Missing Gemini API Key. Please add VITE_GEMINI_API_KEY to your .env file.');
      return;
    }

    try {
      setConnectionState('connecting');
      setError(null);

      // 1. Initialize Web Audio API
      audioContextRef.current = new AudioContext({ sampleRate: 16000 }); // Setup for 16kHz input
      await audioContextRef.current.audioWorklet.addModule('/audio-processor.js');

      audioWorkletNodeRef.current = new AudioWorkletNode(audioContextRef.current, 'audio-processor');
      audioWorkletNodeRef.current.connect(audioContextRef.current.destination); // Connect output to speakers

      // 2. Request Microphone Access
      mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      const source = audioContextRef.current.createMediaStreamSource(mediaStreamRef.current);
      source.connect(audioWorkletNodeRef.current); // Connect mic to worklet for processing

      // 3. Connect WebSocket
      const wsUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${apiKey}`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        if (wsRef.current !== ws) return;
        setConnectionState('connected');
        
        // Send Initial Setup Message
        const setupMessage = {
          setup: {
            model: "models/gemini-2.0-flash-exp",
            generationConfig: {
              responseModalities: ["AUDIO"],
            },
            systemInstruction: {
              parts: [{ text: systemInstruction }]
            }
          }
        };
        ws.send(JSON.stringify(setupMessage));
      };

      ws.onmessage = (event) => {
        if (wsRef.current !== ws) return;
        // Handle incoming data
        if (event.data instanceof Blob) {
          // It's binary (rare for JSON-based API, but good to handle)
        } else {
          try {
            const data = JSON.parse(event.data);
            if (data.serverContent?.modelTurn?.parts) {
              const parts = data.serverContent.modelTurn.parts;
              for (const part of parts) {
                if (part.inlineData && part.inlineData.mimeType.startsWith('audio/pcm')) {
                  setIsSpeaking(true);
                  
                  // Clear existing timeout
                  if ((window as any).speakingTimeout) {
                    clearTimeout((window as any).speakingTimeout);
                  }
                  // Keep speaking state active for a bit after the last chunk
                  (window as any).speakingTimeout = setTimeout(() => {
                    setIsSpeaking(false);
                  }, 1500);

                  const pcmData = base64ToArrayBuffer(part.inlineData.data);
                  const int16Array = new Int16Array(pcmData);
                  // Send to audio worklet to play
                  audioWorkletNodeRef.current?.port.postMessage({ audio: int16Array });
                }
              }
            }
          } catch (e) {
            console.error("Failed to parse websocket message", e);
          }
        }
      };

      ws.onerror = (e) => {
        if (wsRef.current !== ws) return;
        console.error("WebSocket Error:", e);
        setError("WebSocket connection failed.");
        setConnectionState('error');
      };

      ws.onclose = (event) => {
        console.log("WebSocket closed. Code:", event.code, "Reason:", event.reason);
        if (wsRef.current !== ws) return;
        setConnectionState('disconnected');
      };

      // 4. Handle Audio Input from Microphone (from Worklet to WebSocket)
      audioWorkletNodeRef.current.port.onmessage = (event) => {
        if (event.data.buffer && wsRef.current?.readyState === WebSocket.OPEN) {
          const base64Audio = arrayBufferToBase64(event.data.buffer.buffer);
          const realtimeInput = {
            realtimeInput: {
              mediaChunks: [{
                mimeType: "audio/pcm;rate=16000",
                data: base64Audio
              }]
            }
          };
          wsRef.current.send(JSON.stringify(realtimeInput));
        }
      };

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to initialize Gemini Live API');
      setConnectionState('error');
    }
  }, [systemInstruction]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setConnectionState('disconnected');
    setIsSpeaking(false);
  }, []);

  return {
    connect,
    disconnect,
    connectionState,
    isSpeaking,
    error
  };
};

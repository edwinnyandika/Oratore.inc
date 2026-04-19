
import { GoogleGenAI, Modality } from "@google/genai";

// Audio Decoding Helper
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

/**
 * Generates speech for a given text using Gemini TTS
 */
export const speakText = async (text: string) => {
  /* Fix: Instantiate GoogleGenAI inside the call to ensure current API key is used */
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Read this invoice summary clearly: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Charon' }, // Professional voice
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) return;

    const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContext, 24000, 1);
    
    const source = outputAudioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(outputAudioContext.destination);
    source.start();
  } catch (error) {
    console.error("TTS Error:", error);
  }
};

/**
 * Interface for Voice Command parsing
 */
export interface VoiceAction {
  action: 'ADD_ITEM' | 'SET_CLIENT' | 'SET_TAX' | 'UNKNOWN';
  payload: any;
}

/**
 * Uses Gemini Pro to interpret a voice command string into structured data
 */
export const interpretVoiceCommand = async (transcript: string): Promise<VoiceAction> => {
  /* Fix: Instantiate GoogleGenAI inside the call to ensure current API key is used */
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    Interpret the following voice command for an invoice app: "${transcript}"
    Possible actions:
    - ADD_ITEM: payload { description: string, rate: number, quantity: number }
    - SET_CLIENT: payload { clientName: string }
    - SET_TAX: payload { taxRate: number }
    
    Return a JSON object with "action" and "payload". Return UNKNOWN if not understood.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });
    return JSON.parse(response.text || '{"action": "UNKNOWN"}');
  } catch {
    return { action: 'UNKNOWN', payload: null };
  }
};

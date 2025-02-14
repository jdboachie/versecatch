'use server'
import { HfInference } from "@huggingface/inference";

export const transcribeAudio = async (arrayBuffer: ArrayBuffer) => {
    try {
        console.log("whisper whisper");

        const inference = new HfInference(process.env.HF_API_KEY!);

        // Convert ArrayBuffer to Blob
        const blob = new Blob([arrayBuffer], { type: 'audio/wav' });

        const res = await inference.automaticSpeechRecognition({
          model: "openai/whisper-large-v3-turbo",
          data: blob,
          provider: "hf-inference",
        });

        return res;
    } catch (error) {
        console.error("Transcription failed:", error);
        throw error;
    }
}
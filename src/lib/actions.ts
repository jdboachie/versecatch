'use server'

import { HfInference } from "@huggingface/inference";



export const transcribeAudio = async (arrayBuffer: ArrayBuffer) => {
    console.log('whisper whisper')
    const inference = new HfInference('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');

    const res = await inference.automaticSpeechRecognition({
      model: 'openai/whisper-large-v3-turbo',
      data: arrayBuffer,
      provider: "hf-inference",
    }).then((res) => {
        return res
    })

    return res
  }
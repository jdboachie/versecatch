import React from 'react'
import { HfInference } from "@huggingface/inference";
import { readFileSync } from 'fs';

const Page = () => {

  async function onSubmit () {
    // 'use server'

    // const inference = new HfInference(process.env.HF_TOKEN);

    // const res = await inference.automaticSpeechRecognition({
    //   model: 'openai/whisper-large-v3-turbo',
    //   data: readFileSync('src/app/v/clear-audio-1.wav')
    // })

    // console.log(res.text)
  }
  return (
    <div className='h-screen w-screen place-items-center grid'>
        <form action={onSubmit}>
            <button type='submit' className='border px-3 py-1 rounded-md'>submit</button>
        </form>
    </div>
  )
}

export default Page
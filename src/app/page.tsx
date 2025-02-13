'use client';

import * as React from 'react';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Mic, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { transcribeAudio } from '@/lib/actions';


export default function Page () {

  const [isRecording, setIsRecording] = React.useState<boolean>(false);
  const [audioChunks, setAudioChunks] = React.useState<Blob[]>([]);
  // const [audioUrl, setAudioUrl] = React.useState<string | null >(null);
  const [transcription, setTranscription] = React.useState('');
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);

  React.useEffect(() => {
    if (isRecording) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then((stream) => {
          const mediaRecorder = new MediaRecorder(stream);
          mediaRecorderRef.current = mediaRecorder;
          mediaRecorder.start();

          mediaRecorder.ondataavailable = async (event) => {
            console.log('Audio chunk received');
            setAudioChunks((prevChunks) => [...prevChunks, event.data]);

            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            const audioBuffer = await audioBlob.arrayBuffer();

            await transcribeAudio(audioBuffer).then((res) => {
              setTranscription(res.text);
            });
          };

          mediaRecorder.onstop = () => {
            // const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            // const audioUrl = URL.createObjectURL(audioBlob);
            // setAudioUrl(audioUrl);
            // sendAudioForTranscription(audioBlob);
            console.log('Recording stopped');
          };
        })
        .catch((err) => console.error('Error accessing audio devices', err));
    }
  }, [audioChunks, isRecording]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);

    setAudioChunks([]); // Reset audio chunks before starting

    mediaRecorder.ondataavailable = async (event) => {
      console.log('Audio chunk received');
      setAudioChunks((prevChunks) => [...prevChunks, event.data]);

      const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
      const audioBuffer = await audioBlob.arrayBuffer();

      await transcribeAudio(audioBuffer).then((res) => {
        setTranscription(res.text);
      });
    };

    mediaRecorder.onstop = async () => {
      console.log('Recording stopped');
      const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
      const audioBuffer = await audioBlob.arrayBuffer();

      await transcribeAudio(audioBuffer).then((res) => {
        setTranscription(res.text);
      });
    };

    mediaRecorder.start();
    mediaRecorderRef.current = mediaRecorder;
    setIsRecording(true);
    console.log('Recording started');
  };

  const stopRecording = async () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      console.log('Stopping recording');
    }
  };

  return (
    <div className='size-full h-screen sm:p-16 grid place-items-center'>
      <main className="h-full flex flex-col z-10 sm:border-4 border-zinc-500 bg-black rounded-[2.75rem] sm:aspect-[428/926] w-full sm:max-w-[300px]">
        <ResizablePanelGroup
          direction="vertical"
          className="size-ful rounded-[calc(2.75rem-4px)] gap-0.5"
        >
          <ResizablePanel
            defaultSize={80}
            minSize={50}
            className="rounded-b-3xl p-4 bg-background dark:border-b"
          >
            {/* {audioUrl && <audio controls src={audioUrl} />} */}
            <p className='border p-4 rounded-3xl'>{transcription}</p>
          </ResizablePanel>
          <ResizableHandle withHandle className="border-0 bg-transparent"/>
          <ResizablePanel
            minSize={15}
            maxSize={50}
            defaultSize={20}
            className="rounded-t-3xl p-4 pt-8 bg-background dark:border-t"
          >
            <div className="p-4 grid place-items-center">
              <Button
                size={'icon'}
                onClick={() => {
                  if (isRecording) {
                    stopRecording();
                  } else {
                    startRecording();
                  }
                }}
                className="rounded-full size-16"
              >
                {isRecording ? <Pause className="size-8" /> : <Mic className='size-8' />}
              </Button>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>
    </div>
  )
}

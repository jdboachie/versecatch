"use client"

import * as React from "react"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { Mic, Pause, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { transcribeAudio } from "@/lib/actions"
import { toast } from "@/hooks/use-toast"

export default function Page() {
  const [isRecording, setIsRecording] = React.useState<boolean>(false)
  const [isProcessing, setIsProcessing] = React.useState<boolean>(false)
  const [transcription, setTranscription] = React.useState("")
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null)
  const audioChunksRef = React.useRef<Blob[]>([])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)

      mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
          await processAudioChunk()
        }
      }

      mediaRecorder.start(2000) // Capture data every second
      mediaRecorderRef.current = mediaRecorder
      setIsRecording(true)
      toast({
        title: "Recording started",
        description: "Speak clearly into your microphone.",
      })
    } catch (err) {
      console.error("Error accessing audio devices", err)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not access microphone. Please check your permissions.",
      })
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop())
      setIsRecording(false)
      toast({
        title: "Recording stopped",
        description: "Processing final transcription...",
      })
    }
  }

  const processAudioChunk = async () => {
    setIsProcessing(true)
    const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" })
    const audioBuffer = await audioBlob.arrayBuffer()

    try {
      const res = await transcribeAudio(audioBuffer)
      setTranscription((prevTranscription) => {
        const newText = res.text.trim()
        return prevTranscription ? `${prevTranscription} ${newText}` : newText
      })
    } catch (error) {
      console.error("Transcription error:", error)
      toast({
        variant: "destructive",
        title: "Transcription failed",
        description: "There was an error processing your audio. Please try again.",
      })
    } finally {
      setIsProcessing(false)
      audioChunksRef.current = []
    }
  }

  return (
    <div className="size-full h-screen sm:p-16 grid place-items-center">
      <main className="h-full flex flex-col z-10 sm:border-4 border-zinc-500 bg-black rounded-[2.75rem] sm:aspect-[428/926] w-full sm:max-w-[300px]">
        <ResizablePanelGroup direction="vertical" className="size-full rounded-[calc(2.75rem-4px)] gap-0.5">
          <ResizablePanel defaultSize={80} minSize={50} className="rounded-b-3xl p-4 bg-background dark:border-b">
            {isProcessing && (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing audio...
              </div>
            )}
            <p className="p-4 rounded-3xl whitespace-pre-wrap">
              {transcription || "Your transcription will appear here..."}
            </p>
          </ResizablePanel>
          <ResizableHandle withHandle className="border-0 bg-transparent" />
          <ResizablePanel
            minSize={15}
            maxSize={50}
            defaultSize={20}
            className="rounded-t-3xl p-4 pt-8 bg-background dark:border-t"
          >
            <div className="p-4 grid place-items-center">
              <Button
                size={"icon"}
                onClick={() => {
                  if (isRecording) {
                    stopRecording()
                  } else {
                    startRecording()
                  }
                }}
                className="rounded-full size-16"
                disabled={isProcessing}
              >
                {isRecording ? <Pause className="size-8" /> : <Mic className="size-8" />}
              </Button>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>
    </div>
  )
}


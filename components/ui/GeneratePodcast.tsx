import { GeneratePodcastProps } from "@/types";
import React, { useState } from "react";
import { Label } from "./label";
import { Textarea } from "./textarea";
import { Button } from "./button";
import { Loader } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { useAction, useQuery } from "convex/react";

const useGeneratePodcast = ({
  setAudio,
  voicePrompt,
  voiceType,
  setAudioStorageId,
}: GeneratePodcastProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const getPodcastAudio = useAction(api.openai.getPodcastAudioAction);

  const generatePodcast = async () => {
    setIsGenerating(true);
    setAudio("");
    const response = await getPodcastAudio({
      input: voicePrompt,
      voice: voiceType,
    });
    const blob = new Blob([response], { type: "audio/mpeg" });
    console.log(blob);
    if (!voicePrompt) {
      return setIsGenerating(false);
    }

    try {
    } catch (error) {
      console.error("error generating podcast");
    }
  };

  return {
    isGenerating,
    generatePodcast,
  };
};

const GeneratePodcast = (props: GeneratePodcastProps) => {
  const { generatePodcast, isGenerating } = useGeneratePodcast(props);
  return (
    <div>
      <div className="flex flex-col gap-2.5">
        <Label className=" text-16 font-bold text-white-1">
          AI prompt to generate Podcast
        </Label>
        <Textarea
          className="input-class font-light focus-visible:ring-offset-purple-600"
          placeholder="Provide text to generate audio"
          rows={5}
          value={props.voicePrompt}
          onChange={(e) => props.setVoicePrompt(e.target.value)}
        />
      </div>
      <div className="mt-5 w-full max-w-[200px]">
        <Button
          onClick={generatePodcast}
          className="text-16 w-full text-white-1 bg-purple-500 py-4 font-bold"
        >
          {isGenerating ? (
            <>
              Generating
              <Loader size={20} className="animate-spin ml-2" />
            </>
          ) : (
            <>Generate</>
          )}
        </Button>
      </div>
      {props.audio && (
        <audio
          controls
          src={props.audio}
          autoPlay
          className="mt-5"
          onLoadedMetadata={(e) =>
            props.setAudioDuration(e.currentTarget.duration)
          }
        />
      )}
    </div>
  );
};

export default GeneratePodcast;

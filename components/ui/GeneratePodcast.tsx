import { GeneratePodcastProps } from "@/types";
import React, { useState } from "react";
import { Label } from "./label";
import { Textarea } from "./textarea";
import { Button } from "./button";
import { Loader } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { useAction, useMutation, useQuery } from "convex/react";
import { v4 as uuidv4 } from "uuid";
import { generateUploadUrl } from "@/convex/files";
import { useUploadFiles } from "@xixixao/uploadstuff/react";
import { useToast } from "./use-toast";

const useGeneratePodcast = ({
  setAudio,
  voicePrompt,
  voiceType,
  setAudioStorageId,
}: GeneratePodcastProps) => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const getPodcastAudio = useAction(api.openai.getPodcastAudioAction);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const getAudioUrl = useMutation(api.podcasts.getUrl);
  const { startUpload } = useUploadFiles(generateUploadUrl);

  const generatePodcast = async () => {
    setIsGenerating(true);
    setAudio("");

    if (!voicePrompt) {
      toast({
        title: "Please provide a voice prompt",
      });
      return setIsGenerating(false);
    }

    try {
      const response = await getPodcastAudio({
        input: voicePrompt,
        voice: voiceType,
      });
      const blob = new Blob([response], { type: "audio/mpeg" });
      const fileName = `podcast-${uuidv4()}.mp3`;
      const file = new File([blob], fileName, { type: "audio/mpeg" });

      const uploaded = await startUpload([file]);
      const storageId = (uploaded[0].response as any).storageId;
      setAudioStorageId(storageId);

      const audioUrl = await getAudioUrl({ storageId });
      setAudio(audioUrl!);
      setIsGenerating(false);
      toast({
        title: "Podcast generated successfully",
      });
    } catch (error) {
      setIsGenerating(false);
      console.error("error generating podcast");
      toast({
        title: "Error generating podcast",
        variant: "destructive",
      });
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

import type { Media } from "@/data/projects";
import { DemoVideo } from "./DemoVideo";
import { BrowserFrame } from "./Frames";
import { VoiceNavPipeline } from "./VoiceNavPipeline";

export function ProjectMedia({ media, address }: { media: Media; address?: string }) {
  if (media.kind === "voicenav") return <VoiceNavPipeline />;
  return (
    <BrowserFrame address={address}>
      <DemoVideo {...media} />
    </BrowserFrame>
  );
}

import Image from "next/image";
import type { Media } from "@/data/projects";
import { DemoVideo } from "./DemoVideo";
import { VoiceNavPipeline } from "./VoiceNavPipeline";

type Props = {
  media: Media;
  sizes?: string;
  eager?: boolean;
};

export function ProjectMedia({ media, sizes = "(min-width: 1024px) 560px, 100vw", eager = false }: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface-2 shadow-[0_20px_50px_-24px_rgb(0_0_0/0.5)]">
      {media.kind === "image" && (
        <Image
          src={media.src}
          alt={media.alt}
          width={media.width}
          height={media.height}
          sizes={sizes}
          loading={eager ? "eager" : "lazy"}
          className="h-auto w-full"
        />
      )}
      {media.kind === "video" && <DemoVideo {...media} />}
      {media.kind === "voicenav" && <VoiceNavPipeline />}
    </div>
  );
}

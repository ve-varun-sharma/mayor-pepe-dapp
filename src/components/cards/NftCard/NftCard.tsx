import { GlareCard } from "@/components/ui/glare-card";
import { MediaRenderer } from "thirdweb/react";
import { client } from "@/app/client";

export function NftCard({ imageUrl }: { imageUrl: string }) {
  return (
    <GlareCard className="flex flex-col items-center justify-center">
      <MediaRenderer
        client={client}
        src={imageUrl}
        className="h-full w-full object-cover rounded-xl"
      />
    </GlareCard>
  );
}

"use client";
import Spline from "@splinetool/react-spline/next";
import { cn } from "@/lib/utils";
import { SparklesText } from "@/components/magicui/sparkles-text";
import { HyperText } from "@/components/magicui/hyper-text";
import { InteractiveHoverButton } from "@/components/magicui/interactive-hover-button";
import Link from "next/link";
export default function Home() {
  return (
    <div>
      <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-black">
        <div className="max-w-screen-md w-full space-y-8 text-center">
          <HyperText className="text-4xl font-bold -tracking-widest text-white dark:text-white md:text-7xl md:leading-[5rem]">
            Mayor Pepe Token
          </HyperText>
          <SparklesText className="text-white" text="$MAYOR" />
          <div className="aspect-square w-3/4 mx-auto relative rounded-2xl overflow-hidden">
            <Spline scene="https://prod.spline.design/cRCxdks8YC9RtQHz/scene.splinecode" />
          </div>
          <div className="flex flex-row gap-4 justify-center">
            <Link href="/mint-nft">
              <InteractiveHoverButton>Mint Mayor NFT</InteractiveHoverButton>
            </Link>
            <InteractiveHoverButton>
              Mint $Mayor (Coming Soon)
            </InteractiveHoverButton>
          </div>
        </div>
      </main>
    </div>
  );
}

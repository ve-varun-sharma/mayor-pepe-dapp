"use client";
import Spline from "@splinetool/react-spline/next";
import { cn } from "@/lib/utils";
import { SparklesText } from "@/components/magicui/sparkles-text";
import { HyperText } from "@/components/magicui/hyper-text";
import { InteractiveHoverButton } from "@/components/magicui/interactive-hover-button";
import Link from "next/link";
import { BlurHeader } from "@/components/magicui/blur-header";

export default function Home() {
  return (
    <div className="min-h-screen bg-black">
      <BlurHeader />
      <main className="container mx-auto p-4">
        <h1 className="text-4xl font-bold text-white text-center mt-20">
          Welcome to the Token Platform
        </h1>
        <div className="flex justify-center gap-4 mt-8">
          <Link
            href="/mint-nft"
            className="text-white hover:text-cyan-400 px-4 py-2"
          >
            Mint NFT
          </Link>
          <Link
            href="/mint-token"
            className="text-white hover:text-cyan-400 px-4 py-2"
          >
            Mint Token
          </Link>
        </div>
      </main>
    </div>
  );
}

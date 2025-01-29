"use client";
import { ConnectButton } from "thirdweb/react";
import { client } from "@/app/client";
import { base } from "thirdweb/chains";
import Link from "next/link";

export function BlurHeader() {
  // Replace the chain with the chain you want to connect to
  const chain = base;
  return (
    <header className="sticky top-0 z-20 mx-auto flex w-full items-center justify-between p-5  sm:px-10">
      <div className="pointer-events-none absolute inset-0  z-[1] h-[20vh] backdrop-blur-[0.0625px] [mask-image:linear-gradient(0deg,transparent_0%,#000_12.5%,#000_25%,transparent_37.5%)]"></div>
      <div className="pointer-events-none absolute inset-0  z-[2] h-[20vh] backdrop-blur-[0.125px] [mask-image:linear-gradient(0deg,transparent_12.5%,#000_25%,#000_37.5%,transparent_50%)]"></div>
      <div className="pointer-events-none absolute inset-0  z-[3] h-[20vh] backdrop-blur-[0.25px] [mask-image:linear-gradient(0deg,transparent_25%,#000_37.5%,#000_50%,transparent_62.5%)]"></div>
      <div className="pointer-events-none absolute inset-0  z-[4] h-[20vh] backdrop-blur-[0.5px] [mask-image:linear-gradient(0deg,transparent_37.5%,#000_50%,#000_62.5%,transparent_75%)]"></div>
      <div className="pointer-events-none absolute inset-0  z-[5] h-[20vh] backdrop-blur-[1px] [mask-image:linear-gradient(0deg,transparent_50%,#000_62.5%,#000_75%,transparent_87.5%)]"></div>
      <div className="pointer-events-none absolute inset-0  z-[6] h-[20vh] backdrop-blur-[2px] [mask-image:linear-gradient(0deg,transparent_62.5%,#000_75%,#000_87.5%,transparent_100%)]"></div>
      <div className="pointer-events-none absolute inset-0  z-[7] h-[20vh] backdrop-blur-[4px] [mask-image:linear-gradient(0deg,transparent_75%,#000_87.5%,#000_100%,transparent_112.5%)]"></div>
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between">
        <Link href="/" className="text-white font-bold" legacyBehavior>
          <a>Home</a>
        </Link>
        <Link
          href="/mint-token/"
          className="text-white hover:text-cyan-400 px-4 py-2"
          legacyBehavior
        >
          <a>Mint Tokens</a>
        </Link>
        <div className="z-[10]">
          <ConnectButton client={client} chain={chain} />
        </div>
      </div>
    </header>
  );
}

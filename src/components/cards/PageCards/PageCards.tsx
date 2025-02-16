"use client";

import { useTheme } from "next-themes";
import { MagicCard } from "@/components/magicui/magic-card";
import Link from "next/link";

export function PageCards() {
  const { theme } = useTheme();
  return (
    <div
      className={
        "flex h-[500px] w-full flex-col gap-4 lg:h-[250px] lg:flex-row"
      }
    >
      <Link href="/mint-nft">
        <MagicCard
          className="cursor-pointer flex-col items-center justify-center whitespace-nowrap text-4xl"
          gradientColor={theme === "dark" ? "#262626" : "#D9D9D955"}
        >
          Mint Mayor Pepe NFTs
        </MagicCard>
      </Link>
      <MagicCard
        className="cursor-pointer flex-col items-center justify-center whitespace-nowrap text-4xl"
        gradientColor={theme === "dark" ? "#262626" : "#D9D9D955"}
      >
        Mint $MAYOR Tokens (Coming Soon)
      </MagicCard>
    </div>
  );
}

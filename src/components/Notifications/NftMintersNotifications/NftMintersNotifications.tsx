"use client";

import { cn } from "@/lib/utils";
import { AnimatedList } from "@/components/magicui/animated-list";
import { useState, useEffect } from "react";

interface Item {
  name: string;
  description: string;
  icon: string;
  color: string;
  time: string;
}

let notifications = [
  {
    name: "PepeFan123",
    description: "Minted 3 Mayor Pepe NFTs",
    time: "Just now",
    icon: "🐸",
    color: "#00C9A7",
  },
  {
    name: "CryptoDegen",
    description: "Claimed Rare Golden Pepe Edition",
    time: "2m ago",
    icon: "💰",
    color: "#FFB800",
  },
  {
    name: "NFTCollector",
    description: "Bought 5 Mayor PEPE at 0.5 ETH",
    time: "5m ago",
    icon: "🎩",
    color: "#1E86FF",
  },
  {
    name: "Memelord420",
    description: "Sold 2 PEPE NFTs for profit",
    time: "8m ago",
    icon: "🚀",
    color: "#FF3D71",
  },
  {
    name: "MayorStaker",
    description: "Staked 10 Mayor PEPE NFTs",
    time: "12m ago",
    icon: "🏛️",
    color: "#8A2BE2",
  },
];

// Generate random recent minters
const generateFakeMinter = () => {
  const names = [
    "PepeLover",
    "CryptoWhale",
    "NFTMaster",
    "DeFiDegen",
    "Memeking",
  ];
  const actions = [
    { verb: "Minted", icon: "🖼️", color: "#4CAF50" },
    { verb: "Traded", icon: "🔄", color: "#FF9800" },
    { verb: "Bought", icon: "🛒", color: "#2196F3" },
    { verb: "Sold", icon: "💸", color: "#E91E63" },
  ];

  const randomName = `${
    names[Math.floor(Math.random() * names.length)]
  }${Math.floor(Math.random() * 1000)}`;
  const action = actions[Math.floor(Math.random() * actions.length)];
  const quantity = Math.floor(Math.random() * 5) + 1;

  return {
    name: randomName,
    description: `${action.verb} ${quantity} Mayor Pepe NFT${
      quantity > 1 ? "s" : ""
    }`,
    time: `${Math.floor(Math.random() * 15)}m ago`,
    icon: action.icon,
    color: action.color,
  };
};

// Generate 50 random minters
notifications = Array.from({ length: 50 }, generateFakeMinter);

const Notification = ({ name, description, icon, color, time }: Item) => {
  return (
    <figure
      className={cn(
        "relative mx-auto min-h-fit w-full max-w-[400px] cursor-pointer overflow-hidden rounded-xl p-3",
        // animation styles
        "animate-[slideIn_8s_linear_infinite]",
        // dark styles
        "bg-gray-900/90 backdrop-blur-lg",
        "shadow-xl shadow-black/40"
      )}
    >
      <div className="flex flex-row items-center gap-3">
        <div
          className="flex size-9 items-center justify-center rounded-xl"
          style={{
            backgroundColor: `${color}20`,
            boxShadow: `0 0 12px ${color}30`,
          }}
        >
          <span className="text-lg">{icon}</span>
        </div>
        <div className="flex flex-col overflow-hidden">
          <figcaption className="flex flex-row items-center whitespace-pre text-base font-medium text-gray-300">
            <span className="text-sm">{name}</span>
            <span className="mx-1 text-gray-500">·</span>
            <span className="text-xs text-gray-400">{time}</span>
          </figcaption>
          <p className="text-sm font-normal text-gray-400">{description}</p>
        </div>
      </div>
    </figure>
  );
};

export function AnimatedListDemo({ className }: { className?: string }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div
      className={cn(
        "relative flex h-[400px] w-full flex-col overflow-hidden",
        "bg-gradient-to-b from-gray-900/50 to-gray-900/90 backdrop-blur-2xl",
        "shadow-2xl shadow-black/50",
        className
      )}
    >
      {isMounted && (
        <AnimatedList>
          {notifications.map((item, idx) => (
            <Notification {...item} key={idx} />
          ))}
        </AnimatedList>
      )}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-gray-900/90"></div>
    </div>
  );
}

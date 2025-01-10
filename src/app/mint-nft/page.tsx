"use client";

import Image from "next/image";
import {
  ConnectButton,
  MediaRenderer,
  TransactionButton,
  useActiveAccount,
  useReadContract,
} from "thirdweb/react";
import { client } from "../client";
import { defineChain, getContract, toEther } from "thirdweb";
import { base } from "thirdweb/chains";
import { getContractMetadata } from "thirdweb/extensions/common";
import {
  claimTo,
  getActiveClaimCondition,
  getTotalClaimedSupply,
  nextTokenIdToMint,
} from "thirdweb/extensions/erc721";
import { useState } from "react";
import { FlipText } from "@/components/magicui/flip-text";
import { NftCard } from "@/components/cards/NftCard/NftCard";
import { BlurHeader } from "@/components/Headers/Header";
import { cn } from "@/lib/utils";
import { PageSubheader } from "@/components/Headers/page-subheader";
import { ConfettiButton } from "@/components/magicui/confetti";
import { motion } from "framer-motion";
// import { AnimatedListDemo } from "@/components/Notifications/NftMintersNotifications/NftMintersNotifications";

export default function Home() {
  const account = useActiveAccount();

  // Replace the chain with the chain you want to connect to
  const chain = base;

  const [quantity, setQuantity] = useState(1);
  const [isClaimed, setIsClaimed] = useState(false);

  // Replace the address with the address of the deployed contract
  const contract = getContract({
    client: client,
    chain: chain,
    address: "0xfdd694eAbb14df6154093f3f89497a3B27887e18",
  });

  const { data: contractMetadata, isLoading: isContractMetadataLoading } =
    useReadContract(getContractMetadata, {
      contract: contract,
    });

  const { data: claimedSupply, isLoading: isClaimedSupplyLoading } =
    useReadContract(getTotalClaimedSupply, {
      contract: contract,
    });

  const { data: totalNFTSupply, isLoading: isTotalSupplyLoading } =
    useReadContract(nextTokenIdToMint, {
      contract: contract,
    });

  const { data: claimCondition } = useReadContract(getActiveClaimCondition, {
    contract: contract,
  });

  const getPrice = (quantity: number) => {
    const total =
      quantity * parseInt(claimCondition?.pricePerToken.toString() || "0");
    return toEther(BigInt(total));
  };
  return (
    <div className="min-h-screen bg-black">
      <BlurHeader />
      <main className="p-4 pb-10 min-h-[100vh] flex items-center justify-center container max-w-screen-lg mx-auto">
        <div className="py-20 text-center text-white">
          <PageSubheader />
          <div className="flex flex-col items-center mt-4">
            {isContractMetadataLoading ? (
              <p>Loading...</p>
            ) : (
              <>
                <NftCard imageUrl={contractMetadata?.image} />
                <div className="mt-8 space-y-4 max-w-2xl mx-auto">
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-amber-600 bg-clip-text text-transparent">
                    {contractMetadata?.name}
                  </h2>
                  <p className="text-xl text-gray-300 font-light leading-relaxed">
                    {contractMetadata?.description}
                  </p>
                  <div className="pt-4 border-t border-white/10">
                    <p className="text-lg font-mono text-amber-400">
                      Total Available for Mint for this Wallet:{" "}
                      {claimedSupply?.toString()}/{totalNFTSupply?.toString()}
                    </p>
                  </div>
                </div>
              </>
            )}
            {isClaimedSupplyLoading || isTotalSupplyLoading ? (
              <p>Loading...</p>
            ) : (
              <div className="flex flex-row items-center justify-center my-4">
                <button
                  className="bg-black text-white px-4 py-2 rounded-md mr-4"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  -
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                  className="w-10 text-center border border-gray-300 rounded-md bg-black text-white"
                />
                <button
                  className="bg-black text-white px-4 py-2 rounded-md mr-4"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  +
                </button>
              </div>
            )}

            <TransactionButton
              transaction={() =>
                claimTo({
                  contract: contract,
                  to: account?.address || "",
                  quantity: BigInt(quantity),
                })
              }
              onTransactionConfirmed={async () => {
                setIsClaimed(true);
                setQuantity(1);
              }}
            >
              {`Claim NFT (${getPrice(quantity)} ETH)`}
            </TransactionButton>
          </div>
        </div>
        {isClaimed && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-white/10 backdrop-blur-lg p-6 rounded-2xl shadow-xl"
          >
            <div className="flex items-center gap-4">
              <MediaRenderer
                client={client}
                src={contractMetadata?.image}
                className="w-24 h-24 rounded-xl"
              />
              <div>
                <h3 className="text-2xl font-bold text-white">Success! 🎉</h3>
                <p className="text-white/80">
                  Your {contractMetadata?.name} NFT has been minted!
                </p>
              </div>
              <button
                onClick={() => setIsClaimed(false)}
                className="text-white hover:text-amber-400 transition-colors"
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}
        {/* <div className="fixed bottom-0 left-0 mb-4 ml-4 z-50 w-96">
          <AnimatedListDemo className="bg-black/50 backdrop-blur-lg rounded-2xl border border-white/10" />
        </div> */}
      </main>
    </div>
  );
}

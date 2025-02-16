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

export default function Home() {
  const account = useActiveAccount();

  // Replace the chain with the chain you want to connect to
  const chain = base;

  const [quantity, setQuantity] = useState(1);

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
                      Total Minted: {claimedSupply?.toString()}/
                      {totalNFTSupply?.toString()}
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
                alert("NFT Claimed!");
                setQuantity(1);
              }}
            >
              {`Claim NFT (${getPrice(quantity)} ETH)`}
            </TransactionButton>
          </div>
        </div>
      </main>
    </div>
  );
}

"use client";

import Image from "next/image";
import {
  ConnectButton,
  MediaRenderer,
  TransactionButton,
  useActiveAccount,
  useReadContract,
} from "thirdweb/react";
import thirdwebIcon from "@public/thirdweb.svg";
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
    <main className="p-4 pb-10 min-h-[100vh] flex items-center justify-center container max-w-screen-lg mx-auto">
      <div className="py-20 text-center">
        <Header />
        <ConnectButton client={client} chain={chain} />
        <div className="flex flex-col items-center mt-4">
          {isContractMetadataLoading ? (
            <p>Loading...</p>
          ) : (
            <>
              <MediaRenderer
                client={client}
                src={contractMetadata?.image}
                className="rounded-xl"
              />
              <h2 className="text-2xl font-semibold mt-4">
                {contractMetadata?.name}
              </h2>
              <p className="text-lg mt-2">{contractMetadata?.description}</p>
            </>
          )}
          {isClaimedSupplyLoading || isTotalSupplyLoading ? (
            <p>Loading...</p>
          ) : (
            <p className="text-lg mt-2 font-bold">
              Total NFT Supply: {claimedSupply?.toString()}/
              {totalNFTSupply?.toString()}
            </p>
          )}
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
  );
}

function Header() {
  return (
    <header className="flex flex-row items-center">
      <Image
        src={thirdwebIcon}
        alt=""
        className="size-[150px] md:size-[150px]"
        style={{
          filter: "drop-shadow(0px 0px 24px #a726a9a8)",
        }}
      />
      <FlipText
        className="text-4xl font-bold -tracking-widest text-black dark:text-white md:text-7xl md:leading-[5rem]"
        word="Mint Mayor Pepe"
      />
    </header>
  );
}

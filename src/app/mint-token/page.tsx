"use client";

import {
  ConnectButton,
  TransactionButton,
  useActiveAccount,
  useReadContract,
} from "thirdweb/react";
import { client } from "../client";
import { getContract, toTokens } from "thirdweb";
import { base } from "thirdweb/chains";
import {
  getActiveClaimCondition,
  // @ts-ignore
  getClaimerProofs,
  claimTo,
  // @ts-ignore
  totalSupply,
  mintTo,
} from "thirdweb/extensions/erc20";
import { BlurHeader } from "@/components/Headers/Header";
import { useState } from "react";
import { MediaRenderer } from "thirdweb/react";
import { getContractMetadata } from "thirdweb/extensions/common";
import { prepareContractCall, sendTransaction } from "thirdweb";
import Spline from "@splinetool/react-spline/next";

// Replace with your ERC20 contract address
const TOKEN_CONTRACT_ADDRESS = "0xA17604c449299355bB6C4C6097933265410D2924";

export default function MintTokenPage() {
  const account = useActiveAccount();
  const [amount, setAmount] = useState(1);
  const [error, setError] = useState("");
  const [txHash, setTxHash] = useState("");
  const [isClaimMode, setIsClaimMode] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const tokenContract = getContract({
    client: client,
    chain: base,
    address: TOKEN_CONTRACT_ADDRESS,
  });

  const { data: tokenMetadata } = useReadContract(getContractMetadata, {
    contract: tokenContract,
  });

  const { data: totalTokenSupply } = useReadContract(totalSupply, {
    contract: tokenContract,
  });

  const { data: activeClaimCondition } = useReadContract(
    getActiveClaimCondition,
    {
      contract: tokenContract,
    }
  );

  const decimals = tokenMetadata?.decimals || 18;
  // @ts-ignore
  const availableSupply = activeClaimCondition?.availableSupply || BigInt(0);
  const availableTokens = toTokens(availableSupply, decimals);
  const maxPerWallet =
    activeClaimCondition?.quantityLimitPerWallet || BigInt(0);
  const maxClaimable = Number(maxPerWallet);
  const maxMintable = Number(availableSupply);

  return (
    <div className="min-h-screen bg-black">
      <BlurHeader />
      <main className="p-4 pb-10 min-h-[100vh] flex items-center justify-center container max-w-screen-lg mx-auto">
        <div className="py-20 text-center text-white">
          <div className="flex flex-col items-center gap-8">
            {/* <div className="aspect-square w-3/4 mx-auto relative rounded-2xl overflow-hidden">
              <Spline scene="https://prod.spline.design/ZSB-xEOdeUNPtdtE/scene.splinecode" />
            </div> */}

            {tokenMetadata?.image && (
              <MediaRenderer
                client={client}
                src={tokenMetadata.image}
                className="w-32 h-32 rounded-full mb-6 border-4 border-yellow-500"
              />
            )}

            <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent font-serif">
              {tokenMetadata?.name || "Base Token"}
            </h1>

            <div className="flex gap-4 mb-8">
              <button
                className={`px-6 py-2 rounded-full ${
                  isClaimMode
                    ? "bg-yellow-600 text-black"
                    : "bg-black/10 hover:bg-black/20"
                }`}
                onClick={() => {
                  setIsClaimMode(true);
                  setIsModalOpen(true);
                }}
              >
                Transfer Tokens
              </button>
              <button
                className={`px-6 py-2 rounded-full ${
                  !isClaimMode
                    ? "bg-yellow-600 text-black"
                    : "bg-black/10 hover:bg-black/20"
                }`}
                onClick={() => setIsClaimMode(false)}
              >
                Mint Tokens
              </button>
            </div>

            {isModalOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center">
                <div className="bg-black p-6 rounded-lg text-center shadow-lg">
                  <h2 className="text-xl font-bold mb-4 text-yellow-400">
                    Feature Under Development
                  </h2>
                  <p className="mb-4 text-yellow-300">
                    The transfer tokens feature is currently under development.
                    The smart contract is deployed via thirdweb infra but a work
                    in progress to connect it to this frontend app.
                  </p>
                  <button
                    className="bg-yellow-600 text-black px-4 py-2 rounded hover:bg-yellow-700 transition"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

            <div className="my-8 p-6 bg-black/5 rounded-xl border border-black/10">
              <div className="flex flex-col gap-4 items-center">
                <div className="flex items-center gap-4">
                  <button
                    className="bg-black/10 px-4 py-2 rounded-lg hover:bg-black/20 transition-colors"
                    onClick={() => setAmount(Math.max(1, amount - 1))}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) =>
                      setAmount(Math.max(1, Number(e.target.value)))
                    }
                    className="w-24 text-center bg-black/10 rounded-lg py-2"
                    min="1"
                  />
                  <button
                    className="bg-black/10 px-4 py-2 rounded-lg hover:bg-black/20 transition-colors"
                    onClick={() => setAmount(amount + 1)}
                  >
                    +
                  </button>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-yellow-300">
                    Available: {availableTokens.toLocaleString()}
                  </p>
                  <p className="text-sm text-yellow-400">
                    Max per wallet: {maxPerWallet.toString()}
                  </p>
                  {totalTokenSupply && (
                    <p className="text-sm text-yellow-500">
                      Total supply:{" "}
                      {toTokens(totalTokenSupply, decimals).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <TransactionButton
              transaction={async () => {
                try {
                  if (!account) {
                    throw new Error(
                      "Wallet not connected. Please connect your wallet."
                    );
                  }
                  if (isClaimMode) {
                    // Transfer tokens logic
                    setIsModalOpen(true);
                    const transferAmount = (
                      BigInt(amount) * BigInt(10 ** decimals)
                    ).toString();
                    console.log("Transfer tokens:", transferAmount);
                    const transaction = await prepareContractCall({
                      contract: tokenContract,
                      method:
                        "function transfer(address to, uint256 amount) returns (bool)",
                      // @ts-ignore
                      params: [account?.address || "", transferAmount],
                    });
                    const result = await sendTransaction({
                      transaction,
                      // @ts-ignore
                      account: account?.address || "",
                    });
                    return result;
                  } else {
                    // Mint logic (needs decimal conversion)
                    return mintTo({
                      contract: tokenContract,
                      to: account?.address || "",
                      amount: (
                        BigInt(amount) * BigInt(10 ** decimals)
                      ).toString(),
                    });
                  }
                } catch (error) {
                  console.error("Transaction failed:", error);
                  throw error;
                }
              }}
              onError={(error) => {
                console.error("Transaction error:", error);
                let errorMessage = error.message;
                if (error.message.includes("not minter")) {
                  errorMessage =
                    "Only authorized minters can create new tokens";
                } else if (error.message.includes("user rejected")) {
                  errorMessage = "Transaction rejected by user";
                }
                setError(errorMessage);
                setTxHash("");
              }}
              // @ts-ignore
              onTransactionSubmitted={(result) => {
                console.log("Transaction submitted:", result.transactionHash);
                setError("");
                setTxHash(result.transactionHash);
              }}
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 px-8 py-4 rounded-xl text-lg font-bold transition-all transform hover:scale-105"
            >
              {isClaimMode
                ? `Transfer ${amount} ${tokenMetadata?.symbol || "TOKENS"}`
                : `Mint ${amount} ${tokenMetadata?.symbol || "TOKENS"}`}
            </TransactionButton>

            {error && (
              <div className="mt-4 p-4 bg-red-900/20 rounded-xl">
                <p className="text-red-400">Error: {error}</p>
              </div>
            )}

            {txHash && (
              <div className="mt-4 p-4 bg-yellow-900/20 rounded-xl">
                <p className="text-yellow-400">
                  Success! View transaction:
                  <a
                    href={`https://basescan.org/tx/${txHash}`}
                    target="_blank"
                    className="underline ml-2"
                  >
                    BaseScan
                  </a>
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

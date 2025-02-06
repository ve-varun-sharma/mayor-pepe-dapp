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
  getClaimerProofs,
  claimTo,
  totalSupply,
  mintTo,
} from "thirdweb/extensions/erc20";
import { BlurHeader } from "@/components/Headers/Header";
import { useState } from "react";
import { MediaRenderer } from "thirdweb/react";
import { getContractMetadata } from "thirdweb/extensions/common";

// Replace with your ERC20 contract address
const TOKEN_CONTRACT_ADDRESS = "0xB926598d2E818D574dd952b8D227406E47a0E617";

export default function MintTokenPage() {
  const account = useActiveAccount();
  const [amount, setAmount] = useState(1);
  const [error, setError] = useState("");
  const [txHash, setTxHash] = useState("");
  const [isClaimMode, setIsClaimMode] = useState(true);

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
            {tokenMetadata?.image && (
              <MediaRenderer
                client={client}
                src={tokenMetadata.image}
                className="w-32 h-32 rounded-full mb-6"
              />
            )}

            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-cyan-500 bg-clip-text text-transparent">
              {tokenMetadata?.name || "Base Token"}
            </h1>

            <div className="flex gap-4 mb-8">
              <button
                className={`px-6 py-2 rounded-full ${
                  isClaimMode
                    ? "bg-cyan-600 text-white"
                    : "bg-white/10 hover:bg-white/20"
                }`}
                onClick={() => setIsClaimMode(true)}
              >
                Claim Tokens
              </button>
              <button
                className={`px-6 py-2 rounded-full ${
                  !isClaimMode
                    ? "bg-green-600 text-white"
                    : "bg-white/10 hover:bg-white/20"
                }`}
                onClick={() => setIsClaimMode(false)}
              >
                Mint Tokens
              </button>
            </div>

            <div className="my-8 p-6 bg-white/5 rounded-xl border border-white/10">
              <div className="flex flex-col gap-4 items-center">
                <div className="flex items-center gap-4">
                  <button
                    className="bg-white/10 px-4 py-2 rounded-lg hover:bg-white/20 transition-colors"
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
                    className="w-24 text-center bg-white/10 rounded-lg py-2"
                    min="1"
                  />
                  <button
                    className="bg-white/10 px-4 py-2 rounded-lg hover:bg-white/20 transition-colors"
                    onClick={() => setAmount(amount + 1)}
                  >
                    +
                  </button>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-gray-400">
                    Available: {availableTokens.toLocaleString()}
                  </p>
                  <p className="text-sm text-cyan-400">
                    Max per wallet: {maxPerWallet.toString()}
                  </p>
                  {totalTokenSupply && (
                    <p className="text-sm text-amber-400">
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
                  if (isClaimMode) {
                    // Claim logic (uses token amount directly)
                    console.log(
                      "Claim quantity:",
                      (BigInt(amount) * BigInt(10 ** decimals)).toString()
                    );
                    return claimTo({
                      contract: tokenContract,
                      to: account?.address || "",
                      quantity: (
                        BigInt(amount) * BigInt(10 ** decimals)
                      ).toString(),
                      proof: [],
                      overrides: {
                        value: BigInt(0),
                      },
                    });
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
              onTransactionSubmitted={(result) => {
                console.log("Transaction submitted:", result.transactionHash);
                setError("");
                setTxHash(result.transactionHash);
              }}
              className="bg-gradient-to-r from-green-500 to-cyan-600 hover:from-green-600 hover:to-cyan-700 px-8 py-4 rounded-xl text-lg font-bold transition-all transform hover:scale-105"
            >
              {isClaimMode
                ? `Claim ${amount} ${tokenMetadata?.symbol || "TOKENS"}`
                : `Mint ${amount} ${tokenMetadata?.symbol || "TOKENS"}`}
            </TransactionButton>

            {error && (
              <div className="mt-4 p-4 bg-red-900/20 rounded-xl">
                <p className="text-red-400">Error: {error}</p>
              </div>
            )}

            {txHash && (
              <div className="mt-4 p-4 bg-green-900/20 rounded-xl">
                <p className="text-green-400">
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

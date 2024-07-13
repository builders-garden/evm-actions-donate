import { erc20Abi } from "@/lib/contracts/erc20abi";
import { base, baseSepolia, morphHolesky, morphSepolia } from "viem/chains";
import { NextRequest, NextResponse } from "next/server";
import { encodeFunctionData, extractChain, http, parseUnits } from "viem";
import { createPublicClient } from "viem";
import { error } from "console";
import * as chains from 'viem/chains'


export const POST = async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);

  // Get paramaters from the url
  const chainId = searchParams.get("chainId"); //token address
  const tokenAddress = searchParams.get("tokenAddress"); //token address
  const toAddress = searchParams.get("toAddress"); //amount in tokenIn
  const amount = searchParams.get("amount"); //amount in tokenIn

  // if chainId is not provided, use the default chainId
  const chain = chainId ? Number(chainId) : baseSepolia.id;
  // if tokenAddress, toAddress, amount are not provided, return an error
  if (!tokenAddress || !toAddress || !amount) {
    return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
  }

  const viemChain = extractChain({
    chains: Object.values(chains),
    // @ts-ignore
    id: chain,
  })

  // Get token decimals
  const publicClient = createPublicClient({
    chain: viemChain, // chain to use for
    transport: http(),
  });

  // check token decimals
  let decimals = 18;
  let isNativeToken = true;
  if (tokenAddress !== "0x0000000000000000000000000000000000000000") {
    decimals = await publicClient.readContract({
      address: tokenAddress as `0x${string}`,
      abi: erc20Abi,
      functionName: "decimals",
    });
    isNativeToken = false;
  }
  // Prepare amount to transfer
  const bigIntAmount = BigInt(parseUnits(amount as string, decimals));

  // Transfer calldata
  const transferCalldata = encodeFunctionData({
    abi: erc20Abi,
    functionName: "transfer",
    args: [toAddress as `0x${string}`, bigIntAmount],
  });

  // Prepare transactions
  let transactions = [];
  if (isNativeToken) {
    transactions = [
      {
        chainId: `${chain}`,
        to: toAddress as `0x${string}`,
        data: "",
        value: bigIntAmount.toString(),
      },
    ];
  } else {
    transactions = [
      {
        chainId: `${chain}`,
        to: tokenAddress as `0x${string}`,
        data: transferCalldata,
        value: BigInt(0).toString(),
      },
    ];
  }

  return NextResponse.json({
    transactions,
  });
};

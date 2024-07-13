import { erc20Abi } from "@/lib/contracts/erc20abi";
import { base, baseSepolia, morphHolesky, morphSepolia } from "viem/chains";
import { NextRequest, NextResponse } from "next/server"
import { NextApiRequest } from 'next';
import { encodeFunctionData, http, parseUnits } from "viem";
import { createPublicClient } from 'viem'


export const POST = async (req: NextApiRequest) => {
  const body = await req.body();
  // get user address from the body
  const { address } = body;
  // get the tokenAddress, toAddress, amount and chainId from the query parameters
  const { chainId, tokenAddress, toAddress, amount } = req.query;
  // if chainId is not provided, use the default chainId
  const chain = chainId ? chainId : base.id;
  // if tokenAddress, toAddress, amount are not provided, return an error
  if (!tokenAddress || !toAddress || !amount) {
    return NextResponse.error;
  }

  // Get token decimals
  const publicClient = createPublicClient({ 
    chain: base,
    transport: http()
  })

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
        chainId: chain,
        abi: "",
        to: toAddress as `0x${string}`,
        data: "",
        value: bigIntAmount.toString(),
      },
    ];
  } else {
    transactions = [
      {
        chainId: chain,
        abi: erc20Abi,
        to: tokenAddress as `0x${string}`,
        data: transferCalldata,
        value: BigInt(0).toString(),
      },
    ];
  }

  return NextResponse.json({
    transactions: transactions,
  });
};

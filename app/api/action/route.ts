import { EVMAction, ActionLinkType } from "@/lib/actions";
import { appURL } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);

  const evmActionMetadata: EVMAction = {
    title: "Donate EVM Action",
    description: `This is a donation EVM action! You'll send ${searchParams.get('amount')} ${searchParams.get('tokenAddress')} to ${searchParams.get('toAddress')} on chain ${searchParams.get('chainId')}`,
    image: `${appURL()}/landing.png`,
    links: [
      {
        targetUrl: `${appURL()}/api/tx?chainId=${searchParams.get('chainId')}&tokenAddress=${searchParams.get('tokenAddress')}&toAddress=${searchParams.get('toAddress')}&amount=${searchParams.get('amount')}`,
        postUrl: `${appURL()}/tx-success`, // this will be a GET HTTP call
        label: "Tx",
        type: ActionLinkType.TX,
      },
    ],
    label: "Donate",
  };
  return NextResponse.json(evmActionMetadata);
};

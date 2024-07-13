import { EVMAction, ActionLinkType } from "@/lib/actions";
import { appURL } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  const evmActionMetadata: EVMAction = {
    title: "Transfer EVM Action",
    description: "This is a sample EVM Action for transferring tokens",
    image: "https://placehold.co/955x500",
    links: [
      {
        targetUrl: `${appURL()}/api/tx`,
        postUrl: `${appURL()}/tx-success`, // this will be a GET HTTP call
        label: "Tx",
        type: ActionLinkType.TX,
      },
    ],
    label: "Donate",
  };
  return NextResponse.json(evmActionMetadata);
};

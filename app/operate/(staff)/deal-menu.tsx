"use client";

import Link from "next/link";
import { useState } from "react";
import { ExternalLink, Link2, MoreHorizontal, PencilLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function DealMenu({ dealId, token, companyName }: { dealId: string; token: string; companyName: string }) {
  const [copied, setCopied] = useState(false);
  const clientPath = `/operate/d/${token}`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${clientPath}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Actions for ${companyName}`}
          className="relative z-10 justify-self-end rounded-md text-muted-foreground hover:text-foreground data-[state=open]:bg-foreground/5 data-[state=open]:text-foreground"
        >
          <MoreHorizontal aria-hidden="true" className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem asChild>
          <Link href={`/operate/${dealId}`}>
            <PencilLine aria-hidden="true" />
            Edit deal
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href={clientPath} target="_blank" rel="noreferrer">
            <ExternalLink aria-hidden="true" />
            Open client page
          </a>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={(event) => {
            event.preventDefault();
            void copyLink();
          }}
        >
          <Link2 aria-hidden="true" />
          {copied ? "Copied" : "Copy client link"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

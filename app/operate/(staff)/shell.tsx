"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, LogOut } from "lucide-react";
import { signOutAction } from "@/app/operate/actions";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { DealAvatar } from "./deal-avatar";

type RailDeal = {
  id: string;
  companyName: string;
  contactName: string;
  companyLogoUrl: string | null;
};

const railItem =
  "h-10 rounded-none border-l-2 border-transparent px-3 text-[14px] text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground data-[active=true]:border-orange data-[active=true]:bg-sidebar-accent data-[active=true]:font-normal data-[active=true]:text-orange";

const railLabel = "operate-label h-auto px-3 pb-3 pt-6 text-sidebar-foreground/50";

function Wordmark() {
  return (
    <span
      role="img"
      aria-label="Bloom"
      className="block h-[19px] w-[123px] bg-[#FAF6EC]"
      style={{
        WebkitMaskImage: "url(/bloom-wordmark.svg)",
        maskImage: "url(/bloom-wordmark.svg)",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskSize: "contain",
        maskSize: "contain",
      }}
    />
  );
}

export function OperateShell({
  deals,
  email,
  children,
}: {
  deals: RailDeal[];
  email: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const current = deals.find((deal) => pathname === `/operate/${deal.id}`);

  return (
    <SidebarProvider>
      <Sidebar collapsible="offcanvas" className="border-sidebar-border">
        <SidebarHeader className="gap-3 px-5 pb-2 pt-6">
          <Link href="/operate" className="block w-fit py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring">
            <Wordmark />
          </Link>
          <span className="operate-label text-sidebar-foreground/50">Operate</span>
        </SidebarHeader>

        <SidebarContent className="pb-4">
          <SidebarGroup className="p-0 px-2">
            <SidebarGroupLabel className={railLabel}>Navigate</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/operate"} className={railItem}>
                  <Link href="/operate">
                    <LayoutDashboard aria-hidden="true" />
                    <span>Deals</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>

          <SidebarGroup className="p-0 px-2">
            <SidebarGroupLabel className={railLabel}>Open deals</SidebarGroupLabel>
            <SidebarMenu className="gap-1">
              {deals.map((deal) => (
                <SidebarMenuItem key={deal.id}>
                  <SidebarMenuButton
                    asChild
                    size="lg"
                    isActive={pathname === `/operate/${deal.id}`}
                    className={`${railItem} h-14 gap-3`}
                  >
                    <Link href={`/operate/${deal.id}`}>
                      <DealAvatar companyName={deal.companyName} logoUrl={deal.companyLogoUrl} />
                      <span className="grid min-w-0 flex-1 leading-tight">
                        <span className="truncate">{deal.companyName}</span>
                        {deal.contactName ? (
                          <span className="truncate text-xs text-sidebar-foreground/50">{deal.contactName}</span>
                        ) : null}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="gap-3 border-t border-sidebar-border px-5 py-5">
          <span className="truncate text-xs text-sidebar-foreground/60">{email}</span>
          <form action={signOutAction}>
            <button
              type="submit"
              className="operate-label flex items-center gap-2 text-sidebar-foreground/80 transition-colors hover:text-orange focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
            >
              <LogOut aria-hidden="true" className="size-3.5" />
              Sign out
            </button>
          </form>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <SidebarInset>
        <header className="sticky top-0 z-20 flex h-12 shrink-0 items-center gap-3 border-b border-border bg-background px-3">
          <SidebarTrigger />
          <span className="operate-label text-muted-foreground">
            {current ? `Deals / ${current.companyName}` : "Deals"}
          </span>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}

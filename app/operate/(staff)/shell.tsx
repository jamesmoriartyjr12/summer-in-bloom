"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard } from "lucide-react";
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
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";

type RailDeal = {
  id: string;
  companyName: string;
  contactName: string;
};

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

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild size="lg" tooltip="Operate">
                <Link href="/operate">
                  {/* Bloom mark stays the identity of the rail. */}
                  <img alt="" className="size-4" src="/bloom-mark.svg" />
                  <span className="truncate font-medium">Operate</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="operate-label">Navigate</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/operate"} tooltip="Deals">
                  <Link href="/operate">
                    <LayoutDashboard aria-hidden="true" />
                    <span>Deals</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel className="operate-label">Open deals</SidebarGroupLabel>
            <SidebarMenu>
              {deals.map((deal) => (
                <SidebarMenuItem key={deal.id}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === `/operate/${deal.id}`}
                    tooltip={deal.companyName}
                  >
                    <Link href={`/operate/${deal.id}`}>
                      <span className="flex size-4 items-center justify-center text-[10px] font-medium">
                        {deal.companyName.slice(0, 1).toUpperCase()}
                      </span>
                      <span>{deal.companyName}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarSeparator />
        <SidebarFooter>
          <p className="truncate px-2 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">{email}</p>
          <form action={signOutAction}>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton type="submit" tooltip="Sign out">
                  <span>Sign out</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </form>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-20 flex h-12 shrink-0 items-center gap-2 border-b border-border bg-background px-3">
          <SidebarTrigger />
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}

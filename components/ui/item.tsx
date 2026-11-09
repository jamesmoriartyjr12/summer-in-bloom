"use client";

import { Slot } from "radix-ui";
import * as React from "react";
import { tv, type VariantProps } from "tailwind-variants";
import { cn } from "@/lib/utils";

function ItemGroup({ className, ...props }: React.ComponentProps<"div">) {
  return <div role="list" className={cn("group/item-group flex w-full flex-col", className)} {...props} />;
}

const itemVariants = tv({
  base: "group/item flex w-full flex-wrap items-center rounded-lg border text-sm outline-none transition-colors duration-100 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50",
  defaultVariants: { size: "default", variant: "default" },
  variants: {
    size: {
      default: "gap-4 px-4 py-4",
      sm: "gap-2.5 px-3 py-2.5",
      xs: "gap-2 px-2.5 py-2",
    },
    variant: {
      default: "border-transparent",
      muted: "border-transparent bg-muted/50",
      outline: "border-border",
    },
  },
});

function Item({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof itemVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "div";
  return (
    <Comp
      role="listitem"
      data-size={size}
      data-variant={variant}
      className={cn(itemVariants({ size, variant }), className)}
      {...props}
    />
  );
}

const itemMediaVariants = tv({
  base: "flex shrink-0 items-center justify-center gap-2 [&_svg]:pointer-events-none",
  defaultVariants: { variant: "default" },
  variants: {
    variant: {
      default: "bg-transparent",
      icon: "[&_svg]:size-4",
      image: "size-10 overflow-hidden rounded-sm [&_img]:size-full [&_img]:object-cover",
    },
  },
});

function ItemMedia({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof itemMediaVariants>) {
  return <div data-variant={variant} className={cn(itemMediaVariants({ variant }), className)} {...props} />;
}

function ItemContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex min-w-0 flex-1 flex-col gap-1", className)} {...props} />;
}

function ItemTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("line-clamp-1 flex w-fit items-center gap-2 text-sm font-medium leading-snug underline-offset-4", className)}
      {...props}
    />
  );
}

function ItemDescription({ className, ...props }: React.ComponentProps<"p">) {
  return <p className={cn("line-clamp-2 text-left text-sm font-normal leading-normal text-muted-foreground", className)} {...props} />;
}

function ItemActions({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex items-center gap-2", className)} {...props} />;
}

export { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle };


// Sidebar: Always visible, never overlays, doesn't block content (even mobile).
import * as React from "react";
import { cn } from "@/lib/utils";
import { useSidebar } from "./SidebarProvider";

/**
 * Sidebar is always visible (fixed/inline), collapses to mini width (w-16) when toggled,
 * never overlays content in any mode (desktop or mobile).
 */
export const Sidebar: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => {
  const { state } = useSidebar();

  return (
    <nav
      className={cn(
        // Fixed sidebar on ALL breakpoints, never overlays
        "flex h-full w-64 flex-col bg-sidebar text-sidebar-foreground fixed inset-y-0 left-0 z-10 border-r border-sidebar-border transition-all duration-200 ease-in-out select-none",
        state === "collapsed" && "w-16",
        "overflow-y-auto",
        className
      )}
      data-state={state}
      aria-label="Sidebar"
      {...props}
    >
      {children}
    </nav>
  );
};


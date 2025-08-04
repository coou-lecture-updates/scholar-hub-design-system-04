
import * as React from "react"
import { useIsMobile } from "@/hooks/use-mobile"

export type SidebarState = "expanded" | "collapsed";
type SidebarContextType = {
  state: SidebarState;
  open: boolean;
  setOpen: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
};

const SidebarContext = React.createContext<SidebarContextType | null>(null);

export function useSidebar() {
  const ctx = React.useContext(SidebarContext);
  if (!ctx) {
    throw new Error("useSidebar must be used within SidebarProvider.");
  }
  return ctx;
}

export const SidebarProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [open, setOpen] = React.useState(true);
  const isMobile = useIsMobile();

  const toggleSidebar = React.useCallback(() => setOpen((o) => !o), []);

  const state = open ? "expanded" : "collapsed";

  return (
    <SidebarContext.Provider value={{ state, open, setOpen, isMobile, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
};

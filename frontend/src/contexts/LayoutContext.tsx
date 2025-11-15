import React, { createContext, useContext, useState, useEffect } from "react";

type LayoutContextType = {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
};

const LayoutContext = createContext<LayoutContextType>({
  collapsed: false,
  setCollapsed: () => {},
});

export const SIDEBAR_WIDTH = 220;
export const SIDEBAR_COLLAPSED_WIDTH = 80;

export const useLayoutContext = () => useContext(LayoutContext);

export const LayoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    return saved === "true";
  });

  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", collapsed.toString());
  }, [collapsed]);

  return (
    <LayoutContext.Provider value={{ collapsed, setCollapsed }}>
      {children}
    </LayoutContext.Provider>
  );
};
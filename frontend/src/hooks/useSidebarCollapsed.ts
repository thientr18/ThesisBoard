import { useEffect, useState } from "react";

export function useSidebarCollapsed() {
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    return saved === "true";
  });

  useEffect(() => {
    const handler = () => {
      const saved = localStorage.getItem("sidebar-collapsed");
      setCollapsed(saved === "true");
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  return collapsed;
}
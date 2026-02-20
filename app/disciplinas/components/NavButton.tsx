"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";

type NavButtonProps = {
  children: ReactNode;
  href: string;
  onClick: () => void;
};

export function NavButton({ children, href, onClick }: NavButtonProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <button
      onClick={onClick}
      className="
        relative flex items-center gap-2 px-4 py-2 rounded-lg
        transition-all duration-300 ease-out
        border
        active:scale-95
      "
      style={{
        borderColor: "var(--border)",
        color: "var(--foreground)",
        backgroundColor: isActive ? "var(--card)" : "transparent",
      }}
    >
      {children}

      <span
        className="absolute left-3 right-3 bottom-0 h-[2px] rounded-full transition-all duration-300"
        style={{
          background:
            "linear-gradient(to right, var(--gradient-start), var(--gradient-end))",
          opacity: isActive ? 1 : 0,
        }}
      />
    </button>
  );
}

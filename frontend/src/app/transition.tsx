"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type TransitionProps = {
  children: ReactNode;
};

export default function Transition({ children }: TransitionProps) {
  const pathname = usePathname();
  const [show, setShow] = useState(true);

  useEffect(() => {
    setShow(false);

    const frame = requestAnimationFrame(() => {
      setShow(true);
    });

    return () => cancelAnimationFrame(frame);
  }, [pathname]);

  return (
    <div
      className="relative min-h-[50vh] transition-opacity duration-300 ease-out"
      style={{ opacity: show ? 1 : 0.96 }}
    >
      {children}
    </div>
  );
}
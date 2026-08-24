import type { ReactNode } from "react";
import ProShell from "@/components/pro/ProShell";

export default function ProLayout({ children }: { children: ReactNode }) {
  return <ProShell>{children}</ProShell>;
}

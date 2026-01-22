"use client";

import { useState } from "react";
import { PrimaryHeader } from "@/components/core-components/primary-header";
import Footer from "@/components/core-components/footer";
import { useHeaderIntersection } from "@/hooks/useHeaderIntersection";

export default function PublicPagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [headerRef, outOfView] = useHeaderIntersection();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <PrimaryHeader
        menuActive={menuOpen}
        onMenuToggle={() => setMenuOpen((v) => !v)}
      />
      <div ref={headerRef} />
      <main className="pt-16 w-full px-2 py-2">
        {children}
      </main>
      <Footer />
    </>
  );
}

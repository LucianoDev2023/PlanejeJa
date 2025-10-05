"use client";

import { useAuth, UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NavStart = () => {
  const pathname = usePathname();

  const { signOut } = useAuth();

  const links = [
    { href: "/", label: "Início" },
    { href: "/transactions", label: "Transações" },
    { href: "/subscription", label: "Assinatura" },
  ];

  const isHome = pathname === "/";

  return (
    <nav className="fixed left-0 top-0 z-[99] flex w-full items-center justify-between border-b border-solid bg-gradient-to-b from-[#0b1219] to-[#040b11] px-2 py-2 sm:px-4 sm:py-2">
      {/* LOGO */}
      <div className="flex items-center">
        <div className="flex items-center justify-center gap-2 text-white/90 sm:text-white/70">
          <Image
            src="/New11.png"
            alt="Planeje Já"
            className="w-12 opacity-80 sm:w-16 lg:w-16"
            width={50}
            height={64}
          />
          <p className="items-center justify-center font-sans text-sm font-semibold">
            PlanejeJá
          </p>
        </div>
      </div>
    </nav>
  );
};

export default NavStart;

"use client";

import { useAuth, UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Menu } from "lucide-react";

const Navbar = () => {
  const pathname = usePathname();

  const { signOut } = useAuth();

  const links = [
    { href: "/", label: "Início" },
    { href: "/transactions", label: "Transações" },
    { href: "/subscription", label: "Assinatura" },
    { href: "/criptos", label: "Criptos" },
  ];

  const isHome = pathname === "/";

  return (
    <nav className="flex items-center justify-between border-b border-solid bg-gradient-to-b from-[#0b1219] to-[#040b11] px-2 py-2 sm:px-4 sm:py-2">
      {/* LOGO */}
      <div className="flex items-center">
        {isHome ? (
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
        ) : (
          <Link href="/">
            <div className="flex items-center justify-center gap-2 text-white/90 sm:text-white/70">
              <Image
                src="/New11.png"
                alt="Planeje Já"
                className="w-12 opacity-80 sm:w-16 lg:w-16"
                width={100}
                height={64}
              />
              <p className="font-sans text-sm font-semibold">PlanejeJá</p>
            </div>
          </Link>
        )}
      </div>

      {/* MENU DESKTOP */}
      <div className="hidden items-center gap-6 sm:flex">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={
              pathname === link.href
                ? "font-bold text-primary"
                : "text-muted-foreground"
            }
          >
            {link.label}
          </Link>
        ))}
        <UserButton showName />
      </div>

      {/* MENU MOBILE */}
      <div className="flex items-center justify-center gap-3 sm:hidden">
        <UserButton showName />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center rounded-lg border-2 bg-gradient-to-b from-[#213243] to-[#040b11] p-1 focus:outline-none">
              <Menu className="text-gray-400" size={24} />{" "}
              {/* Ícone de 3 barras do Lucide */}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="mr-4 w-40 border-2 border-[#213243] bg-gradient-to-t from-[#1a2a3a] to-[#040b11]">
            {links.map((link) => (
              <DropdownMenuItem key={link.href} asChild>
                <Link
                  href={link.href}
                  className={
                    pathname === link.href
                      ? "font-bold text-primary"
                      : "text-muted-foreground"
                  }
                >
                  {link.label}
                </Link>
              </DropdownMenuItem>
            ))}

            <DropdownMenuItem asChild onClick={() => signOut()}>
              <span className="cursor-pointer text-red-500">Sair</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="mt-2 items-center justify-center">
              <p className="text-center text-xs text-white/40">
                Versão 1.4.0 ©2024
              </p>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
};

export default Navbar;

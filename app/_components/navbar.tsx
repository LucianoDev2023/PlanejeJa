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
import { Menu, LayoutDashboard, LogOut, TrendingUp, LineChart } from "lucide-react";

const Navbar = () => {
  const pathname = usePathname();
  const { signOut } = useAuth();

  const links = [
    { href: "/criptos", label: "Dashboard", icon: <LayoutDashboard size={16} /> },
    { href: "/patrimonio", label: "Patrimônio", icon: <TrendingUp size={16} /> },
    { href: "/evolucao", label: "Evolução", icon: <LineChart size={16} /> },
  ];

  return (
    <nav className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-white/5 bg-[#020617]/80 px-4 backdrop-blur-xl sm:px-8">
      {/* LOGO */}
      <Link href="/criptos" className="group flex items-center gap-3 transition-all hover:opacity-90">
        <div className="relative">
          <div className="absolute -inset-1 rounded-full bg-primary/20 blur opacity-0 group-hover:opacity-100 transition-opacity" />
          <Image
            src="/New11.png"
            alt="Planeje Já"
            className="relative w-10 sm:w-12"
            width={48}
            height={48}
          />
        </div>
        <div className="flex flex-col">
          <span className="font-sans text-sm font-bold tracking-tight text-white sm:text-base">
            Planeje<span className="text-primary">Já</span>
          </span>
          <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">
            Crypto Assets
          </span>
        </div>
      </Link>

      {/* MENU DESKTOP */}
      <div className="hidden items-center gap-8 sm:flex">
        {links.map(({ href, label, icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-2 text-sm font-bold transition-all ${
              pathname === href
                ? "neon-text-blue"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {icon}
            {label}
          </Link>
        ))}
        <div className="h-4 w-[1px] bg-white/10" />
        <UserButton 
          afterSignOutUrl="/login"
          appearance={{
            elements: {
              userButtonAvatarBox: "h-8 w-8 ring-2 ring-primary/20 ring-offset-2 ring-offset-[#020617]",
            }
          }}
        />
      </div>

      {/* MENU MOBILE */}
      <div className="flex items-center gap-4 sm:hidden">
        <UserButton afterSignOutUrl="/login" />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-400 focus:outline-none focus:ring-1 focus:ring-primary/50">
              <Menu size={20} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 rounded-2xl border-white/10 bg-[#020617] p-2 shadow-2xl backdrop-blur-xl">
            {links.map(({ href, label, icon }) => (
              <DropdownMenuItem key={href} asChild>
                <Link
                  href={href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-bold transition-all ${
                    pathname === href
                      ? "bg-primary/20 text-primary"
                      : "text-slate-400 hover:bg-white/5"
                  }`}
                >
                  {icon}
                  {label}
                </Link>
              </DropdownMenuItem>
            ))}

            <div className="my-2 h-[1px] bg-white/5" />

            <DropdownMenuItem 
              onClick={() => signOut()}
              className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-bold text-rose-500 hover:bg-rose-500/10 cursor-pointer"
            >
              <LogOut size={16} />
              Sair
            </DropdownMenuItem>
            
            <div className="mt-2 px-3 pb-1 text-[10px] font-medium text-slate-600">
              Versão 2.1.0 ©2026
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
};

export default Navbar;

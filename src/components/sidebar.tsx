"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, Receipt } from "lucide-react";

const navItems = [
  {
    label: "Cadastro",
    href: "/cadastro",
    icon: Users,
  },
  {
    label: "Cobranças",
    href: "/cobrancas",
    icon: Receipt,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 flex-col bg-menlo-blue">
      <div className="flex h-16 items-center px-6">
        <Link href="/cadastro">
          <Image
            src="/logo_menlo.png"
            alt="Menlo"
            width={120}
            height={32}
            priority
          />
        </Link>
      </div>

      <nav className="mt-6 flex flex-col gap-1 px-3">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-white/25 text-black"
                  : "text-black/70 hover:bg-white/15 hover:text-black"
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

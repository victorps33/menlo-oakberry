"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { Users, Receipt } from "lucide-react";

const navigation = [
  { name: "Cadastro", href: "/cadastro", icon: Users },
  { name: "Cobranças", href: "/cobrancas", icon: Receipt },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      aria-label="Menu principal"
      className="flex h-full w-64 flex-col bg-white border-r border-gray-100"
    >
      {/* Logo */}
      <div className="flex h-16 items-center px-5 border-b border-gray-100 overflow-hidden">
        <Link href="/cadastro" className="shrink-0">
          <Image
            src="/menlo-logo-sidebar.png"
            alt="Menlo"
            width={120}
            height={32}
            priority
          />
        </Link>
      </div>

      {/* Main Navigation */}
      <nav aria-label="Navegação principal" className="flex-1 px-3 py-4 space-y-1">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                isActive
                  ? "bg-secondary/20 text-gray-900"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 flex-shrink-0",
                  isActive ? "text-primary" : "text-gray-500"
                )}
                strokeWidth={1.5}
                aria-hidden="true"
              />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

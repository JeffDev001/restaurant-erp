"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  UtensilsCrossed,
  ShoppingCart,
  Package,
  Users,
  ChartNoAxesCombined,
  LogOut,
  Menu,
  X,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  async function fetchUser() {
    try {
      const response = await fetch("/api/auth/me");
      const data = await response.json();

      if (data.success) {
        setUser(data.user);
      }
    } catch (error) {
      console.error("Failed to load user:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });

      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  const allLinks = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      roles: ["ADMIN", "MANAGER", "STAFF"],
    },
    {
      name: "Menu",
      href: "/menu",
      icon: UtensilsCrossed,
      roles: ["ADMIN", "MANAGER"],
    },
    {
      name: "Orders / POS",
      href: "/orders",
      icon: ShoppingCart,
      roles: ["ADMIN", "MANAGER", "STAFF"],
    },
    {
      name: "Inventory",
      href: "/inventory",
      icon: Package,
      roles: ["ADMIN", "MANAGER"],
    },
    {
      name: "Staff",
      href: "/staff",
      icon: Users,
      roles: ["ADMIN"],
    },
    {
      name: "Sales",
      href: "/sales",
      icon: ChartNoAxesCombined,
      roles: ["ADMIN", "MANAGER"],
    },
  ];

  const visibleLinks = user
    ? allLinks.filter((link) => link.roles.includes(user.role))
    : [];

  function isActive(href) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <>
      {/* MOBILE TOP BAR */}
      <header className="fixed left-0 right-0 top-0 z-40 flex h-16 items-center justify-between bg-gray-950 px-4 text-white shadow-md md:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-gray-800"
          aria-label="Open navigation"
        >
          <Menu size={24} />
        </button>

        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-sm font-bold text-gray-950">
            R
          </div>

          <span className="text-lg font-bold">
            Restaurant ERP
          </span>
        </div>

        <div className="w-10" />
      </header>

      {/* MOBILE OVERLAY */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed left-0 top-0 z-50 flex h-screen w-64
          flex-col bg-gray-950 text-white shadow-xl
          transition-transform duration-300
          md:translate-x-0
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* LOGO */}
        <div className="flex h-20 items-center justify-between border-b border-gray-800 px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white font-bold text-gray-950">
              R
            </div>

            <div>
              <p className="font-bold">Restaurant ERP</p>
              <p className="text-xs text-gray-500">
                Management System
              </p>
            </div>
          </div>

          {/* MOBILE CLOSE BUTTON */}
          <button
            onClick={() => setMobileOpen(false)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white md:hidden"
            aria-label="Close navigation"
          >
            <X size={22} />
          </button>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div
                  key={item}
                  className="h-11 animate-pulse rounded-lg bg-gray-900"
                />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {visibleLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.href);

                return (
                  <button
                    key={link.href}
                    onClick={() => router.push(link.href)}
                    className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium transition ${
                      active
                        ? "bg-white text-gray-950"
                        : "text-gray-400 hover:bg-gray-900 hover:text-white"
                    }`}
                  >
                    <Icon size={19} />
                    <span>{link.name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </nav>

        {/* USER SECTION */}
        <div className="border-t border-gray-800 p-4">
          {loading ? (
            <div className="animate-pulse">
              <div className="h-4 w-24 rounded bg-gray-800" />
              <div className="mt-2 h-3 w-32 rounded bg-gray-900" />
            </div>
          ) : (
            <>
              {user && (
                <div className="mb-3 rounded-lg bg-gray-900 p-3">
                  <p className="truncate text-sm font-semibold text-white">
                    {user.name}
                  </p>

                  <p className="truncate text-xs text-gray-500">
                    {user.email}
                  </p>

                  <p className="mt-1 text-xs font-medium text-gray-400">
                    {user.role}
                  </p>
                </div>
              )}

              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-400 transition hover:bg-red-950 hover:text-red-400"
              >
                <LogOut size={19} />
                <span>Logout</span>
              </button>
            </>
          )}
        </div>
      </aside>
    </>
  );
}
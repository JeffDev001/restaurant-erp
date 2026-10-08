"use client";

import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ChefHat,
  ClipboardList,
  CreditCard,
  Package,
  ShieldCheck,
  Users,
  Utensils,
} from "lucide-react";

const features = [
  {
    icon: ClipboardList,
    title: "Point of Sale",
    description:
      "Take orders, process payments and keep your restaurant's daily sales organized.",
  },
  {
    icon: Utensils,
    title: "Menu Management",
    description:
      "Create and manage your menu, categories, prices and availability from one place.",
  },
  {
    icon: Package,
    title: "Inventory",
    description:
      "Track stock levels, stock movements and low-stock items before they become a problem.",
  },
  {
    icon: Users,
    title: "Staff Management",
    description:
      "Create staff accounts and control what each member of your team can access.",
  },
  {
    icon: BarChart3,
    title: "Sales & Reports",
    description:
      "See revenue, transactions, payment methods and your best-selling menu items.",
  },
  {
    icon: ShieldCheck,
    title: "Role-Based Access",
    description:
      "Give managers and staff access to the tools they need while keeping sensitive areas protected.",
  },
];

const steps = [
  {
    number: "01",
    title: "Create your restaurant",
    description:
      "Set up your restaurant and create your administrator account in a few simple steps.",
  },
  {
    number: "02",
    title: "Set up your operations",
    description:
      "Add your menu, inventory and staff so your team is ready to work.",
  },
  {
    number: "03",
    title: "Run your restaurant",
    description:
      "Process orders, manage customers, track inventory and monitor sales from one system.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-gray-950">
      {/* Navigation */}
      <nav className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-950 text-sm font-bold text-white">
              R
            </div>

            <div>
              <p className="text-lg font-bold tracking-tight">
                Restaurant ERP
              </p>

              <p className="hidden text-xs text-gray-500 sm:block">
                Restaurant Management System
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            >
              Sign in
            </Link>

            <Link
              href="/register"
              className="rounded-lg bg-gray-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="overflow-hidden border-b border-gray-100">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 md:py-24 lg:grid-cols-2 lg:gap-16">
          {/* Hero Text */}
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-600">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              Built for modern restaurants
            </div>

            <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Run your restaurant with{" "}
              <span className="text-gray-500">clarity.</span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-gray-600">
              Manage orders, sales, inventory, customers and staff from one
              simple restaurant management platform.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-950 px-6 py-3.5 font-semibold text-white transition hover:bg-gray-800"
              >
                Create your restaurant
                <ArrowRight size={18} />
              </Link>

              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-xl border border-gray-300 px-6 py-3.5 font-semibold text-gray-800 transition hover:bg-gray-50"
              >
                Sign in
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-gray-500">
              <span className="flex items-center gap-2">
                <CheckCircle2 size={16} />
                Orders & POS
              </span>

              <span className="flex items-center gap-2">
                <CheckCircle2 size={16} />
                Inventory
              </span>

              <span className="flex items-center gap-2">
                <CheckCircle2 size={16} />
                Sales reports
              </span>
            </div>
          </div>

          {/* Dashboard Preview */}
          <div className="relative w-full min-w-0">
            <div className="absolute -inset-4 rounded-3xl bg-gray-100 blur-2xl" />

            <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-gray-950 shadow-2xl">
              {/* Browser bar */}
              <div className="flex h-12 items-center gap-2 border-b border-gray-800 px-4">
                <span className="h-2.5 w-2.5 rounded-full bg-gray-700" />
                <span className="h-2.5 w-2.5 rounded-full bg-gray-700" />
                <span className="h-2.5 w-2.5 rounded-full bg-gray-700" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-[150px_1fr]">
                {/* Fake sidebar */}
                <div className="hidden border-r border-gray-800 p-4 sm:block">
                  <div className="mb-6 flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-xs font-bold text-gray-950">
                      R
                    </div>

                    <span className="text-xs font-semibold text-white">
                      Restaurant ERP
                    </span>
                  </div>

                  <div className="space-y-2">
                    {[
                      "Dashboard",
                      "Menu",
                      "Orders",
                      "Customers",
                      "Inventory",
                      "Sales",
                    ].map((item, index) => (
                      <div
                        key={item}
                        className={`rounded-md px-3 py-2 text-[11px] ${
                          index === 0
                            ? "bg-white text-gray-950"
                            : "text-gray-500"
                        }`}
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dashboard content */}
                <div className="min-w-0 p-4 sm:p-6">
                  <div className="mb-5">
                    <p className="text-xs text-gray-500">
                      Good morning
                    </p>

                    <p className="mt-1 text-lg font-bold text-white">
                      Restaurant Dashboard
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-1 gap-3 xs:grid-cols-3 sm:grid-cols-3">
                    <div className="rounded-lg border border-gray-800 bg-gray-900 p-3">
                      <p className="text-[10px] text-gray-500">
                        Today's Sales
                      </p>

                      <p className="mt-2 text-sm font-bold text-white">
                        GH₵ 4,850
                      </p>
                    </div>

                    <div className="rounded-lg border border-gray-800 bg-gray-900 p-3">
                      <p className="text-[10px] text-gray-500">
                        Orders
                      </p>

                      <p className="mt-2 text-sm font-bold text-white">
                        47
                      </p>
                    </div>

                    <div className="rounded-lg border border-gray-800 bg-gray-900 p-3">
                      <p className="text-[10px] text-gray-500">
                        Customers
                      </p>

                      <p className="mt-2 text-sm font-bold text-white">
                        126
                      </p>
                    </div>
                  </div>

                  {/* Recent Orders */}
                  <div className="mt-4 rounded-lg border border-gray-800 bg-gray-900 p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <p className="text-xs font-semibold text-white">
                        Recent Orders
                      </p>

                      <span className="text-[10px] text-gray-500">
                        Today
                      </span>
                    </div>

                    <div className="space-y-3">
                      {[
                        ["#ORD-1047", "Jollof & Chicken", "GH₵ 85"],
                        ["#ORD-1046", "Fried Rice", "GH₵ 65"],
                        ["#ORD-1045", "Burger & Fries", "GH₵ 75"],
                      ].map(([order, item, amount]) => (
                        <div
                          key={order}
                          className="flex min-w-0 items-center justify-between gap-3 border-b border-gray-800 pb-3 last:border-0 last:pb-0"
                        >
                          <div className="min-w-0">
                            <p className="text-[10px] text-gray-500">
                              {order}
                            </p>

                            <p className="mt-0.5 truncate text-xs text-gray-300">
                              {item}
                            </p>
                          </div>

                          <p className="shrink-0 text-xs font-semibold text-white">
                            {amount}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature intro */}
      <section className="bg-gray-50">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
              Everything in one place
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              The tools you need to manage your restaurant.
            </h2>

            <p className="mt-4 text-gray-600">
              Replace scattered spreadsheets, notebooks and disconnected
              systems with one central platform for your restaurant.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-gray-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-950 text-white">
                    <Icon size={21} />
                  </div>

                  <h3 className="mt-5 text-lg font-bold">
                    {feature.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
              Simple setup
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Get your restaurant running in three steps.
            </h2>
          </div>

          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {steps.map((step) => (
              <div key={step.number} className="relative">
                <p className="text-5xl font-bold text-gray-100">
                  {step.number}
                </p>

                <h3 className="mt-3 text-xl font-bold">
                  {step.title}
                </h3>

                <p className="mt-2 leading-7 text-gray-600">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Operations section */}
      <section className="bg-gray-950 text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:py-24">
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-gray-950">
              <ChefHat size={23} />
            </div>

            <h2 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
              Built around how restaurants actually operate.
            </h2>

            <p className="mt-5 max-w-xl leading-7 text-gray-400">
              From the moment a customer places an order to the moment you
              review the day's sales, keep your restaurant's operations
              connected.
            </p>

            <div className="mt-8 space-y-4">
              {[
                "Take and manage orders",
                "Track inventory movement",
                "Manage your restaurant team",
                "Monitor sales and payments",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 text-sm text-gray-300"
                >
                  <CheckCircle2 size={18} className="text-white" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
              <CreditCard size={22} />

              <p className="mt-5 text-lg font-bold">Payments</p>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Keep track of cash, mobile money and card transactions.
              </p>
            </div>

            <div className="mt-8 rounded-2xl border border-gray-800 bg-gray-900 p-6">
              <Package size={22} />

              <p className="mt-5 text-lg font-bold">Inventory</p>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Know what's available and what needs attention.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
              <Users size={22} />

              <p className="mt-5 text-lg font-bold">Your Team</p>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Give every employee the right level of access.
              </p>
            </div>

            <div className="mt-8 rounded-2xl border border-gray-800 bg-gray-900 p-6">
              <BarChart3 size={22} />

              <p className="mt-5 text-lg font-bold">Reports</p>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Understand your restaurant's performance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white">
        <div className="mx-auto max-w-4xl px-5 py-20 text-center sm:px-8 sm:py-24">
          <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">
            Take control of your restaurant.
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-gray-600">
            Bring your orders, inventory, customers, staff and sales together
            in one system.
          </p>

          <Link
            href="/register"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gray-950 px-7 py-4 font-semibold text-white transition hover:bg-gray-800"
          >
            Get started
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 sm:px-8 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-bold">Restaurant ERP</p>

            <p className="mt-1 text-sm text-gray-500">
              Restaurant management, simplified.
            </p>
          </div>

          <div className="flex items-center gap-5 text-sm text-gray-500">
            <Link href="/login" className="hover:text-gray-950">
              Sign in
            </Link>

            <Link href="/register" className="hover:text-gray-950">
              Get started
            </Link>
          </div>
        </div>

        <div className="border-t border-gray-200 px-5 py-5 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} Restaurant ERP. All rights reserved.
        </div>
      </footer>
    </main>
  );
}


"use client";

import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadDashboard() {
    try {
      setLoading(true);

      const response = await fetch("/api/dashboard");
      const result = await response.json();

      if (result.success) {
        setData(result);
      }
    } catch (error) {
      console.error("Failed to load dashboard:", error);
    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    loadDashboard();
  }, []);


  const stats = data?.stats || {
    totalRevenue: 0,
    totalOrders: 0,
    menuItems: 0,
    staff: 0,
  };

  const inventory = data?.inventory || {
    total: 0,
    lowStock: 0,
    outOfStock: 0,
    items: [],
  };

  const recentOrders = data?.recentOrders || [];

  function formatDate(date) {
    return new Date(date).toLocaleString("en-GH", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">

      {/* Sidebar */}
      <Sidebar />

      {/* Main */}
      <main className="ml-0 min-h-screen p-4 pt-20 sm:p-6 sm:pt-20 md:ml-64 md:p-8 md:pt-8">

        {/* Header */}
        <header className="border-b border-gray-200 bg-white px-6 py-5">

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

            <div>
              <h2 className="text-2xl font-bold">
                Dashboard
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Overview of your restaurant operations.
              </p>
            </div>

            <div className="flex gap-3">

              <button
                onClick={loadDashboard}
                className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Refresh
              </button>

            </div>

          </div>

        </header>

        <div className="p-6">

          {/* Loading */}
          {loading && !data && (
            <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 text-sm text-gray-500">
              Loading dashboard data...
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

            {/* Revenue */}
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

              <p className="text-sm text-gray-500">
                Total Revenue
              </p>

              <h3 className="mt-2 text-2xl font-bold">
                GH₵ {stats.totalRevenue.toFixed(2)}
              </h3>

              <p className="mt-1 text-xs text-gray-400">
                From completed sales
              </p>

            </div>

            {/* Orders */}
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

              <p className="text-sm text-gray-500">
                Total Orders
              </p>

              <h3 className="mt-2 text-2xl font-bold">
                {stats.totalOrders}
              </h3>

              <p className="mt-1 text-xs text-gray-400">
                Completed orders
              </p>

            </div>

            {/* Menu */}
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

              <p className="text-sm text-gray-500">
                Menu Items
              </p>

              <h3 className="mt-2 text-2xl font-bold">
                {stats.menuItems}
              </h3>

              <p className="mt-1 text-xs text-gray-400">
                Items in menu
              </p>

            </div>

            {/* Staff */}
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

              <p className="text-sm text-gray-500">
                Active Staff
              </p>

              <h3 className="mt-2 text-2xl font-bold">
                {stats.staff}
              </h3>

              <p className="mt-1 text-xs text-gray-400">
                Currently active
              </p>

            </div>

          </div>

          {/* Main Grid */}
          <div className="mt-8 grid gap-6 xl:grid-cols-3">

            {/* Recent Orders */}
            <div className="xl:col-span-2 rounded-xl border border-gray-200 bg-white shadow-sm">

              <div className="flex items-center justify-between border-b border-gray-200 p-5">

                <div>
                  <h3 className="text-lg font-semibold">
                    Recent Orders
                  </h3>

                  <p className="text-sm text-gray-500">
                    Latest completed transactions
                  </p>
                </div>

                <a
                  href="/sales"
                  className="text-sm font-medium text-gray-900 hover:underline"
                >
                  View all
                </a>

              </div>

              {recentOrders.length === 0 ? (

                <div className="p-8 text-center text-sm text-gray-500">
                  No completed orders yet.
                </div>

              ) : (

                <div className="divide-y divide-gray-100">

                  {recentOrders.map((order) => (

                    <div
                      key={order.id}
                      className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
                    >

                      <div>

                        <p className="font-medium">
                          Order #
                          {order.id
                            .slice(-8)
                            .toUpperCase()}
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                          {order.items
                            .map(
                              (item) =>
                                `${item.quantity} × ${item.menuItem.name}`
                            )
                            .join(", ")}
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          {formatDate(order.createdAt)}
                        </p>

                      </div>

                      <div className="flex items-center gap-4">

                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                          Completed
                        </span>

                        <span className="font-bold">
                          GH₵{" "}
                          {Number(order.total).toFixed(2)}
                        </span>

                      </div>

                    </div>

                  ))}

                </div>

              )}

            </div>

            {/* Inventory Status */}
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">

              <div className="border-b border-gray-200 p-5">

                <h3 className="text-lg font-semibold">
                  Inventory Status
                </h3>

                <p className="text-sm text-gray-500">
                  Current stock alerts
                </p>

              </div>

              <div className="space-y-4 p-5">

                {/* Total */}
                <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">

                  <div>
                    <p className="text-sm font-medium">
                      Total Items
                    </p>

                    <p className="text-xs text-gray-500">
                      Inventory records
                    </p>
                  </div>

                  <span className="text-xl font-bold">
                    {inventory.total}
                  </span>

                </div>

                {/* Low Stock */}
                <div className="flex items-center justify-between rounded-lg bg-yellow-50 p-4">

                  <div>
                    <p className="text-sm font-medium text-yellow-800">
                      Low Stock
                    </p>

                    <p className="text-xs text-yellow-600">
                      Needs attention
                    </p>
                  </div>

                  <span className="text-xl font-bold text-yellow-700">
                    {inventory.lowStock}
                  </span>

                </div>

                {/* Out of Stock */}
                <div className="flex items-center justify-between rounded-lg bg-red-50 p-4">

                  <div>
                    <p className="text-sm font-medium text-red-800">
                      Out of Stock
                    </p>

                    <p className="text-xs text-red-600">
                      Currently unavailable
                    </p>
                  </div>

                  <span className="text-xl font-bold text-red-700">
                    {inventory.outOfStock}
                  </span>

                </div>

              </div>

              <div className="border-t border-gray-200 p-5">

                <a
                  href="/inventory"
                  className="block rounded-lg bg-gray-950 px-4 py-3 text-center text-sm font-medium text-white hover:bg-gray-800"
                >
                  Manage Inventory
                </a>

              </div>

            </div>

          </div>

          {/* Quick Actions */}
          <div className="mt-8">

            <h3 className="mb-4 text-lg font-semibold">
              Quick Actions
            </h3>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

              <a
                href="/orders"
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:border-gray-400"
              >
                <p className="font-semibold">
                  New Order
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Create a new customer order
                </p>
              </a>

              <a
                href="/menu"
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:border-gray-400"
              >
                <p className="font-semibold">
                  Manage Menu
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Add or update menu items
                </p>
              </a>

              <a
                href="/inventory"
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:border-gray-400"
              >
                <p className="font-semibold">
                  Inventory
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Check current stock
                </p>
              </a>

              <a
                href="/sales"
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:border-gray-400"
              >
                <p className="font-semibold">
                  Sales History
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Review transactions
                </p>
              </a>

            </div>

          </div>

        </div>

      </main>

    </div>
  );
}
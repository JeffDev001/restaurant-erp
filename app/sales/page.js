"use client";

import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";

export default function SalesPage() {
  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [search, setSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState(null);

  async function loadSales() {
    try {
      setLoading(true);

      const response = await fetch("/api/sales");
      const data = await response.json();

      if (data.success) {
        setSales(data.sales);
        setFilteredSales(data.sales);
      }
    } catch (error) {
      console.error("Failed to load sales:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSales();
  }, []);

  useEffect(() => {
    let results = [...sales];

    if (search.trim()) {
      const searchTerm = search.toLowerCase();

      results = results.filter((sale) => {
        const saleId = sale.id.toLowerCase();

        const paymentMethod =
          sale.paymentMethod?.toLowerCase() || "";

        const itemNames = sale.order.items
          .map((item) => item.menuItem.name)
          .join(" ")
          .toLowerCase();

        return (
          saleId.includes(searchTerm) ||
          paymentMethod.includes(searchTerm) ||
          itemNames.includes(searchTerm)
        );
      });
    }

    if (paymentFilter !== "ALL") {
      results = results.filter(
        (sale) => sale.paymentMethod === paymentFilter
      );
    }

    setFilteredSales(results);
  }, [search, paymentFilter, sales]);

  const totalRevenue = sales.reduce(
    (sum, sale) => sum + Number(sale.amount),
    0
  );

  const cashSales = sales
    .filter((sale) => sale.paymentMethod === "CASH")
    .reduce((sum, sale) => sum + Number(sale.amount), 0);

  const mobileMoneySales = sales
    .filter((sale) => sale.paymentMethod === "MOBILE_MONEY")
    .reduce((sum, sale) => sum + Number(sale.amount), 0);

  const cardSales = sales
    .filter((sale) => sale.paymentMethod === "CARD")
    .reduce((sum, sale) => sum + Number(sale.amount), 0);

  function formatDate(date) {
    return new Date(date).toLocaleString("en-GH", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  function formatPaymentMethod(method) {
    if (method === "MOBILE_MONEY") return "Mobile Money";

    if (method === "CASH") return "Cash";

    if (method === "CARD") return "Card";

    return method;
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
                Sales & Transactions
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                View and monitor completed restaurant transactions.
              </p>
            </div>

            <button
              onClick={loadSales}
              className="rounded-lg bg-gray-950 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
            >
              Refresh
            </button>
          </div>
        </header>

        <div className="p-6">
          {/* Summary Cards */}
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">
                Total Revenue
              </p>

              <h3 className="mt-2 text-2xl font-bold">
                GH₵ {totalRevenue.toFixed(2)}
              </h3>

              <p className="mt-1 text-xs text-gray-400">
                All completed sales
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">
                Cash Sales
              </p>

              <h3 className="mt-2 text-2xl font-bold">
                GH₵ {cashSales.toFixed(2)}
              </h3>

              <p className="mt-1 text-xs text-gray-400">
                Cash payments
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">
                Mobile Money
              </p>

              <h3 className="mt-2 text-2xl font-bold">
                GH₵ {mobileMoneySales.toFixed(2)}
              </h3>

              <p className="mt-1 text-xs text-gray-400">
                Mobile money payments
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">
                Card Sales
              </p>

              <h3 className="mt-2 text-2xl font-bold">
                GH₵ {cardSales.toFixed(2)}
              </h3>

              <p className="mt-1 text-xs text-gray-400">
                Card payments
              </p>
            </div>
          </div>

          {/* Transactions */}
          <div className="mt-8 rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h3 className="text-lg font-semibold">
                    Transaction History
                  </h3>

                  <p className="text-sm text-gray-500">
                    {filteredSales.length} transaction
                    {filteredSales.length !== 1 ? "s" : ""}
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    type="text"
                    placeholder="Search transactions..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
                  />

                  <select
                    value={paymentFilter}
                    onChange={(e) =>
                      setPaymentFilter(e.target.value)
                    }
                    className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
                  >
                    <option value="ALL">All Payments</option>
                    <option value="CASH">Cash</option>
                    <option value="MOBILE_MONEY">
                      Mobile Money
                    </option>
                    <option value="CARD">Card</option>
                  </select>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="p-10 text-center text-gray-500">
                Loading transactions...
              </div>
            ) : filteredSales.length === 0 ? (
              <div className="p-10 text-center">
                <p className="font-medium text-gray-700">
                  No transactions found
                </p>

                <p className="mt-1 text-sm text-gray-400">
                  Completed orders will appear here.
                </p>
              </div>
            ) : (
              <div className="rounded-xl bg-white p-4 shadow-sm sm:p-6">
                <div className="w-full overflow-x-auto">
                  <table className="w-full min-w-175">
                    <thead className="border-b border-gray-200 bg-gray-50">
                      <tr>
                        <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Transaction
                        </th>

                        <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Items
                        </th>

                        <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Amount
                        </th>

                        <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Payment
                        </th>

                        <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Status
                        </th>

                        <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Date
                        </th>

                        <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Action
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                      {filteredSales.map((sale) => (
                        <tr
                          key={sale.id}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-5 py-4">
                            <p className="font-medium">
                              #{sale.id.slice(-8).toUpperCase()}
                            </p>

                            <p className="text-xs text-gray-400">
                              Order #{sale.order.id.slice(-8).toUpperCase()}
                            </p>
                          </td>

                          <td className="px-5 py-4">
                            <div className="max-w-xs">
                              {sale.order.items.map(
                                (item, index) => (
                                  <span
                                    key={item.id}
                                    className="text-sm text-gray-600"
                                  >
                                    {item.quantity} ×{" "}
                                    {item.menuItem.name}
                                    {index <
                                      sale.order.items.length - 1
                                      ? ", "
                                      : ""}
                                  </span>
                                )
                              )}
                            </div>
                          </td>

                          <td className="px-5 py-4 font-semibold">
                            GH₵ {Number(sale.amount).toFixed(2)}
                          </td>

                          <td className="px-5 py-4">
                            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                              {formatPaymentMethod(
                                sale.paymentMethod
                              )}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                              Completed
                            </span>
                          </td>

                          <td className="px-5 py-4 text-sm text-gray-500">
                            {formatDate(sale.createdAt)}
                          </td>

                          <td className="px-5 py-4">
                            <button
                              onClick={() =>
                                setSelectedSale(sale)
                              }
                              className="text-sm font-medium text-gray-900 hover:underline"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  </div>
                </div>
            )}
              </div>
        </div>
      </main>

      {/* Sale Details Modal */}
      {selectedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 p-5">
              <div>
                <h3 className="text-lg font-bold">
                  Transaction Details
                </h3>

                <p className="text-sm text-gray-500">
                  #
                  {selectedSale.id
                    .slice(-8)
                    .toUpperCase()}
                </p>
              </div>

              <button
                onClick={() => setSelectedSale(null)}
                className="rounded-lg px-3 py-2 text-gray-500 hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            <div className="space-y-5 p-5">
              <div>
                <p className="mb-2 text-sm font-semibold">
                  Items
                </p>

                <div className="space-y-2">
                  {selectedSale.order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between rounded-lg bg-gray-50 p-3"
                    >
                      <div>
                        <p className="font-medium">
                          {item.menuItem.name}
                        </p>

                        <p className="text-xs text-gray-500">
                          {item.quantity} × GH₵{" "}
                          {Number(item.price).toFixed(2)}
                        </p>
                      </div>

                      <p className="font-semibold">
                        GH₵{" "}
                        {(
                          Number(item.price) *
                          item.quantity
                        ).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-xs text-gray-500">
                    Payment Method
                  </p>

                  <p className="mt-1 font-semibold">
                    {formatPaymentMethod(
                      selectedSale.paymentMethod
                    )}
                  </p>
                </div>

                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-xs text-gray-500">
                    Status
                  </p>

                  <p className="mt-1 font-semibold text-green-600">
                    Completed
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                <span className="font-semibold">
                  Total
                </span>

                <span className="text-xl font-bold">
                  GH₵{" "}
                  {Number(selectedSale.amount).toFixed(2)}
                </span>
              </div>

              <p className="text-center text-xs text-gray-400">
                {formatDate(selectedSale.createdAt)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
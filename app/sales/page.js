"use client";

import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import {
  RefreshCw,
  Search,
  X,
  TrendingUp,
  ShoppingBag,
  Wallet,
  CreditCard,
  Smartphone,
  CalendarDays,
  BarChart3,
} from "lucide-react";

export default function SalesPage() {
  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);

  const [summary, setSummary] = useState({
    totalRevenue: 0,
    transactionCount: 0,
    averageTransaction: 0,
    paymentBreakdown: {
      CASH: 0,
      MOBILE_MONEY: 0,
      CARD: 0,
    },
  });

  const [dailySales, setDailySales] = useState([]);
  const [topItems, setTopItems] = useState([]);

  const [search, setSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("ALL");

  const [dateRange, setDateRange] = useState("ALL");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  const [loading, setLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState(null);

  async function loadSales() {
    try {
      setLoading(true);

      let url = "/api/sales";

      const params = new URLSearchParams();

      if (dateRange === "TODAY") {
        const today = new Date()
          .toISOString()
          .split("T")[0];

        params.set("startDate", today);
        params.set("endDate", today);
      }

      if (dateRange === "7_DAYS") {
        const end = new Date();
        const start = new Date();

        start.setDate(end.getDate() - 6);

        params.set(
          "startDate",
          start.toISOString().split("T")[0]
        );

        params.set(
          "endDate",
          end.toISOString().split("T")[0]
        );
      }

      if (dateRange === "30_DAYS") {
        const end = new Date();
        const start = new Date();

        start.setDate(end.getDate() - 29);

        params.set(
          "startDate",
          start.toISOString().split("T")[0]
        );

        params.set(
          "endDate",
          end.toISOString().split("T")[0]
        );
      }

      if (
        dateRange === "CUSTOM" &&
        customStartDate &&
        customEndDate
      ) {
        params.set("startDate", customStartDate);
        params.set("endDate", customEndDate);
      }

      const query = params.toString();

      if (query) {
        url += `?${query}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setSales(data.sales || []);
        setFilteredSales(data.sales || []);

        setSummary(
          data.summary || {
            totalRevenue: 0,
            transactionCount: 0,
            averageTransaction: 0,
            paymentBreakdown: {
              CASH: 0,
              MOBILE_MONEY: 0,
              CARD: 0,
            },
          }
        );

        setDailySales(data.dailySales || []);
        setTopItems(data.topItems || []);
      } else {
        console.error(data.error);
      }
    } catch (error) {
      console.error("Failed to load sales:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSales();
  }, [dateRange]);

  useEffect(() => {
    if (
      dateRange === "CUSTOM" &&
      customStartDate &&
      customEndDate
    ) {
      loadSales();
    }
  }, [customStartDate, customEndDate]);

  useEffect(() => {
    let results = [...sales];

    if (search.trim()) {
      const searchTerm = search.toLowerCase();

      results = results.filter((sale) => {
        const saleId = sale.id.toLowerCase();

        const orderNumber =
          sale.order.orderNumber?.toLowerCase() || "";

        const paymentMethod =
          sale.paymentMethod?.toLowerCase() || "";

        const customerName =
          sale.order.customerName?.toLowerCase() || "";

        const customerPhone =
          sale.order.customerPhone?.toLowerCase() || "";

        const itemNames = sale.order.items
          .map((item) => item.menuItem.name)
          .join(" ")
          .toLowerCase();

        return (
          saleId.includes(searchTerm) ||
          orderNumber.includes(searchTerm) ||
          paymentMethod.includes(searchTerm) ||
          customerName.includes(searchTerm) ||
          customerPhone.includes(searchTerm) ||
          itemNames.includes(searchTerm)
        );
      });
    }

    if (paymentFilter !== "ALL") {
      results = results.filter(
        (sale) =>
          sale.paymentMethod === paymentFilter
      );
    }

    setFilteredSales(results);
  }, [search, paymentFilter, sales]);

  function formatDate(date) {
    return new Date(date).toLocaleString("en-GH", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  function formatShortDate(date) {
    return new Date(date).toLocaleDateString("en-GH", {
      month: "short",
      day: "numeric",
    });
  }

  function formatPaymentMethod(method) {
    if (method === "MOBILE_MONEY") {
      return "Mobile Money";
    }

    if (method === "CASH") {
      return "Cash";
    }

    if (method === "CARD") {
      return "Card";
    }

    return method;
  }

  function paymentIcon(method) {
    if (method === "CASH") {
      return <Wallet size={16} />;
    }

    if (method === "CARD") {
      return <CreditCard size={16} />;
    }

    return <Smartphone size={16} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Sidebar />

      <main className="ml-0 min-h-screen pt-16 md:ml-64 md:pt-0">
        {/* Header */}
        <header className="border-b border-gray-200 bg-white px-4 py-5 sm:px-6 md:px-8">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <h1 className="text-2xl font-bold">
                Sales & Reports
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Monitor revenue, transactions, payment methods,
                and best-selling menu items.
              </p>
            </div>

            <button
              onClick={loadSales}
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-lg bg-gray-950 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={16}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>
        </header>

        <div className="space-y-8 p-4 sm:p-6 md:p-8">
          {/* Date Filters */}
          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <CalendarDays size={18} />
              <h2 className="font-semibold">
                Report Period
              </h2>
            </div>

            <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
              <div className="flex-1">
                <label className="mb-1 block text-xs font-medium text-gray-500">
                  Period
                </label>

                <select
                  value={dateRange}
                  onChange={(e) =>
                    setDateRange(e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
                >
                  <option value="ALL">
                    All Time
                  </option>

                  <option value="TODAY">
                    Today
                  </option>

                  <option value="7_DAYS">
                    Last 7 Days
                  </option>

                  <option value="30_DAYS">
                    Last 30 Days
                  </option>

                  <option value="CUSTOM">
                    Custom Range
                  </option>
                </select>
              </div>

              {dateRange === "CUSTOM" && (
                <>
                  <div className="flex-1">
                    <label className="mb-1 block text-xs font-medium text-gray-500">
                      Start Date
                    </label>

                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) =>
                        setCustomStartDate(e.target.value)
                      }
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
                    />
                  </div>

                  <div className="flex-1">
                    <label className="mb-1 block text-xs font-medium text-gray-500">
                      End Date
                    </label>

                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) =>
                        setCustomEndDate(e.target.value)
                      }
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
                    />
                  </div>
                </>
              )}
            </div>
          </section>

          {/* Summary Cards */}
          <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Total Revenue
                </p>

                <TrendingUp
                  size={20}
                  className="text-gray-400"
                />
              </div>

              <h3 className="mt-3 text-2xl font-bold">
                GH₵{" "}
                {Number(
                  summary.totalRevenue
                ).toFixed(2)}
              </h3>

              <p className="mt-1 text-xs text-gray-400">
                Paid completed sales
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Transactions
                </p>

                <ShoppingBag
                  size={20}
                  className="text-gray-400"
                />
              </div>

              <h3 className="mt-3 text-2xl font-bold">
                {summary.transactionCount}
              </h3>

              <p className="mt-1 text-xs text-gray-400">
                Completed transactions
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Average Sale
                </p>

                <BarChart3
                  size={20}
                  className="text-gray-400"
                />
              </div>

              <h3 className="mt-3 text-2xl font-bold">
                GH₵{" "}
                {Number(
                  summary.averageTransaction
                ).toFixed(2)}
              </h3>

              <p className="mt-1 text-xs text-gray-400">
                Average transaction value
              </p>
            </div>
          </section>

          {/* Payment Breakdown */}
          <section>
            <h2 className="mb-4 text-lg font-semibold">
              Payment Breakdown
            </h2>

            <div className="grid gap-5 md:grid-cols-3">
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-gray-100 p-3">
                    <Wallet size={20} />
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      Cash
                    </p>

                    <p className="text-xl font-bold">
                      GH₵{" "}
                      {Number(
                        summary.paymentBreakdown?.CASH ||
                          0
                      ).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-gray-100 p-3">
                    <Smartphone size={20} />
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      Mobile Money
                    </p>

                    <p className="text-xl font-bold">
                      GH₵{" "}
                      {Number(
                        summary.paymentBreakdown?.MOBILE_MONEY ||
                          0
                      ).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-gray-100 p-3">
                    <CreditCard size={20} />
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      Card
                    </p>

                    <p className="text-xl font-bold">
                      GH₵{" "}
                      {Number(
                        summary.paymentBreakdown?.CARD ||
                          0
                      ).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Daily Sales */}
          <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 p-5">
              <h2 className="font-semibold">
                Daily Sales
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Revenue and transaction volume by day.
              </p>
            </div>

            {dailySales.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-400">
                No daily sales data available.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead className="border-b border-gray-200 bg-gray-50">
                    <tr>
                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Date
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Transactions
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Revenue
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {dailySales
                      .slice()
                      .reverse()
                      .map((day) => (
                        <tr
                          key={day.date}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-5 py-4 font-medium">
                            {formatShortDate(day.date)}
                          </td>

                          <td className="px-5 py-4 text-sm text-gray-600">
                            {day.transactions}
                          </td>

                          <td className="px-5 py-4 font-semibold">
                            GH₵{" "}
                            {Number(day.revenue).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Top Selling Items */}
          <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 p-5">
              <h2 className="font-semibold">
                Best-Selling Menu Items
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Top menu items based on quantity sold.
              </p>
            </div>

            {topItems.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-400">
                No item sales data available.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead className="border-b border-gray-200 bg-gray-50">
                    <tr>
                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Item
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Category
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Quantity Sold
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Revenue
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {topItems.map((item, index) => (
                      <tr
                        key={item.id}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm font-bold">
                              {index + 1}
                            </span>

                            <span className="font-medium">
                              {item.name}
                            </span>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-sm text-gray-500">
                          {item.category}
                        </td>

                        <td className="px-5 py-4 font-medium">
                          {item.quantity}
                        </td>

                        <td className="px-5 py-4 font-semibold">
                          GH₵{" "}
                          {Number(item.revenue).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Transaction History */}
          <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-lg font-semibold">
                    Transaction History
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    {filteredSales.length} transaction
                    {filteredSales.length !== 1
                      ? "s"
                      : ""}
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="relative">
                    <Search
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      type="text"
                      placeholder="Search transactions..."
                      value={search}
                      onChange={(e) =>
                        setSearch(e.target.value)
                      }
                      className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-gray-900 sm:w-64"
                    />
                  </div>

                  <select
                    value={paymentFilter}
                    onChange={(e) =>
                      setPaymentFilter(e.target.value)
                    }
                    className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
                  >
                    <option value="ALL">
                      All Payments
                    </option>

                    <option value="CASH">
                      Cash
                    </option>

                    <option value="MOBILE_MONEY">
                      Mobile Money
                    </option>

                    <option value="CARD">
                      Card
                    </option>
                  </select>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="p-10 text-center text-gray-500">
                Loading sales...
              </div>
            ) : filteredSales.length === 0 ? (
              <div className="p-10 text-center">
                <p className="font-medium text-gray-700">
                  No transactions found
                </p>

                <p className="mt-1 text-sm text-gray-400">
                  Completed paid orders will appear here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px]">
                  <thead className="border-b border-gray-200 bg-gray-50">
                    <tr>
                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Transaction
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Customer
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Items
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Amount
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Payment
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Date
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
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
                            #
                            {sale.id
                              .slice(-8)
                              .toUpperCase()}
                          </p>

                          <p className="text-xs text-gray-400">
                            {sale.order.orderNumber}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <p className="font-medium">
                            {sale.order.customerName ||
                              "Walk-in Customer"}
                          </p>

                          <p className="text-xs text-gray-400">
                            {sale.order.customerPhone ||
                              "No phone"}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <div className="max-w-xs text-sm text-gray-600">
                            {sale.order.items.map(
                              (item, index) => (
                                <span key={item.id}>
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
                          GH₵{" "}
                          {Number(
                            sale.amount
                          ).toFixed(2)}
                        </td>

                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700">
                            {paymentIcon(
                              sale.paymentMethod
                            )}

                            {formatPaymentMethod(
                              sale.paymentMethod
                            )}
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
            )}
          </section>
        </div>
      </main>

      {/* Transaction Details Modal */}
      {selectedSale && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelectedSale(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
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
                onClick={() =>
                  setSelectedSale(null)
                }
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5 p-5">
              {/* Customer */}
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Customer
                </p>

                <p className="font-semibold">
                  {selectedSale.order.customerName ||
                    "Walk-in Customer"}
                </p>

                {selectedSale.order.customerPhone && (
                  <p className="mt-1 text-sm text-gray-500">
                    {selectedSale.order.customerPhone}
                  </p>
                )}

                {selectedSale.order.orderType && (
                  <p className="mt-2 text-sm text-gray-500">
                    {selectedSale.order.orderType ===
                    "DELIVERY"
                      ? "Delivery"
                      : "Pickup"}
                  </p>
                )}

                {selectedSale.order.deliveryAddress && (
                  <p className="mt-1 text-sm text-gray-500">
                    {selectedSale.order.deliveryAddress}
                  </p>
                )}
              </div>

              {/* Items */}
              <div>
                <p className="mb-2 text-sm font-semibold">
                  Items
                </p>

                <div className="space-y-2">
                  {selectedSale.order.items.map(
                    (item) => (
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
                            {Number(
                              item.unitPrice
                            ).toFixed(2)}
                          </p>
                        </div>

                        <p className="font-semibold">
                          GH₵{" "}
                          {Number(
                            item.subtotal
                          ).toFixed(2)}
                        </p>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Payment */}
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
                    Payment Status
                  </p>

                  <p className="mt-1 font-semibold text-green-600">
                    Paid
                  </p>
                </div>
              </div>

              {/* Transaction Reference */}
              {selectedSale.transactionRef && (
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-xs text-gray-500">
                    Transaction Reference
                  </p>

                  <p className="mt-1 break-all text-sm font-medium">
                    {selectedSale.transactionRef}
                  </p>
                </div>
              )}

              {/* Staff */}
              {selectedSale.order.createdBy && (
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-xs text-gray-500">
                    Processed By
                  </p>

                  <p className="mt-1 font-semibold">
                    {selectedSale.order.createdBy.name}
                  </p>

                  <p className="text-xs text-gray-500">
                    {selectedSale.order.createdBy.role}
                  </p>
                </div>
              )}

              {/* Total */}
              <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                <span className="font-semibold">
                  Total
                </span>

                <span className="text-xl font-bold">
                  GH₵{" "}
                  {Number(
                    selectedSale.amount
                  ).toFixed(2)}
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


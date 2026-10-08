"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Users,
  ShoppingBag,
  Wallet,
  RefreshCw,
  Eye,
  X,
  Phone,
  Mail,
  MapPin,
  CalendarDays,
  Loader2,
  Truck,
  Store,
} from "lucide-react";
import Sidebar from "../../components/Sidebar";

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCustomers();
  }, []);

  async function fetchCustomers(searchValue = "") {
    try {
      setError("");

      const response = await fetch(
        `/api/customers?search=${encodeURIComponent(searchValue)}`
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Failed to load customers."
        );
      }

      setCustomers(data.customers || []);
    } catch (error) {
      console.error("FETCH CUSTOMERS ERROR:", error);
      setError(
        error.message || "Failed to load customers."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    await fetchCustomers(search);
  }

  async function handleSearch(event) {
    event.preventDefault();
    await fetchCustomers(search);
  }

  function formatCurrency(amount) {
    return `GH₵${Number(amount || 0).toFixed(2)}`;
  }

  function formatDate(date) {
    if (!date) return "No orders yet";

    return new Date(date).toLocaleDateString("en-GH", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function formatDateTime(date) {
    if (!date) return "N/A";

    return new Date(date).toLocaleString("en-GH", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function getPaymentLabel(method) {
    if (method === "MOBILE_MONEY") {
      return "Mobile Money";
    }

    if (method === "CARD") {
      return "Card";
    }

    if (method === "CASH") {
      return "Cash";
    }

    return method || "N/A";
  }

  function getOrderTypeLabel(orderType) {
    if (orderType === "DELIVERY") {
      return "Delivery";
    }

    return "Pickup";
  }

  function getOrderTypeClass(orderType) {
    if (orderType === "DELIVERY") {
      return "bg-blue-50 text-blue-700";
    }

    return "bg-gray-100 text-gray-700";
  }

  const totalCustomers = customers.length;

  const totalOrders = customers.reduce(
    (sum, customer) =>
      sum + Number(customer.orderCount || 0),
    0
  );

  const totalSpent = customers.reduce(
    (sum, customer) =>
      sum + Number(customer.totalSpent || 0),
    0
  );

  return (
    <div className="min-h-screen bg-gray-50 md:ml-64">
      {/* SIDEBAR */}
      <Sidebar />

      {/* HEADER */}
      <header className="border-b border-gray-200 bg-white px-4 py-5 md:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-950">
              Customers
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage customers and view their order history.
            </p>
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex w-fit items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={17}
              className={
                refreshing ? "animate-spin" : ""
              }
            />

            {refreshing
              ? "Refreshing..."
              : "Refresh"}
          </button>
        </div>
      </header>

      <main className="p-4 md:p-8">
        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Customers
                </p>

                <p className="mt-2 text-2xl font-bold text-gray-950">
                  {totalCustomers}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gray-100">
                <Users
                  size={21}
                  className="text-gray-700"
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Orders
                </p>

                <p className="mt-2 text-2xl font-bold text-gray-950">
                  {totalOrders}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gray-100">
                <ShoppingBag
                  size={21}
                  className="text-gray-700"
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Customer Spending
                </p>

                <p className="mt-2 text-2xl font-bold text-gray-950">
                  {formatCurrency(totalSpent)}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gray-100">
                <Wallet
                  size={21}
                  className="text-gray-700"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SEARCH */}
        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <form
            onSubmit={handleSearch}
            className="flex flex-col gap-3 sm:flex-row"
          >
            <div className="relative flex-1">
              <Search
                size={19}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search by customer name, phone or email..."
                className="w-full rounded-lg border border-gray-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
              />
            </div>

            <button
              type="submit"
              className="rounded-lg bg-gray-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
            >
              Search
            </button>
          </form>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* CUSTOMER TABLE */}
        <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-5 py-4">
            <h2 className="font-semibold text-gray-950">
              Customer List
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              {customers.length} customer
              {customers.length === 1 ? "" : "s"} found
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center px-6 py-16">
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <Loader2
                  size={20}
                  className="animate-spin"
                />
                Loading customers...
              </div>
            </div>
          ) : customers.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <Users
                size={40}
                className="mx-auto text-gray-300"
              />

              <h3 className="mt-4 font-semibold text-gray-900">
                No customers found
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Try changing your search or create a
                customer through the POS.
              </p>
            </div>
          ) : (
            <>
              {/* DESKTOP TABLE */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr className="border-b border-gray-200 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      <th className="px-5 py-4">
                        Customer
                      </th>

                      <th className="px-5 py-4">
                        Phone
                      </th>

                      <th className="px-5 py-4">
                        Orders
                      </th>

                      <th className="px-5 py-4">
                        Total Spent
                      </th>

                      <th className="px-5 py-4">
                        Last Order
                      </th>

                      <th className="px-5 py-4">
                        Status
                      </th>

                      <th className="px-5 py-4 text-right">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {customers.map((customer) => (
                      <tr
                        key={customer.id}
                        className="transition hover:bg-gray-50"
                      >
                        <td className="px-5 py-4">
                          <div>
                            <p className="font-semibold text-gray-950">
                              {customer.name}
                            </p>

                            {customer.email && (
                              <p className="mt-1 text-xs text-gray-500">
                                {customer.email}
                              </p>
                            )}
                          </div>
                        </td>

                        <td className="px-5 py-4 text-sm text-gray-700">
                          {customer.phone}
                        </td>

                        <td className="px-5 py-4">
                          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                            {customer.orderCount}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-sm font-semibold text-gray-900">
                          {formatCurrency(
                            customer.totalSpent
                          )}
                        </td>

                        <td className="px-5 py-4 text-sm text-gray-600">
                          {formatDate(
                            customer.lastOrderDate
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                            Active
                          </span>
                        </td>

                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() =>
                              setSelectedCustomer(
                                customer
                              )
                            }
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-100"
                          >
                            <Eye size={15} />
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* MOBILE CUSTOMER CARDS */}
              <div className="divide-y divide-gray-100 md:hidden">
                {customers.map((customer) => (
                  <div
                    key={customer.id}
                    className="p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-950">
                          {customer.name}
                        </h3>

                        <p className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                          <Phone size={14} />
                          {customer.phone}
                        </p>

                        {customer.email && (
                          <p className="mt-1 flex items-center gap-2 truncate text-xs text-gray-500">
                            <Mail size={14} />
                            {customer.email}
                          </p>
                        )}
                      </div>

                      <span className="shrink-0 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                        Active
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="rounded-lg bg-gray-50 p-3">
                        <p className="text-xs text-gray-500">
                          Orders
                        </p>

                        <p className="mt-1 font-semibold text-gray-900">
                          {customer.orderCount}
                        </p>
                      </div>

                      <div className="rounded-lg bg-gray-50 p-3">
                        <p className="text-xs text-gray-500">
                          Total Spent
                        </p>

                        <p className="mt-1 font-semibold text-gray-900">
                          {formatCurrency(
                            customer.totalSpent
                          )}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        setSelectedCustomer(customer)
                      }
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
                    >
                      <Eye size={16} />
                      View Customer
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      {/* CUSTOMER DETAILS MODAL */}
      {selectedCustomer && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelectedCustomer(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            {/* MODAL HEADER */}
            <div className="flex items-start justify-between border-b border-gray-200 p-6">
              <div>
                <h2 className="text-xl font-bold text-gray-950">
                  {selectedCustomer.name}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Customer profile and order history
                </p>
              </div>

              <button
                onClick={() =>
                  setSelectedCustomer(null)
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            {/* CUSTOMER INFORMATION */}
            <div className="grid gap-4 border-b border-gray-200 p-6 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <Phone
                  size={18}
                  className="mt-0.5 text-gray-400"
                />

                <div>
                  <p className="text-xs text-gray-500">
                    Phone
                  </p>

                  <p className="mt-1 text-sm font-medium text-gray-900">
                    {selectedCustomer.phone}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail
                  size={18}
                  className="mt-0.5 text-gray-400"
                />

                <div>
                  <p className="text-xs text-gray-500">
                    Email
                  </p>

                  <p className="mt-1 text-sm font-medium text-gray-900">
                    {selectedCustomer.email ||
                      "Not provided"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin
                  size={18}
                  className="mt-0.5 text-gray-400"
                />

                <div>
                  <p className="text-xs text-gray-500">
                    Address
                  </p>

                  <p className="mt-1 text-sm font-medium text-gray-900">
                    {selectedCustomer.address ||
                      "Not provided"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CalendarDays
                  size={18}
                  className="mt-0.5 text-gray-400"
                />

                <div>
                  <p className="text-xs text-gray-500">
                    Customer Since
                  </p>

                  <p className="mt-1 text-sm font-medium text-gray-900">
                    {formatDate(
                      selectedCustomer.createdAt
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* CUSTOMER SUMMARY */}
            <div className="grid grid-cols-2 gap-4 p-6">
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-xs text-gray-500">
                  Total Orders
                </p>

                <p className="mt-1 text-xl font-bold text-gray-950">
                  {selectedCustomer.orderCount}
                </p>
              </div>

              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-xs text-gray-500">
                  Total Spent
                </p>

                <p className="mt-1 text-xl font-bold text-gray-950">
                  {formatCurrency(
                    selectedCustomer.totalSpent
                  )}
                </p>
              </div>
            </div>

            {/* ORDER HISTORY */}
            <div className="px-6 pb-6">
              <h3 className="mb-4 font-semibold text-gray-950">
                Order History
              </h3>

              {selectedCustomer.orders &&
              selectedCustomer.orders.length > 0 ? (
                <div className="overflow-hidden rounded-xl border border-gray-200">
                  <div className="divide-y divide-gray-100">
                    {selectedCustomer.orders.map(
                      (order) => {
                        const isDelivery =
                          order.orderType ===
                          "DELIVERY";

                        return (
                          <div
                            key={order.id}
                            className="p-4"
                          >
                            <div className="flex flex-col gap-4">
                              {/* TOP ROW */}
                              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                  <p className="font-semibold text-gray-900">
                                    {order.orderNumber ||
                                      order.id}
                                  </p>

                                  <p className="mt-1 text-xs text-gray-500">
                                    {formatDateTime(
                                      order.createdAt
                                    )}
                                  </p>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                  {/* ORDER TYPE */}
                                  <span
                                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${getOrderTypeClass(
                                      order.orderType
                                    )}`}
                                  >
                                    {isDelivery ? (
                                      <Truck
                                        size={13}
                                      />
                                    ) : (
                                      <Store
                                        size={13}
                                      />
                                    )}

                                    {getOrderTypeLabel(
                                      order.orderType
                                    )}
                                  </span>

                                  {/* STATUS */}
                                  <span
                                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                      order.status ===
                                      "COMPLETED"
                                        ? "bg-green-50 text-green-700"
                                        : order.status ===
                                          "CANCELLED"
                                        ? "bg-red-50 text-red-700"
                                        : "bg-yellow-50 text-yellow-700"
                                    }`}
                                  >
                                    {order.status}
                                  </span>
                                </div>
                              </div>

                              {/* DELIVERY ADDRESS */}
                              {isDelivery &&
                                order.deliveryAddress && (
                                  <div className="flex items-start gap-3 rounded-lg bg-blue-50 p-3">
                                    <MapPin
                                      size={17}
                                      className="mt-0.5 shrink-0 text-blue-600"
                                    />

                                    <div>
                                      <p className="text-xs font-semibold text-blue-700">
                                        Delivery Address
                                      </p>

                                      <p className="mt-1 text-sm text-blue-900">
                                        {
                                          order.deliveryAddress
                                        }
                                      </p>
                                    </div>
                                  </div>
                                )}

                              {/* BOTTOM DETAILS */}
                              <div className="flex flex-col gap-3 border-t border-gray-100 pt-3 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                  <p className="text-xs text-gray-500">
                                    Payment
                                  </p>

                                  <p className="mt-1 text-sm font-medium text-gray-900">
                                    {getPaymentLabel(
                                      order.sale
                                        ?.paymentMethod
                                    )}
                                  </p>

                                  <p className="mt-0.5 text-xs text-gray-500">
                                    {order.sale
                                      ?.paymentStatus ||
                                      "N/A"}
                                  </p>
                                </div>

                                <div className="text-left sm:text-right">
                                  <p className="text-xs text-gray-500">
                                    Order Total
                                  </p>

                                  <p className="mt-1 text-lg font-bold text-gray-950">
                                    {formatCurrency(
                                      order.total
                                    )}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
              ) : (
                <div className="rounded-xl bg-gray-50 p-6 text-center text-sm text-gray-500">
                  No orders found for this customer.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


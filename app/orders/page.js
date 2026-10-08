"use client";

import { useEffect, useMemo, useState } from "react";
import Sidebar from "../../components/Sidebar";

export default function OrdersPage() {
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const [paymentMethod, setPaymentMethod] =
    useState("CASH");

  const [customerName, setCustomerName] =
    useState("");

  const [customerPhone, setCustomerPhone] =
    useState("");

  const [customerEmail, setCustomerEmail] =
    useState("");

  const [orderType, setOrderType] =
    useState("PICKUP");

  const [deliveryAddress, setDeliveryAddress] =
    useState("");

  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const [completedOrder, setCompletedOrder] =
    useState(null);

  const [orders, setOrders] = useState([]);

  const [ordersLoading, setOrdersLoading] =
    useState(false);

  const [orderSearch, setOrderSearch] =
    useState("");

  const [orderStatusFilter, setOrderStatusFilter] =
    useState("ALL");

  const [updatingOrderId, setUpdatingOrderId] =
    useState(null);

  useEffect(() => {
    fetchMenu();
    fetchOrders();
  }, []);

  async function fetchMenu() {
    try {
      const response = await fetch("/api/menu");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to load menu."
        );
      }

      if (data.success) {
        setMenuItems(data.menuItems || []);
      }
    } catch (error) {
      console.error("FAILED TO LOAD MENU:", error);

      alert(
        error.message ||
          "Failed to load menu items."
      );
    } finally {
      setLoading(false);
    }
  }

  // -----------------------------
  // Orders / Order History
  // -----------------------------

  async function fetchOrders() {
    setOrdersLoading(true);

    try {
      const response = await fetch("/api/orders");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to load orders."
        );
      }

      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error(
        "FAILED TO LOAD ORDERS:",
        error
      );

      alert(
        error.message ||
          "Failed to load order history."
      );
    } finally {
      setOrdersLoading(false);
    }
  }

  async function updateOrderStatus(orderId, status) {
    setUpdatingOrderId(orderId);

    try {
      const response = await fetch(
        `/api/orders/${orderId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to update order status."
        );
      }

      if (data.success) {
        setOrders((currentOrders) =>
          currentOrders.map((order) =>
            order.id === orderId
              ? data.order
              : order
          )
        );
      }
    } catch (error) {
      console.error(
        "UPDATE ORDER STATUS ERROR:",
        error
      );

      alert(
        error.message ||
          "Failed to update order status."
      );
    } finally {
      setUpdatingOrderId(null);
    }
  }

  function getNextStatus(status) {
    if (status === "PENDING") {
      return "PREPARING";
    }

    if (status === "PREPARING") {
      return "READY";
    }

    if (status === "READY") {
      return "COMPLETED";
    }

    return null;
  }

  function getStatusLabel(status) {
    const labels = {
      PENDING: "Pending",
      PREPARING: "Preparing",
      READY: "Ready",
      COMPLETED: "Completed",
      CANCELLED: "Cancelled",
    };

    return labels[status] || status;
  }

  function getStatusClass(status) {
    const classes = {
      PENDING:
        "bg-yellow-100 text-yellow-700",

      PREPARING:
        "bg-blue-100 text-blue-700",

      READY:
        "bg-purple-100 text-purple-700",

      COMPLETED:
        "bg-green-100 text-green-700",

      CANCELLED:
        "bg-red-100 text-red-700",
    };

    return (
      classes[status] ||
      "bg-gray-100 text-gray-700"
    );
  }

  const filteredOrders = useMemo(() => {
    const query = orderSearch
      .trim()
      .toLowerCase();

    return orders.filter((order) => {
      const matchesSearch =
        !query ||
        order.orderNumber
          ?.toLowerCase()
          .includes(query) ||
        order.customerName
          ?.toLowerCase()
          .includes(query) ||
        order.customerPhone
          ?.toLowerCase()
          .includes(query);

      const matchesStatus =
        orderStatusFilter === "ALL" ||
        order.status === orderStatusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    orders,
    orderSearch,
    orderStatusFilter,
  ]);

  // -----------------------------
  // Categories
  // -----------------------------

  const categories = useMemo(() => {
    const categoryNames = menuItems
      .map((item) => item.category?.name)
      .filter(Boolean);

    return ["All", ...new Set(categoryNames)];
  }, [menuItems]);

  // -----------------------------
  // Filter menu
  // -----------------------------

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const itemCategory =
        item.category?.name || "";

      const matchesSearch =
        item.name
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        itemCategory
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        (item.description || "")
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesCategory =
        category === "All" ||
        itemCategory === category;

      return (
        item.isAvailable &&
        matchesSearch &&
        matchesCategory
      );
    });
  }, [menuItems, search, category]);

  // -----------------------------
  // Cart functions
  // -----------------------------

  function addToCart(item) {
    setCart((currentCart) => {
      const existing = currentCart.find(
        (cartItem) =>
          cartItem.id === item.id
      );

      if (existing) {
        return currentCart.map((cartItem) =>
          cartItem.id === item.id
            ? {
                ...cartItem,
                quantity:
                  cartItem.quantity + 1,
              }
            : cartItem
        );
      }

      return [
        ...currentCart,
        {
          ...item,
          quantity: 1,
        },
      ];
    });
  }

  function increaseQuantity(id) {
    setCart((currentCart) =>
      currentCart.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity:
                item.quantity + 1,
            }
          : item
      )
    );
  }

  function decreaseQuantity(id) {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.id === id
            ? {
                ...item,
                quantity:
                  item.quantity - 1,
              }
            : item
        )
        .filter(
          (item) => item.quantity > 0
        )
    );
  }

  function removeFromCart(id) {
    setCart((currentCart) =>
      currentCart.filter(
        (item) => item.id !== id
      )
    );
  }

  // -----------------------------
  // Totals
  // -----------------------------

  const itemCount = useMemo(() => {
    return cart.reduce(
      (sum, item) =>
        sum + item.quantity,
      0
    );
  }, [cart]);

  const subtotal = useMemo(() => {
    return cart.reduce(
      (sum, item) =>
        sum +
        Number(item.price) *
          item.quantity,
      0
    );
  }, [cart]);

  const total = subtotal;

  // -----------------------------
  // Place order
  // -----------------------------

  async function completeOrder() {
    if (!customerName.trim()) {
      alert(
        "Please enter the customer name."
      );
      return;
    }

    if (!customerPhone.trim()) {
      alert(
        "Please enter the customer phone number."
      );
      return;
    }

    if (
      customerEmail.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        customerEmail.trim()
      )
    ) {
      alert(
        "Please enter a valid email address."
      );
      return;
    }

    if (
      orderType === "DELIVERY" &&
      !deliveryAddress.trim()
    ) {
      alert(
        "Please enter the delivery address."
      );
      return;
    }

    if (cart.length === 0) {
      alert(
        "Please add at least one item to the order."
      );
      return;
    }

    setProcessing(true);

    try {
      const response = await fetch(
        "/api/orders",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            customerName:
              customerName.trim(),

            customerPhone:
              customerPhone.trim(),

            customerEmail:
              customerEmail.trim() || null,

            orderType,

            deliveryAddress:
              orderType === "DELIVERY"
                ? deliveryAddress.trim()
                : null,

            notes: notes.trim(),

            paymentMethod,

            items: cart.map((item) => ({
              menuItemId: item.id,
              quantity: item.quantity,
            })),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.error ||
            "Failed to create order."
        );
        return;
      }

      setCompletedOrder(data.order);

      // Refresh order history
      fetchOrders();

      // Clear current order
      setCart([]);
      setCustomerName("");
      setCustomerPhone("");
      setCustomerEmail("");
      setOrderType("PICKUP");
      setDeliveryAddress("");
      setNotes("");
      setPaymentMethod("CASH");
    } catch (error) {
      console.error(
        "ORDER ERROR:",
        error
      );

      alert(
        "Something went wrong while creating the order."
      );
    } finally {
      setProcessing(false);
    }
  }

  // -----------------------------
  // Payment label
  // -----------------------------

  function getPaymentLabel(method) {
    if (method === "MOBILE_MONEY") {
      return "Mobile Money";
    }

    if (method === "CARD") {
      return "Card";
    }

    return "Cash";
  }

  // -----------------------------
  // Order type label
  // -----------------------------

  function getOrderTypeLabel(type) {
    if (type === "DELIVERY") {
      return "Delivery";
    }

    return "Pickup";
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <Sidebar />

      <main className="ml-0 min-h-screen p-4 pt-20 sm:p-6 sm:pt-20 md:ml-64 md:p-8 md:pt-8">

        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold">
            Orders / POS
          </h2>

          <p className="mt-1 text-gray-500">
            Create and process customer orders
          </p>
        </div>

        {/* POS */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* Menu */}
          <section className="lg:col-span-2">

            <div className="rounded-xl bg-white p-6 shadow-sm">

              {/* Search */}
              <div className="mb-5">
                <input
                  type="text"
                  placeholder="Search menu..."
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
                />
              </div>

              {/* Categories */}
              <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
                {categories.map(
                  (itemCategory) => (
                    <button
                      key={itemCategory}
                      onClick={() =>
                        setCategory(
                          itemCategory
                        )
                      }
                      className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium ${
                        category ===
                        itemCategory
                          ? "bg-gray-900 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {itemCategory}
                    </button>
                  )
                )}
              </div>

              {/* Menu Items */}
              {loading ? (
                <div className="p-10 text-center text-gray-500">
                  Loading menu...
                </div>
              ) : filteredItems.length ===
                0 ? (
                <div className="rounded-lg border border-dashed border-gray-300 p-10 text-center">

                  <div className="text-4xl">
                    🍽️
                  </div>

                  <p className="mt-3 font-medium">
                    No available menu items
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    Add available items from
                    Menu Management.
                  </p>

                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

                  {filteredItems.map(
                    (item) => (
                      <button
                        key={item.id}
                        onClick={() =>
                          addToCart(item)
                        }
                        className="rounded-xl border border-gray-200 p-5 text-left transition hover:border-gray-900 hover:shadow-md"
                      >

                        <div className="mb-4 flex h-20 items-center justify-center rounded-lg bg-gray-100 text-4xl">
                          🍽️
                        </div>

                        <h3 className="font-semibold">
                          {item.name}
                        </h3>

                        <p className="mt-1 text-sm text-gray-500">
                          {item.category?.name ||
                            "Uncategorized"}
                        </p>

                        {item.description && (
                          <p className="mt-2 line-clamp-2 text-xs text-gray-400">
                            {item.description}
                          </p>
                        )}

                        <p className="mt-3 font-bold">
                          GH₵{" "}
                          {Number(
                            item.price
                          ).toFixed(2)}
                        </p>

                        <div className="mt-3 rounded-lg bg-gray-900 py-2 text-center text-sm font-medium text-white">
                          + Add to Order
                        </div>

                      </button>
                    )
                  )}

                </div>
              )}

            </div>
          </section>

          {/* Current Order */}
          <section>

            <div className="sticky top-8 rounded-xl bg-white shadow-sm">

              <div className="border-b p-6">

                <h3 className="text-xl font-bold">
                  Current Order
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  {itemCount} item(s)
                </p>

              </div>

              {/* Cart */}
              <div className="max-h-105 overflow-y-auto p-6">

                {cart.length === 0 ? (
                  <div className="py-10 text-center">

                    <div className="text-4xl">
                      🛒
                    </div>

                    <p className="mt-3 font-medium">
                      Your order is empty
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      Select items from the
                      menu.
                    </p>

                  </div>
                ) : (
                  <div className="space-y-5">

                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="border-b pb-4 last:border-0"
                      >

                        <div className="flex justify-between gap-3">

                          <div>
                            <p className="font-semibold">
                              {item.name}
                            </p>

                            <p className="text-sm text-gray-500">
                              GH₵{" "}
                              {Number(
                                item.price
                              ).toFixed(2)}
                            </p>
                          </div>

                          <button
                            onClick={() =>
                              removeFromCart(
                                item.id
                              )
                            }
                            className="text-sm text-red-500 hover:text-red-700"
                          >
                            Remove
                          </button>

                        </div>

                        <div className="mt-3 flex items-center justify-between">

                          <div className="flex items-center rounded-lg border">

                            <button
                              onClick={() =>
                                decreaseQuantity(
                                  item.id
                                )
                              }
                              className="px-3 py-1 text-lg hover:bg-gray-100"
                            >
                              −
                            </button>

                            <span className="px-4 font-medium">
                              {item.quantity}
                            </span>

                            <button
                              onClick={() =>
                                increaseQuantity(
                                  item.id
                                )
                              }
                              className="px-3 py-1 text-lg hover:bg-gray-100"
                            >
                              +
                            </button>

                          </div>

                          <p className="font-bold">
                            GH₵{" "}
                            {(
                              Number(
                                item.price
                              ) *
                              item.quantity
                            ).toFixed(2)}
                          </p>

                        </div>

                      </div>
                    ))}

                  </div>
                )}

              </div>

              {/* Checkout */}
              <div className="border-t p-6">

                {/* Order Type */}
                <div className="mb-5">

                  <h4 className="mb-3 font-semibold">
                    Order Type
                  </h4>

                  <div className="grid grid-cols-2 gap-2 rounded-lg bg-gray-100 p-1">

                    <button
                      type="button"
                      onClick={() => {
                        setOrderType("PICKUP");
                        setDeliveryAddress("");
                      }}
                      className={`rounded-md px-4 py-3 text-sm font-medium transition ${
                        orderType === "PICKUP"
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-500 hover:text-gray-900"
                      }`}
                    >
                      🛍️ Pickup
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setOrderType("DELIVERY")
                      }
                      className={`rounded-md px-4 py-3 text-sm font-medium transition ${
                        orderType === "DELIVERY"
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-500 hover:text-gray-900"
                      }`}
                    >
                      🛵 Delivery
                    </button>

                  </div>

                  {orderType === "DELIVERY" && (
                    <div className="mt-3">

                      <label className="mb-2 block text-sm font-medium">
                        Delivery Address
                      </label>

                      <textarea
                        placeholder="Enter customer's delivery address"
                        value={deliveryAddress}
                        onChange={(e) =>
                          setDeliveryAddress(
                            e.target.value
                          )
                        }
                        rows={3}
                        required
                        className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900"
                      />

                      <p className="mt-1 text-xs text-gray-400">
                        Required for delivery orders.
                      </p>

                    </div>
                  )}

                </div>

                {/* Customer */}
                <div className="mb-5">

                  <h4 className="mb-3 font-semibold">
                    Customer Details
                  </h4>

                  <div className="space-y-3">

                    <div>
                      <label className="mb-1 block text-sm font-bold">
                        Customer Name
                      </label>

                      <input
                        type="text"
                        placeholder="John Agyekum"
                        value={customerName}
                        onChange={(e) =>
                          setCustomerName(
                            e.target.value
                          )
                        }
                        required
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-bold">
                        Phone Number
                      </label>

                      <input
                        type="tel"
                        placeholder="0243XXXXXX"
                        value={customerPhone}
                        onChange={(e) =>
                          setCustomerPhone(
                            e.target.value
                          )
                        }
                        required
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-bold">
                        Email{" "}
                        <span className="font-normal text-gray-400">
                          (optional)
                        </span>
                      </label>

                      <input
                        type="email"
                        placeholder="customer@example.com"
                        value={customerEmail}
                        onChange={(e) =>
                          setCustomerEmail(
                            e.target.value
                          )
                        }
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-bold">
                        Order Notes{" "}
                        <span className="font-normal text-gray-400">
                          (optional)
                        </span>
                      </label>

                      <textarea
                        placeholder="Special instructions..."
                        value={notes}
                        onChange={(e) =>
                          setNotes(
                            e.target.value
                          )
                        }
                        rows={3}
                        className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900"
                      />
                    </div>

                  </div>

                </div>

                {/* Totals */}
                <div className="space-y-2 border-t pt-4">

                  <div className="flex justify-between text-sm text-gray-500">
                    <span>
                      Subtotal
                    </span>

                    <span>
                      GH₵{" "}
                      {subtotal.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between text-lg">

                    <span className="font-medium">
                      Total
                    </span>

                    <span className="text-2xl font-bold">
                      GH₵{" "}
                      {total.toFixed(2)}
                    </span>

                  </div>

                </div>

                {/* Payment */}
                <div className="mt-5">

                  <label className="mb-2 block text-sm font-medium">
                    Payment Method
                  </label>

                  <select
                    value={paymentMethod}
                    onChange={(e) =>
                      setPaymentMethod(
                        e.target.value
                      )
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
                  >

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

                {/* Submit */}
                <button
                  onClick={completeOrder}
                  disabled={
                    cart.length === 0 ||
                    processing
                  }
                  className="mt-5 w-full rounded-lg bg-gray-900 py-4 font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  {processing
                    ? "Processing..."
                    : "Place Order"}
                </button>

              </div>

            </div>

          </section>

        </div>

        {/* Order History */}
        <section className="mt-8">
          <div className="rounded-xl bg-white shadow-sm">

            {/* Header */}
            <div className="border-b p-6">

              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                <div>
                  <h3 className="text-xl font-bold">
                    Order History
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    View and manage customer orders
                  </p>
                </div>

                <button
                  onClick={fetchOrders}
                  disabled={ordersLoading}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {ordersLoading
                    ? "Refreshing..."
                    : "↻ Refresh"}
                </button>

              </div>

              {/* Search & Filter */}
              <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">

                <input
                  type="text"
                  placeholder="Search order number, customer or phone..."
                  value={orderSearch}
                  onChange={(e) =>
                    setOrderSearch(
                      e.target.value
                    )
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900"
                />

                <select
                  value={orderStatusFilter}
                  onChange={(e) =>
                    setOrderStatusFilter(
                      e.target.value
                    )
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900"
                >

                  <option value="ALL">
                    All Statuses
                  </option>

                  <option value="PENDING">
                    Pending
                  </option>

                  <option value="PREPARING">
                    Preparing
                  </option>

                  <option value="READY">
                    Ready
                  </option>

                  <option value="COMPLETED">
                    Completed
                  </option>

                  <option value="CANCELLED">
                    Cancelled
                  </option>

                </select>

              </div>

            </div>

            {/* Orders */}
            {ordersLoading ? (
              <div className="p-10 text-center text-gray-500">
                Loading order history...
              </div>
            ) : filteredOrders.length ===
              0 ? (
              <div className="p-10 text-center">

                <div className="text-4xl">
                  📋
                </div>

                <p className="mt-3 font-medium">
                  No orders found
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Orders created through the POS
                  will appear here.
                </p>

              </div>
            ) : (
              <div className="overflow-x-auto">

                <table className="w-full min-w-225">

                  <thead>
                    <tr className="border-b bg-gray-50 text-left text-sm text-gray-500">

                      <th className="px-6 py-4 font-medium">
                        Order
                      </th>

                      <th className="px-6 py-4 font-medium">
                        Customer
                      </th>

                      <th className="px-6 py-4 font-medium">
                        Type
                      </th>

                      <th className="px-6 py-4 font-medium">
                        Items
                      </th>

                      <th className="px-6 py-4 font-medium">
                        Total
                      </th>

                      <th className="px-6 py-4 font-medium">
                        Payment
                      </th>

                      <th className="px-6 py-4 font-medium">
                        Status
                      </th>

                      <th className="px-6 py-4 font-medium">
                        Staff
                      </th>

                      <th className="px-6 py-4 font-medium">
                        Date
                      </th>

                      <th className="px-6 py-4 font-medium">
                        Action
                      </th>

                    </tr>
                  </thead>

                  <tbody>

                    {filteredOrders.map(
                      (order) => {
                        const nextStatus =
                          getNextStatus(
                            order.status
                          );

                        return (
                          <tr
                            key={order.id}
                            className="border-b last:border-0 hover:bg-gray-50"
                          >

                            {/* Order */}
                            <td className="px-6 py-4">

                              <p className="font-semibold">
                                {order.orderNumber}
                              </p>

                              <p className="mt-1 text-xs text-gray-400">
                                {order.id.slice(
                                  0,
                                  8
                                )}
                              </p>

                            </td>

                            {/* Customer */}
                            <td className="px-6 py-4">

                              <p className="font-medium">
                                {order.customerName ||
                                  "Walk-in Customer"}
                              </p>

                              <p className="mt-1 text-sm text-gray-500">
                                {order.customerPhone ||
                                  "No phone"}
                              </p>

                              {order.customerEmail && (
                                <p className="mt-1 text-xs text-gray-400">
                                  {order.customerEmail}
                                </p>
                              )}

                              {order.orderType ===
                                "DELIVERY" &&
                                order.deliveryAddress && (
                                  <p className="mt-2 max-w-xs text-xs text-gray-500">
                                    📍{" "}
                                    {
                                      order.deliveryAddress
                                    }
                                  </p>
                                )}

                            </td>

                            {/* Order Type */}
                            <td className="px-6 py-4">

                              <span
                                className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                                  order.orderType ===
                                  "DELIVERY"
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                {order.orderType ===
                                "DELIVERY"
                                  ? "🛵 Delivery"
                                  : "🛍️ Pickup"}
                              </span>

                            </td>

                            {/* Items */}
                            <td className="px-6 py-4">

                              <div className="max-w-xs space-y-1">

                                {order.items?.map(
                                  (item) => (
                                    <p
                                      key={item.id}
                                      className="text-sm"
                                    >
                                      {item.quantity} ×{" "}
                                      {item.menuItem?.name}
                                    </p>
                                  )
                                )}

                              </div>

                            </td>

                            {/* Total */}
                            <td className="px-6 py-4">

                              <p className="font-bold">
                                GH₵{" "}
                                {Number(
                                  order.total
                                ).toFixed(2)}
                              </p>

                            </td>

                            {/* Payment */}
                            <td className="px-6 py-4">

                              <p className="text-sm">
                                {getPaymentLabel(
                                  order.sale
                                    ?.paymentMethod
                                )}
                              </p>

                              <p className="mt-1 text-xs text-gray-400">
                                {order.sale
                                  ?.paymentStatus ||
                                  "N/A"}
                              </p>

                            </td>

                            {/* Status */}
                            <td className="px-6 py-4">

                              <span
                                className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(
                                  order.status
                                )}`}
                              >
                                {getStatusLabel(
                                  order.status
                                )}
                              </span>

                            </td>

                            {/* Staff */}
                            <td className="px-6 py-4">

                              <p className="text-sm font-medium">
                                {order.createdBy?.name ||
                                  "Unknown"}
                              </p>

                              <p className="mt-1 text-xs text-gray-400">
                                {order.createdBy?.role ||
                                  ""}
                              </p>

                            </td>

                            {/* Date */}
                            <td className="px-6 py-4">

                              <p className="whitespace-nowrap text-sm">
                                {new Date(
                                  order.createdAt
                                ).toLocaleDateString(
                                  "en-GH"
                                )}
                              </p>

                              <p className="mt-1 whitespace-nowrap text-xs text-gray-400">
                                {new Date(
                                  order.createdAt
                                ).toLocaleTimeString(
                                  "en-GH",
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </p>

                            </td>

                            {/* Action */}
                            <td className="px-6 py-4">

                              <div className="flex flex-col gap-2">

                                {nextStatus && (
                                  <button
                                    onClick={() =>
                                      updateOrderStatus(
                                        order.id,
                                        nextStatus
                                      )
                                    }
                                    disabled={
                                      updatingOrderId ===
                                      order.id
                                    }
                                    className="whitespace-nowrap rounded-lg bg-gray-900 px-3 py-2 text-xs font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
                                  >
                                    {updatingOrderId ===
                                    order.id
                                      ? "Updating..."
                                      : `Mark ${getStatusLabel(
                                          nextStatus
                                        )}`}
                                  </button>
                                )}

                                {order.status !==
                                  "COMPLETED" &&
                                  order.status !==
                                    "CANCELLED" && (
                                    <button
                                      onClick={() =>
                                        updateOrderStatus(
                                          order.id,
                                          "CANCELLED"
                                        )
                                      }
                                      disabled={
                                        updatingOrderId ===
                                        order.id
                                      }
                                      className="whitespace-nowrap rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                      Cancel
                                    </button>
                                  )}

                              </div>

                            </td>

                          </tr>
                        );
                      }
                    )}

                  </tbody>

                </table>

              </div>
            )}

          </div>
        </section>

      </main>

      {/* Confirmation Modal */}
      {completedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">

              <span className="text-3xl text-green-600">
                ✓
              </span>

            </div>

            <div className="mt-5 text-center">

              <h2 className="text-2xl font-bold">
                Order Created
              </h2>

              <p className="mt-2 text-gray-500">
                The order has been successfully recorded.
              </p>

            </div>

            <div className="mt-6 rounded-xl bg-gray-50 p-5">

              <div className="flex justify-between gap-4">

                <span className="text-gray-500">
                  Order Number
                </span>

                <span className="font-bold">
                  {completedOrder.orderNumber}
                </span>

              </div>

              <div className="mt-4 flex justify-between">

                <span className="text-gray-500">
                  Order Type
                </span>

                <span className="font-medium">
                  {getOrderTypeLabel(
                    completedOrder.orderType
                  )}
                </span>

              </div>

              {completedOrder.orderType ===
                "DELIVERY" &&
                completedOrder.deliveryAddress && (
                  <div className="mt-4">

                    <span className="block text-gray-500">
                      Delivery Address
                    </span>

                    <span className="mt-1 block font-medium">
                      {
                        completedOrder.deliveryAddress
                      }
                    </span>

                  </div>
                )}

              <div className="mt-4 flex justify-between">

                <span className="text-gray-500">
                  Status
                </span>

                <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-700">
                  {completedOrder.status}
                </span>

              </div>

              <div className="mt-4 flex justify-between">

                <span className="text-gray-500">
                  Total
                </span>

                <span className="text-lg font-bold">
                  GH₵{" "}
                  {Number(
                    completedOrder.total
                  ).toFixed(2)}
                </span>

              </div>

              <div className="mt-4 flex justify-between">

                <span className="text-gray-500">
                  Payment
                </span>

                <span className="font-medium">
                  {getPaymentLabel(
                    completedOrder.sale
                      ?.paymentMethod
                  )}
                </span>

              </div>

              {completedOrder.customerName && (
                <div className="mt-4 flex justify-between gap-4">

                  <span className="text-gray-500">
                    Customer
                  </span>

                  <span className="font-medium">
                    {
                      completedOrder.customerName
                    }
                  </span>

                </div>
              )}

            </div>

            <button
              onClick={() =>
                setCompletedOrder(null)
              }
              className="mt-6 w-full rounded-lg bg-gray-900 py-3 font-semibold text-white transition hover:bg-gray-800"
            >
              Start New Order
            </button>

          </div>

        </div>
      )}

    </div>
  );
}


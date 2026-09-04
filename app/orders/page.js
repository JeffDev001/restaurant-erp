"use client";

import { useEffect, useMemo, useState } from "react";
import Sidebar from "../../components/Sidebar";

export default function OrdersPage() {
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [paymentMethod, setPaymentMethod] = useState("CASH");

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);
  const [completedPaymentMethod, setCompletedPaymentMethod] =
    useState(null);

  useEffect(() => {
    fetchMenu();
  }, []);

  async function fetchMenu() {
    try {
      const response = await fetch("/api/menu");
      const data = await response.json();

      if (data.success) {
        setMenuItems(data.menuItems);
      }
    } catch (error) {
      console.error("Failed to load menu:", error);
    } finally {
      setLoading(false);
    }
  }

  const categories = [
    "All",
    ...new Set(menuItems.map((item) => item.category)),
  ];

  const filteredItems = menuItems.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      category === "All" || item.category === category;

    return (
      item.available &&
      matchesSearch &&
      matchesCategory
    );
  });

  function addToCart(item) {
    setCart((currentCart) => {
      const existing = currentCart.find(
        (cartItem) => cartItem.id === item.id
      );

      if (existing) {
        return currentCart.map((cartItem) =>
          cartItem.id === item.id
            ? {
              ...cartItem,
              quantity: cartItem.quantity + 1,
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
            quantity: item.quantity + 1,
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
              quantity: item.quantity - 1,
            }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  function removeFromCart(id) {
    setCart((currentCart) =>
      currentCart.filter((item) => item.id !== id)
    );
  }

  const total = useMemo(() => {
    return cart.reduce(
      (sum, item) =>
        sum + Number(item.price) * item.quantity,
      0
    );
  }, [cart]);

  async function completeOrder() {
    if (cart.length === 0) {
      alert("Please add at least one item to the order.");
      return;
    }

    setProcessing(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentMethod,
          items: cart.map((item) => ({
            menuItemId: item.id,
            quantity: item.quantity,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to complete order.");
        return;
      }

      setCompletedOrder(data.order);
      setCompletedPaymentMethod(paymentMethod);

      setCart([]);
      setPaymentMethod("CASH");
    } catch (error) {
      console.error("ORDER ERROR:", error);
      alert("Something went wrong while completing the order.");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
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

        {/* POS Layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* Menu */}
          <section className="xl:col-span-2">

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

                {categories.map((itemCategory) => (

                  <button
                    key={itemCategory}
                    onClick={() =>
                      setCategory(itemCategory)
                    }
                    className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium ${category === itemCategory
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                  >
                    {itemCategory}
                  </button>

                ))}

              </div>

              {/* Menu Items */}
              {loading ? (

                <div className="p-10 text-center text-gray-500">
                  Loading menu...
                </div>

              ) : filteredItems.length === 0 ? (

                <div className="rounded-lg border border-dashed border-gray-300 p-10 text-center">

                  <div className="text-4xl">
                    🍽️
                  </div>

                  <p className="mt-3 font-medium">
                    No available menu items
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    Add available items from Menu Management.
                  </p>

                </div>

              ) : (

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

                  {filteredItems.map((item) => (

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
                        {item.category}
                      </p>

                      <p className="mt-3 font-bold">
                        GH₵{" "}
                        {Number(item.price).toFixed(2)}
                      </p>

                      <div className="mt-3 rounded-lg bg-gray-900 py-2 text-center text-sm font-medium text-white">
                        + Add to Order
                      </div>

                    </button>

                  ))}

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
                  {cart.reduce(
                    (sum, item) =>
                      sum + item.quantity,
                    0
                  )}{" "}
                  item(s)
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
                      Select items from the menu.
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
                              {Number(item.price).toFixed(2)}
                            </p>
                          </div>

                          <button
                            onClick={() =>
                              removeFromCart(item.id)
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
                                decreaseQuantity(item.id)
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
                                increaseQuantity(item.id)
                              }
                              className="px-3 py-1 text-lg hover:bg-gray-100"
                            >
                              +
                            </button>

                          </div>

                          <p className="font-bold">
                            GH₵{" "}
                            {(
                              Number(item.price) *
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

                <div className="mb-5 flex justify-between text-lg">

                  <span className="font-medium">
                    Total
                  </span>

                  <span className="text-2xl font-bold">
                    GH₵ {total.toFixed(2)}
                  </span>

                </div>

                {/* Payment */}
                <label className="mb-2 block text-sm font-medium">
                  Payment Method
                </label>

                <select
                  value={paymentMethod}
                  onChange={(e) =>
                    setPaymentMethod(e.target.value)
                  }
                  className="mb-5 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
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

                <button
                  onClick={completeOrder}
                  disabled={
                    cart.length === 0 ||
                    processing
                  }
                  className="w-full rounded-lg bg-gray-900 py-4 font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  {processing
                    ? "Processing..."
                    : "Complete Order"}
                </button>

              </div>

            </div>

          </section>

        </div>

      </main>

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
                Order Completed
              </h2>

              <p className="mt-2 text-gray-500">
                The order has been successfully recorded.
              </p>
            </div>

            <div className="mt-6 rounded-xl bg-gray-50 p-5">

              <div className="flex justify-between">
                <span className="text-gray-500">
                  Order ID
                </span>

                <span className="max-w-45 truncate font-medium">
                  {completedOrder.id}
                </span>
              </div>

              <div className="mt-4 flex justify-between">
                <span className="text-gray-500">
                  Total
                </span>

                <span className="text-lg font-bold">
                  GH₵ {Number(completedOrder.total).toFixed(2)}
                </span>
              </div>

              <div className="mt-4 flex justify-between">
                <span className="text-gray-500">
                  Payment
                </span>

                <span className="font-medium">
                  {completedPaymentMethod === "MOBILE_MONEY"
                    ? "Mobile Money"
                    : completedPaymentMethod === "CARD"
                      ? "Card"
                      : "Cash"}
                </span>
              </div>

            </div>

            <button
              onClick={() => setCompletedOrder(null)}
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
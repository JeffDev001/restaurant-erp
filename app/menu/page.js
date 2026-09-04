"use client";

import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    name: "",
    category: "",
    price: "",
    available: true,
  });

  const [search, setSearch] = useState("");

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

  function handleChange(e) {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.name || !form.category || !form.price) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      const response = await fetch("/api/menu", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          category: form.category,
          price: Number(form.price),
          available: form.available,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to add menu item.");
        return;
      }

      setMenuItems((prev) => [data.menuItem, ...prev]);

      setForm({
        name: "",
        category: "",
        price: "",
        available: true,
      });

      setShowForm(false);
    } catch (error) {
      console.error(error);
      alert("Something went wrong.");
    }
  }

  async function toggleAvailability(item) {
    try {
      const response = await fetch(`/api/menu/${item.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          available: !item.available,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to update item.");
        return;
      }

      setMenuItems((prev) =>
        prev.map((menuItem) =>
          menuItem.id === item.id ? data.menuItem : menuItem
        )
      );
    } catch (error) {
      console.error(error);
    }
  }

  async function deleteItem(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this menu item?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/menu/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to delete item.");
        return;
      }

      setMenuItems((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error(error);
    }
  }

  const filteredItems = menuItems.filter((item) => {
    const searchText = search.toLowerCase();

    return (
      item.name.toLowerCase().includes(searchText) ||
      item.category.toLowerCase().includes(searchText)
    );
  });

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">

      {/* Sidebar */}
      <Sidebar />

      {/* Main */}
      <main className="ml-0 min-h-screen p-4 pt-20 sm:p-6 sm:pt-20 md:ml-64 md:p-8 md:pt-8">

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">

          <div>
            <h2 className="text-3xl font-bold">
              Menu Management
            </h2>

            <p className="mt-1 text-gray-500">
              Manage your restaurant menu and prices
            </p>
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="rounded-lg bg-gray-900 px-5 py-3 font-medium text-white hover:bg-gray-800"
          >
            + Add Menu Item
          </button>

        </div>

        {/* Search */}
        <div className="mb-6 rounded-xl bg-white p-5 shadow-sm">

          <input
            type="text"
            placeholder="Search menu items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
          />

        </div>

        {/* Menu Table */}
        <div className="overflow-hidden rounded-xl bg-white shadow-sm">

          <div className="border-b px-6 py-5">
            <h3 className="text-xl font-bold">
              Menu Items
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              {filteredItems.length} item
              {filteredItems.length !== 1 ? "s" : ""}
            </p>
          </div>

          {loading ? (

            <div className="p-10 text-center text-gray-500">
              Loading menu...
            </div>

          ) : filteredItems.length === 0 ? (

            <div className="p-12 text-center">

              <div className="text-5xl">🍽️</div>

              <h3 className="mt-4 text-lg font-semibold">
                No menu items yet
              </h3>

              <p className="mt-1 text-gray-500">
                Add your first menu item to get started.
              </p>

              <button
                onClick={() => setShowForm(true)}
                className="mt-5 rounded-lg bg-gray-900 px-5 py-3 text-sm font-medium text-white"
              >
                + Add Menu Item
              </button>

            </div>

          ) : (

            <div className="rounded-xl bg-white p-4 shadow-sm sm:p-6">
              <div className="w-full overflow-x-auto">

                <table className="w-full min-w-175">

                  <thead className="bg-gray-50 text-left text-sm text-gray-500">

                    <tr>
                      <th className="px-6 py-4 font-medium">
                        Item
                      </th>

                      <th className="px-6 py-4 font-medium">
                        Category
                      </th>

                      <th className="px-6 py-4 font-medium">
                        Price
                      </th>

                      <th className="px-6 py-4 font-medium">
                        Status
                      </th>

                      <th className="px-6 py-4 text-right font-medium">
                        Actions
                      </th>
                    </tr>

                  </thead>

                  <tbody className="divide-y">

                    {filteredItems.map((item) => (

                      <tr
                        key={item.id}
                        className="hover:bg-gray-50"
                      >

                        <td className="px-6 py-4">
                          <p className="font-semibold">
                            {item.name}
                          </p>
                        </td>

                        <td className="px-6 py-4 text-gray-600">
                          {item.category}
                        </td>

                        <td className="px-6 py-4 font-semibold">
                          GH₵ {Number(item.price).toFixed(2)}
                        </td>

                        <td className="px-6 py-4">

                          {item.available ? (

                            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                              Available
                            </span>

                          ) : (

                            <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                              Unavailable
                            </span>

                          )}

                        </td>

                        <td className="px-6 py-4">

                          <div className="flex justify-end gap-2">

                            <button
                              onClick={() => toggleAvailability(item)}
                              className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-100"
                            >
                              {item.available
                                ? "Disable"
                                : "Enable"}
                            </button>

                            <button
                              onClick={() => deleteItem(item.id)}
                              className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                              Delete
                            </button>

                          </div>

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

                </div>

              </div>

          )}

            </div>

      </main>

      {/* Add Item Modal */}
      {showForm && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="w-full max-w-lg rounded-2xl bg-white p-7 shadow-xl">

            <div className="mb-6 flex items-center justify-between">

              <div>
                <h3 className="text-2xl font-bold">
                  Add Menu Item
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Add a new item to your restaurant menu.
                </p>
              </div>

              <button
                onClick={() => setShowForm(false)}
                className="text-2xl text-gray-400 hover:text-gray-700"
              >
                ×
              </button>

            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              <div>

                <label className="mb-2 block text-sm font-medium">
                  Item Name
                </label>

                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Jollof Rice"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
                />

              </div>

              <div>

                <label className="mb-2 block text-sm font-medium">
                  Category
                </label>

                <input
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  placeholder="e.g. Main Meals"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
                />

              </div>

              <div>

                <label className="mb-2 block text-sm font-medium">
                  Price (GH₵)
                </label>

                <input
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
                />

              </div>

              <label className="flex items-center gap-3">

                <input
                  type="checkbox"
                  name="available"
                  checked={form.available}
                  onChange={handleChange}
                  className="h-4 w-4"
                />

                <span className="text-sm font-medium">
                  Available for ordering
                </span>

              </label>

              <div className="flex gap-3 pt-3">

                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 rounded-lg border px-4 py-3 font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-gray-900 px-4 py-3 font-medium text-white hover:bg-gray-800"
                >
                  Add Item
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}
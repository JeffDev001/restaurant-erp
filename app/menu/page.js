"use client";

import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [editingItem, setEditingItem] = useState(null);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
    categoryId: "",
    categoryName: "",
    price: "",
    isAvailable: true,
  });

  useEffect(() => {
    fetchMenu();
  }, []);

  async function fetchMenu() {
    try {
      const response = await fetch("/api/menu");
      const data = await response.json();

      if (data.success) {
        setMenuItems(data.menuItems);
        setCategories(data.categories || []);
      } else {
        alert(data.error || "Failed to load menu.");
      }
    } catch (error) {
      console.error("Failed to load menu:", error);
      alert("Failed to load menu.");
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setForm({
      name: "",
      description: "",
      categoryId: "",
      categoryName: "",
      price: "",
      isAvailable: true,
    });

    setEditingItem(null);
    setShowForm(false);
  }

  function openAddForm() {
    setEditingItem(null);

    setForm({
      name: "",
      description: "",
      categoryId: "",
      categoryName: "",
      price: "",
      isAvailable: true,
    });

    setShowForm(true);
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function startEditing(item) {
    setEditingItem(item);

    setForm({
      name: item.name || "",
      description: item.description || "",
      categoryId: item.categoryId || "",
      categoryName: "",
      price: item.price ? Number(item.price) : "",
      isAvailable: item.isAvailable,
    });

    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.name.trim() || !form.price) {
      alert("Please enter the item name and price.");
      return;
    }

    if (!editingItem && !form.categoryId && !form.categoryName.trim()) {
      alert("Please select a category or enter a new category.");
      return;
    }

    if (editingItem && !form.categoryId) {
      alert("Please select a category.");
      return;
    }

    try {
      const url = editingItem
        ? `/api/menu/${editingItem.id}`
        : "/api/menu";

      const method = editingItem ? "PATCH" : "POST";

      const body = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        isAvailable: form.isAvailable,
      };

      if (editingItem) {
        body.categoryId = form.categoryId;
      } else {
        if (form.categoryId) {
          body.categoryId = form.categoryId;
        }

        if (form.categoryName.trim()) {
          body.categoryName = form.categoryName.trim();
        }
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to save menu item.");
        return;
      }

      if (editingItem) {
        setMenuItems((prev) =>
          prev.map((item) =>
            item.id === editingItem.id ? data.menuItem : item,
          ),
        );
      } else {
        setMenuItems((prev) => [data.menuItem, ...prev]);

        // Refresh categories in case a new category was created.
        await fetchCategories();
      }

      resetForm();
    } catch (error) {
      console.error("SAVE MENU ERROR:", error);
      alert("Something went wrong while saving the menu item.");
    }
  }

  async function fetchCategories() {
    try {
      const response = await fetch("/api/menu");
      const data = await response.json();

      if (data.success) {
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error("Failed to refresh categories:", error);
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
          isAvailable: !item.isAvailable,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to update item.");
        return;
      }

      setMenuItems((prev) =>
        prev.map((menuItem) =>
          menuItem.id === item.id ? data.menuItem : menuItem,
        ),
      );
    } catch (error) {
      console.error("TOGGLE MENU ERROR:", error);
      alert("Something went wrong.");
    }
  }

  async function deleteItem(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this menu item?",
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

      setMenuItems((prev) =>
        prev.filter((item) => item.id !== id),
      );
    } catch (error) {
      console.error("DELETE MENU ERROR:", error);
      alert("Something went wrong.");
    }
  }

  const filteredItems = menuItems.filter((item) => {
    const searchText = search.toLowerCase().trim();

    const categoryName = item.category?.name || "";

    return (
      item.name.toLowerCase().includes(searchText) ||
      categoryName.toLowerCase().includes(searchText) ||
      (item.description || "").toLowerCase().includes(searchText)
    );
  });

  const availableCount = menuItems.filter(
    (item) => item.isAvailable,
  ).length;

  const unavailableCount = menuItems.filter(
    (item) => !item.isAvailable,
  ).length;

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <Sidebar />

      <main className="ml-0 min-h-screen p-4 pt-20 sm:p-6 sm:pt-20 md:ml-64 md:p-8 md:pt-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-3xl font-bold">
              Menu Management
            </h2>

            <p className="mt-1 text-gray-500">
              Manage restaurant menu items, categories and prices.
            </p>
          </div>

          <button
            onClick={openAddForm}
            className="rounded-lg bg-gray-900 px-5 py-3 font-medium text-white hover:bg-gray-800"
          >
            + Add Menu Item
          </button>
        </div>

        {/* Summary */}
        <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Total Items
            </p>

            <p className="mt-2 text-3xl font-bold">
              {menuItems.length}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Available
            </p>

            <p className="mt-2 text-3xl font-bold text-green-600">
              {availableCount}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Unavailable
            </p>

            <p className="mt-2 text-3xl font-bold text-red-600">
              {unavailableCount}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6 rounded-xl bg-white p-5 shadow-sm">
          <input
            type="text"
            placeholder="Search by item, category or description..."
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
                No menu items found
              </h3>

              <p className="mt-1 text-gray-500">
                Add your first menu item to get started.
              </p>

              <button
                onClick={openAddForm}
                className="mt-5 rounded-lg bg-gray-900 px-5 py-3 text-sm font-medium text-white"
              >
                + Add Menu Item
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px]">
                <thead className="bg-gray-50 text-left text-sm text-gray-500">
                  <tr>
                    <th className="px-6 py-4 font-medium">
                      Item
                    </th>

                    <th className="px-6 py-4 font-medium">
                      Category
                    </th>

                    <th className="px-6 py-4 font-medium">
                      Description
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

                      <td className="px-6 py-4">
                        <span className="rounded-lg bg-gray-100 px-3 py-1 text-sm font-medium">
                          {item.category?.name ||
                            "Uncategorized"}
                        </span>
                      </td>

                      <td className="max-w-xs px-6 py-4 text-sm text-gray-500">
                        {item.description || "—"}
                      </td>

                      <td className="px-6 py-4 font-semibold">
                        GH₵{" "}
                        {Number(item.price).toFixed(2)}
                      </td>

                      <td className="px-6 py-4">
                        {item.isAvailable ? (
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
                            onClick={() =>
                              startEditing(item)
                            }
                            className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-100"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() =>
                              toggleAvailability(item)
                            }
                            className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-100"
                          >
                            {item.isAvailable
                              ? "Disable"
                              : "Enable"}
                          </button>

                          <button
                            onClick={() =>
                              deleteItem(item.id)
                            }
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
          )}
        </div>
      </main>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
          <div className="my-8 w-full max-w-2xl rounded-2xl bg-white p-7 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold">
                  {editingItem
                    ? "Edit Menu Item"
                    : "Add Menu Item"}
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  {editingItem
                    ? "Update menu item information."
                    : "Add a new item to your restaurant menu."}
                </p>
              </div>

              <button
                onClick={resetForm}
                className="text-2xl text-gray-400 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              {/* Name */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Item Name *
                </label>

                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Jollof Rice"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
                />
              </div>

              {/* Description */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Description
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Describe the meal..."
                  className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
                />
              </div>

              {/* Category */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Category *
                </label>

                <select
                  name="categoryId"
                  value={form.categoryId}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
                >
                  <option value="">
                    Select a category
                  </option>

                  {categories.map((category) => (
                    <option
                      key={category.id}
                      value={category.id}
                    >
                      {category.name}
                    </option>
                  ))}
                </select>

                {!editingItem && (
                  <div className="mt-3">
                    <p className="mb-2 text-xs text-gray-500">
                      Or enter a new category:
                    </p>

                    <input
                      name="categoryName"
                      value={form.categoryName}
                      onChange={handleChange}
                      placeholder="e.g. Breakfast"
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
                    />
                  </div>
                )}
              </div>

              {/* Price */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Price (GH₵) *
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

              {/* Availability */}
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="isAvailable"
                  checked={form.isAvailable}
                  onChange={handleChange}
                  className="h-4 w-4"
                />

                <span className="text-sm font-medium">
                  Available for ordering
                </span>
              </label>

              {/* Buttons */}
              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 rounded-lg border px-4 py-3 font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-gray-900 px-4 py-3 font-medium text-white hover:bg-gray-800"
                >
                  {editingItem
                    ? "Save Changes"
                    : "Add Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
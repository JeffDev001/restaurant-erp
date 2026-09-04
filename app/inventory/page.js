"use client";

import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";

export default function InventoryPage() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    name: "",
    quantity: "",
    unit: "pcs",
    minimumStock: "",
  });

  useEffect(() => {
    fetchInventory();
  }, []);

  async function fetchInventory() {
    try {
      const response = await fetch("/api/inventory");
      const data = await response.json();

      if (data.success) {
        setInventory(data.inventory);
      }
    } catch (error) {
      console.error("Failed to load inventory:", error);
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setForm({
      name: "",
      quantity: "",
      unit: "pcs",
      minimumStock: "",
    });

    setEditingItem(null);
    setShowForm(false);
  }

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.name || form.quantity === "") {
      alert("Please enter the item name and quantity.");
      return;
    }

    try {
      const url = editingItem
        ? `/api/inventory/${editingItem.id}`
        : "/api/inventory";

      const method = editingItem ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          quantity: Number(form.quantity),
          unit: form.unit,
          minimumStock: Number(form.minimumStock || 0),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to save inventory item.");
        return;
      }

      if (editingItem) {
        setInventory((prev) =>
          prev.map((item) =>
            item.id === editingItem.id
              ? data.inventoryItem
              : item
          )
        );
      } else {
        setInventory((prev) => [
          data.inventoryItem,
          ...prev,
        ]);
      }

      resetForm();
    } catch (error) {
      console.error("SAVE INVENTORY ERROR:", error);
      alert("Something went wrong.");
    }
  }

  function startEditing(item) {
    setEditingItem(item);

    setForm({
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      minimumStock: item.minimumStock,
    });

    setShowForm(true);
  }

  async function deleteItem(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this inventory item?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `/api/inventory/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to delete item.");
        return;
      }

      setInventory((prev) =>
        prev.filter((item) => item.id !== id)
      );
    } catch (error) {
      console.error("DELETE INVENTORY ERROR:", error);
    }
  }

  const filteredInventory = inventory.filter((item) =>
    item.name
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  function getStatus(item) {
    if (Number(item.quantity) <= 0) {
      return {
        label: "Out of Stock",
        className:
          "bg-red-100 text-red-700",
      };
    }

    if (
      Number(item.quantity) <=
      Number(item.minimumStock)
    ) {
      return {
        label: "Low Stock",
        className:
          "bg-yellow-100 text-yellow-700",
      };
    }

    return {
      label: "In Stock",
      className:
        "bg-green-100 text-green-700",
    };
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="ml-0 min-h-screen p-4 pt-20 sm:p-6 sm:pt-20 md:ml-64 md:p-8 md:pt-8">

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">

          <div>
            <h2 className="text-3xl font-bold">
              Inventory Management
            </h2>

            <p className="mt-1 text-gray-500">
              Monitor and manage restaurant stock
            </p>
          </div>

          <button
            onClick={() => {
              setEditingItem(null);
              setForm({
                name: "",
                quantity: "",
                unit: "pcs",
                minimumStock: "",
              });
              setShowForm(true);
            }}
            className="rounded-lg bg-gray-900 px-5 py-3 font-medium text-white hover:bg-gray-800"
          >
            + Add Inventory
          </button>

        </div>

        {/* Summary Cards */}
        <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-3">

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Total Items
            </p>

            <p className="mt-2 text-3xl font-bold">
              {inventory.length}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Low Stock
            </p>

            <p className="mt-2 text-3xl font-bold text-yellow-600">
              {
                inventory.filter(
                  (item) =>
                    Number(item.quantity) > 0 &&
                    Number(item.quantity) <=
                    Number(item.minimumStock)
                ).length
              }
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Out of Stock
            </p>

            <p className="mt-2 text-3xl font-bold text-red-600">
              {
                inventory.filter(
                  (item) =>
                    Number(item.quantity) <= 0
                ).length
              }
            </p>
          </div>

        </div>

        {/* Search */}
        <div className="mb-6 rounded-xl bg-white p-5 shadow-sm">

          <input
            type="text"
            placeholder="Search inventory..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
          />

        </div>

        {/* Inventory Table */}
        <div className="overflow-hidden rounded-xl bg-white shadow-sm">

          <div className="border-b px-6 py-5">
            <h3 className="text-xl font-bold">
              Inventory Items
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              {filteredInventory.length} item
              {filteredInventory.length !== 1
                ? "s"
                : ""}
            </p>
          </div>

          {loading ? (

            <div className="p-10 text-center text-gray-500">
              Loading inventory...
            </div>

          ) : filteredInventory.length === 0 ? (

            <div className="p-12 text-center">

              <div className="text-5xl">
                📦
              </div>

              <h3 className="mt-4 text-lg font-semibold">
                No inventory items yet
              </h3>

              <p className="mt-1 text-gray-500">
                Add your first stock item to get started.
              </p>

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
                        Quantity
                      </th>

                      <th className="px-6 py-4 font-medium">
                        Unit
                      </th>

                      <th className="px-6 py-4 font-medium">
                        Minimum Stock
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

                    {filteredInventory.map((item) => {

                      const status =
                        getStatus(item);

                      return (

                        <tr
                          key={item.id}
                          className="hover:bg-gray-50"
                        >

                          <td className="px-6 py-4 font-semibold">
                            {item.name}
                          </td>

                          <td className="px-6 py-4 font-medium">
                            {Number(item.quantity)}
                          </td>

                          <td className="px-6 py-4 text-gray-600">
                            {item.unit}
                          </td>

                          <td className="px-6 py-4 text-gray-600">
                            {Number(item.minimumStock)}
                          </td>

                          <td className="px-6 py-4">

                            <span
                              className={`rounded-full px-3 py-1 text-xs font-medium ${status.className}`}
                            >
                              {status.label}
                            </span>

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
                                  deleteItem(item.id)
                                }
                                className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                              >
                                Delete
                              </button>

                            </div>

                          </td>

                        </tr>

                      );
                    })}

                  </tbody>

                </table>

                </div>

              </div>

          )}

            </div>

      </main>

      {/* Add/Edit Modal */}
      {showForm && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="w-full max-w-lg rounded-2xl bg-white p-7 shadow-xl">

            <div className="mb-6 flex items-center justify-between">

              <div>

                <h3 className="text-2xl font-bold">
                  {editingItem
                    ? "Edit Inventory"
                    : "Add Inventory"}
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  {editingItem
                    ? "Update this stock item."
                    : "Add a new stock item."}
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

              <div>

                <label className="mb-2 block text-sm font-medium">
                  Item Name
                </label>

                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Rice"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
                />

              </div>

              <div className="grid grid-cols-2 gap-4">

                <div>

                  <label className="mb-2 block text-sm font-medium">
                    Quantity
                  </label>

                  <input
                    name="quantity"
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.quantity}
                    onChange={handleChange}
                    placeholder="0"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
                  />

                </div>

                <div>

                  <label className="mb-2 block text-sm font-medium">
                    Unit
                  </label>

                  <select
                    name="unit"
                    value={form.unit}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
                  >

                    <option value="pcs">
                      Pieces
                    </option>

                    <option value="kg">
                      Kilograms
                    </option>

                    <option value="g">
                      Grams
                    </option>

                    <option value="litres">
                      Litres
                    </option>

                    <option value="ml">
                      Millilitres
                    </option>

                    <option value="packs">
                      Packs
                    </option>

                    <option value="boxes">
                      Boxes
                    </option>

                  </select>

                </div>

              </div>

              <div>

                <label className="mb-2 block text-sm font-medium">
                  Minimum Stock Level
                </label>

                <input
                  name="minimumStock"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.minimumStock}
                  onChange={handleChange}
                  placeholder="e.g. 10"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
                />

                <p className="mt-1 text-xs text-gray-500">
                  The system will mark the item as low stock when it reaches this level.
                </p>

              </div>

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
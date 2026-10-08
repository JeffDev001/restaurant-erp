"use client";

import { useEffect, useMemo, useState } from "react";
import Sidebar from "../../components/Sidebar";
import {
  Package,
  Search,
  Plus,
  Minus,
  Pencil,
  Trash2,
  X,
  History,
  ArrowDownToLine,
  ArrowUpFromLine,
  Loader2,
} from "lucide-react";

export default function InventoryPage() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const [editingItem, setEditingItem] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);

  const [stockAction, setStockAction] = useState("STOCK_IN");

  const [form, setForm] = useState({
    name: "",
    description: "",
    currentStock: "",
    unit: "pcs",
    minimumStock: "",
  });

  const [stockForm, setStockForm] = useState({
    quantity: "",
    reason: "",
  });

  useEffect(() => {
    fetchInventory();
  }, []);

  async function fetchInventory() {
    try {
      setLoading(true);

      const response = await fetch("/api/inventory");
      const data = await response.json();

      if (data.success) {
        setInventory(data.inventory);
      } else {
        alert(data.error || "Failed to load inventory.");
      }
    } catch (error) {
      console.error("Failed to load inventory:", error);
      alert("Failed to load inventory.");
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setForm({
      name: "",
      description: "",
      currentStock: "",
      unit: "pcs",
      minimumStock: "",
    });

    setEditingItem(null);
    setShowForm(false);
  }

  function resetStockForm() {
    setStockForm({
      quantity: "",
      reason: "",
    });

    setSelectedItem(null);
    setShowStockModal(false);
  }

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleStockChange(e) {
    const { name, value } = e.target;

    setStockForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.name.trim()) {
      alert("Please enter the item name.");
      return;
    }

    if (form.currentStock === "") {
      alert("Please enter the current stock.");
      return;
    }

    try {
      setSaving(true);

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
          description: form.description,
          currentStock: Number(form.currentStock),
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
    } finally {
      setSaving(false);
    }
  }

  function startEditing(item) {
    setEditingItem(item);

    setForm({
      name: item.name || "",
      description: item.description || "",
      currentStock: Number(item.currentStock),
      unit: item.unit || "pcs",
      minimumStock: Number(item.minimumStock),
    });

    setShowForm(true);
  }

  function openStockModal(item, action) {
    setSelectedItem(item);
    setStockAction(action);

    setStockForm({
      quantity: "",
      reason: "",
    });

    setShowStockModal(true);
  }

  function openHistory(item) {
    setSelectedItem(item);
    setShowHistoryModal(true);
  }

  async function handleStockAdjustment(e) {
    e.preventDefault();

    if (!selectedItem) return;

    const quantity = Number(stockForm.quantity);

    if (!Number.isFinite(quantity) || quantity <= 0) {
      alert("Enter a valid quantity greater than 0.");
      return;
    }

    const currentStock = Number(selectedItem.currentStock);

    if (
      stockAction === "STOCK_OUT" &&
      quantity > currentStock
    ) {
      alert(
        `You cannot remove ${quantity} ${selectedItem.unit}. Only ${currentStock} ${selectedItem.unit} is available.`
      );
      return;
    }

    const newStock =
      stockAction === "STOCK_IN"
        ? currentStock + quantity
        : currentStock - quantity;

    try {
      setSaving(true);

      const response = await fetch(
        `/api/inventory/${selectedItem.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            currentStock: newStock,
            stockReason:
              stockForm.reason.trim() ||
              (stockAction === "STOCK_IN"
                ? "Stock added"
                : "Stock removed"),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.error ||
            "Failed to adjust stock."
        );
        return;
      }

      setInventory((prev) =>
        prev.map((item) =>
          item.id === selectedItem.id
            ? data.inventoryItem
            : item
        )
      );

      resetStockForm();
    } catch (error) {
      console.error(
        "STOCK ADJUSTMENT ERROR:",
        error
      );

      alert("Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteItem(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this inventory item? All stock transaction history for this item will also be deleted."
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
        alert(
          data.error ||
            "Failed to delete item."
        );
        return;
      }

      setInventory((prev) =>
        prev.filter((item) => item.id !== id)
      );
    } catch (error) {
      console.error(
        "DELETE INVENTORY ERROR:",
        error
      );

      alert("Failed to delete item.");
    }
  }

  const filteredInventory = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) return inventory;

    return inventory.filter((item) =>
      item.name.toLowerCase().includes(query)
    );
  }, [inventory, search]);

  function getStatus(item) {
    const stock = Number(item.currentStock);
    const minimum = Number(item.minimumStock);

    if (stock <= 0) {
      return {
        label: "Out of Stock",
        className:
          "bg-red-100 text-red-700",
      };
    }

    if (stock <= minimum) {
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

  const lowStockCount = inventory.filter(
    (item) => {
      const stock = Number(item.currentStock);
      const minimum = Number(item.minimumStock);

      return (
        stock > 0 &&
        stock <= minimum
      );
    }
  ).length;

  const outOfStockCount = inventory.filter(
    (item) =>
      Number(item.currentStock) <= 0
  ).length;

  function formatDate(date) {
    if (!date) return "N/A";

    return new Date(date).toLocaleString(
      "en-GH",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <Sidebar />

      <main className="ml-0 min-h-screen p-4 pt-20 sm:p-6 md:ml-64 md:p-8 md:pt-8">
        {/* HEADER */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
                description: "",
                currentStock: "",
                unit: "pcs",
                minimumStock: "",
              });

              setShowForm(true);
            }}
            className="flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-5 py-3 font-medium text-white hover:bg-gray-800"
          >
            <Plus size={18} />
            Add Inventory
          </button>
        </div>

        {/* SUMMARY */}
        <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Total Items
              </p>

              <Package
                size={20}
                className="text-gray-400"
              />
            </div>

            <p className="mt-2 text-3xl font-bold">
              {inventory.length}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Low Stock
            </p>

            <p className="mt-2 text-3xl font-bold text-yellow-600">
              {lowStockCount}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Out of Stock
            </p>

            <p className="mt-2 text-3xl font-bold text-red-600">
              {outOfStockCount}
            </p>
          </div>
        </div>

        {/* SEARCH */}
        <div className="mb-6 rounded-xl bg-white p-5 shadow-sm">
          <div className="relative">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              placeholder="Search inventory..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="w-full rounded-lg border border-gray-300 py-3 pl-11 pr-4 outline-none focus:border-gray-900"
            />
          </div>
        </div>

        {/* TABLE */}
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
              <Package
                size={48}
                className="mx-auto text-gray-300"
              />

              <h3 className="mt-4 text-lg font-semibold">
                No inventory items yet
              </h3>

              <p className="mt-1 text-gray-500">
                Add your first stock item to get started.
              </p>
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-275">
                <thead className="bg-gray-50 text-left text-sm text-gray-500">
                  <tr>
                    <th className="px-6 py-4 font-medium">
                      Item
                    </th>

                    <th className="px-6 py-4 font-medium">
                      Current Stock
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
                  {filteredInventory.map(
                    (item) => {
                      const status =
                        getStatus(item);

                      return (
                        <tr
                          key={item.id}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-6 py-4">
                            <p className="font-semibold">
                              {item.name}
                            </p>

                            {item.description && (
                              <p className="mt-1 max-w-xs truncate text-xs text-gray-500">
                                {item.description}
                              </p>
                            )}
                          </td>

                          <td className="px-6 py-4 font-semibold">
                            {Number(
                              item.currentStock
                            )}
                          </td>

                          <td className="px-6 py-4 text-gray-600">
                            {item.unit}
                          </td>

                          <td className="px-6 py-4 text-gray-600">
                            {Number(
                              item.minimumStock
                            )}
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
                                  openStockModal(
                                    item,
                                    "STOCK_IN"
                                  )
                                }
                                title="Add stock"
                                className="flex items-center gap-1 rounded-lg border border-green-200 px-3 py-2 text-sm font-medium text-green-700 hover:bg-green-50"
                              >
                                <Plus size={15} />
                                Add
                              </button>

                              <button
                                onClick={() =>
                                  openStockModal(
                                    item,
                                    "STOCK_OUT"
                                  )
                                }
                                title="Remove stock"
                                className="flex items-center gap-1 rounded-lg border border-orange-200 px-3 py-2 text-sm font-medium text-orange-700 hover:bg-orange-50"
                              >
                                <Minus size={15} />
                                Remove
                              </button>

                              <button
                                onClick={() =>
                                  openHistory(item)
                                }
                                title="View history"
                                className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-100"
                              >
                                <History
                                  size={16}
                                />
                              </button>

                              <button
                                onClick={() =>
                                  startEditing(item)
                                }
                                title="Edit"
                                className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-100"
                              >
                                <Pencil
                                  size={16}
                                />
                              </button>

                              <button
                                onClick={() =>
                                  deleteItem(
                                    item.id
                                  )
                                }
                                title="Delete"
                                className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                              >
                                <Trash2
                                  size={16}
                                />
                              </button>
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
      </main>

      {/* ADD / EDIT MODAL */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl sm:p-7">
            <div className="mb-6 flex items-start justify-between">
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
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              >
                <X size={22} />
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

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Description
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Optional description"
                  rows={2}
                  className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Current Stock
                  </label>

                  <input
                    name="currentStock"
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.currentStock}
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
                  The item becomes low stock when it reaches this level.
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
                  disabled={saving}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-3 font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving && (
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                  )}

                  {editingItem
                    ? "Save Changes"
                    : "Add Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STOCK ADJUSTMENT MODAL */}
      {showStockModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  {stockAction === "STOCK_IN" ? (
                    <ArrowDownToLine
                      size={22}
                      className="text-green-600"
                    />
                  ) : (
                    <ArrowUpFromLine
                      size={22}
                      className="text-orange-600"
                    />
                  )}

                  <h3 className="text-xl font-bold">
                    {stockAction === "STOCK_IN"
                      ? "Add Stock"
                      : "Remove Stock"}
                  </h3>
                </div>

                <p className="mt-1 text-sm text-gray-500">
                  {selectedItem.name}
                </p>
              </div>

              <button
                onClick={resetStockForm}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-5 rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-500">
                Current Stock
              </p>

              <p className="mt-1 text-2xl font-bold">
                {Number(
                  selectedItem.currentStock
                )}{" "}
                {selectedItem.unit}
              </p>
            </div>

            <form
              onSubmit={handleStockAdjustment}
              className="space-y-5"
            >
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Quantity
                </label>

                <input
                  name="quantity"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={stockForm.quantity}
                  onChange={handleStockChange}
                  placeholder={`e.g. 10 ${selectedItem.unit}`}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Reason
                </label>

                <textarea
                  name="reason"
                  value={stockForm.reason}
                  onChange={handleStockChange}
                  rows={3}
                  placeholder={
                    stockAction === "STOCK_IN"
                      ? "e.g. New supplier delivery"
                      : "e.g. Used for today's cooking"
                  }
                  className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={resetStockForm}
                  className="flex-1 rounded-lg border px-4 py-3 font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 font-medium text-white disabled:opacity-60 ${
                    stockAction === "STOCK_IN"
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-orange-600 hover:bg-orange-700"
                  }`}
                >
                  {saving && (
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                  )}

                  {stockAction === "STOCK_IN"
                    ? "Add Stock"
                    : "Remove Stock"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* HISTORY MODAL */}
      {showHistoryModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="flex items-start justify-between border-b p-6">
              <div>
                <h3 className="text-2xl font-bold">
                  Stock History
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  {selectedItem.name} · Current stock:{" "}
                  {Number(
                    selectedItem.currentStock
                  )}{" "}
                  {selectedItem.unit}
                </p>
              </div>

              <button
                onClick={() => {
                  setShowHistoryModal(false);
                  setSelectedItem(null);
                }}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100"
              >
                <X size={22} />
              </button>
            </div>

            <div className="max-h-[65vh] overflow-y-auto">
              {!selectedItem.transactions ||
              selectedItem.transactions.length === 0 ? (
                <div className="p-10 text-center text-gray-500">
                  No stock transactions yet.
                </div>
              ) : (
                <div className="divide-y">
                  {selectedItem.transactions.map(
                    (transaction) => (
                      <div
                        key={transaction.id}
                        className="p-5"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              {transaction.type ===
                              "STOCK_IN" ? (
                                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                                  Stock In
                                </span>
                              ) : transaction.type ===
                                "STOCK_OUT" ? (
                                <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
                                  Stock Out
                                </span>
                              ) : (
                                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                                  Adjustment
                                </span>
                              )}

                              <span className="text-sm font-semibold">
                                {Number(
                                  transaction.quantity
                                )}{" "}
                                {selectedItem.unit}
                              </span>
                            </div>

                            <p className="mt-2 text-sm text-gray-700">
                              {transaction.reason ||
                                "No reason provided"}
                            </p>
                          </div>

                          <div className="text-left sm:text-right">
                            <p className="text-sm font-medium text-gray-900">
                              {transaction.recordedBy
                                ?.name ||
                                "Unknown user"}
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                              {formatDate(
                                transaction.createdAt
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


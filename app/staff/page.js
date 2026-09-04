"use client";

import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";

export default function StaffPage() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);

  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "Staff",
    status: "ACTIVE",
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  async function fetchStaff() {
    try {
      const response = await fetch("/api/staff");
      const data = await response.json();

      if (data.success) {
        setStaff(data.staff);
      }
    } catch (error) {
      console.error("Failed to load staff:", error);
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setForm({
      name: "",
      email: "",
      phone: "",
      role: "Staff",
      status: "ACTIVE",
    });

    setEditingStaff(null);
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

    if (!form.name || !form.email || !form.role) {
      alert("Please fill in the required fields.");
      return;
    }

    try {
      const url = editingStaff ? `/api/staff/${editingStaff.id}` : "/api/staff";

      const method = editingStaff ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to save staff member.");
        return;
      }

      if (editingStaff) {
        setStaff((prev) =>
          prev.map((member) =>
            member.id === editingStaff.id ? data.staff : member,
          ),
        );
      } else {
        setStaff((prev) => [data.staff, ...prev]);
      }

      resetForm();
    } catch (error) {
      console.error("SAVE STAFF ERROR:", error);
      alert("Something went wrong.");
    }
  }

  function startEditing(member) {
    setEditingStaff(member);

    setForm({
      name: member.name,
      email: member.email,
      phone: member.phone || "",
      role: member.role,
      status: member.status,
    });

    setShowForm(true);
  }

  async function toggleStatus(member) {
    const newStatus = member.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    try {
      const response = await fetch(`/api/staff/${member.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to update status.");
        return;
      }

      setStaff((prev) =>
        prev.map((item) => (item.id === member.id ? data.staff : item)),
      );
    } catch (error) {
      console.error("STATUS UPDATE ERROR:", error);
    }
  }

  async function deleteStaff(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this staff member?",
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/staff/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to delete staff member.");
        return;
      }

      setStaff((prev) => prev.filter((member) => member.id !== id));
    } catch (error) {
      console.error("DELETE STAFF ERROR:", error);
    }
  }

  const filteredStaff = staff.filter((member) => {
    const query = search.toLowerCase();

    return (
      member.name.toLowerCase().includes(query) ||
      member.email.toLowerCase().includes(query) ||
      member.role.toLowerCase().includes(query)
    );
  });

  const activeStaff = staff.filter(
    (member) => member.status === "ACTIVE",
  ).length;

  const inactiveStaff = staff.filter(
    (member) => member.status === "INACTIVE",
  ).length;

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      {/* Sidebar */}
      <Sidebar />

      {/* Main */}
      <main className="ml-0 min-h-screen p-4 pt-20 sm:p-6 sm:pt-20 md:ml-64 md:p-8 md:pt-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Staff Management</h2>

            <p className="mt-1 text-gray-500">
              Manage restaurant employees and their roles
            </p>
          </div>

          <button
            onClick={() => {
              setEditingStaff(null);

              setForm({
                name: "",
                email: "",
                phone: "",
                role: "Staff",
                status: "ACTIVE",
              });

              setShowForm(true);
            }}
            className="rounded-lg bg-gray-900 px-5 py-3 font-medium text-white hover:bg-gray-800"
          >
            + Add Staff
          </button>
        </div>

        {/* Summary */}
        <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-3">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Total Staff</p>

            <p className="mt-2 text-3xl font-bold">{staff.length}</p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Active Staff</p>

            <p className="mt-2 text-3xl font-bold text-green-600">
              {activeStaff}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Inactive Staff</p>

            <p className="mt-2 text-3xl font-bold text-red-600">
              {inactiveStaff}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6 rounded-xl bg-white p-5 shadow-sm">
          <input
            type="text"
            placeholder="Search staff by name, email or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
          />
        </div>

        {/* Staff Table */}
        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
          <div className="border-b px-6 py-5">
            <h3 className="text-xl font-bold">Employees</h3>

            <p className="mt-1 text-sm text-gray-500">
              {filteredStaff.length} employee
              {filteredStaff.length !== 1 ? "s" : ""}
            </p>
          </div>

          {loading ? (
            <div className="p-10 text-center text-gray-500">
              Loading staff...
            </div>
          ) : filteredStaff.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-5xl">👥</div>

              <h3 className="mt-4 text-lg font-semibold">
                No staff members yet
              </h3>

              <p className="mt-1 text-gray-500">
                Add your first employee to get started.
              </p>
            </div>
          ) : (
            <div className="rounded-xl bg-white p-4 shadow-sm sm:p-6">
              <div className="w-full overflow-x-auto">
                <table className="w-full min-w-175">
                  <thead className="bg-gray-50 text-left text-sm text-gray-500">
                    <tr>
                      <th className="px-6 py-4 font-medium">Employee</th>

                      <th className="px-6 py-4 font-medium">Contact</th>

                      <th className="px-6 py-4 font-medium">Role</th>

                      <th className="px-6 py-4 font-medium">Status</th>

                      <th className="px-6 py-4 text-right font-medium">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y">
                    {filteredStaff.map((member) => (
                      <tr key={member.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <p className="font-semibold">{member.name}</p>
                        </td>

                        <td className="px-6 py-4">
                          <p className="text-sm">{member.email}</p>

                          {member.phone && (
                            <p className="mt-1 text-sm text-gray-500">
                              {member.phone}
                            </p>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <span className="rounded-lg bg-gray-100 px-3 py-1 text-sm font-medium">
                            {member.role}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          {member.status === "ACTIVE" ? (
                            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                              Active
                            </span>
                          ) : (
                            <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                              Inactive
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => startEditing(member)}
                              className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-100"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() => toggleStatus(member)}
                              className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-100"
                            >
                              {member.status === "ACTIVE"
                                ? "Deactivate"
                                : "Activate"}
                            </button>

                            <button
                              onClick={() => deleteStaff(member.id)}
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

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-7 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold">
                  {editingStaff ? "Edit Staff Member" : "Add Staff Member"}
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  {editingStaff
                    ? "Update employee information."
                    : "Add a new employee to the restaurant."}
                </p>
              </div>

              <button
                onClick={resetForm}
                className="text-2xl text-gray-400 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Full Name *
                </label>

                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. John Mensah"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
                />
              </div>

              {/* Email */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Email *
                </label>

                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="employee@example.com"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="mb-2 block text-sm font-medium">Phone</label>

                <input
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="024 XXX XXXX"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
                />
              </div>

              {/* Role + Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Role *
                  </label>

                  <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
                  >
                    <option value="Manager">Manager</option>

                    <option value="Chef">Chef</option>

                    <option value="Cashier">Cashier</option>

                    <option value="Waiter">Waiter</option>

                    <option value="Kitchen Staff">Kitchen Staff</option>

                    <option value="Staff">Staff</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Status
                  </label>

                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
                  >
                    <option value="ACTIVE">Active</option>

                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>

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
                  {editingStaff ? "Save Changes" : "Add Staff"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

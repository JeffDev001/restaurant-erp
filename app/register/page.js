"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Store,
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  CheckCircle2,
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    restaurantName: "",
    restaurantEmail: "",
    phone: "",
    address: "",
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");

    // --------------------------------------------------
    // BASIC VALIDATION
    // --------------------------------------------------

    if (
      !form.restaurantName.trim() ||
      !form.name.trim() ||
      !form.email.trim() ||
      !form.password
    ) {
      setError("Please fill in all required fields.");

      return;
    }

    if (form.password.length < 8) {
      setError(
        "Password must be at least 8 characters long."
      );

      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");

      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/auth/register", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Registration failed."
        );
      }

      // --------------------------------------------------
      // REGISTRATION SUCCESS
      // --------------------------------------------------

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      setError(
        error.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-5xl">
        {/* -------------------------------------------------- */}
        {/* HEADER */}
        {/* -------------------------------------------------- */}

        <div className="mb-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white">
              R
            </span>

            Restaurant ERP
          </Link>

          <h1 className="mt-8 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Create your restaurant account
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
            Set up your restaurant and create your administrator
            account to start managing your operations.
          </p>
        </div>

        {/* -------------------------------------------------- */}
        {/* FORM */}
        {/* -------------------------------------------------- */}

        <form
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="grid lg:grid-cols-2">
            {/* -------------------------------------------------- */}
            {/* RESTAURANT INFORMATION */}
            {/* -------------------------------------------------- */}

            <section className="border-b border-slate-200 p-6 sm:p-8 lg:border-b-0 lg:border-r">
              <div className="mb-7">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-900">
                  <Store size={21} />
                </div>

                <h2 className="text-xl font-semibold text-slate-900">
                  Restaurant information
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Tell us about your restaurant.
                </p>
              </div>

              <div className="space-y-5">
                {/* Restaurant Name */}

                <div>
                  <label
                    htmlFor="restaurantName"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Restaurant name
                    <span className="text-red-500"> *</span>
                  </label>

                  <div className="relative">
                    <Store
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="restaurantName"
                      name="restaurantName"
                      value={form.restaurantName}
                      onChange={handleChange}
                      placeholder="e.g. Bambicup"
                      className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                    />
                  </div>
                </div>

                {/* Restaurant Email */}

                <div>
                  <label
                    htmlFor="restaurantEmail"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Restaurant email
                  </label>

                  <div className="relative">
                    <Mail
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="restaurantEmail"
                      name="restaurantEmail"
                      type="email"
                      value={form.restaurantEmail}
                      onChange={handleChange}
                      placeholder="restaurant@example.com"
                      className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                    />
                  </div>
                </div>

                {/* Phone */}

                <div>
                  <label
                    htmlFor="phone"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Phone number
                  </label>

                  <div className="relative">
                    <Phone
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="024 XXX XXXX"
                      className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                    />
                  </div>
                </div>

                {/* Address */}

                <div>
                  <label
                    htmlFor="address"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Restaurant address
                  </label>

                  <div className="relative">
                    <MapPin
                      size={18}
                      className="absolute left-3 top-4 text-slate-400"
                    />

                    <textarea
                      id="address"
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Restaurant location"
                      className="w-full resize-none rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* -------------------------------------------------- */}
            {/* ADMIN INFORMATION */}
            {/* -------------------------------------------------- */}

            <section className="p-6 sm:p-8">
              <div className="mb-7">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-900">
                  <User size={21} />
                </div>

                <h2 className="text-xl font-semibold text-slate-900">
                  Administrator account
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  This account will manage your restaurant.
                </p>
              </div>

              <div className="space-y-5">
                {/* Name */}

                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Full name
                    <span className="text-red-500"> *</span>
                  </label>

                  <div className="relative">
                    <User
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="name"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Your full name"
                      className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                    />
                  </div>
                </div>

                {/* Email */}

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Admin email
                    <span className="text-red-500"> *</span>
                  </label>

                  <div className="relative">
                    <Mail
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                    />
                  </div>
                </div>

                {/* Password */}

                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Password
                    <span className="text-red-500"> *</span>
                  </label>

                  <div className="relative">
                    <Lock
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="password"
                      name="password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      value={form.password}
                      onChange={handleChange}
                      placeholder="At least 8 characters"
                      className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-12 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (current) => !current
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Confirm password
                    <span className="text-red-500"> *</span>
                  </label>

                  <div className="relative">
                    <Lock
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      value={form.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm your password"
                      className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-12 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          (current) => !current
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Error */}

              {error && (
                <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* Submit */}

              <button
                type="submit"
                disabled={loading}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />

                    Creating account...
                  </>
                ) : (
                  <>
                    Create restaurant account
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              {/* Login */}

              <p className="mt-5 text-center text-sm text-slate-500">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-slate-900 hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </section>
          </div>

          {/* -------------------------------------------------- */}
          {/* FOOTER NOTE */}
          {/* -------------------------------------------------- */}

          <div className="border-t border-slate-200 bg-slate-50 px-6 py-4 sm:px-8">
            <div className="flex items-start gap-3 text-xs leading-5 text-slate-500">
              <CheckCircle2
                size={16}
                className="mt-0.5 shrink-0 text-slate-700"
              />

              <p>
                Your restaurant data will be kept separate from
                other restaurants using the platform.
              </p>
            </div>
          </div>
        </form>

        <p className="mt-6 text-center text-xs text-slate-400">
          By creating an account, you agree to use the
          platform responsibly.
        </p>
      </div>
    </main>
  );
}


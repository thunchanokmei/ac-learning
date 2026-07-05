"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async () => {
    setErrorMessage("");

    if (!email || !password) {
      setErrorMessage("Please enter email and password.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    router.push("/");
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-red-50 to-white px-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl">
        <div className="mb-6 flex flex-col items-center">
          <Image
            src="/images/logo.jpg"
            alt="AC Learning Logo"
            width={86}
            height={86}
            priority
            className="rounded-full object-cover"
          />
          <h1 className="mt-3 text-2xl font-extrabold text-red-700">
            AC Learning
          </h1>
          <p className="text-sm text-gray-500">Sign in to continue</p>
        </div>

        {errorMessage && (
          <div className="mb-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        <label className="mb-1 block text-sm font-semibold text-gray-700">
          Email
        </label>
        <input
          type="email"
          className="mb-3 w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-red-500"
          placeholder="student@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label className="mb-1 block text-sm font-semibold text-gray-700">
          Password
        </label>
        <input
          type="password"
          className="mb-4 w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-red-500"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full rounded-xl bg-red-700 py-3 font-bold text-white disabled:bg-gray-300"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>

        <p className="mt-4 text-center text-sm text-gray-600">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-bold text-red-700">
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}
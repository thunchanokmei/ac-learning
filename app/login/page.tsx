"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

const GUEST_PASSWORD = "AC-Learning-Guest-2026!";

async function buildGuestEmail(name: string) {
  const normalizedName = name.trim().toLowerCase().normalize("NFKC");
  const encoded = new TextEncoder().encode(normalizedName);
  const digest = await crypto.subtle.digest("SHA-256", encoded);

  const hash = Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  return `guest-${hash.slice(0, 32)}@ac-learning.local`;
}

export default function LoginPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session) {
      router.replace("/");
      return;
    }

    setChecking(false);
  };

  const handleLogin = async () => {
    setErrorMessage("");

    const trimmedName = name.trim();

    if (!trimmedName) {
      setErrorMessage("Please enter your name.");
      return;
    }

    setLoading(true);

    const guestEmail = await buildGuestEmail(trimmedName);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: guestEmail,
      password: GUEST_PASSWORD,
    });

    if (!signInError) {
      localStorage.setItem("ac_learning_name", trimmedName);
      setLoading(false);
      router.replace("/");
      router.refresh();
      return;
    }

    const { data: signUpData, error: signUpError } =
      await supabase.auth.signUp({
        email: guestEmail,
        password: GUEST_PASSWORD,
        options: {
          data: {
            full_name: trimmedName,
          },
        },
      });

    setLoading(false);

    if (signUpError) {
      setErrorMessage(signUpError.message);
      return;
    }

    if (!signUpData.session) {
      setErrorMessage(
        "Login created, but email confirmation is still enabled. Please turn off email confirmation in Supabase."
      );
      return;
    }

    localStorage.setItem("ac_learning_name", trimmedName);

    router.replace("/");
    router.refresh();
  };

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-red-50 to-white px-4">
        <div className="rounded-3xl bg-white px-6 py-4 shadow-xl">
          <p className="text-sm font-medium text-gray-500">Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-red-50 to-white px-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl">
        <div className="mb-6 flex flex-col items-center">
          <div className="flex h-[86px] w-[86px] items-center justify-center overflow-hidden rounded-full bg-white shadow-sm ring-4 ring-red-50">
            <Image
              src="/images/logo.jpg"
              alt="AC Learning Logo"
              width={110}
              height={110}
              priority
              className="h-[80px] w-[80px] scale-125 rounded-full object-cover"
            />
          </div>

          <h1 className="mt-3 text-2xl font-extrabold text-red-700">
            AC Learning
          </h1>

          <p className="text-sm text-gray-500">Enter your name to continue</p>
        </div>

        {errorMessage && (
          <div className="mb-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        <label className="mb-1 block text-sm font-semibold text-gray-700">
          Name
        </label>

        <input
          type="text"
          className="mb-4 w-full rounded-xl border border-gray-200 p-3 text-base outline-none focus:border-red-500"
          placeholder="Enter your name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              handleLogin();
            }
          }}
        />

        <button
          type="button"
          onClick={handleLogin}
          disabled={loading}
          className="w-full rounded-xl bg-red-700 py-3 font-bold text-white disabled:bg-gray-300"
        >
          {loading ? "Entering..." : "Continue"}
        </button>
      </div>
    </main>
  );
}
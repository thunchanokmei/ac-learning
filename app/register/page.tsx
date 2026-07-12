"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const passwordRules = useMemo(
    () => [
      {
        label: "At least 6 characters",
        valid: password.length >= 6,
      },
      {
        label: "At least one lowercase letter",
        valid: /[a-z]/.test(password),
      },
      {
        label: "At least one uppercase letter",
        valid: /[A-Z]/.test(password),
      },
      {
        label: "At least one number",
        valid: /[0-9]/.test(password),
      },
    ],
    [password]
  );

  const isPasswordValid = passwordRules.every((rule) => rule.valid);
  const isConfirmMatched =
    confirmPassword.length > 0 && password === confirmPassword;

  const handleRegister = async () => {
    setErrorMessage("");

    if (!fullName || !studentId || !email || !password || !confirmPassword) {
      setErrorMessage("Please fill in all fields.");
      return;
    }

    if (!isPasswordValid) {
      setErrorMessage("Password does not meet all requirements.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Confirm password does not match.");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setLoading(false);
      setErrorMessage(error.message);
      return;
    }

    if (data.user) {
      const { error: profileError } = await supabase.from("profiles").insert({
        id: data.user.id,
        full_name: fullName,
        student_id: studentId,
      });

      if (profileError) {
        setLoading(false);
        setErrorMessage(profileError.message);
        return;
      }
    }

    setLoading(false);
    router.push("/login");
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-red-50 to-white px-4 py-8">
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
          <p className="text-sm text-gray-500">Create your account</p>
        </div>

        {errorMessage && (
          <div className="mb-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        <label className="mb-1 block text-sm font-semibold text-gray-700">
          Full name
        </label>
        <input
          type="text"
          name="fullName"
          autoComplete="name"
          className="mb-3 w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-red-500"
          placeholder="Wowza Haha"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />

        <label className="mb-1 block text-sm font-semibold text-gray-700">
          Student ID
        </label>
        <input
          type="text"
          name="studentId"
          inputMode="numeric"
          autoComplete="off"
          data-lpignore="true"
          data-1p-ignore="true"
          className="mb-3 w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-red-500"
          placeholder="6911111"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
        />

        <label className="mb-1 block text-sm font-semibold text-gray-700">
          Email
        </label>
        <input
          type="email"
          name="email"
          autoComplete="email"
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
          name="new-password"
          autoComplete="new-password"
          className="mb-2 w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-red-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="mb-3 space-y-1">
          {passwordRules.map((rule) => (
            <div
              key={rule.label}
              className={`flex items-center gap-2 text-xs ${
                rule.valid ? "text-green-700" : "text-red-600"
              }`}
            >
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full ${
                  rule.valid ? "bg-green-100" : "bg-red-100"
                }`}
              >
                {rule.valid ? <Check size={14} /> : <X size={14} />}
              </span>
              <span>{rule.label}</span>
            </div>
          ))}
        </div>

        <label className="mb-1 block text-sm font-semibold text-gray-700">
          Confirm password
        </label>
        <input
          type="password"
          name="confirm-password"
          autoComplete="new-password"
          className="mb-2 w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-red-500"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        {confirmPassword.length > 0 && (
          <div
            className={`mb-4 flex items-center gap-2 text-xs ${
              isConfirmMatched ? "text-green-700" : "text-red-600"
            }`}
          >
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full ${
                isConfirmMatched ? "bg-green-100" : "bg-red-100"
              }`}
            >
              {isConfirmMatched ? <Check size={14} /> : <X size={14} />}
            </span>
            <span>
              {isConfirmMatched
                ? "Passwords match"
                : "Passwords do not match"}
            </span>
          </div>
        )}

        <button
          onClick={handleRegister}
          disabled={loading}
          className="w-full rounded-xl bg-red-700 py-3 font-bold text-white disabled:bg-gray-300"
        >
          {loading ? "Creating..." : "Sign Up"}
        </button>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-red-700">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
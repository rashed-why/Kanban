import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SignupForm } from "./signup-form";
import { getServerSession } from "@/lib/get-server-session";

export const metadata: Metadata = {
  title: "Sign up",
  description: "Create a new account",
};

export default async function AuthSignupPage() {
  const user = await getServerSession();

  if (user) {
    redirect("/boards");
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4 py-12 dark:bg-black">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Create an account
            </h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Sign up with your name, email, and password
            </p>
          </div>

          <SignupForm />

          <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="font-medium text-zinc-900 underline-offset-4 hover:underline dark:text-zinc-50"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

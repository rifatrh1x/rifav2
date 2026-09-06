import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth";
import { SignupForm } from "@/components/auth-forms";

export const metadata: Metadata = { title: "Sign up · Rifav" };

export default async function SignupPage() {
  const user = await getCurrentUser();
  if (user) redirect("/");
  return <SignupForm />;
}

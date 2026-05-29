"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function LoginPage() {

  const router = useRouter();
  const [error, setError] = useState("");

  //log in button handler
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {

    e.preventDefault();

    //get form inputs
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    //call signIn with credentials --> passes to lib/auth.ts authorize()
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    //if success, redirect to dashboard
    if (res?.ok) {
      router.push("/dashboard");
    } else {
      //otherwise, give an error to the user
      setError("Invalid email or password");
    }

  }

  return (
    <main>
      <h1>Log In</h1>
      <form onSubmit={handleSubmit}>
        <input name="email" type="email" placeholder="Email" required />
        <input name="password" type="password" placeholder="Password" required />
        <button type="submit">Log In</button>
      </form>
      {error && <p>{error}</p>}
      <p>Don't have an account? <Link href="/signup">Sign up</Link></p>
    </main>
  );

}
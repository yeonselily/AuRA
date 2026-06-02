"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {

  const router = useRouter();
  const [error, setError] = useState("");

  //create account button handler
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {

    e.preventDefault();

    //get form inputs
    const form = e.currentTarget;
    const username = (form.elements.namedItem("username") as HTMLInputElement).value;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    //call signup POST with user input
    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });

    //if success, take the user to login
    if (res.ok) {
      router.push("/login");
    } else {
      //otherwise, show the error
      const data = await res.json();
      setError(data.error || "Something went wrong");
    }

  }

  return (
    <main className="onboarding">
      <section>
        <h1>Sign Up</h1>
        <form onSubmit={handleSubmit}>
          <p>
          <label htmlFor="username">Username: </label>
          <input id="username" name="username" type="text" placeholder="Username" required />
          </p>
          <p>
          <label htmlFor="email">Email: </label>
          <input id="email" name="email" type="email" placeholder="Email" required />
          </p>
          <p>
          <label htmlFor="password">Password: </label>
          <input id="password" name="password" type="password" placeholder="Password" required />
          </p>
          <button type="submit">Create Account</button>
        </form>
        {error && <p>{error}</p>}
      </section>
      <section>
        <p>Already have an account? <Link href="/login">Log in</Link></p>
      </section>
    </main>
  );
}
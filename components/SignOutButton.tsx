"use client";
import { signOut } from "next-auth/react";

import './components.css';

//handles signout, as its own component because signOut() must be called by the client
export default function SignOutButton() {
  //just deletes the cookie and takes you back to the login page
  return (
    <button id="signout" onClick={() => signOut({ callbackUrl: "/login" })}>
      Sign Out
    </button>
  );
}
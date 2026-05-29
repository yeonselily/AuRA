import { redirect } from "next/navigation";

export default function Home() {
  //user should be redirected to dashboard by default
  redirect("/dashboard");
}
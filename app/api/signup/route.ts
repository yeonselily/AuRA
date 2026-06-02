import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

//POST function for creating a new user account
export async function POST(req: Request) {

  //get the credentials entered by the user
  const { username, email, password } = await req.json();

  //make sure all fields are given
  if (!username || !email || !password) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }

  const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  //try to find a user in the db with the given email, fetch the first result from the query as [existing]
  const [existing] = await db.select().from(users).where(eq(users.email, email));

  //if there is already a user with this email, tell the user
  if (existing) {
    return NextResponse.json({ error: "Email already in use" }, { status: 409 });
  }

  //encrypt the password
  const hashed = await bcrypt.hash(password, 10);

  //create the new user in the db
  await db.insert(users).values({ username, email, password: hashed });

  //return success!
  return NextResponse.json({ success: true }, { status: 201 });

}
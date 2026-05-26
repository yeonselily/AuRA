import { db } from '@/db';
import { users } from '@/db/schema';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json();
  const newUser = await db.insert(users).values({
    username: body.username,
    email: body.email,
  }).returning();
  return NextResponse.json(newUser);
}

export async function GET() {
  const allUsers = await db.select().from(users);
  return NextResponse.json(allUsers);
}
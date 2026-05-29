import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db/index";
import { feedback } from "@/db/schema";
import { and, eq } from "drizzle-orm";

//POST function for setting or updating a user's song rating
export async function POST(req: Request) {

  //get the current session
  const session = await getServerSession(authOptions);

  //if the user is not logged in, give an error
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  //get the song & rating to be saved
  const { songID, rating } = await req.json();

  //if eithe ris not given, give an error
  if (!songID || rating === undefined) {
    return NextResponse.json({ error: "songID and rating are required" }, { status: 400 });
  }

  //if rating is not within range, give an error
  if (rating < 1 || rating > 10) {
    return NextResponse.json({ error: "Rating must be between 1 and 10" }, { status: 400 });
  }

  const userID = Number(session.user.id);

  //check if the user has already given a rating to the song
  const [existing] = await db
    .select()
    .from(feedback)
    .where(and(eq(feedback.userID, userID), eq(feedback.songID, songID)));

  //if the user has already rated the song, then use update()
  if (existing) {
    await db
      .update(feedback)
      .set({ rating })
      .where(and(eq(feedback.userID, userID), eq(feedback.songID, songID)));
  } else {
    //otherwise, this is a new rating, so use insert()
    await db.insert(feedback).values({ userID, songID, rating });
  }

  //success!
  return NextResponse.json({ success: true });

}
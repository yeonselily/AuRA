import { db } from '@/db';
import { users } from '@/db/schema';
import { sql } from 'drizzle-orm';

export default async function HomePage() {
  const allUsers = await db.select().from(users)
    .where(sql`LENGTH(${users.username}) >= 5`);

  return (
    <div>
      <h1>List of users:</h1>
      <ul>
        {allUsers.map(u => (
          <li key={u.id}>{u.username}: {u.email}</li>
        ))}
      </ul>
    </div>
  );
}
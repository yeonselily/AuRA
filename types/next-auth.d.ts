import "next-auth";

//we need to modify next-auth's Session interface to include an id field
//this is how we fetch the id of the current user, which is needed for intracting with the database
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
    };
  }

  interface JWT {
    id: string;
  }
}
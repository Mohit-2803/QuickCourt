import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session extends DefaultSession {
    id: string;
    role: string;
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
    name: string;
    email: string;
    role: "USER" | "OWNER" | "ADMIN";
    emailVerified: boolean | null;
    image?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    name: string;
    email: string;
    role: "USER" | "OWNER" | "ADMIN";
    emailVerified: boolean | null;
    image?: string | null;
  }
}

import type { NextAuthOptions } from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";

import { prisma } from "@formbricks/database";

import { env } from "./env.mjs";
import { createMembership } from "./membership/service";
import { createProduct } from "./product/service";
import { createTeam, getTeam } from "./team/service";
import { createUser, getUserByEmail } from "./user/service";

export const authOptions: NextAuthOptions = {
  providers: [
    KeycloakProvider({
      clientId: env.KEYCLOAK_CLIENT_ID ?? "formbricks",
      clientSecret: env.KEYCLOAK_CLIENT_SECRET ?? "BzFq0b03aDlPMFBbkNVGy8qKluDz4Qbm",
      issuer: env.KEYCLOAK_ISSUER ?? "https://3.109.154.173/kc/realms/midas",
    }),
  ],
  callbacks: {
    async jwt({ token }) {
      const existingUser = await getUserByEmail(token?.email!);

      if (!existingUser) {
        return token;
      }

      return {
        ...token,
        profile: existingUser || null,
      };
    },
    async session({ session, token }) {
      // @ts-expect-error
      session.user.id = token?.id;
      // @ts-expect-error
      session.user = token.profile;

      return session;
    },
    async signIn({ user, account }: any) {
      if (!user.email || !user.name || account.type !== "oauth") {
        return false;
      }

      // check if accounts for this provider / account Id already exists
      const existingUserWithAccount = await prisma.user.findFirst({
        where: {
          email: user.email,
        },
      });

      if (existingUserWithAccount) {
        return true;
      }

      const userProfile = await createUser({
        name: user.name,
        email: user.email,
        emailVerified: new Date(Date.now()),
        onboardingCompleted: false,
        identityProvider: "email",
        identityProviderAccountId: user.id,
      });
      // Default team assignment if env variable is set
      if (env.DEFAULT_TEAM_ID && env.DEFAULT_TEAM_ID.length > 0) {
        // check if team exists
        let team = await getTeam(env.DEFAULT_TEAM_ID);
        let isNewTeam = false;
        if (!team) {
          // create team with id from env
          team = await createTeam({ id: env.DEFAULT_TEAM_ID, name: userProfile.name + "'s Team" });
          isNewTeam = true;
        }
        const role = isNewTeam ? "owner" : env.DEFAULT_TEAM_ROLE || "admin";
        await createMembership(team.id, userProfile.id, { role, accepted: true });
      } else {
        const team = await createTeam({ name: userProfile.name + "'s Team" });
        await createMembership(team.id, userProfile.id, { role: "owner", accepted: true });
        await createProduct(team.id, { name: "My Product" });
      }
      return true;
    },
  },
  logger: {
    error(code, metadata) {
      console.log(code, metadata);
    },
    warn(code) {
      console.log(code);
    },
    debug(code, metadata) {
      console.log(code, metadata);
    },
  },
  secret: env.NEXTAUTH_SECRET ?? "",
};

import bcrypt from "bcryptjs";
import crypto from "crypto";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

const SESSION_COOKIE = "restaurant_erp_session";

// --------------------------------------------------
// PASSWORD
// --------------------------------------------------

export async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword);
}

// --------------------------------------------------
// SESSION
// --------------------------------------------------

export async function createSession(userId) {
  const token = crypto.randomUUID();

  const cookieStore = await cookies();

  cookieStore.set(
    SESSION_COOKIE,
    `${userId}:${token}`,
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    }
  );

  return token;
}

// --------------------------------------------------
// CURRENT USER
// --------------------------------------------------

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();

    const session =
      cookieStore.get(SESSION_COOKIE)?.value;

    if (!session) {
      return null;
    }

    const [userId] = session.split(":");

    if (!userId) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },

      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        restaurantId: true,
        isActive: true,

        restaurant: {
          select: {
            id: true,
            name: true,
            slug: true,
            isActive: true,
          },
        },
      },
    });

    if (!user) {
      return null;
    }

    // --------------------------------------------------
    // ACCOUNT STATUS
    // --------------------------------------------------

    if (!user.isActive) {
      return null;
    }

    // --------------------------------------------------
    // RESTAURANT STATUS
    // --------------------------------------------------

    if (!user.restaurantId || !user.restaurant) {
      return null;
    }

    if (!user.restaurant.isActive) {
      return null;
    }

    return user;
  } catch (error) {
    console.error(
      "GET CURRENT USER ERROR:",
      error
    );

    return null;
  }
}

// --------------------------------------------------
// REQUIRE AUTH
// --------------------------------------------------

export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("UNAUTHORIZED");
  }

  return user;
}

// --------------------------------------------------
// REQUIRE ROLE
// --------------------------------------------------

export async function requireRole(allowedRoles) {
  const user = await requireAuth();

  if (!allowedRoles.includes(user.role)) {
    throw new Error("FORBIDDEN");
  }

  return user;
}

// --------------------------------------------------
// LOGOUT
// --------------------------------------------------

export async function logout() {
  const cookieStore = await cookies();

  cookieStore.delete(SESSION_COOKIE);
}

// --------------------------------------------------
// ROLE CHECK
// --------------------------------------------------

export function hasRole(user, allowedRoles) {
  if (!user) {
    return false;
  }

  return allowedRoles.includes(user.role);
}


import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import {
  hashPassword,
  createSession,
} from "../../../../lib/auth";

// --------------------------------------------------
// SLUG GENERATOR
// --------------------------------------------------

function createSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// --------------------------------------------------
// UNIQUE SLUG
// --------------------------------------------------

async function generateUniqueSlug(name) {
  const baseSlug = createSlug(name);

  let slug = baseSlug || "restaurant";

  let counter = 1;

  while (true) {
    const existingRestaurant =
      await prisma.restaurant.findUnique({
        where: {
          slug,
        },
        select: {
          id: true,
        },
      });

    if (!existingRestaurant) {
      return slug;
    }

    counter += 1;

    slug = `${baseSlug}-${counter}`;
  }
}

// --------------------------------------------------
// POST
// --------------------------------------------------

export async function POST(request) {
  try {
    // --------------------------------------------------
    // READ REQUEST
    // --------------------------------------------------

    const body = await request.json();

    const {
      restaurantName,
      restaurantEmail,
      phone,
      address,
      name,
      email,
      password,
    } = body;

    // --------------------------------------------------
    // NORMALIZE
    // --------------------------------------------------

    const cleanRestaurantName =
      restaurantName?.trim();

    const cleanRestaurantEmail =
      restaurantEmail?.trim().toLowerCase() || null;

    const cleanPhone =
      phone?.trim() || null;

    const cleanAddress =
      address?.trim() || null;

    const cleanName =
      name?.trim();

    const cleanEmail =
      email?.trim().toLowerCase();

    // --------------------------------------------------
    // VALIDATION
    // --------------------------------------------------

    if (!cleanRestaurantName) {
      return NextResponse.json(
        {
          success: false,
          error: "Restaurant name is required.",
        },
        { status: 400 }
      );
    }

    if (!cleanName) {
      return NextResponse.json(
        {
          success: false,
          error: "Administrator name is required.",
        },
        { status: 400 }
      );
    }

    if (!cleanEmail) {
      return NextResponse.json(
        {
          success: false,
          error: "Administrator email is required.",
        },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        {
          success: false,
          error: "Password is required.",
        },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Password must be at least 8 characters long.",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // CHECK ADMIN EMAIL
    // --------------------------------------------------

    const existingUser =
      await prisma.user.findUnique({
        where: {
          email: cleanEmail,
        },

        select: {
          id: true,
        },
      });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error:
            "An account with this email already exists.",
        },
        { status: 409 }
      );
    }

    // --------------------------------------------------
    // GENERATE SLUG
    // --------------------------------------------------

    const slug =
      await generateUniqueSlug(
        cleanRestaurantName
      );

    // --------------------------------------------------
    // HASH PASSWORD
    // --------------------------------------------------

    const hashedPassword =
      await hashPassword(password);

    // --------------------------------------------------
    // CREATE RESTAURANT + ADMIN
    // --------------------------------------------------

    const result =
      await prisma.$transaction(async (tx) => {
        const restaurant =
          await tx.restaurant.create({
            data: {
              name: cleanRestaurantName,
              slug,
              email: cleanRestaurantEmail,
              phone: cleanPhone,
              address: cleanAddress,
              isActive: true,
            },
          });

        const user =
          await tx.user.create({
            data: {
              name: cleanName,
              email: cleanEmail,
              password: hashedPassword,
              role: "ADMIN",
              isActive: true,
              restaurantId:
                restaurant.id,
            },
          });

        return {
          restaurant,
          user,
        };
      });

    // --------------------------------------------------
    // CREATE SESSION
    // --------------------------------------------------

    await createSession(result.user.id);

    // --------------------------------------------------
    // RESPONSE
    // --------------------------------------------------

    return NextResponse.json({
      success: true,

      message:
        "Restaurant account created successfully.",

      restaurant: {
        id: result.restaurant.id,
        name: result.restaurant.name,
        slug: result.restaurant.slug,
      },

      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role,
      },
    });
  } catch (error) {
    console.error(
      "REGISTRATION ERROR:",
      error
    );

    // --------------------------------------------------
    // DUPLICATE EMAIL SAFETY
    // --------------------------------------------------

    if (
      error?.code === "P2002" &&
      error?.meta?.target?.includes("email")
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "An account with this email already exists.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error:
          "Unable to create your restaurant account. Please try again.",
      },
      { status: 500 }
    );
  }
}


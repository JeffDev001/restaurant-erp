import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import {
  verifyPassword,
  createSession,
} from "../../../../lib/auth";

export async function POST(request) {
  try {
    const body = await request.json();

    const email = body.email?.trim().toLowerCase();
    const password = body.password;

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: "Email and password are required.",
        },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
      include: {
        restaurant: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid email or password.",
        },
        { status: 401 }
      );
    }

    // Make sure the user account is active.
    if (!user.isActive) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Your account has been deactivated. Please contact your restaurant administrator.",
        },
        { status: 403 }
      );
    }

    // Every user in the SaaS must belong to a restaurant.
    if (!user.restaurantId || !user.restaurant) {
      return NextResponse.json(
        {
          success: false,
          error:
            "This account is not connected to a restaurant.",
        },
        { status: 403 }
      );
    }

    // Make sure the restaurant itself is active.
    if (!user.restaurant.isActive) {
      return NextResponse.json(
        {
          success: false,
          error:
            "This restaurant account is currently inactive.",
        },
        { status: 403 }
      );
    }

    const passwordMatches = await verifyPassword(
      password,
      user.password
    );

    if (!passwordMatches) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid email or password.",
        },
        { status: 401 }
      );
    }

    await createSession(user.id);

    return NextResponse.json({
      success: true,

      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,

        restaurantId: user.restaurantId,

        restaurant: {
          id: user.restaurant.id,
          name: user.restaurant.name,
          slug: user.restaurant.slug,
        },
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Login failed.",
      },
      { status: 500 }
    );
  }
}


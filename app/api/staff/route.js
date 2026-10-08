import { prisma } from "../../../lib/prisma";
import {
  hashPassword,
  requireRole,
} from "../../../lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await requireRole(["ADMIN"]);

    const restaurantId = user.restaurantId;

    const staff = await prisma.staff.findMany({
      where: {
        restaurantId,
      },

      orderBy: {
        createdAt: "desc",
      },

      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
          },
        },
      },
    });

    const formattedStaff = staff.map(
      (member) => ({
        id: member.id,
        userId: member.userId,
        firstName: member.firstName,
        lastName: member.lastName,
        name: `${member.firstName} ${member.lastName}`,
        email:
          member.user?.email || "",
        phone:
          member.phone || "",
        role:
          member.user?.role ||
          "STAFF",
        position: member.position,
        status: member.status,
        isActive:
          member.user?.isActive ??
          false,
        createdAt: member.createdAt,
      })
    );

    return NextResponse.json({
      success: true,
      staff: formattedStaff,
    });
  } catch (error) {
    console.error(
      "GET STAFF ERROR:",
      error
    );

    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    if (error.message === "FORBIDDEN") {
      return NextResponse.json(
        {
          success: false,
          error:
            "You do not have permission to manage staff.",
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to load staff",
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const user = await requireRole([
      "ADMIN",
    ]);

    const restaurantId =
      user.restaurantId;

    const body =
      await request.json();

    const {
      firstName,
      lastName,
      email,
      phone,
      role,
      position,
      password,
      status,
    } = body;

    if (
      !firstName ||
      !lastName ||
      !email ||
      !role ||
      !position
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "First name, last name, email, role and position are required.",
        },
        { status: 400 }
      );
    }

    if (
      !["ADMIN", "MANAGER", "STAFF"].includes(
        role
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid system role.",
        },
        { status: 400 }
      );
    }

    const validPositions = [
      "MANAGER",
      "SALESPERSON",
      "CASHIER",
      "KITCHEN_STAFF",
      "WAITER",
      "INVENTORY_STAFF",
    ];

    if (
      !validPositions.includes(
        position
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid staff position.",
        },
        { status: 400 }
      );
    }

    if (
      !password ||
      password.length < 6
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Password must be at least 6 characters.",
        },
        { status: 400 }
      );
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    const hashedPassword =
      await hashPassword(password);

    /*
     * User.email is globally unique,
     * so this check remains global.
     */
    const existingUser =
      await prisma.user.findUnique({
        where: {
          email: normalizedEmail,
        },
      });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error:
            "A user with this email already exists.",
        },
        { status: 409 }
      );
    }

    /*
     * Create the login account with
     * the current restaurant.
     */
    const createdUser =
      await prisma.user.create({
        data: {
          restaurantId,

          name: `${firstName.trim()} ${lastName.trim()}`,

          email:
            normalizedEmail,

          password:
            hashedPassword,

          role,

          isActive:
            status !== "INACTIVE",
        },
      });

    try {
      /*
       * Create the corresponding staff
       * record under the same restaurant.
       */
      const staff =
        await prisma.staff.create({
          data: {
            restaurantId,

            userId:
              createdUser.id,

            firstName:
              firstName.trim(),

            lastName:
              lastName.trim(),

            phone:
              phone?.trim() ||
              null,

            position,

            status:
              status ||
              "ACTIVE",
          },

          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isActive: true,
              },
            },
          },
        });

      return NextResponse.json(
        {
          success: true,

          staff: {
            id: staff.id,
            userId:
              staff.userId,
            firstName:
              staff.firstName,
            lastName:
              staff.lastName,
            name: `${staff.firstName} ${staff.lastName}`,
            email:
              staff.user.email,
            phone:
              staff.phone || "",
            role:
              staff.user.role,
            position:
              staff.position,
            status:
              staff.status,
            isActive:
              staff.user.isActive,
            createdAt:
              staff.createdAt,
          },
        },
        { status: 201 }
      );
    } catch (staffError) {
      /*
       * If Staff creation fails,
       * remove the User we just created.
       */
      await prisma.user.delete({
        where: {
          id: createdUser.id,
        },
      });

      throw staffError;
    }
  } catch (error) {
    console.error(
      "CREATE STAFF ERROR:",
      error
    );

    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    if (error.message === "FORBIDDEN") {
      return NextResponse.json(
        {
          success: false,
          error:
            "Only administrators can create staff accounts.",
        },
        { status: 403 }
      );
    }

    if (error.code === "P2002") {
      return NextResponse.json(
        {
          success: false,
          error:
            "That email or staff account already exists.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error:
          "Failed to create staff member.",
      },
      { status: 500 }
    );
  }
}


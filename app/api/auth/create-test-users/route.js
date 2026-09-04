import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { hashPassword } from "../../../../lib/auth";

export async function POST() {
  try {
    const managerPassword =
      await hashPassword("Manager@123");

    const staffPassword =
      await hashPassword("Staff@123");

    const manager = await prisma.user.upsert({
      where: {
        email: "manager@restaurant.com",
      },

      update: {
        password: managerPassword,
        role: "MANAGER",
        name: "Restaurant Manager",
      },

      create: {
        name: "Restaurant Manager",
        email: "manager@restaurant.com",
        password: managerPassword,
        role: "MANAGER",
      },
    });

    const staff = await prisma.user.upsert({
      where: {
        email: "staff@restaurant.com",
      },

      update: {
        password: staffPassword,
        role: "STAFF",
        name: "Restaurant Staff",
      },

      create: {
        name: "Restaurant Staff",
        email: "staff@restaurant.com",
        password: staffPassword,
        role: "STAFF",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Test users created successfully.",
      users: [
        {
          name: manager.name,
          email: manager.email,
          role: manager.role,
        },
        {
          name: staff.name,
          email: staff.email,
          role: staff.role,
        },
      ],
    });
  } catch (error) {
    console.error(
      "CREATE TEST USERS ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create test users.",
      },
      { status: 500 }
    );
  }
}
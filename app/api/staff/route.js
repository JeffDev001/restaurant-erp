import { prisma } from "../../../lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const staff = await prisma.staff.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      staff,
    });
  } catch (error) {
    console.error("GET STAFF ERROR:", error);

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
    const body = await request.json();

    const {
      name,
      email,
      phone,
      role,
      status,
    } = body;

    if (!name || !email || !role) {
      return NextResponse.json(
        {
          error: "Name, email and role are required",
        },
        { status: 400 }
      );
    }

    const staff = await prisma.staff.create({
      data: {
        name,
        email,
        phone: phone || null,
        role,
        status: status || "ACTIVE",
      },
    });

    return NextResponse.json(
      {
        success: true,
        staff,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE STAFF ERROR:", error);

    if (error.code === "P2002") {
      return NextResponse.json(
        {
          error: "A staff member with this name or email already exists.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create staff member",
      },
      { status: 500 }
    );
  }
}
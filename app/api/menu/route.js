import { prisma } from "../../../lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const menuItems = await prisma.menuItem.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      menuItems,
    });
  } catch (error) {
    console.error("GET MENU ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to load menu items",
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    const { name, category, price, available } = body;

    if (!name || !category || price === undefined) {
      return NextResponse.json(
        {
          error: "Name, category and price are required",
        },
        { status: 400 }
      );
    }

    const menuItem = await prisma.menuItem.create({
      data: {
        name,
        category,
        price: Number(price),
        available: available ?? true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        menuItem,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE MENU ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create menu item",
      },
      { status: 500 }
    );
  }
}
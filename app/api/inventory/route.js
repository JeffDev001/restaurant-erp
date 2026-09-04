import { prisma } from "../../../lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const inventory = await prisma.inventory.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      inventory,
    });
  } catch (error) {
    console.error("GET INVENTORY ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to load inventory",
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
      quantity,
      unit,
      minimumStock,
    } = body;

    if (!name || quantity === undefined) {
      return NextResponse.json(
        {
          error: "Name and quantity are required",
        },
        { status: 400 }
      );
    }

    const inventoryItem = await prisma.inventory.create({
      data: {
        name,
        quantity: Number(quantity),
        unit: unit || "pcs",
        minimumStock: Number(minimumStock || 0),
      },
    });

    return NextResponse.json(
      {
        success: true,
        inventoryItem,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE INVENTORY ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create inventory item",
      },
      { status: 500 }
    );
  }
}
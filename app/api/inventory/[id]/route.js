import { prisma } from "../../../../lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const inventoryItem = await prisma.inventory.update({
      where: {
        id,
      },
      data: {
        ...(body.name !== undefined && {
          name: body.name,
        }),

        ...(body.quantity !== undefined && {
          quantity: Number(body.quantity),
        }),

        ...(body.unit !== undefined && {
          unit: body.unit,
        }),

        ...(body.minimumStock !== undefined && {
          minimumStock: Number(body.minimumStock),
        }),
      },
    });

    return NextResponse.json({
      success: true,
      inventoryItem,
    });
  } catch (error) {
    console.error("UPDATE INVENTORY ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update inventory item",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    await prisma.inventory.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Inventory item deleted successfully",
    });
  } catch (error) {
    console.error("DELETE INVENTORY ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete inventory item",
      },
      { status: 500 }
    );
  }
}
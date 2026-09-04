import { prisma } from "../../../../lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const menuItem = await prisma.menuItem.update({
      where: {
        id,
      },
      data: body,
    });

    return NextResponse.json({
      success: true,
      menuItem,
    });
  } catch (error) {
    console.error("UPDATE MENU ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update menu item",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    await prisma.menuItem.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Menu item deleted successfully",
    });
  } catch (error) {
    console.error("DELETE MENU ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete menu item",
      },
      { status: 500 }
    );
  }
}
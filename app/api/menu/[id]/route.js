import { prisma } from "../../../../lib/prisma";
import { NextResponse } from "next/server";
import { requireRole } from "../../../../lib/auth";

export async function PATCH(request, { params }) {
  try {
    const user = await requireRole([
      "ADMIN",
      "MANAGER",
    ]);

    const restaurantId = user.restaurantId;

    const { id } = await params;
    const body = await request.json();

    // Only find the item if it belongs to the
    // currently logged-in user's restaurant.
    const existingItem = await prisma.menuItem.findFirst({
      where: {
        id,
        restaurantId,
      },
    });

    if (!existingItem) {
      return NextResponse.json(
        {
          success: false,
          error: "Menu item not found.",
        },
        { status: 404 }
      );
    }

    const data = {};

    if (body.name !== undefined) {
      if (!body.name.trim()) {
        return NextResponse.json(
          {
            success: false,
            error: "Item name cannot be empty.",
          },
          { status: 400 }
        );
      }

      data.name = body.name.trim();
    }

    if (body.description !== undefined) {
      data.description =
        body.description?.trim() || null;
    }

    if (body.price !== undefined) {
      const numericPrice = Number(body.price);

      if (
        Number.isNaN(numericPrice) ||
        numericPrice < 0
      ) {
        return NextResponse.json(
          {
            success: false,
            error: "Price must be a valid positive number.",
          },
          { status: 400 }
        );
      }

      data.price = numericPrice;
    }

    if (body.isAvailable !== undefined) {
      data.isAvailable = Boolean(body.isAvailable);
    }

    if (body.categoryId !== undefined) {
      // Make sure the new category belongs to the
      // same restaurant.
      const category =
        await prisma.category.findFirst({
          where: {
            id: body.categoryId,
            restaurantId,
          },
        });

      if (!category || !category.isActive) {
        return NextResponse.json(
          {
            success: false,
            error: "Selected category is not available.",
          },
          { status: 400 }
        );
      }

      data.categoryId = body.categoryId;
    }

    const menuItem = await prisma.menuItem.update({
      where: {
        id,
      },
      data,
      include: {
        category: true,
      },
    });

    return NextResponse.json({
      success: true,
      menuItem,
    });
  } catch (error) {
    console.error("UPDATE MENU ERROR:", error);

    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        {
          success: false,
          error: "You must be logged in.",
        },
        { status: 401 }
      );
    }

    if (error.message === "FORBIDDEN") {
      return NextResponse.json(
        {
          success: false,
          error: "You do not have permission to manage the menu.",
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update menu item.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await requireRole([
      "ADMIN",
      "MANAGER",
    ]);

    const restaurantId = user.restaurantId;

    const { id } = await params;

    // Only find the item if it belongs to the
    // currently logged-in user's restaurant.
    const existingItem = await prisma.menuItem.findFirst({
      where: {
        id,
        restaurantId,
      },
    });

    if (!existingItem) {
      return NextResponse.json(
        {
          success: false,
          error: "Menu item not found.",
        },
        { status: 404 }
      );
    }

    await prisma.menuItem.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Menu item deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE MENU ERROR:", error);

    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        {
          success: false,
          error: "You must be logged in.",
        },
        { status: 401 }
      );
    }

    if (error.message === "FORBIDDEN") {
      return NextResponse.json(
        {
          success: false,
          error: "You do not have permission to manage the menu.",
        },
        { status: 403 }
      );
    }

    // Existing menu items may already be referenced by orders.
    if (error.code === "P2003") {
      return NextResponse.json(
        {
          success: false,
          error:
            "This menu item has already been used in an order and cannot be deleted. Disable it instead.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete menu item.",
      },
      { status: 500 }
    );
  }
}

import { prisma } from "../../../../lib/prisma";
import { NextResponse } from "next/server";
import { requireRole } from "../../../../lib/auth";

async function getInventoryItem(
  tx,
  id,
  restaurantId
) {
  return tx.inventoryItem.findFirst({
    where: {
      id,
      restaurantId,
    },

    include: {
      transactions: {
        orderBy: {
          createdAt: "desc",
        },

        include: {
          recordedBy: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      },
    },
  });
}

export async function PATCH(
  request,
  { params }
) {
  try {
    const user = await requireRole([
      "ADMIN",
      "MANAGER",
    ]);

    const restaurantId = user.restaurantId;

    const { id } = await params;
    const body = await request.json();

    const inventoryItem =
      await prisma.$transaction(async (tx) => {
        /*
         * IMPORTANT:
         * The item must belong to the logged-in
         * restaurant before it can be modified.
         */
        const existingItem =
          await tx.inventoryItem.findFirst({
            where: {
              id,
              restaurantId,
            },
          });

        if (!existingItem) {
          throw new Error("NOT_FOUND");
        }

        const data = {};

        if (body.name !== undefined) {
          if (!body.name?.trim()) {
            throw new Error("INVALID_NAME");
          }

          data.name =
            body.name.trim();
        }

        if (
          body.description !== undefined
        ) {
          data.description =
            body.description?.trim() ||
            null;
        }

        if (body.unit !== undefined) {
          data.unit =
            body.unit?.trim() || "pcs";
        }

        if (
          body.minimumStock !== undefined
        ) {
          const minimum =
            Number(body.minimumStock);

          if (
            !Number.isFinite(minimum) ||
            minimum < 0
          ) {
            throw new Error(
              "INVALID_MINIMUM_STOCK"
            );
          }

          data.minimumStock = minimum;
        }

        /*
         * Direct stock editing is supported
         * for ADMIN/MANAGER.
         *
         * A transaction is automatically
         * recorded for the difference.
         */
        if (
          body.currentStock !== undefined
        ) {
          const newStock =
            Number(body.currentStock);

          if (
            !Number.isFinite(newStock) ||
            newStock < 0
          ) {
            throw new Error(
              "INVALID_STOCK"
            );
          }

          const oldStock =
            Number(
              existingItem.currentStock
            );

          const difference =
            newStock - oldStock;

          data.currentStock = newStock;

          if (difference !== 0) {
            await tx.inventoryTransaction.create(
              {
                data: {
                  inventoryId: id,
                  recordedById: user.id,

                  type:
                    difference > 0
                      ? "STOCK_IN"
                      : "STOCK_OUT",

                  quantity:
                    Math.abs(difference),

                  reason:
                    body.stockReason?.trim() ||
                    "Stock updated manually",
                },
              }
            );
          }
        }

        await tx.inventoryItem.update({
          where: {
            id,
          },

          data,
        });

        return getInventoryItem(
          tx,
          id,
          restaurantId
        );
      });

    return NextResponse.json({
      success: true,
      inventoryItem,
    });
  } catch (error) {
    console.error(
      "UPDATE INVENTORY ERROR:",
      error
    );

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
          error:
            "You do not have permission to update inventory.",
        },
        { status: 403 }
      );
    }

    if (error.message === "NOT_FOUND") {
      return NextResponse.json(
        {
          success: false,
          error:
            "Inventory item not found.",
        },
        { status: 404 }
      );
    }

    if (
      error.message === "INVALID_NAME"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Item name cannot be empty.",
        },
        { status: 400 }
      );
    }

    if (
      error.message ===
      "INVALID_MINIMUM_STOCK"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Minimum stock must be a valid number greater than or equal to 0.",
        },
        { status: 400 }
      );
    }

    if (
      error.message === "INVALID_STOCK"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Stock must be a valid number greater than or equal to 0.",
        },
        { status: 400 }
      );
    }

    if (error.code === "P2002") {
      return NextResponse.json(
        {
          success: false,
          error:
            "An inventory item with this name already exists.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error:
          "Failed to update inventory item.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request,
  { params }
) {
  try {
    const user = await requireRole([
      "ADMIN",
      "MANAGER",
    ]);

    const restaurantId = user.restaurantId;

    const { id } = await params;

    /*
     * Only find an item if it belongs
     * to the logged-in restaurant.
     */
    const existingItem =
      await prisma.inventoryItem.findFirst({
        where: {
          id,
          restaurantId,
        },
      });

    if (!existingItem) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Inventory item not found.",
        },
        { status: 404 }
      );
    }

    /*
     * Delete only after ownership has
     * been verified.
     */
    await prisma.inventoryItem.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
      message:
        "Inventory item deleted successfully.",
    });
  } catch (error) {
    console.error(
      "DELETE INVENTORY ERROR:",
      error
    );

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
          error:
            "You do not have permission to delete inventory items.",
        },
        { status: 403 }
      );
    }

    if (error.code === "P2025") {
      return NextResponse.json(
        {
          success: false,
          error:
            "Inventory item not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error:
          "Failed to delete inventory item.",
      },
      { status: 500 }
    );
  }
}


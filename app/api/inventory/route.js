import { prisma } from "../../../lib/prisma";
import { NextResponse } from "next/server";
import { requireRole } from "../../../lib/auth";

export async function GET() {
  try {
    const user = await requireRole(["ADMIN", "MANAGER"]);

    const restaurantId = user.restaurantId;

    const inventory = await prisma.inventoryItem.findMany({
      where: {
        restaurantId,
      },

      orderBy: {
        createdAt: "desc",
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

    return NextResponse.json({
      success: true,
      inventory,
    });
  } catch (error) {
    console.error("GET INVENTORY ERROR:", error);

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
            "You do not have permission to view inventory.",
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to load inventory.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const user = await requireRole(["ADMIN", "MANAGER"]);

    const restaurantId = user.restaurantId;

    const body = await request.json();

    const {
      name,
      description,
      currentStock,
      unit,
      minimumStock,
    } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Item name is required.",
        },
        { status: 400 }
      );
    }

    if (
      currentStock === undefined ||
      currentStock === ""
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Current stock is required.",
        },
        { status: 400 }
      );
    }

    const stock = Number(currentStock);
    const minimum = Number(minimumStock || 0);

    if (!Number.isFinite(stock) || stock < 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Current stock must be a valid number greater than or equal to 0.",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isFinite(minimum) ||
      minimum < 0
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

    const inventoryItem =
      await prisma.$transaction(async (tx) => {
        const item =
          await tx.inventoryItem.create({
            data: {
              restaurantId,

              name: name.trim(),

              description:
                description?.trim() || null,

              currentStock: stock,

              unit:
                unit?.trim() || "pcs",

              minimumStock: minimum,
            },
          });

        /*
         * Record initial stock as a transaction.
         */
        if (stock > 0) {
          await tx.inventoryTransaction.create({
            data: {
              inventoryId: item.id,
              recordedById: user.id,
              type: "STOCK_IN",
              quantity: stock,
              reason: "Initial stock",
            },
          });
        }

        return tx.inventoryItem.findFirst({
          where: {
            id: item.id,
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
      });

    return NextResponse.json(
      {
        success: true,
        inventoryItem,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "CREATE INVENTORY ERROR:",
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
            "You do not have permission to create inventory items.",
        },
        { status: 403 }
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
          "Failed to create inventory item.",
      },
      { status: 500 }
    );
  }
}


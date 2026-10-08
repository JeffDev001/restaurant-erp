import { prisma } from "../../../lib/prisma";
import { NextResponse } from "next/server";
import { requireRole } from "../../../lib/auth";

export async function GET() {
  try {
    const user = await requireRole(["ADMIN", "MANAGER", "STAFF"]);

    const restaurantId = user.restaurantId;

    if (!restaurantId) {
      return NextResponse.json(
        {
          success: false,
          error: "Your account is not linked to a restaurant.",
        },
        { status: 403 }
      );
    }

    const [
      revenueResult,
      totalOrders,
      pendingOrders,
      menuItems,
      staff,
      recentOrders,
      inventory,
    ] = await Promise.all([
      // Total revenue:
      // Only PAID sales belonging to COMPLETED orders
      // are counted as revenue.
      prisma.sale.aggregate({
        _sum: {
          amount: true,
        },
        where: {
          paymentStatus: "PAID",
          order: {
            restaurantId,
            status: "COMPLETED",
          },
        },
      }),

      // Completed orders for this restaurant
      prisma.order.count({
        where: {
          restaurantId,
          status: "COMPLETED",
        },
      }),

      // Orders that still need attention
      prisma.order.count({
        where: {
          restaurantId,
          status: {
            in: ["PENDING", "PREPARING", "READY"],
          },
        },
      }),

      // Available menu items for this restaurant
      prisma.menuItem.count({
        where: {
          restaurantId,
          isAvailable: true,
        },
      }),

      // Active staff for this restaurant
      prisma.staff.count({
        where: {
          restaurantId,
          status: "ACTIVE",
        },
      }),

      // Recent completed orders for this restaurant
      prisma.order.findMany({
        where: {
          restaurantId,
          status: "COMPLETED",
        },

        orderBy: {
          createdAt: "desc",
        },

        take: 5,

        include: {
          items: {
            include: {
              menuItem: true,
            },
          },

          sale: true,
        },
      }),

      // Inventory for this restaurant
      prisma.inventoryItem.findMany({
        where: {
          restaurantId,
        },

        orderBy: {
          currentStock: "asc",
        },
      }),
    ]);

    const totalRevenue = Number(
      revenueResult._sum.amount || 0
    );

    // Low stock items
    const lowStock = inventory.filter(
      (item) =>
        Number(item.currentStock) > 0 &&
        Number(item.currentStock) <= Number(item.minimumStock)
    );

    // Out of stock items
    const outOfStock = inventory.filter(
      (item) => Number(item.currentStock) <= 0
    );

    return NextResponse.json({
      success: true,

      stats: {
        totalRevenue,
        totalOrders,
        pendingOrders,
        menuItems,
        staff,
      },

      recentOrders,

      inventory: {
        total: inventory.length,
        lowStock: lowStock.length,
        outOfStock: outOfStock.length,
        items: inventory,
      },
    });
  } catch (error) {
    console.error("DASHBOARD ERROR:", error);

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
          error: "You do not have permission to view the dashboard.",
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to load dashboard data",
      },
      { status: 500 }
    );
  }
}


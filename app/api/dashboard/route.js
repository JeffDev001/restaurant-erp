import { prisma } from "../../../lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [
      revenueResult,
      totalOrders,
      menuItems,
      staff,
      recentOrders,
      inventory,
    ] = await Promise.all([
      prisma.sale.aggregate({
        _sum: {
          amount: true,
        },
      }),

      prisma.order.count({
        where: {
          status: "COMPLETED",
        },
      }),

      prisma.menuItem.count(),

      prisma.staff.count({
        where: {
          status: "ACTIVE",
        },
      }),

      prisma.order.findMany({
        where: {
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

      prisma.inventory.findMany({
        orderBy: {
          quantity: "asc",
        },
      }),
    ]);

    const totalRevenue = Number(
      revenueResult._sum.amount || 0
    );

    const lowStock = inventory.filter(
      (item) =>
        item.quantity > 0 &&
        item.quantity <= item.minimumStock
    );

    const outOfStock = inventory.filter(
      (item) => item.quantity <= 0
    );

    return NextResponse.json({
      success: true,

      stats: {
        totalRevenue,
        totalOrders,
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

    return NextResponse.json(
      {
        success: false,
        error: "Failed to load dashboard data",
      },
      { status: 500 }
    );
  }
}
import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { requireRole } from "../../../lib/auth";

export async function GET(request) {
  try {
    const user = await requireRole(["ADMIN", "MANAGER"]);

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

    const { searchParams } = new URL(request.url);

    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const where = {
      paymentStatus: "PAID",

      // IMPORTANT:
      // Sale does not have restaurantId directly.
      // Tenant isolation is enforced through the related Order.
      order: {
        restaurantId,
        status: "COMPLETED",
      },
    };

    if (startDate || endDate) {
      where.createdAt = {};

      if (startDate) {
        const start = new Date(`${startDate}T00:00:00`);

        if (!Number.isNaN(start.getTime())) {
          where.createdAt.gte = start;
        }
      }

      if (endDate) {
        const end = new Date(`${endDate}T23:59:59.999`);

        if (!Number.isNaN(end.getTime())) {
          where.createdAt.lte = end;
        }
      }
    }

    const sales = await prisma.sale.findMany({
      where,

      orderBy: {
        createdAt: "desc",
      },

      include: {
        order: {
          include: {
            customer: {
              select: {
                id: true,
                name: true,
                phone: true,
                email: true,
              },
            },

            createdBy: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },

            items: {
              include: {
                menuItem: {
                  select: {
                    id: true,
                    name: true,
                    price: true,
                    category: {
                      select: {
                        id: true,
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    const formattedSales = sales.map((sale) => ({
      ...sale,

      amount: Number(sale.amount),

      order: {
        ...sale.order,

        subtotal: Number(sale.order.subtotal),
        total: Number(sale.order.total),

        items: sale.order.items.map((item) => ({
          ...item,
          unitPrice: Number(item.unitPrice),
          subtotal: Number(item.subtotal),
        })),
      },
    }));

    const totalRevenue = sales.reduce(
      (sum, sale) => sum + Number(sale.amount),
      0
    );

    const transactionCount = sales.length;

    const averageTransaction =
      transactionCount > 0
        ? totalRevenue / transactionCount
        : 0;

    const paymentBreakdown = {
      CASH: 0,
      MOBILE_MONEY: 0,
      CARD: 0,
    };

    sales.forEach((sale) => {
      if (paymentBreakdown[sale.paymentMethod] !== undefined) {
        paymentBreakdown[sale.paymentMethod] += Number(
          sale.amount
        );
      }
    });

    const dailySalesMap = {};

    sales.forEach((sale) => {
      const date = new Date(sale.createdAt)
        .toISOString()
        .slice(0, 10);

      if (!dailySalesMap[date]) {
        dailySalesMap[date] = {
          date,
          revenue: 0,
          transactions: 0,
        };
      }

      dailySalesMap[date].revenue += Number(sale.amount);
      dailySalesMap[date].transactions += 1;
    });

    const dailySales = Object.values(dailySalesMap).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    const menuItemMap = {};

    sales.forEach((sale) => {
      sale.order.items.forEach((item) => {
        const id = item.menuItem.id;

        if (!menuItemMap[id]) {
          menuItemMap[id] = {
            id,
            name: item.menuItem.name,
            category:
              item.menuItem.category?.name || "Uncategorized",
            quantity: 0,
            revenue: 0,
          };
        }

        menuItemMap[id].quantity += item.quantity;
        menuItemMap[id].revenue += Number(item.subtotal);
      });
    });

    const topItems = Object.values(menuItemMap)
      .sort((a, b) => {
        if (b.quantity !== a.quantity) {
          return b.quantity - a.quantity;
        }

        return b.revenue - a.revenue;
      })
      .slice(0, 10);

    return NextResponse.json({
      success: true,
      sales: formattedSales,

      summary: {
        totalRevenue,
        transactionCount,
        averageTransaction,
        paymentBreakdown,
      },

      dailySales,
      topItems,
    });
  } catch (error) {
    console.error("GET SALES ERROR:", error);

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
          error: "You do not have permission to view sales.",
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to load sales.",
      },
      { status: 500 }
    );
  }
}


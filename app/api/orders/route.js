import { prisma } from "../../../lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
        sale: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("GET ORDERS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to load orders",
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    const { items, paymentMethod = "CASH" } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        {
          error: "Order must contain at least one item",
        },
        { status: 400 }
      );
    }

    // Get menu items from database
    const menuItemIds = items.map((item) => item.menuItemId);

    const menuItems = await prisma.menuItem.findMany({
      where: {
        id: {
          in: menuItemIds,
        },
        available: true,
      },
    });

    if (menuItems.length !== items.length) {
      return NextResponse.json(
        {
          error: "One or more menu items are unavailable",
        },
        { status: 400 }
      );
    }

    // Calculate total securely from database prices
    let total = 0;

    const orderItems = items.map((item) => {
      const menuItem = menuItems.find(
        (menu) => menu.id === item.menuItemId
      );

      const quantity = Number(item.quantity);

      total += Number(menuItem.price) * quantity;

      return {
        menuItemId: menuItem.id,
        quantity,
        price: menuItem.price,
      };
    });

    // TEMPORARY: Use first user until authentication is added
    let user = await prisma.user.findFirst({
      where: {
        role: "ADMIN",
      },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: "Administrator",
          email: "admin@restaurant.com",
          password: "temporary-password",
          role: "ADMIN",
        },
      });
    }

    // Create order and sale
    const order = await prisma.order.create({
      data: {
        total,
        status: "COMPLETED",
        userId: user.id,

        items: {
          create: orderItems,
        },

        sale: {
          create: {
            amount: total,
            paymentMethod,
          },
        },
      },

      include: {
        items: {
          include: {
            menuItem: true,
          },
        },

        sale: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        order,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE ORDER ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create order",
      },
      { status: 500 }
    );
  }
}
import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { requireRole } from "../../../../lib/auth";

const VALID_STATUSES = [
  "PENDING",
  "PREPARING",
  "READY",
  "COMPLETED",
  "CANCELLED",
];

export async function GET(request, { params }) {
  try {
    const user = await requireRole([
      "ADMIN",
      "MANAGER",
      "STAFF",
    ]);

    const restaurantId = user.restaurantId;

    const { id } = await params;

    const order = await prisma.order.findFirst({
      where: {
        id,
        restaurantId,
      },

      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },

        customer: true,

        items: {
          include: {
            menuItem: {
              include: {
                category: true,
              },
            },
          },
        },

        sale: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          error: "Order not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("GET ORDER ERROR:", error);

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
            "You do not have permission to view orders.",
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to load order.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const user = await requireRole([
      "ADMIN",
      "MANAGER",
      "STAFF",
    ]);

    const restaurantId = user.restaurantId;

    const { id } = await params;
    const body = await request.json();

    const { status } = body;

    if (
      !status ||
      !VALID_STATUSES.includes(status)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid order status.",
        },
        { status: 400 }
      );
    }

    /*
     * Only retrieve an order belonging to
     * the logged-in restaurant.
     */

    const existingOrder =
      await prisma.order.findFirst({
        where: {
          id,
          restaurantId,
        },
      });

    if (!existingOrder) {
      return NextResponse.json(
        {
          success: false,
          error: "Order not found.",
        },
        { status: 404 }
      );
    }

    /*
     * Do not allow changes to completed
     * or cancelled orders.
     */

    if (
      existingOrder.status === "COMPLETED" ||
      existingOrder.status === "CANCELLED"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: `This order is already ${existingOrder.status.toLowerCase()} and cannot be changed.`,
        },
        { status: 400 }
      );
    }

    /*
     * Staff follow the normal order workflow.
     */

    if (user.role === "STAFF") {
      const allowedTransitions = {
        PENDING: [
          "PREPARING",
          "CANCELLED",
        ],

        PREPARING: [
          "READY",
          "CANCELLED",
        ],

        READY: [
          "COMPLETED",
          "CANCELLED",
        ],
      };

      const allowedNextStatuses =
        allowedTransitions[
          existingOrder.status
        ];

      if (
        !allowedNextStatuses?.includes(status)
      ) {
        return NextResponse.json(
          {
            success: false,
            error: `Staff cannot change this order from ${existingOrder.status} to ${status}.`,
          },
          { status: 403 }
        );
      }
    }

    const order =
      await prisma.order.update({
        where: {
          id,
        },

        data: {
          status,
        },

        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },

          customer: true,

          items: {
            include: {
              menuItem: {
                include: {
                  category: true,
                },
              },
            },
          },

          sale: true,
        },
      });

    return NextResponse.json({
      success: true,
      message:
        `Order status updated to ${status}.`,
      order,
    });
  } catch (error) {
    console.error(
      "UPDATE ORDER ERROR:",
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
            "You do not have permission to update orders.",
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error:
          "Failed to update order.",
      },
      { status: 500 }
    );
  }
}


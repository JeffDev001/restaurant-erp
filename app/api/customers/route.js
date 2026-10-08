import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { requireRole } from "../../../lib/auth";

export async function GET(request) {
  try {
    const user = await requireRole([
      "ADMIN",
      "MANAGER",
      "STAFF",
    ]);

    const restaurantId = user.restaurantId;

    const { searchParams } = new URL(request.url);
    const search =
      searchParams.get("search")?.trim() || "";

    const customers =
      await prisma.customer.findMany({
        where: {
          restaurantId,
          isActive: true,

          ...(search
            ? {
                OR: [
                  {
                    name: {
                      contains: search,
                      mode: "insensitive",
                    },
                  },
                  {
                    phone: {
                      contains: search,
                    },
                  },
                  {
                    email: {
                      contains: search,
                      mode: "insensitive",
                    },
                  },
                ],
              }
            : {}),
        },

        orderBy: {
          createdAt: "desc",
        },

        include: {
          _count: {
            select: {
              orders: true,
            },
          },

          orders: {
            select: {
              id: true,
              orderNumber: true,
              total: true,
              status: true,
              createdAt: true,

              // Pickup / Delivery information
              orderType: true,
              deliveryAddress: true,

              sale: {
                select: {
                  paymentStatus: true,
                  paymentMethod: true,
                  transactionRef: true,
                  paidAt: true,
                },
              },
            },

            orderBy: {
              createdAt: "desc",
            },
          },
        },
      });

    const formattedCustomers =
      customers.map((customer) => {
        /*
         * Count customer spending from paid orders.
         *
         * Cancelled orders are excluded.
         */
        const paidOrders =
          customer.orders.filter(
            (order) =>
              order.sale?.paymentStatus ===
                "PAID" &&
              order.status !== "CANCELLED"
          );

        const totalSpent =
          paidOrders.reduce(
            (sum, order) => {
              return (
                sum + Number(order.total)
              );
            },
            0
          );

        const lastOrder =
          customer.orders.length > 0
            ? customer.orders[0]
            : null;

        /*
         * Find the customer's most recent
         * delivery address.
         */
        const latestDeliveryOrder =
          customer.orders.find(
            (order) =>
              order.orderType ===
                "DELIVERY" &&
              order.deliveryAddress?.trim()
          );

        const customerAddress =
          customer.address?.trim() ||
          latestDeliveryOrder?.deliveryAddress?.trim() ||
          null;

        return {
          id: customer.id,
          name: customer.name,
          phone: customer.phone,
          email: customer.email,

          address: customerAddress,

          isActive: customer.isActive,
          createdAt: customer.createdAt,
          updatedAt: customer.updatedAt,

          // Customer statistics
          orderCount:
            customer._count.orders,
          totalSpent,

          // Most recent order
          lastOrderDate:
            lastOrder?.createdAt || null,

          // Full order history
          orders: customer.orders,
        };
      });

    return NextResponse.json({
      success: true,
      customers: formattedCustomers,
    });
  } catch (error) {
    console.error(
      "GET CUSTOMERS ERROR:",
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
            "You do not have permission to view customers.",
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to load customers.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const user = await requireRole([
      "ADMIN",
      "MANAGER",
      "STAFF",
    ]);

    const restaurantId = user.restaurantId;

    const body = await request.json();

    const {
      name,
      phone,
      email,
      address,
    } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Customer name is required.",
        },
        { status: 400 }
      );
    }

    if (!phone?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Customer phone number is required.",
        },
        { status: 400 }
      );
    }

    const cleanPhone =
      phone.trim();

    /*
     * Customer phone numbers are unique
     * within each restaurant.
     */

    const existingCustomer =
      await prisma.customer.findUnique({
        where: {
          restaurantId_phone: {
            restaurantId,
            phone: cleanPhone,
          },
        },
      });

    if (existingCustomer) {
      return NextResponse.json(
        {
          success: false,
          error:
            "A customer with this phone number already exists.",
          customer: existingCustomer,
        },
        { status: 409 }
      );
    }

    const customer =
      await prisma.customer.create({
        data: {
          restaurantId,

          name: name.trim(),

          phone: cleanPhone,

          email:
            email?.trim() || null,

          address:
            address?.trim() || null,
        },
      });

    return NextResponse.json(
      {
        success: true,
        customer,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "CREATE CUSTOMER ERROR:",
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
            "You do not have permission to create customers.",
        },
        { status: 403 }
      );
    }

    if (error.code === "P2002") {
      return NextResponse.json(
        {
          success: false,
          error:
            "A customer with this phone number already exists.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create customer.",
      },
      { status: 500 }
    );
  }
}


import { prisma } from "../../../lib/prisma";
import { NextResponse } from "next/server";
import { requireAuth, requireRole } from "../../../lib/auth";

const VALID_PAYMENT_METHODS = [
  "CASH",
  "CARD",
  "MOBILE_MONEY",
];

const VALID_ORDER_TYPES = [
  "PICKUP",
  "DELIVERY",
];

function generateOrderNumber() {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  const random = Math.floor(1000 + Math.random() * 9000);

  return `ORD-${year}${month}${day}-${random}`;
}

function generateTransactionRef() {
  const random = Math.floor(
    100000 + Math.random() * 900000
  );

  return `TXN-${Date.now()}-${random}`;
}

export async function GET() {
  try {
    const user = await requireRole([
      "ADMIN",
      "MANAGER",
      "STAFF",
    ]);

    const restaurantId = user.restaurantId;

    const orders = await prisma.order.findMany({
      where: {
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
        error: "Failed to load orders.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const user = await requireAuth();

    const restaurantId = user.restaurantId;

    const body = await request.json();

    const {
      items,
      customerName,
      customerPhone,
      customerEmail,
      notes,
      paymentMethod = "CASH",
      orderType = "PICKUP",
      deliveryAddress,
    } = body;

    /*
     * CUSTOMER VALIDATION
     */

    if (!customerName?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Customer name is required.",
        },
        { status: 400 }
      );
    }

    if (!customerPhone?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Customer phone number is required.",
        },
        { status: 400 }
      );
    }

    /*
     * ORDER TYPE VALIDATION
     */

    if (!VALID_ORDER_TYPES.includes(orderType)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid order type.",
        },
        { status: 400 }
      );
    }

    /*
     * DELIVERY ADDRESS VALIDATION
     */

    if (
      orderType === "DELIVERY" &&
      !deliveryAddress?.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Delivery address is required for delivery orders.",
        },
        { status: 400 }
      );
    }

    /*
     * ORDER ITEMS VALIDATION
     */

    if (
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Order must contain at least one item.",
        },
        { status: 400 }
      );
    }

    /*
     * PAYMENT VALIDATION
     */

    if (
      !VALID_PAYMENT_METHODS.includes(
        paymentMethod
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid payment method.",
        },
        { status: 400 }
      );
    }

    /*
     * VALIDATE EACH ITEM
     */

    for (const item of items) {
      if (!item.menuItemId) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Every order item must have a menu item.",
          },
          { status: 400 }
        );
      }

      const quantity = Number(item.quantity);

      if (
        !Number.isInteger(quantity) ||
        quantity <= 0
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Item quantities must be positive whole numbers.",
          },
          { status: 400 }
        );
      }
    }

    /*
     * COMBINE DUPLICATE MENU ITEMS
     */

    const itemMap = new Map();

    for (const item of items) {
      const quantity = Number(item.quantity);

      if (itemMap.has(item.menuItemId)) {
        itemMap.set(
          item.menuItemId,
          itemMap.get(item.menuItemId) + quantity
        );
      } else {
        itemMap.set(
          item.menuItemId,
          quantity
        );
      }
    }

    const normalizedItems =
      Array.from(itemMap.entries()).map(
        ([menuItemId, quantity]) => ({
          menuItemId,
          quantity,
        })
      );

    const menuItemIds =
      normalizedItems.map(
        (item) => item.menuItemId
      );

    /*
     * GET MENU ITEMS
     *
     * IMPORTANT:
     * Only menu items belonging to the
     * logged-in restaurant can be ordered.
     */

    const menuItems =
      await prisma.menuItem.findMany({
        where: {
          id: {
            in: menuItemIds,
          },

          restaurantId,

          isAvailable: true,
        },

        include: {
          category: true,
        },
      });

    if (
      menuItems.length !==
      menuItemIds.length
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "One or more selected menu items are unavailable.",
        },
        { status: 400 }
      );
    }

    /*
     * CALCULATE ORDER TOTAL
     */

    let subtotal = 0;

    const orderItems =
      normalizedItems.map((item) => {
        const menuItem =
          menuItems.find(
            (menu) =>
              menu.id === item.menuItemId
          );

        const unitPrice =
          Number(menuItem.price);

        const itemSubtotal =
          unitPrice * item.quantity;

        subtotal += itemSubtotal;

        return {
          menuItemId: menuItem.id,
          quantity: item.quantity,
          unitPrice,
          subtotal: itemSubtotal,
        };
      });

    const total = subtotal;

    /*
     * GENERATE UNIQUE ORDER NUMBER
     */

    let orderNumber;
    let existingOrder;

    do {
      orderNumber =
        generateOrderNumber();

      existingOrder =
        await prisma.order.findUnique({
          where: {
            orderNumber,
          },
        });
    } while (existingOrder);

    /*
     * CREATE CUSTOMER + ORDER
     * IN ONE TRANSACTION
     */

    const order =
      await prisma.$transaction(
        async (transaction) => {
          /*
           * IMPORTANT:
           * Customer phone is unique per restaurant,
           * not globally.
           */

          let customer =
            await transaction.customer.findUnique({
              where: {
                restaurantId_phone: {
                  restaurantId,
                  phone: customerPhone.trim(),
                },
              },
            });

          /*
           * CREATE CUSTOMER
           */

          if (!customer) {
            customer =
              await transaction.customer.create({
                data: {
                  restaurantId,

                  name:
                    customerName.trim(),

                  phone:
                    customerPhone.trim(),

                  email:
                    customerEmail?.trim() ||
                    null,
                },
              });
          }

          /*
           * UPDATE EXISTING CUSTOMER
           */

          else {
            const customerUpdate = {
              name: customerName.trim(),
              isActive: true,
            };

            if (
              customerEmail?.trim()
            ) {
              customerUpdate.email =
                customerEmail.trim();
            }

            customer =
              await transaction.customer.update({
                where: {
                  id: customer.id,
                },

                data: customerUpdate,
              });
          }

          /*
           * CREATE ORDER
           */

          const createdOrder =
            await transaction.order.create({
              data: {
                restaurantId,

                orderNumber,

                createdById:
                  user.id,

                customerId:
                  customer.id,

                customerName:
                  customerName.trim(),

                customerPhone:
                  customerPhone.trim(),

                status: "PENDING",

                orderType,

                deliveryAddress:
                  orderType === "DELIVERY"
                    ? deliveryAddress.trim()
                    : null,

                notes:
                  notes?.trim() || null,

                subtotal,

                total,

                items: {
                  create: orderItems,
                },

                sale: {
                  create: {
                    amount: total,

                    paymentMethod,

                    paymentStatus:
                      "PAID",

                    transactionRef:
                      generateTransactionRef(),

                    paidAt:
                      new Date(),
                  },
                },
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

          return createdOrder;
        }
      );

    return NextResponse.json(
      {
        success: true,
        message:
          "Order created successfully.",
        order,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "CREATE ORDER ERROR:",
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

    return NextResponse.json(
      {
        success: false,
        error:
          "Failed to create order.",
      },
      { status: 500 }
    );
  }
}


import { prisma } from "../../../lib/prisma";
import { NextResponse } from "next/server";
import { requireRole } from "../../../lib/auth";

export async function GET() {
  try {
    const user = await requireRole([
      "ADMIN",
      "MANAGER",
      "STAFF",
    ]);

    const restaurantId = user.restaurantId;

    let menuItems;

    if (user.role === "STAFF") {
      menuItems = await prisma.menuItem.findMany({
        where: {
          restaurantId,
          isAvailable: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          category: true,
        },
      });
    } else {
      menuItems = await prisma.menuItem.findMany({
        where: {
          restaurantId,
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          category: true,
        },
      });
    }

    const categories = await prisma.category.findMany({
      where: {
        restaurantId,
        isActive: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    console.log("CURRENT RESTAURANT:", restaurantId);
    console.log("CATEGORIES:", categories);

    return NextResponse.json({
      success: true,
      menuItems,
      categories,
    });
  } catch (error) {
    console.error("GET MENU ERROR:", error);

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
        error: "Failed to load menu items.",
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
    ]);

    const restaurantId = user.restaurantId;

    const body = await request.json();

    const {
      name,
      description,
      categoryId,
      categoryName,
      price,
      isAvailable,
    } = body;

    if (!name?.trim() || price === undefined || price === "") {
      return NextResponse.json(
        {
          success: false,
          error: "Name and price are required.",
        },
        { status: 400 }
      );
    }

    const numericPrice = Number(price);

    if (Number.isNaN(numericPrice) || numericPrice < 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Price must be a valid positive number.",
        },
        { status: 400 }
      );
    }

    let finalCategoryId = categoryId;

    // Allow the UI to create a category by name if needed.
    // The category is always created inside the logged-in
    // user's restaurant.
    if (!finalCategoryId && categoryName?.trim()) {
      const category = await prisma.category.upsert({
        where: {
          restaurantId_name: {
            restaurantId,
            name: categoryName.trim(),
          },
        },
        update: {
          isActive: true,
        },
        create: {
          restaurantId,
          name: categoryName.trim(),
          isActive: true,
        },
      });

      finalCategoryId = category.id;
    }

    if (!finalCategoryId) {
      return NextResponse.json(
        {
          success: false,
          error: "Please select or enter a category.",
        },
        { status: 400 }
      );
    }

    // Make sure the selected category belongs to
    // the logged-in user's restaurant.
    const category = await prisma.category.findFirst({
      where: {
        id: finalCategoryId,
        restaurantId,
      },
    });

    if (!category || !category.isActive) {
      return NextResponse.json(
        {
          success: false,
          error: "The selected category is not available.",
        },
        { status: 400 }
      );
    }

    const menuItem = await prisma.menuItem.create({
      data: {
        restaurantId,
        name: name.trim(),
        description: description?.trim() || null,
        categoryId: finalCategoryId,
        price: numericPrice,
        isAvailable: isAvailable ?? true,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        menuItem,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE MENU ERROR:", error);

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
        error: "Failed to create menu item.",
      },
      { status: 500 }
    );
  }
}

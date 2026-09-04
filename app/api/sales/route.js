import { prisma } from "../../../lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const sales = await prisma.sale.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        order: {
          include: {
            items: {
              include: {
                menuItem: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      sales,
    });
  } catch (error) {
    console.error("GET SALES ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to load sales",
      },
      { status: 500 }
    );
  }
}
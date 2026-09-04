import { prisma } from "../../../../lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const staff = await prisma.staff.update({
      where: {
        id,
      },
      data: {
        ...(body.name !== undefined && {
          name: body.name,
        }),

        ...(body.email !== undefined && {
          email: body.email,
        }),

        ...(body.phone !== undefined && {
          phone: body.phone || null,
        }),

        ...(body.role !== undefined && {
          role: body.role,
        }),

        ...(body.status !== undefined && {
          status: body.status,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      staff,
    });
  } catch (error) {
    console.error("UPDATE STAFF ERROR:", error);

    if (error.code === "P2002") {
      return NextResponse.json(
        {
          error: "That name or email is already in use.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update staff member",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    await prisma.staff.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Staff member deleted successfully",
    });
  } catch (error) {
    console.error("DELETE STAFF ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete staff member",
      },
      { status: 500 }
    );
  }
}
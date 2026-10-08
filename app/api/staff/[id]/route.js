import { prisma } from "../../../../lib/prisma";
import {
  hashPassword,
  requireRole,
} from "../../../../lib/auth";
import { NextResponse } from "next/server";

export async function PATCH(
  request,
  { params }
) {
  try {
    const currentUser =
      await requireRole(["ADMIN"]);

    const restaurantId =
      currentUser.restaurantId;

    const { id } =
      await params;

    const body =
      await request.json();

    /*
     * Only retrieve staff belonging
     * to the current restaurant.
     */
    const existingStaff =
      await prisma.staff.findFirst({
        where: {
          id,
          restaurantId,
        },

        include: {
          user: true,
        },
      });

    if (!existingStaff) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Staff member not found.",
        },
        { status: 404 }
      );
    }

    const {
      firstName,
      lastName,
      email,
      phone,
      role,
      position,
      status,
      password,
    } = body;

    const userUpdate = {};

    if (
      firstName !== undefined ||
      lastName !== undefined
    ) {
      const updatedFirstName =
        firstName !== undefined
          ? firstName.trim()
          : existingStaff.firstName;

      const updatedLastName =
        lastName !== undefined
          ? lastName.trim()
          : existingStaff.lastName;

      if (!updatedFirstName) {
        return NextResponse.json(
          {
            success: false,
            error:
              "First name cannot be empty.",
          },
          { status: 400 }
        );
      }

      if (!updatedLastName) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Last name cannot be empty.",
          },
          { status: 400 }
        );
      }

      userUpdate.name =
        `${updatedFirstName} ${updatedLastName}`;
    }

    if (email !== undefined) {
      const normalizedEmail =
        email.trim().toLowerCase();

      if (!normalizedEmail) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Email cannot be empty.",
          },
          { status: 400 }
        );
      }

      const duplicateUser =
        await prisma.user.findFirst({
          where: {
            email: normalizedEmail,

            NOT: {
              id:
                existingStaff.userId ||
                undefined,
            },
          },
        });

      if (duplicateUser) {
        return NextResponse.json(
          {
            success: false,
            error:
              "That email is already in use.",
          },
          { status: 409 }
        );
      }

      userUpdate.email =
        normalizedEmail;
    }

    if (role !== undefined) {
      if (
        !["ADMIN", "MANAGER", "STAFF"].includes(
          role
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Invalid system role.",
          },
          { status: 400 }
        );
      }

      userUpdate.role = role;
    }

    if (status !== undefined) {
      if (
        !["ACTIVE", "INACTIVE"].includes(
          status
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Invalid staff status.",
          },
          { status: 400 }
        );
      }

      userUpdate.isActive =
        status === "ACTIVE";
    }

    if (
      password !== undefined &&
      password !== ""
    ) {
      if (password.length < 6) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Password must be at least 6 characters.",
          },
          { status: 400 }
        );
      }

      userUpdate.password =
        await hashPassword(password);
    }

    const validPositions = [
      "MANAGER",
      "SALESPERSON",
      "CASHIER",
      "KITCHEN_STAFF",
      "WAITER",
      "INVENTORY_STAFF",
    ];

    if (
      position !== undefined &&
      !validPositions.includes(
        position
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid staff position.",
        },
        { status: 400 }
      );
    }

    const staffUpdate = {};

    if (firstName !== undefined) {
      const value =
        firstName.trim();

      if (!value) {
        return NextResponse.json(
          {
            success: false,
            error:
              "First name cannot be empty.",
          },
          { status: 400 }
        );
      }

      staffUpdate.firstName =
        value;
    }

    if (lastName !== undefined) {
      const value =
        lastName.trim();

      if (!value) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Last name cannot be empty.",
          },
          { status: 400 }
        );
      }

      staffUpdate.lastName =
        value;
    }

    if (phone !== undefined) {
      staffUpdate.phone =
        phone?.trim() || null;
    }

    if (position !== undefined) {
      staffUpdate.position =
        position;
    }

    if (status !== undefined) {
      staffUpdate.status =
        status;
    }

    const updatedStaff =
      await prisma.$transaction(
        async (tx) => {
          if (
            Object.keys(userUpdate)
              .length > 0 &&
            existingStaff.userId
          ) {
            await tx.user.update({
              where: {
                id:
                  existingStaff.userId,
              },

              data: userUpdate,
            });
          }

          /*
           * Staff ownership was verified
           * before entering the transaction.
           */
          const updated =
            await tx.staff.update({
              where: {
                id,
              },

              data: staffUpdate,

              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    isActive: true,
                  },
                },
              },
            });

          return updated;
        }
      );

    return NextResponse.json({
      success: true,

      staff: {
        id:
          updatedStaff.id,

        userId:
          updatedStaff.userId,

        firstName:
          updatedStaff.firstName,

        lastName:
          updatedStaff.lastName,

        name:
          `${updatedStaff.firstName} ${updatedStaff.lastName}`,

        email:
          updatedStaff.user?.email ||
          "",

        phone:
          updatedStaff.phone ||
          "",

        role:
          updatedStaff.user?.role ||
          "STAFF",

        position:
          updatedStaff.position,

        status:
          updatedStaff.status,

        isActive:
          updatedStaff.user?.isActive ??
          false,

        createdAt:
          updatedStaff.createdAt,
      },
    });
  } catch (error) {
    console.error(
      "UPDATE STAFF ERROR:",
      error
    );

    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    if (error.message === "FORBIDDEN") {
      return NextResponse.json(
        {
          success: false,
          error:
            "Only administrators can update staff accounts.",
        },
        { status: 403 }
      );
    }

    if (error.code === "P2002") {
      return NextResponse.json(
        {
          success: false,
          error:
            "That email or staff account already exists.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error:
          "Failed to update staff member.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request,
  { params }
) {
  try {
    const currentUser =
      await requireRole(["ADMIN"]);

    const restaurantId =
      currentUser.restaurantId;

    const { id } =
      await params;

    /*
     * Only find staff belonging
     * to the current restaurant.
     */
    const staff =
      await prisma.staff.findFirst({
        where: {
          id,
          restaurantId,
        },

        include: {
          user: true,
        },
      });

    if (!staff) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Staff member not found.",
        },
        { status: 404 }
      );
    }

    /*
     * Prevent an administrator from
     * deleting their own account.
     */
    if (
      staff.userId ===
      currentUser.id
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "You cannot delete your own administrator account.",
        },
        { status: 400 }
      );
    }

    await prisma.$transaction(
      async (tx) => {
        await tx.staff.delete({
          where: {
            id,
          },
        });

        if (staff.userId) {
          await tx.user.delete({
            where: {
              id: staff.userId,
            },
          });
        }
      }
    );

    return NextResponse.json({
      success: true,
      message:
        "Staff member deleted successfully.",
    });
  } catch (error) {
    console.error(
      "DELETE STAFF ERROR:",
      error
    );

    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    if (error.message === "FORBIDDEN") {
      return NextResponse.json(
        {
          success: false,
          error:
            "Only administrators can delete staff accounts.",
        },
        { status: 403 }
      );
    }

    if (error.code === "P2025") {
      return NextResponse.json(
        {
          success: false,
          error:
            "Staff member not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error:
          "Failed to delete staff member.",
      },
      { status: 500 }
    );
  }
}


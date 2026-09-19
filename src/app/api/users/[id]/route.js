import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Expense from "@/models/Expense";


// GET /api/users/:id
// Get one user
export async function GET(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    const user = await User.findById(id).select("-password");

    if (!user) {
      return NextResponse.json(
        {
          message: "User not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(user, {
      status: 200,
    });
  } catch (error) {
    console.error("GET /api/users/:id error:", error);

    return NextResponse.json(
      {
        message: "Failed to retrieve user",
      },
      {
        status: 500,
      }
    );
  }
}


// PATCH /api/users/:id
// Update a user
export async function PATCH(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;
    const body = await request.json();

    const { name, email, password } = body;

    const user = await User.findById(id);

    if (!user) {
      return NextResponse.json(
        {
          message: "User not found",
        },
        {
          status: 404,
        }
      );
    }

    // Update only fields that were provided
    if (name !== undefined) {
      user.name = name;
    }

    if (email !== undefined) {
      const normalizedEmail = email.toLowerCase();

      // Check whether another user already uses this email
      const existingUser = await User.findOne({
        email: normalizedEmail,
        _id: { $ne: id },
      });

      if (existingUser) {
        return NextResponse.json(
          {
            message: "Email is already registered",
          },
          {
            status: 409,
          }
        );
      }

      user.email = normalizedEmail;
    }

    if (password !== undefined) {
      user.password = password;
    }

    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;

    return NextResponse.json(userResponse, {
      status: 200,
    });
  } catch (error) {
    console.error("PATCH /api/users/:id error:", error);

    return NextResponse.json(
      {
        message: "Failed to update user",
      },
      {
        status: 500,
      }
    );
  }
}


// DELETE /api/users/:id
// Delete a user
export async function DELETE(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    // Prevent deletion if user has expenses
    const expenseCount = await Expense.countDocuments({
      userId: id,
    });

    if (expenseCount > 0) {
      return NextResponse.json(
        {
          message:
            "Cannot delete user because the user has existing expenses",
        },
        {
          status: 409,
        }
      );
    }

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return NextResponse.json(
        {
          message: "User not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(
      {
        message: "User deleted successfully",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("DELETE /api/users/:id error:", error);

    return NextResponse.json(
      {
        message: "Failed to delete user",
      },
      {
        status: 500,
      }
    );
  }
}
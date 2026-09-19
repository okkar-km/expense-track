import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Expense from "@/models/Expense";
import User from "@/models/User";
import Category from "@/models/Category";
import mongoose from "mongoose";


function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}


// GET /api/expenses/:id
// Get one expense
export async function GET(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    if (!isValidId(id)) {
      return NextResponse.json(
        {
          message: "Invalid expense ID",
        },
        {
          status: 400,
        }
      );
    }

    const expense = await Expense.findById(id)
      .populate("userId", "name email")
      .populate("categoryId", "name");

    if (!expense) {
      return NextResponse.json(
        {
          message: "Expense not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(expense, {
      status: 200,
    });
  } catch (error) {
    console.error("GET /api/expenses/:id error:", error);

    return NextResponse.json(
      {
        message: "Failed to retrieve expense",
      },
      {
        status: 500,
      }
    );
  }
}


// PATCH /api/expenses/:id
// Update an expense
export async function PATCH(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    if (!isValidId(id)) {
      return NextResponse.json(
        {
          message: "Invalid expense ID",
        },
        {
          status: 400,
        }
      );
    }

    const body = await request.json();

    const {
      title,
      amount,
      date,
      description,
      userId,
      categoryId,
    } = body;

    const expense = await Expense.findById(id);

    if (!expense) {
      return NextResponse.json(
        {
          message: "Expense not found",
        },
        {
          status: 404,
        }
      );
    }

    // Update title
    if (title !== undefined) {
      if (title.trim() === "") {
        return NextResponse.json(
          {
            message: "Title cannot be empty",
          },
          {
            status: 400,
          }
        );
      }

      expense.title = title.trim();
    }

    // Update amount
    if (amount !== undefined) {
      const numericAmount = Number(amount);

      if (
        Number.isNaN(numericAmount) ||
        numericAmount < 0
      ) {
        return NextResponse.json(
          {
            message:
              "Amount must be a valid number greater than or equal to 0",
          },
          {
            status: 400,
          }
        );
      }

      expense.amount = numericAmount;
    }

    // Update date
    if (date !== undefined) {
      const expenseDate = new Date(date);

      if (Number.isNaN(expenseDate.getTime())) {
        return NextResponse.json(
          {
            message: "Invalid expense date",
          },
          {
            status: 400,
          }
        );
      }

      expense.date = expenseDate;
    }

    // Update description
    if (description !== undefined) {
      expense.description = description.trim();
    }

    // Update User
    if (userId !== undefined) {
      if (!isValidId(userId)) {
        return NextResponse.json(
          {
            message: "Invalid user ID",
          },
          {
            status: 400,
          }
        );
      }

      const user = await User.findById(userId);

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

      expense.userId = userId;
    }

    // Update Category
    if (categoryId !== undefined) {
      if (!isValidId(categoryId)) {
        return NextResponse.json(
          {
            message: "Invalid category ID",
          },
          {
            status: 400,
          }
        );
      }

      const category = await Category.findById(categoryId);

      if (!category) {
        return NextResponse.json(
          {
            message: "Category not found",
          },
          {
            status: 404,
          }
        );
      }

      expense.categoryId = categoryId;
    }

    await expense.save();

    const updatedExpense = await Expense.findById(id)
      .populate("userId", "name email")
      .populate("categoryId", "name");

    return NextResponse.json(updatedExpense, {
      status: 200,
    });
  } catch (error) {
    console.error("PATCH /api/expenses/:id error:", error);

    return NextResponse.json(
      {
        message: "Failed to update expense",
      },
      {
        status: 500,
      }
    );
  }
}


// DELETE /api/expenses/:id
// Delete an expense
export async function DELETE(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    if (!isValidId(id)) {
      return NextResponse.json(
        {
          message: "Invalid expense ID",
        },
        {
          status: 400,
        }
      );
    }

    const expense = await Expense.findByIdAndDelete(id);

    if (!expense) {
      return NextResponse.json(
        {
          message: "Expense not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(
      {
        message: "Expense deleted successfully",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("DELETE /api/expenses/:id error:", error);

    return NextResponse.json(
      {
        message: "Failed to delete expense",
      },
      {
        status: 500,
      }
    );
  }
}
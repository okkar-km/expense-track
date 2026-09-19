import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Expense from "@/models/Expense";
import User from "@/models/User";
import Category from "@/models/Category";
import mongoose from "mongoose";


function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}


// GET /api/expenses
// Get all expenses
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search");
    const categoryId = searchParams.get("categoryId");
    const userId = searchParams.get("userId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const filter = {};

    // Search by expense title or description
    if (search) {
      filter.$or = [
        {
          title: {
            $regex: search,
            $options: "i",
          },
        },
        {
          description: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    // Filter by category
    if (categoryId) {
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

      filter.categoryId = categoryId;
    }

    // Filter by user
    if (userId) {
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

      filter.userId = userId;
    }

    // Filter by date range
    if (startDate || endDate) {
      filter.date = {};

      if (startDate) {
        filter.date.$gte = new Date(startDate);
      }

      if (endDate) {
        const end = new Date(endDate);

        // Include the entire end date
        end.setHours(23, 59, 59, 999);

        filter.date.$lte = end;
      }
    }

    const expenses = await Expense.find(filter)
      .populate("userId", "name email")
      .populate("categoryId", "name")
      .sort({
        date: -1,
        createdAt: -1,
      });

    return NextResponse.json(expenses, {
      status: 200,
    });
  } catch (error) {
    console.error("GET /api/expenses error:", error);

    return NextResponse.json(
      {
        message: "Failed to retrieve expenses",
      },
      {
        status: 500,
      }
    );
  }
}


// POST /api/expenses
// Create a new expense
export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();

    const {
      title,
      amount,
      date,
      description,
      userId,
      categoryId,
    } = body;

    // Check required fields
    if (
      !title ||
      amount === undefined ||
      !date ||
      !userId ||
      !categoryId
    ) {
      return NextResponse.json(
        {
          message:
            "Title, amount, date, userId, and categoryId are required",
        },
        {
          status: 400,
        }
      );
    }

    // Validate IDs
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

    // Validate amount
    const numericAmount = Number(amount);

    if (
      Number.isNaN(numericAmount) ||
      numericAmount < 0
    ) {
      return NextResponse.json(
        {
          message: "Amount must be a valid number greater than or equal to 0",
        },
        {
          status: 400,
        }
      );
    }

    // Validate date
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

    // Check that the User exists
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

    // Check that the Category exists
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

    // Create expense
    const expense = await Expense.create({
      title: title.trim(),
      amount: numericAmount,
      date: expenseDate,
      description: description?.trim() || "",
      userId,
      categoryId,
    });

    // Return populated expense
    const populatedExpense = await Expense.findById(
      expense._id
    )
      .populate("userId", "name email")
      .populate("categoryId", "name");

    return NextResponse.json(populatedExpense, {
      status: 201,
    });
  } catch (error) {
    console.error("POST /api/expenses error:", error);

    return NextResponse.json(
      {
        message: "Failed to create expense",
      },
      {
        status: 500,
      }
    );
  }
}
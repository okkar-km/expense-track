import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Category from "@/models/Category";
import Expense from "@/models/Expense";
import mongoose from "mongoose";


function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}


// GET /api/categories/:id
// Get one category
export async function GET(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    if (!isValidId(id)) {
      return NextResponse.json(
        {
          message: "Invalid category ID",
        },
        {
          status: 400,
        }
      );
    }

    const category = await Category.findById(id);

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

    return NextResponse.json(category, {
      status: 200,
    });
  } catch (error) {
    console.error("GET /api/categories/:id error:", error);

    return NextResponse.json(
      {
        message: "Failed to retrieve category",
      },
      {
        status: 500,
      }
    );
  }
}


// PATCH /api/categories/:id
// Update a category
export async function PATCH(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    if (!isValidId(id)) {
      return NextResponse.json(
        {
          message: "Invalid category ID",
        },
        {
          status: 400,
        }
      );
    }

    const body = await request.json();

    const { name, description } = body;

    const category = await Category.findById(id);

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

    // Update name if provided
    if (name !== undefined) {
      if (name.trim() === "") {
        return NextResponse.json(
          {
            message: "Category name cannot be empty",
          },
          {
            status: 400,
          }
        );
      }

      const trimmedName = name.trim();

      // Check if another category already uses this name
      const existingCategory = await Category.findOne({
        name: trimmedName,
        _id: { $ne: id },
      });

      if (existingCategory) {
        return NextResponse.json(
          {
            message: "Category already exists",
          },
          {
            status: 409,
          }
        );
      }

      category.name = trimmedName;
    }

    // Update description if provided
    if (description !== undefined) {
      category.description = description.trim();
    }

    await category.save();

    return NextResponse.json(category, {
      status: 200,
    });
  } catch (error) {
    console.error("PATCH /api/categories/:id error:", error);

    return NextResponse.json(
      {
        message: "Failed to update category",
      },
      {
        status: 500,
      }
    );
  }
}


// DELETE /api/categories/:id
// Delete a category
export async function DELETE(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    if (!isValidId(id)) {
      return NextResponse.json(
        {
          message: "Invalid category ID",
        },
        {
          status: 400,
        }
      );
    }

    // Check whether the category is being used
    const expenseCount = await Expense.countDocuments({
      categoryId: id,
    });

    if (expenseCount > 0) {
      return NextResponse.json(
        {
          message:
            "Cannot delete category because it is being used by existing expenses",
        },
        {
          status: 409,
        }
      );
    }

    const category = await Category.findByIdAndDelete(id);

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

    return NextResponse.json(
      {
        message: "Category deleted successfully",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("DELETE /api/categories/:id error:", error);

    return NextResponse.json(
      {
        message: "Failed to delete category",
      },
      {
        status: 500,
      }
    );
  }
}
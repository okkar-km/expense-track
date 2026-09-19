import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Category from "@/models/Category";


// GET /api/categories
// Get all categories
export async function GET() {
  try {
    await connectDB();

    const categories = await Category.find().sort({
      name: 1,
    });

    return NextResponse.json(categories, {
      status: 200,
    });
  } catch (error) {
    console.error("GET /api/categories error:", error);

    return NextResponse.json(
      {
        message: "Failed to retrieve categories",
      },
      {
        status: 500,
      }
    );
  }
}


// POST /api/categories
// Create a new category
export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();

    const { name, description } = body;

    // Check required field
    if (!name || name.trim() === "") {
      return NextResponse.json(
        {
          message: "Category name is required",
        },
        {
          status: 400,
        }
      );
    }

    const trimmedName = name.trim();

    // Check for duplicate category
    const existingCategory = await Category.findOne({
      name: trimmedName,
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

    // Create category
    const category = await Category.create({
      name: trimmedName,
      description: description?.trim() || "",
    });

    return NextResponse.json(category, {
      status: 201,
    });
  } catch (error) {
    console.error("POST /api/categories error:", error);

    return NextResponse.json(
      {
        message: "Failed to create category",
      },
      {
        status: 500,
      }
    );
  }
}
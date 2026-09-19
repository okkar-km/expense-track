import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";


// GET /api/users
// Get all users
export async function GET() {
  try {
    await connectDB();

    const users = await User.find().select("-password");

    return NextResponse.json(users, {
      status: 200,
    });
  } catch (error) {
    console.error("GET /api/users error:", error);

    return NextResponse.json(
      {
        message: "Failed to retrieve users",
      },
      {
        status: 500,
      }
    );
  }
}


// POST /api/users
// Create a new user
export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();

    const { name, email, password } = body;

    // Basic required-field validation
    if (!name || !email || !password) {
      return NextResponse.json(
        {
          message: "Name, email, and password are required",
        },
        {
          status: 400,
        }
      );
    }

    // Check whether email already exists
    const existingUser = await User.findOne({
      email: email.toLowerCase(),
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

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
    });

    // Do not return password to the client
    const userResponse = user.toObject();
    delete userResponse.password;

    return NextResponse.json(userResponse, {
      status: 201,
    });
  } catch (error) {
    console.error("POST /api/users error:", error);

    return NextResponse.json(
      {
        message: "Failed to create user",
      },
      {
        status: 500,
      }
    );
  }
}
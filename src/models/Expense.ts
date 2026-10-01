import mongoose, { Schema, type Model } from "mongoose";
import type { IExpense } from "@/types";

const expenseSchema = new Schema<IExpense>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    date: {
      type: Date,
      required: true,
    },

    description: {
      type: String,
      trim: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Expense: Model<IExpense> =
  (mongoose.models.Expense as Model<IExpense>) ??
  mongoose.model<IExpense>("Expense", expenseSchema);


export default Expense;
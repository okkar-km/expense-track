import type { Types } from "mongoose";

/* server / model side: real ObjectId + Date */

export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICategory {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IExpense {
  _id: Types.ObjectId;
  title: string;
  amount: number;
  date: Date;
  description?: string;
  userId: Types.ObjectId;
  categoryId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

/* client side: JSON turns ObjectId -> string, Date -> ISO */

export interface UserDTO {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryDTO {
  _id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserRefDTO {
  _id: string;
  name: string;
  email: string;
}

export interface CategoryRefDTO {
  _id: string;
  name: string;
}

export interface ExpenseDTO {
  _id: string;
  title: string;
  amount: number;
  date: string;
  description?: string;
  userId: UserRefDTO;
  categoryId: CategoryRefDTO;
  createdAt: string;
  updatedAt: string;
}

export interface IExpenseInput {
  title: string;
  amount: number;
  date: string;
  description?: string;
  userId: string;
  categoryId: string;
}
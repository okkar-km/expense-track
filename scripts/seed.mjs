import mongoose from "mongoose";
import User from "../src/models/User.ts";
import Category from "../src/models/Category.ts";
import Expense from "../src/models/Expense.ts";

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb://127.0.0.1:27017/expense_track";

if (!process.argv.includes("--force")) {
  console.error(
    "This DELETES all users, categories and expenses.\n" +
      "Re-run with: npm run seed"
  );
  process.exit(1);
}

function daysAgo(n) {
  const date = new Date();

  date.setDate(date.getDate() - n);
  date.setHours(12, 0, 0, 0);

  return date;
}

const categoryData = [
  {
    name: "Food & Dining",
    description: "Groceries, restaurants, cafes",
  },
  {
    name: "Transportation",
    description: "Taxi, fuel, transit passes",
  },
  {
    name: "Shopping",
    description: "Clothes, electronics, household",
  },
  {
    name: "Education",
    description: "Books, courses, supplies",
  },
  {
    name: "Entertainment",
    description: "Streaming, events, hobbies",
  },
  {
    name: "Bills",
    description: "Rent, utilities, subscriptions",
  },
];

const userData = [
  {
    name: "John Doe",
    email: "johndoe@gmail.com",
    password: "password123",
  },
  {
    name: "Jane Smith",
    email: "janesmith@gmail.com",
    password: "password123",
  },
  {
    name: "Ali Khan",
    email: "alikhan@gmail.com",
    password: "password123",
  },
];

// [title, amount, daysAgo, category, userIndex]
const expenseData = [
  ["Lunch at campus cafe", 180, 1, "Food & Dining", 0],
  ["Monthly bus pass", 620, 2, "Transportation", 0],
  ["USB-C cable", 250, 3, "Shopping", 0],
  ["Groceries - weekly", 1450, 4, "Food & Dining", 0],
  ["Spotify premium", 89, 5, "Entertainment", 0],
  ["Programming book", 600, 6, "Education", 0],
  ["Coffee with friends", 320, 7, "Food & Dining", 1],
  ["Taxi to airport", 480, 8, "Transportation", 1],
  ["Electricity bill", 1150, 9, "Bills", 0],
  ["Concert ticket", 950, 10, "Entertainment", 1],
  ["Winter jacket", 2400, 12, "Shopping", 2],
  ["Online course", 1800, 14, "Education", 1],
  ["Team lunch", 860, 16, "Food & Dining", 2],
  ["Fuel refill", 2100, 18, "Transportation", 2],
  ["Internet bill", 990, 20, "Bills", 0],
  ["Phone case", 390, 22, "Shopping", 0],
  ["Restaurant dinner", 1250, 24, "Food & Dining", 1],
  ["Netflix subscription", 450, 26, "Entertainment", 2],
  ["Rent", 9000, 35, "Bills", 0],
  ["Gym membership", 1200, 42, "Entertainment", 2],
  ["Textbooks", 1500, 55, "Education", 0],
  ["Taxi home", 260, 70, "Transportation", 1],
];

async function seed() {
  await mongoose.connect(MONGODB_URI);

  console.log("Connected to", MONGODB_URI);

  await Promise.all([
    User.deleteMany({}),
    Category.deleteMany({}),
    Expense.deleteMany({}),
  ]);

  console.log("Cleared existing collections");

  const categories = await Category.insertMany(categoryData);
  const users = await User.insertMany(userData);

  console.log(
    `Inserted ${categories.length} categories, ${users.length} users`
  );

  const expenseDocs = expenseData.map(
    ([title, amount, days, categoryName, userIndex]) => ({
      title,
      amount,
      date: daysAgo(days),
      description: `${title} (demo data)`,
      userId: users[userIndex]._id,
      categoryId: categories.find(
        (category) => category.name === categoryName
      )._id,
    })
  );

  const expenses = await Expense.insertMany(expenseDocs);

  console.log(`Inserted ${expenses.length} expenses`);

  await mongoose.disconnect();

  console.log("Done.");
}

seed().catch(async (error) => {
  console.error("Seed failed:", error);

  await mongoose.disconnect();
  process.exit(1);
});

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

// A date N days before today, used for expenses in previous months.
function daysAgo(n) {
  const date = new Date();

  date.setDate(date.getDate() - n);
  date.setHours(12, 0, 0, 0);

  return date;
}

// Today, at midday.
function today() {
  const now = new Date();

  return new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    12
  );
}

// Day N of the CURRENT month, clamped so it never lands in the future.
// This keeps the dashboard's "this month" figures populated no matter
// what day of the month the seed happens to be run.
function thisMonth(day) {
  const now = new Date();

  return new Date(
    now.getFullYear(),
    now.getMonth(),
    Math.min(day, now.getDate()),
    12
  );
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

// [title, amount, date, category, userIndex]
// Dates are resolved once at load time. Current-month rows use thisMonth()
// so the dashboard always has data for the month you are viewing.
const expenseData = [
  // Today
  ["Coffee and pastry", 180, today(), "Food & Dining", 0],
  ["Top up mobile balance", 350, today(), "Bills", 1],
  ["Stationery for coursework", 240, today(), "Education", 2],

  // Rest of the current month
  ["Weekly groceries", 1450, thisMonth(2), "Food & Dining", 0],
  ["Monthly bus pass", 620, thisMonth(4), "Transportation", 0],
  ["USB-C cable", 250, thisMonth(6), "Shopping", 0],
  ["Coffee with friends", 320, thisMonth(8), "Food & Dining", 1],
  ["Electricity bill", 1150, thisMonth(10), "Bills", 0],
  ["Winter jacket", 2400, thisMonth(12), "Shopping", 2],
  ["Concert ticket", 950, thisMonth(14), "Entertainment", 1],
  ["Online course", 1800, thisMonth(16), "Education", 1],
  ["Team lunch", 860, thisMonth(18), "Food & Dining", 2],
  ["Fuel refill", 2100, thisMonth(20), "Transportation", 2],
  ["Internet bill", 990, thisMonth(22), "Bills", 0],
  ["Phone case", 390, thisMonth(24), "Shopping", 0],
  ["Restaurant dinner", 1250, thisMonth(26), "Food & Dining", 1],
  ["Spotify premium", 89, thisMonth(28), "Entertainment", 2],

  // Previous months
  ["Rent", 9000, daysAgo(35), "Bills", 0],
  ["Gym membership", 1200, daysAgo(42), "Entertainment", 2],
  ["Netflix subscription", 450, daysAgo(55), "Entertainment", 2],
  ["Textbooks", 1500, daysAgo(70), "Education", 0],
  ["Taxi home", 260, daysAgo(88), "Transportation", 1],
  ["Flight ticket", 3200, daysAgo(120), "Transportation", 0],
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
    ([title, amount, date, categoryName, userIndex]) => ({
      title,
      amount,
      date,
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

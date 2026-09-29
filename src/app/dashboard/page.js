"use client";

import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [expenses, setExpenses] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        setError("");

        const [
          usersResponse,
          categoriesResponse,
          expensesResponse,
        ] = await Promise.all([
          fetch("/api/users"),
          fetch("/api/categories"),
          fetch("/api/expenses"),
        ]);

        if (
          !usersResponse.ok ||
          !categoriesResponse.ok ||
          !expensesResponse.ok
        ) {
          throw new Error("Failed to load dashboard data");
        }

        const usersData = await usersResponse.json();
        const categoriesData = await categoriesResponse.json();
        const expensesData = await expensesResponse.json();

        setUsers(usersData);
        setCategories(categoriesData);
        setExpenses(expensesData);
      } catch (error) {
        console.error(error);
        setError("Unable to load dashboard data.");
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const totalExpenses = expenses.reduce(
    (total, expense) => total + Number(expense.amount || 0),
    0
  );

  // Current month expenses
  const now = new Date();

  const currentMonthExpenses = expenses.filter((expense) => {
    const expenseDate = new Date(expense.date);

    return (
      expenseDate.getFullYear() === now.getFullYear() &&
      expenseDate.getMonth() === now.getMonth()
    );
  });

  const currentMonthTotal = currentMonthExpenses.reduce(
    (total, expense) => total + Number(expense.amount || 0),
    0
  );

  // Spending by category
  const spendingByCategory = {};

  expenses.forEach((expense) => {
    const categoryName = expense.categoryId?.name || "Uncategorized";

    if (!spendingByCategory[categoryName]) {
      spendingByCategory[categoryName] = 0;
    }

    spendingByCategory[categoryName] += Number(expense.amount || 0);
  });

  if (loading) {
    return <main>Loading dashboard...</main>;
  }

  if (error) {
    return <main>{error}</main>;
  }

  return (
    <main>
      <h1>Expense Management Dashboard</h1>

      <p>
        Overview of users, categories, and recorded expenses.
      </p>

      <section>
        <div>
          <h2>{users.length}</h2>
          <p>Total Users</p>
        </div>

        <div>
          <h2>{categories.length}</h2>
          <p>Total Categories</p>
        </div>

        <div>
          <h2>{expenses.length}</h2>
          <p>Total Expenses</p>
        </div>

        <div>
          <h2>฿{totalExpenses.toLocaleString()}</h2>
          <p>Total Amount</p>
        </div>

        <div>
          <h2>฿{currentMonthTotal.toLocaleString()}</h2>
          <p>This Month</p>
        </div>
      </section>

      <section>
        <h2>Spending by Category</h2>

        {Object.keys(spendingByCategory).length === 0 ? (
          <p>No category spending recorded.</p>
        ) : (
          <ul>
            {Object.entries(spendingByCategory).map(
              ([category, amount]) => (
                <li key={category}>
                  <strong>{category}</strong>
                  {" - "}
                  ฿{amount.toLocaleString()}
                </li>
              )
            )}
          </ul>
        )}
      </section>

      {/* Added */}
      <section>
        <h2>Current Month Expenses</h2>

        {currentMonthExpenses.length === 0 ? (
          <p>No expenses recorded this month.</p>
        ) : (
          <ul>
            {currentMonthExpenses.map((expense) => (
              <li key={expense._id}>
                <strong>{expense.title}</strong>
                {" - "}
                ฿{Number(expense.amount).toLocaleString()}
              </li>
            ))}
          </ul>
        )}
      </section>
      
      <section>
        <h2>Recent Expenses</h2>

        {expenses.length === 0 ? (
          <p>No expenses recorded.</p>
        ) : (
          <ul>
            {expenses.slice(0, 5).map((expense) => (
              <li key={expense._id}>
                <strong>{expense.title}</strong>
                {" - "}
                ฿{Number(expense.amount).toLocaleString()}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
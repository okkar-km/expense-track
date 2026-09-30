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
    return (
      <main className="page">Loading dashboard...</main>
    );
  }

  if (error) {
    return <main className="page">{error}</main>;
  }

  return (
    <main className="page">
      <h1 className="page__title">
        Expense Management Dashboard
      </h1>

      <p className="page__subtitle">
        Overview of users, categories, and recorded expenses.
      </p>

      <section className="tiles">
        <div className="tiles__item">
          <h2 className="tiles__value">{users.length}</h2>
          <p className="tiles__label">Total Users</p>
        </div>

        <div className="tiles__item">
          <h2 className="tiles__value">
            {categories.length}
          </h2>
          <p className="tiles__label">Total Categories</p>
        </div>

        <div className="tiles__item">
          <h2 className="tiles__value">
            {expenses.length}
          </h2>
          <p className="tiles__label">Total Expenses</p>
        </div>

        <div className="tiles__item">
          <h2 className="tiles__value">
            ฿{totalExpenses.toLocaleString()}
          </h2>
          <p className="tiles__label">Total Amount</p>
        </div>

        <div className="tiles__item">
          <h2 className="tiles__value">
            ฿{currentMonthTotal.toLocaleString()}
          </h2>
          <p className="tiles__label">This Month</p>
        </div>
      </section>

      <section className="panel">
        <h2 className="panel__title">
          Spending by Category
        </h2>

        {Object.keys(spendingByCategory).length === 0 ? (
          <p>No category spending recorded.</p>
        ) : (
          <ul className="list">
            {Object.entries(spendingByCategory).map(
              ([category, amount]) => (
                <li className="list__item" key={category}>
                  <strong>{category}</strong>
                  {" - "}
                  ฿{amount.toLocaleString()}
                </li>
              )
            )}
          </ul>
        )}
      </section>

      <section className="panel">
        <h2 className="panel__title">
          Current Month Expenses
        </h2>

        {currentMonthExpenses.length === 0 ? (
          <p>No expenses recorded this month.</p>
        ) : (
          <ul className="list">
            {currentMonthExpenses.map((expense) => (
              <li className="list__item" key={expense._id}>
                <strong>{expense.title}</strong>
                {" - "}
                ฿{Number(expense.amount).toLocaleString()}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="panel">
        <h2 className="panel__title">Recent Expenses</h2>

        {expenses.length === 0 ? (
          <p>No expenses recorded.</p>
        ) : (
          <ul className="list">
            {expenses.slice(0, 5).map((expense) => (
              <li className="list__item" key={expense._id}>
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
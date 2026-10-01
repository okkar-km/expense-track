"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { ExpenseDTO, UserDTO, CategoryDTO } from "@/types";
import { errorMessage } from "@/utils/errors";

export default function ExpensesPage() {
  // Expense data
  const [expenses, setExpenses] = useState<ExpenseDTO[]>([]);

  // Users and categories for dropdowns
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [categories, setCategories] = useState<CategoryDTO[]>([]);

  // Form fields
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [userId, setUserId] = useState("");
  const [categoryId, setCategoryId] = useState("");

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);

  // Search
  const [search, setSearch] = useState("");

  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");


  // LOAD EXPENSES
  async function loadExpenses() {
    try {
      const response = await fetch("/api/expenses");

      if (!response.ok) {
        throw new Error("Failed to load expenses");
      }

      const data = await response.json();

      setExpenses(data);
    } catch (error) {
      console.error(error);
      setError("Failed to load expenses.");
    }
  }

  // LOAD USERS
  async function loadUsers() {
    try {
      const response = await fetch("/api/users");

      if (!response.ok) {
        throw new Error("Failed to load users");
      }

      const data = await response.json();

      setUsers(data);
    } catch (error) {
      console.error(error);
      setError("Failed to load users.");
    }
  }

  // LOAD CATEGORIES
  async function loadCategories() {
    try {
      const response = await fetch(
        "/api/categories"
      );

      if (!response.ok) {
        throw new Error(
          "Failed to load categories"
        );
      }

      const data = await response.json();

      setCategories(data);
    } catch (error) {
      console.error(error);
      setError("Failed to load categories.");
    }
  }

  // INITIAL PAGE LOAD
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError("");

      await Promise.all([
        loadExpenses(),
        loadUsers(),
        loadCategories(),
      ]);

      setLoading(false);
    }

    loadData();
  }, []);

  // RESET FORM
  function resetForm() {
    setTitle("");
    setAmount("");
    setDate("");
    setDescription("");
    setUserId("");
    setCategoryId("");

    setEditingId(null);

    setError("");
    setMessage("");
  }


  // CREATE / UPDATE EXPENSE
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setMessage("");
    setSaving(true);

    try {
      const expenseData = {
        title,
        amount: Number(amount),
        date,
        description,
        userId,
        categoryId,
      };

      let response;

      // UPDATE
      if (editingId) {
        response = await fetch(
          `/api/expenses/${editingId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(expenseData),
          }
        );
      }

      // CREATE
      else {
        response = await fetch(
          "/api/expenses",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(expenseData),
          }
        );
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to save expense"
        );
      }

      await loadExpenses();

      if (editingId) {
        setMessage(
          "Expense updated successfully."
        );
      } else {
        setMessage(
          "Expense created successfully."
        );
      }

      resetForm();
    } catch (error) {
      console.error(error);
      setError(errorMessage(error));
    } finally {
      setSaving(false);
    }
  }


  // EDIT EXPENSE
  function handleEdit(expense: ExpenseDTO) {
    setEditingId(expense._id);

    setTitle(expense.title || "");

    setAmount(
      expense.amount !== undefined
        ? String(expense.amount)
        : ""
    );

    // Convert date into YYYY-MM-DD
    if (expense.date) {
      setDate(
        new Date(expense.date)
          .toISOString()
          .split("T")[0]
      );
    } else {
      setDate("");
    }

    setDescription(
      expense.description || ""
    );

    // Because GET uses populate()
    setUserId(expense.userId._id);

    setCategoryId(expense.categoryId._id);

    setMessage("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }


  // DELETE EXPENSE
  async function handleDelete(expenseId: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this expense?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setMessage("");

      const response = await fetch(
        `/api/expenses/${expenseId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to delete expense"
        );
      }

      setMessage(
        "Expense deleted successfully."
      );

      await loadExpenses();
    } catch (error) {
      console.error(error);
      setError(errorMessage(error));
    }
  }


  // SEARCH
  const filteredExpenses = expenses.filter(
    (expense) => {
      const searchText =
        search.toLowerCase();

      const title =
        expense.title?.toLowerCase() || "";

      const description =
        expense.description?.toLowerCase() ||
        "";

      const userName =
        expense.userId?.name?.toLowerCase() ||
        "";

      const categoryName =
        expense.categoryId?.name?.toLowerCase() ||
        "";

      return (
        title.includes(searchText) ||
        description.includes(searchText) ||
        userName.includes(searchText) ||
        categoryName.includes(searchText)
      );
    }
  );


  // LOADING
  if (loading) {
    return (
      <main className="page">
        <h1 className="page__title">Expense Management</h1>

        <p className="page__subtitle">
          Loading expenses...
        </p>
      </main>
    );
  }


  // PAGE
  return (
    <main className="page">

      <h1 className="page__title">Expense Management</h1>

      <p className="page__subtitle">
        Create, view, update, search, and
        delete expenses.
      </p>


      {/* MESSAGES */}

      {error && (
        <p className="alert alert--error">
          {error}
        </p>
      )}

      {message && (
        <p className="alert alert--success">
          {message}
        </p>
      )}


      {/* EXPENSE FORM */}

      <section className="panel">

        <h2 className="panel__title">
          {editingId
            ? "Edit Expense"
            : "Create Expense"}
        </h2>


        <form className="form" onSubmit={handleSubmit}>

          {/* TITLE */}

          <div className="form__field">
            <label className="form__label">
              Title
            </label>

            <input
              type="text"
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              placeholder="Enter expense title"
              required
            />
          </div>


          {/* AMOUNT */}

          <div className="form__field">
            <label className="form__label">
              Amount
            </label>

            <input
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(event) =>
                setAmount(event.target.value)
              }
              placeholder="Enter amount"
              required
            />
          </div>


          {/* DATE */}

          <div className="form__field">
            <label className="form__label">
              Date
            </label>

            <input
              type="date"
              value={date}
              onChange={(event) =>
                setDate(event.target.value)
              }
              required
            />
          </div>


          {/* DESCRIPTION */}

          <div className="form__field">
            <label className="form__label">
              Description
            </label>

            <textarea
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value
                )
              }
              placeholder="Enter description"
              rows={4}
            />
          </div>


          {/* USER */}

          <div className="form__field">
            <label className="form__label">
              User
            </label>

            <select
              value={userId}
              onChange={(event) =>
                setUserId(event.target.value)
              }
              required
            >
              <option value="">
                Select user
              </option>

              {users.map((user) => (
                <option
                  key={user._id}
                  value={user._id}
                >
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
          </div>


          {/* CATEGORY */}

          <div className="form__field">
            <label className="form__label">
              Category
            </label>

            <select
              value={categoryId}
              onChange={(event) =>
                setCategoryId(
                  event.target.value
                )
              }
              required
            >
              <option value="">
                Select category
              </option>

              {categories.map(
                (category) => (
                  <option
                    key={category._id}
                    value={category._id}
                  >
                    {category.name}
                  </option>
                )
              )}
            </select>
          </div>


          {/* SUBMIT */}

          <button
            className="btn btn--primary"
            type="submit"
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : editingId
              ? "Update Expense"
              : "Create Expense"}
          </button>


          {/* CANCEL */}

          {editingId && (
            <button
              className="btn btn--secondary"
              type="button"
              onClick={resetForm}
            >
              Cancel
            </button>
          )}

        </form>

      </section>


      {/* SEARCH */}

      <section className="panel">

        <h2 className="panel__title">Expenses</h2>

        <input
          className="input"
          type="text"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Search expenses"
        />

      </section>


      {/* EXPENSE TABLE */}

      <section className="panel panel--flush">

        {filteredExpenses.length === 0 ? (

          <p>
            No expenses found.
          </p>

        ) : (

          <table className="table">

            <thead>

              <tr>
                <th>Title</th>
                <th>Amount</th>
                <th>Date</th>
                <th>User</th>
                <th>Category</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>

            </thead>


            <tbody>

              {filteredExpenses.map(
                (expense) => (

                  <tr key={expense._id}>

                    {/* TITLE */}

                    <td>
                      {expense.title}
                    </td>


                    {/* AMOUNT */}

                    <td>
                      {Number(
                        expense.amount
                      ).toFixed(2)}
                    </td>


                    {/* DATE */}

                    <td>
                      {expense.date
                        ? new Date(
                            expense.date
                          ).toLocaleDateString()
                        : "-"}
                    </td>


                    {/* USER */}

                    <td>
                      {expense.userId?.name ||
                        "-"}
                    </td>


                    {/* CATEGORY */}

                    <td>
                      {expense.categoryId
                        ?.name || "-"}
                    </td>


                    {/* DESCRIPTION */}

                    <td>
                      {expense.description ||
                        "-"}
                    </td>


                    {/* ACTIONS */}

                    <td>

                      <button
                        className="btn btn--secondary"
                        onClick={() =>
                          handleEdit(
                            expense
                          )
                        }
                      >
                        Edit
                      </button>


                      <button
                        className="btn btn--danger"
                        onClick={() =>
                          handleDelete(
                            expense._id
                          )
                        }
                      >
                        Delete
                      </button>

                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        )}

      </section>

    </main>
  );
}
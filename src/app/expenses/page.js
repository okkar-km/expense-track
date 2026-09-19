"use client";

import { useEffect, useState } from "react";

export default function ExpensesPage() {
  // Expense data
  const [expenses, setExpenses] = useState([]);

  // Users and categories for dropdowns
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);

  // Form fields
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [userId, setUserId] = useState("");
  const [categoryId, setCategoryId] = useState("");

  // Editing state
  const [editingId, setEditingId] = useState(null);

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
  async function handleSubmit(event) {
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
      setError(error.message);
    } finally {
      setSaving(false);
    }
  }


  // EDIT EXPENSE
  function handleEdit(expense) {
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
    setUserId(
      expense.userId?._id ||
        expense.userId ||
        ""
    );

    setCategoryId(
      expense.categoryId?._id ||
        expense.categoryId ||
        ""
    );

    setMessage("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }


  // DELETE EXPENSE
  async function handleDelete(expenseId) {
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
      setError(error.message);
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
      <main>
        <h1>Expense Management</h1>

        <p>
          Loading expenses...
        </p>
      </main>
    );
  }


  // PAGE
  return (
    <main style={{ padding: "30px" }}>

      <h1>Expense Management</h1>

      <p>
        Create, view, update, search, and
        delete expenses.
      </p>


      {/* MESSAGES */}

      {error && (
        <p style={{ color: "red" }}>
          {error}
        </p>
      )}

      {message && (
        <p style={{ color: "green" }}>
          {message}
        </p>
      )}


      {/* EXPENSE FORM */}

      <section>

        <h2>
          {editingId
            ? "Edit Expense"
            : "Create Expense"}
        </h2>


        <form onSubmit={handleSubmit}>

          {/* TITLE */}

          <div>
            <label>
              Title
            </label>

            <br />

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


          <br />


          {/* AMOUNT */}

          <div>
            <label>
              Amount
            </label>

            <br />

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


          <br />


          {/* DATE */}

          <div>
            <label>
              Date
            </label>

            <br />

            <input
              type="date"
              value={date}
              onChange={(event) =>
                setDate(event.target.value)
              }
              required
            />
          </div>


          <br />


          {/* DESCRIPTION */}

          <div>
            <label>
              Description
            </label>

            <br />

            <textarea
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value
                )
              }
              placeholder="Enter description"
              rows="4"
            />
          </div>


          <br />


          {/* USER */}

          <div>
            <label>
              User
            </label>

            <br />

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


          <br />


          {/* CATEGORY */}

          <div>
            <label>
              Category
            </label>

            <br />

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


          <br />


          {/* SUBMIT */}

          <button
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
              type="button"
              onClick={resetForm}
              style={{
                marginLeft: "10px",
              }}
            >
              Cancel
            </button>
          )}

        </form>

      </section>


      <hr />


      {/* SEARCH */}

      <section>

        <h2>Expenses</h2>

        <input
          type="text"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Search expenses"
        />

      </section>


      <br />


      {/* EXPENSE TABLE */}

      <section>

        {filteredExpenses.length === 0 ? (

          <p>
            No expenses found.
          </p>

        ) : (

          <table
            border="1"
            cellPadding="10"
          >

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
                        onClick={() =>
                          handleEdit(
                            expense
                          )
                        }
                      >
                        Edit
                      </button>


                      <button
                        onClick={() =>
                          handleDelete(
                            expense._id
                          )
                        }
                        style={{
                          marginLeft: "10px",
                        }}
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
"use client";

import { useEffect, useState } from "react";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);

  // Form fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // Editing state
  const [editingId, setEditingId] = useState(null);

  // Search
  const [search, setSearch] = useState("");

  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // GET CATEGORIES
  async function loadCategories() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/categories");

      if (!response.ok) {
        throw new Error("Failed to load categories");
      }

      const data = await response.json();

      setCategories(data);
    } catch (error) {
      console.error(error);
      setError("Failed to load categories.");
    } finally {
      setLoading(false);
    }
  }

  // Load categories when page opens
  useEffect(() => {
    loadCategories();
  }, []);

  // RESET FORM
  function resetForm() {
    setName("");
    setDescription("");
    setEditingId(null);
    setError("");
    setMessage("");
  }

  // CREATE / UPDATE CATEGORY
  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setMessage("");
    setSaving(true);

    try {
      const categoryData = {
        name,
        description,
      };

      let response;

      // UPDATE
      if (editingId) {
        response = await fetch(
          `/api/categories/${editingId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(categoryData),
          }
        );
      }

      // CREATE
      else {
        response = await fetch("/api/categories", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(categoryData),
        });
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to save category"
        );
      }

      await loadCategories();

      if (editingId) {
        setMessage("Category updated successfully.");
      } else {
        setMessage("Category created successfully.");
      }

      resetForm();
    } catch (error) {
      console.error(error);
      setError(error.message);
    } finally {
      setSaving(false);
    }
  }

  // EDIT CATEGORY
  function handleEdit(category) {
    setEditingId(category._id);
    setName(category.name || "");
    setDescription(category.description || "");

    setMessage("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // DELETE CATEGORY
  async function handleDelete(categoryId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this category?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setMessage("");

      const response = await fetch(
        `/api/categories/${categoryId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete category"
        );
      }

      setMessage("Category deleted successfully.");

      await loadCategories();
    } catch (error) {
      console.error(error);
      setError(error.message);
    }
  }

  // SEARCH
  const filteredCategories = categories.filter(
    (category) => {
      const searchText = search.toLowerCase();

      return (
        category.name
          ?.toLowerCase()
          .includes(searchText) ||
        category.description
          ?.toLowerCase()
          .includes(searchText)
      );
    }
  );

  // LOADING
  if (loading) {
    return (
      <main>
        <h1>Category Management</h1>
        <p>Loading categories...</p>
      </main>
    );
  }

  // PAGE
  return (
    <main style={{ padding: "30px" }}>
      <h1>Category Management</h1>

      <p>
        Create, view, update, search, and delete
        expense categories.
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

      {/* CATEGORY FORM */}

      <section>
        <h2>
          {editingId
            ? "Edit Category"
            : "Create Category"}
        </h2>

        <form onSubmit={handleSubmit}>
          <div>
            <label>Name</label>

            <br />

            <input
              type="text"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="Enter category name"
              required
            />
          </div>

          <br />

          <div>
            <label>Description</label>

            <br />

            <textarea
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              placeholder="Enter category description"
              rows="4"
            />
          </div>

          <br />

          <button
            type="submit"
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : editingId
              ? "Update Category"
              : "Create Category"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              style={{ marginLeft: "10px" }}
            >
              Cancel
            </button>
          )}
        </form>
      </section>

      <hr />

      {/* SEARCH */}

      <section>
        <h2>Categories</h2>

        <input
          type="text"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Search by name or description"
        />
      </section>

      <br />

      {/* CATEGORY TABLE */}

      <section>
        {filteredCategories.length === 0 ? (
          <p>No categories found.</p>
        ) : (
          <table border="1" cellPadding="10">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredCategories.map(
                (category) => (
                  <tr key={category._id}>
                    <td>
                      {category.name}
                    </td>

                    <td>
                      {category.description || "-"}
                    </td>

                    <td>
                      {category.createdAt
                        ? new Date(
                            category.createdAt
                          ).toLocaleDateString()
                        : "-"}
                    </td>

                    <td>
                      <button
                        onClick={() =>
                          handleEdit(category)
                        }
                      >
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          handleDelete(
                            category._id
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
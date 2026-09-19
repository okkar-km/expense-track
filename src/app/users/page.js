"use client";

import { useEffect, useState } from "react";

export default function UsersPage() {
  const [users, setUsers] = useState([]);

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // editing an existing user
  const [editingId, setEditingId] = useState(null);

  // Search
  const [search, setSearch] = useState("");

  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");


  // GET USERS
  async function loadUsers() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/users");

      if (!response.ok) {
        throw new Error("Failed to load users");
      }

      const data = await response.json();

      setUsers(data);
    } catch (error) {
      console.error(error);
      setError("Failed to load users.");
    } finally {
      setLoading(false);
    }
  }


  // Load users when page opens
  useEffect(() => {
    loadUsers();
  }, []);


  // RESET FORM
  function resetForm() {
    setName("");
    setEmail("");
    setPassword("");
    setEditingId(null);
    setError("");
    setMessage("");
  }


  // CREATE / UPDATE USER
  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setMessage("");
    setSaving(true);

    try {
      // Data sent to the API
      const userData = {
        name,
        email,
        // role,
        password
      };

      let response;

      // UPDATE
      if (editingId) {
        response = await fetch(`/api/users/${editingId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        });
      }

      // CREATE
      else {
        response = await fetch("/api/users", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        });
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to save user"
        );
      }

      // Reload users after successful operation
      await loadUsers();

      if (editingId) {
        setMessage("User updated successfully.");
      } else {
        setMessage("User created successfully.");
      }

      resetForm();

    } catch (error) {
      console.error(error);
      setError(error.message);
    } finally {
      setSaving(false);
    }
  }


  // EDIT USER
  function handleEdit(user) {
    setEditingId(user._id);
    setName(user.name || "");
    setEmail(user.email || "");
    setPassword(""); // Clear password field for security

    setMessage("");
    setError("");

    // Scroll to form
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }


  // DELETE USER
  async function handleDelete(userId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this user?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setMessage("");

      const response = await fetch(
        `/api/users/${userId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete user"
        );
      }

      setMessage("User deleted successfully.");

      await loadUsers();

    } catch (error) {
      console.error(error);
      setError(error.message);
    }
  }

  // SEARCH
  const filteredUsers = users.filter((user) => {
    const searchText = search.toLowerCase();

    return (
      user.name?.toLowerCase().includes(searchText) ||
      user.email?.toLowerCase().includes(searchText)
    );
  });


  // LOADING
  if (loading) {
    return (
      <main>
        <h1>User Management</h1>
        <p>Loading users...</p>
      </main>
    );
  }


  // PAGE
  return (
    <main style={{ padding: "30px" }}>

      <h1>User Management</h1>

      <p>
        Create, view, update, search, and delete
        system users.
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


      {/* USER FORM */}

      <section>
        <h2>
          {editingId
            ? "Edit User"
            : "Create User"}
        </h2>

        <form onSubmit={handleSubmit}>

          <div>
            <label>
              Name
            </label>

            <br />

            <input
              type="text"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="Enter user name"
              required
            />
          </div>


          <br />


          <div>
            <label>
              Email
            </label>

            <br />

            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="Enter email"
              required
            />
          </div>


          <br />

          <div>
            <label>Password</label>

            <br />

            <input
                type="password"
                value={password}
                onChange={(event) =>
                setPassword(event.target.value)
                }
                placeholder={
                    editingId
                    ? "Leave blank to keep current password"
                    : "Enter password"
                }
                required={!editingId}
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
              ? "Update User"
              : "Create User"}
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
        <h2>Users</h2>

        <input
          type="text"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Search by name or email"
        />
      </section>


      <br />


      {/* USER TABLE */}

      <section>

        {filteredUsers.length === 0 ? (
          <p>
            No users found.
          </p>
        ) : (

          <table border="1" cellPadding="10">

            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              {filteredUsers.map((user) => (

                <tr key={user._id}>

                  <td>
                    {user.name}
                  </td>

                  <td>
                    {user.email}
                  </td>


                  <td>
                    {user.createdAt
                      ? new Date(
                          user.createdAt
                        ).toLocaleDateString()
                      : "-"}
                  </td>

                  <td>

                    <button
                      onClick={() =>
                        handleEdit(user)
                      }
                    >
                      Edit
                    </button>

                    <button
                      onClick={() =>
                        handleDelete(user._id)
                      }
                      style={{
                        marginLeft: "10px",
                      }}
                    >
                      Delete
                    </button>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        )}

      </section>

    </main>
  );
}
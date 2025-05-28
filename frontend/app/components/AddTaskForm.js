"use client";

import { useState, useEffect } from "react";

export default function AddTaskForm({ onTaskCreated }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [users, setUsers] = useState([]);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    // Fetch all users to assign task
    fetch("http://localhost:8000/api/users", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setUsers(data.users || []))
      .catch((err) => console.error("Error fetching users:", err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch("http://192.168.1.11:8000/api/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title,
        description,
        user_id: assignedTo,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      alert("Task created!");
      setTitle("");
      setDescription("");
      setAssignedTo("");
      onTaskCreated && onTaskCreated(data.task);
    } else {
      alert("Failed to create task: " + (data.message || "Unknown error"));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 space-y-4">
      <h2 className="text-xl font-semibold">Add New Task</h2>
      <div>
        <label className="block mb-1 font-medium">Title</label>
        <input
          type="text"
          className="w-full border p-2 rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block mb-1 font-medium">Description</label>
        <textarea
          className="w-full border p-2 rounded"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        ></textarea>
      </div>
      <div>
        <label className="block mb-1 font-medium">Assign to User</label>
        <select
          className="w-full border p-2 rounded"
          value={assignedTo}
          onChange={(e) => setAssignedTo(e.target.value)}
          required
        >
          <option value="">Select user</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name || user.username}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Create Task
      </button>
    </form>
  );
}

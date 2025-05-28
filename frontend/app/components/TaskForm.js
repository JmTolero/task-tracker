"use client";

import React from "react";

export default function TaskForm({
  onSubmit,
  onCancel,
  editTaskId,
  title,
  setTitle,
  description,
  setDescription,
  status,
  setStatus,
  assignedTo,
  setAssignedTo,
  users,
}) {
  return (
    <form onSubmit={onSubmit} className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-black mb-6">
        {editTaskId ? "Edit Task" : "Create New Task"}
      </h2>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-black mb-2">
            Task Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter task title"
            className="w-full px-4 py-2 text-black border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-600"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-black mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter task description"
            className="w-full px-4 py-2 text-black border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-600"
            rows={4}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-black mb-2">
            Status <span className="text-red-500">*</span>
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-4 py-2 text-black border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="pending">🟡 Pending</option>
            <option value="in_progress">🔵 In Progress</option>
            <option value="completed">🟢 Completed</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-black mb-2">
            Assign to User <span className="text-red-500">*</span>
          </label>
          <select
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            required
            className="w-full px-4 py-2 text-black border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="" className="text-gray-600">-- Select User --</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                👤 {user.name || user.username}
              </option>
            ))}
          </select>
          <p className="mt-1 text-sm text-gray-700">Select a team member to assign this task</p>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {editTaskId ? "✏️ Update Task" : "➕ Create Task"}
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-100 text-black px-6 py-3 rounded-md text-sm font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            ❌ Cancel
          </button>
        </div>
      </div>
    </form>
  );
}

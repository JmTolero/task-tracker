<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    // Admin: Get all tasks with assigned user info
    public function index()
    {
        return response()->json([
            'tasks' => Task::with(['creator', 'assignedUser'])->latest()->get()
        ]);
    }

    // Admin: Create a new task and assign it to a user
    public function store(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'title' => 'required|string|max:255',
                'description' => 'nullable|string',
                'status' => 'in:pending,in_progress,completed',
                'assigned_to' => 'nullable|exists:users,id'
            ]);

            $task = Task::create([
                'title' => $validatedData['title'],
                'description' => $validatedData['description'],
                'status' => $validatedData['status'] ?? 'pending',
                'user_id' => auth()->id(), // Current admin user
                'assigned_to' => $validatedData['assigned_to'] ?? null
            ]);

            return response()->json([
                'message' => 'Task created successfully',
                'task' => $task->fresh(['creator', 'assignedUser'])
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to create task',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Admin/Client: View a specific task
    public function show($id)
    {
        try {
            $task = Task::with(['creator', 'assignedUser'])->findOrFail($id);
            return response()->json($task);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Task not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    // Admin: Update a task (including reassignment)
    public function update(Request $request, $id)
    {
        try {
            $validatedData = $request->validate([
                'title' => 'sometimes|string|max:255',
                'description' => 'nullable|string',
                'status' => 'sometimes|in:pending,in_progress,completed',
                'assigned_to' => 'nullable|exists:users,id'
            ]);

            $task = Task::findOrFail($id);
            
            $updateData = array_filter($validatedData, function ($value) {
                return $value !== null;
            });

            $task->update($updateData);

            return response()->json([
                'message' => 'Task updated successfully',
                'task' => $task->fresh(['creator', 'assignedUser'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update task',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Admin: Delete a task
    public function destroy($id)
    {
        try {
            $task = Task::findOrFail($id);
            $task->delete();

            return response()->json([
                'message' => 'Task deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete task',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Admin: Get all tasks
    public function allTasks()
    {
        $tasks = Task::with('user')->get();
        return response()->json(['tasks' => $tasks]);
    }

    // Client: Get tasks assigned to them
    public function myTasks(Request $request)
    {
        $tasks = Task::where('user_id', $request->user()->id)->get();
        return response()->json(['tasks' => $tasks]);
    }
}

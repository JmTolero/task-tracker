<?php

namespace App\Http\Controllers;
use App\Models\Task;
use Illuminate\Http\Request;

class ClientTaskController extends Controller
{
    public function index(Request $request)
    {
        $userId = $request->user()->id;

        // Get tasks assigned to this client
        $tasks = Task::where('assigned_to', $userId)->get();

        return response()->json($tasks);
    }

    public function show(Request $request, Task $task)
    {
        // Only allow if the task is assigned to this client
        if ($task->assigned_to !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return response()->json($task);
    }

    public function update(Request $request, Task $task)
    {
        if ($task->assigned_to !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'in:pending,in_progress,completed',
        ]);

        $task->update($request->only(['title', 'description', 'status']));

        return response()->json($task);
    }
}

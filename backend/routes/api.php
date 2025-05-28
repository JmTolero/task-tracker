<?php

use App\Http\Controllers\TaskController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ClientTaskController;
use App\Http\Controllers\UserController;
/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

// Route::middleware('auth:sanctum')->group ( function () {
//     Route::post('/logout',[AuthController::class], 'logout');
// });

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Common routes
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // Users route with role filtering
    Route::get('/users', [UserController::class, 'index']);

    // Admin routes
    Route::middleware('admin')->group(function () {
        Route::apiResource('tasks', TaskController::class);
    });

    // Client routes
    Route::get('/my-tasks', function (Request $request) {
        try {
            $tasks = \App\Models\Task::where('assigned_to', $request->user()->id)
                ->with(['creator', 'assignedUser'])
                ->get();
            return response()->json(['tasks' => $tasks]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    });

    Route::put('/tasks/{id}/status', function (Request $request, $id) {
        try {
            $task = \App\Models\Task::findOrFail($id);
            
            // Only allow client to update their own assigned task
            if ($task->assigned_to !== $request->user()->id) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            $task->status = $request->status;
            $task->save();

            return response()->json(['message' => 'Task updated successfully', 'task' => $task]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    });
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/tasks', [TaskController::class, 'index']);       // Admin only
    Route::get('/my-tasks', [TaskController::class, 'myTasks']);  // Client only
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/tasks', [TaskController::class, 'index']);
    Route::post('/tasks', [TaskController::class, 'store']);
    Route::get('/tasks/{id}', [TaskController::class, 'show']);
    Route::put('/tasks/{id}', [TaskController::class, 'update']);
    Route::delete('/tasks/{id}', [TaskController::class, 'destroy']);
});

// Route::middleware('auth:sanctum')->get('/users', [UserController::class, 'index']);

Route::middleware('auth:sanctum')->get('/my-tasks', function (Request $request) {
    return \App\Models\Task::where('assigned_to', $request->user()->id)->get();
});

// routes/api.php
Route::middleware('auth:sanctum')->put('/tasks/{id}', function (Request $request, $id) {
    $task = \App\Models\Task::findOrFail($id);

    // Only allow client to update their own assigned task
    if ($task->assigned_to !== $request->user()->id) {
        return response()->json(['message' => 'Unauthorized'], 403);
    }

    $task->status = $request->status ?? $task->status;
    $task->save();

    return response()->json(['message' => 'Task updated successfully']);
});

<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;

class UserController extends Controller
{
    public function index(Request $request)
    {
        try {
            $role = $request->query('role');
            $query = User::query();

            if ($role) {
                $query->where('role', $role);
            }

            $users = $query->select('id', 'name', 'email', 'role')->get();

            return response()->json([
                'users' => $users
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage()
            ], 500);
        }
    }
}


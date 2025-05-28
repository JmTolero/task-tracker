<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class ClientMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        if ($request->user() && $request->user()->role === 'client') {
            return $next($request);
        }

        return response()->json(['message' => 'Unauthorized. Client access required.'], 403);
    }
} 
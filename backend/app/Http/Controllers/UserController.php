<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index()
    {
        return response()->json(User::all());
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'alamat' => 'nullable|string',
            'no_telp' => 'nullable|string',
            'lokasi' => 'nullable|string'
        ]);

        $user->update([
            'alamat' => $request->alamat,
            'no_telp' => $request->no_telp,
            'lokasi' => $request->lokasi,
        ]);

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user
        ]);
    }
}

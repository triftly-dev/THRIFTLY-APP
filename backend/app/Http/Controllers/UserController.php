<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

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

    public function destroy($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'message' => 'User not found.'
            ], 404);
        }

        $user->delete();

        return response()->json([
            'message' => 'User deleted successfully.'
        ]);
    }

    public function updateAdmin(Request $request, $id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'message' => 'User not found.'
            ], 404);
        }

        // --- TAMBAHKAN VALIDASI INI ---
        $validator = Validator::make($request->all(), [
            'email' => 'unique:users,email,' . $id
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Email ini sudah digunakan oleh pengguna lain!'
            ], 422);
        }
        // ------------------------------

        if ($request->has('name')) {
            $user->name = $request->name;
        }
        if ($request->has('email')) {
            $user->email = $request->email;
        }
        if ($request->has('role')) {
            $user->role = $request->role;
        }

        $user->save();

        return response()->json([
            'message' => 'User updated successfully.',
            'user' => $user
        ]);
    }
}

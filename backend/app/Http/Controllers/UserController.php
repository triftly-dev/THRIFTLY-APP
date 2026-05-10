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
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'no_telp' => 'nullable|string|max:20|unique:users,no_telp,' . $user->id,
            'gender' => 'nullable|in:L,P',
            'date_of_birth' => 'nullable|date',
            'alamat' => 'nullable|string',
            'lokasi' => 'nullable|string',
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg|max:2048'
        ]);

        $data = $request->only(['name', 'email', 'no_telp', 'gender', 'date_of_birth', 'alamat', 'lokasi']);

        if ($request->hasFile('avatar')) {
            $path = $request->file('avatar')->store('avatars', 'public');
            $data['avatar'] = $path;
        }

        $user->update($data);

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user->fresh()
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

    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        $user = $request->user();

        if (!\Illuminate\Support\Facades\Hash::check($request->current_password, $user->password)) {
            return response()->json(['message' => 'Password saat ini salah.'], 422);
        }

        $user->update([
            'password' => \Illuminate\Support\Facades\Hash::make($request->new_password)
        ]);

        return response()->json(['message' => 'Password berhasil diubah.']);
    }

    public function verifyKTP(Request $request)
    {
        $request->validate([
            'ktp_image' => 'required|image|mimes:jpeg,png,jpg|max:2048',
            'ktp_nik' => 'required|string|size:16|unique:users,ktp_nik,' . Auth::id(),
            'ktp_name' => 'required|string|max:255',
            'ktp_birth_place' => 'required|string|max:255',
            'ktp_birth_date' => 'required|date',
        ], [
            'ktp_nik.unique' => 'NIK ini sudah terdaftar di akun lain!',
            'ktp_nik.size' => 'NIK harus berjumlah 16 digit.',
        ]);

        $user = $request->user();
        
        $path = $request->file('ktp_image')->store('ktp_verifications', 'public');

        $user->update([
            'ktp_path' => $path,
            'ktp_nik' => $request->ktp_nik,
            'ktp_name' => $request->ktp_name,
            'ktp_birth_place' => $request->ktp_birth_place,
            'ktp_birth_date' => $request->ktp_birth_date,
            'ktp_status' => 'pending',
            'is_ktp_verified' => false
        ]);

        // Kirim email ke semua Admin
        $admins = User::where('role', 'admin')->get();
        foreach ($admins as $admin) {
            \Illuminate\Support\Facades\Mail::to($admin->email)->send(new \App\Mail\AdminKtpUploaded($user));
        }

        return response()->json(['message' => 'Dokumen KTP berhasil diunggah. Mohon tunggu verifikasi admin.']);
    }

    public function approveKTP(Request $request, $id)
    {
        $user = User::findOrFail($id);
        
        $user->update([
            'ktp_status' => 'verified',
            'is_ktp_verified' => true,
            // 'role' => 'seller' // Opsional: otomatis jadi seller
        ]);

        // Kirim email ke User
        \Illuminate\Support\Facades\Mail::to($user->email)->send(new \App\Mail\UserKtpStatusUpdated($user));

        return response()->json(['message' => 'Verifikasi KTP disetujui.']);
    }

    public function rejectKTP(Request $request, $id)
    {
        $request->validate([
            'reason' => 'required|string'
        ]);

        $user = User::findOrFail($id);
        
        $user->update([
            'ktp_status' => 'rejected',
            'is_ktp_verified' => false,
            'ktp_rejection_reason' => $request->reason
        ]);

        // Kirim email ke User
        \Illuminate\Support\Facades\Mail::to($user->email)->send(new \App\Mail\UserKtpStatusUpdated($user));

        return response()->json(['message' => 'Verifikasi KTP ditolak.']);
    }
}

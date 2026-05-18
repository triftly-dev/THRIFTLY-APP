<?php

namespace App\Http\Controllers;

use App\Models\BankAccount;
use Illuminate\Http\Request;

class BankAccountController extends Controller
{
    /**
     * Display a listing of the user's bank accounts.
     */
    public function index(Request $request)
    {
        $accounts = $request->user()->bankAccounts()->orderBy('created_at', 'desc')->get();
        return response()->json($accounts);
    }

    /**
     * Store a newly created bank account in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'bank_name' => 'required|string|max:255',
            'account_number' => 'required|string|max:50',
            'account_holder' => 'required|string|max:255',
        ]);

        // Cek jika nomor rekening sudah ada untuk user ini
        $exists = $request->user()->bankAccounts()
            ->where('account_number', $request->account_number)
            ->where('bank_name', $request->bank_name)
            ->exists();

        if ($exists) {
            return response()->json([
                'message' => 'Rekening ini sudah ditambahkan sebelumnya.'
            ], 422);
        }

        $account = $request->user()->bankAccounts()->create([
            'bank_name' => $request->bank_name,
            'account_number' => $request->account_number,
            'account_holder' => $request->account_holder,
        ]);

        // Perbarui no_rekening utama di tabel users dengan rekening pertama jika belum diisi
        $user = $request->user();
        if (empty($user->no_rekening)) {
            $user->update(['no_rekening' => $request->account_number]);
        }

        return response()->json([
            'message' => 'Rekening bank berhasil ditambahkan!',
            'account' => $account
        ], 201);
    }

    /**
     * Remove the specified bank account from storage.
     */
    public function destroy(Request $request, $id)
    {
        $account = $request->user()->bankAccounts()->find($id);

        if (!$account) {
            return response()->json([
                'message' => 'Rekening bank tidak ditemukan atau bukan milik Anda.'
            ], 404);
        }

        $account->delete();

        // Jika rekening utama di tabel users adalah rekening yang dihapus, 
        // perbarui no_rekening utama dengan rekening lain yang tersisa, atau kosongkan
        $user = $request->user();
        if ($user->no_rekening === $account->account_number) {
            $nextAccount = $user->bankAccounts()->first();
            $user->update(['no_rekening' => $nextAccount ? $nextAccount->account_number : null]);
        }

        return response()->json([
            'message' => 'Rekening bank berhasil dihapus!'
        ]);
    }
}

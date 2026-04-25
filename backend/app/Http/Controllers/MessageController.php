<?php

namespace App\Http\Controllers;

use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MessageController extends Controller
{
    /**
     * Mengambil jumlah pesan yang belum dibaca.
     * Dipanggil oleh frontend: api.get('/messages')
     */
    public function getUnreadCount()
    {
        $userId = Auth::id();
        $count = Message::where('receiver_id', $userId)
                        ->where('is_read', false)
                        ->count();
        
        return response()->json(['unread_count' => $count]);
    }

    /**
     * Mengambil daftar pesan antara dua user.
     */
    public function index($receiverId)
    {
        $senderId = Auth::id();
        
        $messages = Message::where(function($query) use ($senderId, $receiverId) {
            $query->where('sender_id', $senderId)->where('receiver_id', $receiverId);
        })->orWhere(function($query) use ($senderId, $receiverId) {
            $query->where('sender_id', $receiverId)->where('receiver_id', $senderId);
        })->orderBy('created_at', 'asc')->get();

        // Tandai pesan sebagai sudah dibaca saat dibuka
        Message::where('sender_id', $receiverId)
               ->where('receiver_id', $senderId)
               ->where('is_read', false)
               ->update(['is_read' => true]);

        return response()->json($messages);
    }

    /**
     * Mengirim pesan baru.
     */
    public function store(Request $request)
    {
        $request->validate([
            'receiver_id' => 'required|exists:users,id',
            'message' => 'required|string',
            'product_id' => 'nullable|exists:products,id',
        ]);

        $message = Message::create([
            'sender_id' => Auth::id(),
            'receiver_id' => $request->receiver_id,
            'product_id' => $request->product_id,
            'message' => $request->message,
            'is_read' => false,
        ]);

        return response()->json($message, 201);
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MessageController extends Controller
{
    /**
     * DASHBOARD / INBOX: Mengambil daftar semua pesan milik user.
     * Dipanggil oleh messageService.getConversationsList() -> GET /messages
     */
    public function index()
    {
        $userId = Auth::id();
        
        // Mengambil semua pesan yang melibatkan user ini (sebagai pengirim atau penerima)
        // Disertai data pengirim, penerima, dan produknya
        $messages = Message::where('sender_id', $userId)
                         ->orWhere('receiver_id', $userId)
                         ->with(['sender', 'receiver', 'product'])
                         ->orderBy('created_at', 'desc')
                         ->get();

        return response()->json($messages);
    }

    /**
     * CHAT ROOM: Mengambil detail chat berdasarkan PRODUK dan LAWAN BICARA.
     * Dipanggil oleh messageService.getConversation() -> GET /messages/{productId}/{otherUserId}
     */
    public function getConversationDetail($productId, $otherUserId)
    {
        $myId = Auth::id();
        
        $messages = Message::where('product_id', $productId)
            ->where(function($query) use ($myId, $otherUserId) {
                $query->where(function($q) use ($myId, $otherUserId) {
                    $q->where('sender_id', $myId)->where('receiver_id', $otherUserId);
                })->orWhere(function($q) use ($myId, $otherUserId) {
                    $q->where('sender_id', $otherUserId)->where('receiver_id', $myId);
                });
            })
            ->orderBy('created_at', 'asc')
            ->get();

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
            'product_id' => 'required|exists:products,id',
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

    /**
     * Tandai pesan sebagai sudah dibaca.
     * Dipanggil oleh POST /messages/read
     */
    public function markAsRead(Request $request)
    {
        $request->validate([
            'product_id' => 'required',
            'sender_id' => 'required' // ID orang yang mengirim pesan ke kita
        ]);

        Message::where('product_id', $request->product_id)
               ->where('sender_id', $request->sender_id)
               ->where('receiver_id', Auth::id())
               ->where('is_read', false)
               ->update(['is_read' => true]);

        return response()->json(['message' => 'Pesan telah dibaca']);
    }

    /**
     * Menghitung unread count (Opsional, jika masih dibutuhkan frontend)
     */
    public function getUnreadCount()
    {
        $count = Message::where('receiver_id', Auth::id())
                        ->where('is_read', false)
                        ->count();
        
        return response()->json(['unread_count' => $count]);
    }
}

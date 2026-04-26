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
    /**
     * DASHBOARD / INBOX: Mengambil daftar percakapan unik (latest message per conversation).
     * Memperbaiki masalah "berantakan" dengan mengelompokkan pesan berdasarkan produk dan lawan bicara.
     */
    public function index()
    {
        $userId = Auth::id();
        
        // Query untuk mengambil ID pesan terbaru dari setiap percakapan
        // Percakapan unik diidentifikasi oleh product_id dan (sender_id + receiver_id)
        $subQuery = Message::where('sender_id', $userId)
            ->orWhere('receiver_id', $userId)
            ->selectRaw('MAX(id) as id')
            ->groupByRaw('product_id, IF(sender_id = ?, receiver_id, sender_id)', [$userId]);

        $latestMessageIds = $subQuery->pluck('id');

        $messages = Message::whereIn('id', $latestMessageIds)
            ->with(['sender.profile', 'receiver.profile', 'product'])
            ->orderBy('created_at', 'desc')
            ->get();

        // Tambahkan unread count untuk setiap percakapan
        $messages->transform(function ($message) use ($userId) {
            $otherUserId = ($message->sender_id == $userId) ? $message->receiver_id : $message->sender_id;
            
            $message->unread_count = Message::where('product_id', $message->product_id)
                ->where('sender_id', $otherUserId)
                ->where('receiver_id', $userId)
                ->where('is_read', false)
                ->count();
            
            return $message;
        });

        return response()->json($messages);
    }

    /**
     * CHAT ROOM: Mengambil detail chat berdasarkan PRODUK dan LAWAN BICARA.
     */
    public function getConversationDetail($productId, $otherUserId)
    {
        $myId = Auth::id();
        
        // Handle case where productId might be string 'null' from frontend
        $pid = ($productId === 'null' || $productId === 'undefined') ? null : $productId;

        $messages = Message::where('product_id', $pid)
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

    /**
     * Tandai pesan sebagai sudah dibaca.
     * Sesuai permintaan rekan tim (logic dari screenshot).
     */
    public function markAsRead(Request $request)
    {
        $request->validate([
            'product_id' => 'nullable', // Diubah ke nullable untuk fleksibilitas
            'sender_id' => 'required'   // ID orang yang mengirim pesan ke kita
        ]);

        $userId = Auth::id();
        $productId = $request->product_id;
        $senderId = $request->sender_id;

        Message::where('product_id', $productId)
               ->where('sender_id', $senderId)
               ->where('receiver_id', $userId)
               ->update(['is_read' => true]);

        return response()->json([
            'status' => 'success',
            'message' => 'Pesan telah ditandai sebagai dibaca'
        ]);
    }

    /**
     * Menghitung total unread count untuk notifikasi global.
     * Sesuai permintaan rekan tim (logic dari screenshot).
     */
    public function getUnreadCount()
    {
        $count = Message::where('receiver_id', Auth::id())
                        ->where('is_read', false)
                        ->count();
        
        return response()->json(['unread_count' => $count]);
    }
}

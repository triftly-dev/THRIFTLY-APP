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
        
        // Optimasi: Gunakan Join dan Subquery untuk mendapatkan pesan terakhir DAN unread count dalam SATU query
        // Ini menghindari N+1 problem (query di dalam loop)
        $messages = Message::from('messages as m')
            ->select('m.*')
            ->selectSub(function ($query) use ($userId) {
                $query->from('messages')
                    ->whereColumn('product_id', 'm.product_id')
                    ->where('receiver_id', $userId)
                    ->where('is_read', false)
                    ->where(function($q) use ($userId) {
                        $q->whereColumn('sender_id', 'm.sender_id')
                          ->orWhereColumn('sender_id', 'm.receiver_id');
                    })
                    ->where(function($q) use ($userId) {
                        $q->whereColumn('receiver_id', 'm.sender_id')
                          ->orWhereColumn('receiver_id', 'm.receiver_id');
                    })
                    ->selectRaw('count(*)');
            }, 'unread_count')
            ->whereIn('m.id', function ($query) use ($userId) {
                $query->selectRaw('MAX(id)')
                    ->from('messages')
                    ->where('sender_id', $userId)
                    ->orWhere('receiver_id', $userId)
                    ->groupByRaw('product_id, IF(sender_id = ?, receiver_id, sender_id)', [$userId]);
            })
            ->with(['sender', 'receiver', 'product'])
            ->orderBy('m.created_at', 'desc')
            ->paginate(15); // Tambahkan pagination agar tidak membebani RAM 1GB

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
        $userId = Auth::id();
        $cacheKey = "unread_count_{$userId}";

        // Caching selama 30 detik untuk meringankan beban VPS RAM 1GB
        // Jika ada ratusan request dalam 30 detik, database hanya dipukul 1x.
        $count = \Cache::remember($cacheKey, 30, function () use ($userId) {
            return Message::where('receiver_id', $userId)
                            ->where('is_read', false)
                            ->count();
        });
        
        return response()->json(['unread_count' => (int)$count]);
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\Newsletter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class NewsletterController extends Controller
{
    public function subscribe(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|unique:newsletters,email',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Email ini sudah berlangganan atau tidak valid.',
                'errors' => $validator->errors()
            ], 400);
        }

        Newsletter::create([
            'email' => $request->email
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Berhasil berlangganan newsletter!'
        ], 201);
    }

    /**
     * Alias untuk sinkronisasi dengan frontend rekan (meminta method 'store')
     */
    public function store(Request $request)
    {
        return $this->subscribe($request);
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\Blog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class BlogController extends Controller
{
    public function index()
    {
        $blogs = Blog::orderBy('published_at', 'desc')->get();
        return response()->json($blogs);
    }

    public function show($id)
    {
        $blog = Blog::find($id);
        if (!$blog) {
            return response()->json(['message' => 'Blog tidak ditemukan'], 404);
        }
        return response()->json($blog);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string',
            'content' => 'required|string',
            'category' => 'required|string',
            'author_name' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        $blog = Blog::create([
            'title' => $request->title,
            'content' => $request->content,
            'image_url' => $request->image_url,
            'category' => $request->category,
            'author_name' => $request->author_name,
            'published_at' => $request->published_at ?? now(),
        ]);

        return response()->json($blog, 201);
    }
}

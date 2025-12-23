<?php

namespace App\Http\Controllers\Api;

use App\Http\Api\UserApi;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ApiController extends Controller
{
    public function postFetchUsers(Request $request)
    {
        $authToken = $request->bearerToken();
        $search = $request->search ?? '';

        $response = UserApi::getUsers(
            $authToken,
            $search,
            5,
            ''
        );

        $usersList = [];
        if ($response && isset($response->data->users)) {
            $usersList = collect($response->data->users)->map(function ($user) {
                return (object) $user;
            })->all();
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Berhasil mengambil daftar pengguna',
            'data' => [
                'users' => $usersList,
            ],
        ]);
    }
}

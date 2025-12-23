<?php

namespace App\Http\Middleware;

use App\Http\Api\UserApi;
use App\Models\HakAksesModel;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ApiCheckTokenMiddleware
{
    /**
     * @return Response|\Illuminate\Http\JsonResponse
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Ambil token dari header Authorization
        $authToken = $request->bearerToken();

        if (empty($authToken)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Akses ditolak, token tidak disediakan',
            ], 403);
        }

        $response = UserApi::getMe($authToken);

        if (! isset($response->data->user)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Akses ditolak, token tidak valid',
            ], 403);
        }

        // Dapatkan hak akses user
        $auth = $response->data->user;
        $akses = HakAksesModel::where('user_id', $auth->id)->first();
        $auth->akses = isset($akses->akses) ? explode(',', $akses->akses) : [];

        $request->attributes->set('auth', $auth);

        return $next($request);
    }
}

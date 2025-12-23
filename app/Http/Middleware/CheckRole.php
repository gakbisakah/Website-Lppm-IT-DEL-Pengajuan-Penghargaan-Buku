<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckRole
{
    public function handle(Request $request, Closure $next, $rolesRequired)
    {
        $auth = $request->attributes->get('auth');

        // Ambil akses user, pastikan array
        if (! isset($auth->akses)) {
            $aksesUser = [];
        } elseif (is_string($auth->akses)) {
            $aksesUser = array_map('trim', explode(',', $auth->akses));
        } elseif (is_array($auth->akses)) {
            $aksesUser = array_map('trim', $auth->akses);
        } else {
            $aksesUser = [];
        }

        // Ambil roles user dari service user
        $rolesUser = isset($auth->roles) ? (array) $auth->roles : [];
        $rolesUser = array_map('trim', $rolesUser);

        // rolesRequired bisa string dengan "|" untuk kombinasi
        if (is_string($rolesRequired)) {
            $rolesRequired = array_map('trim', explode('|', $rolesRequired));
        }

        // Cek akses
        $hasAccess = false;

        // Jika user punya Lppm Ketua, akses diizinkan
        if (in_array('Lppm Ketua', $aksesUser) || in_array('Lppm Ketua', $rolesUser)) {
            $hasAccess = true;
        } else {
            // cek rolesRequired seperti biasa
            foreach ($rolesRequired as $role) {
                if (in_array($role, $aksesUser) || in_array($role, $rolesUser)) {
                    $hasAccess = true;
                    break;
                }
            }
        }

        // Jika tidak punya akses, abort 403 tanpa view
        if (! $hasAccess) {
            abort(403, 'You do not have access to this page.');
        }

        return $next($request);
    }
}

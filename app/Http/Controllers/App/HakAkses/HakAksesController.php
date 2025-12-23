<?php

namespace App\Http\Controllers\App\HakAkses;

use App\Helper\ToolsHelper;
use App\Http\Api\UserApi;
use App\Http\Controllers\Controller;
use App\Models\HakAksesModel;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HakAksesController extends Controller
{
    public function index(Request $request)
    {
        $auth = $request->attributes->get('auth');

        // Hanya Admin atau role Admin yang boleh akses halaman
        if (! in_array('Admin', $auth->akses) && ! in_array('Admin', $auth->roles)) {
            return redirect()->route('home');
        }

        return Inertia::render('App/HakAkses/Index', [
            'aksesList' => $this->aksesList(),
        ]);
    }

    private function aksesList()
    {
        $hakAkses = HakAksesModel::all();
        $token = ToolsHelper::getAuthToken();
        $userIds = $hakAkses->pluck('user_id')->toArray();

        $response = UserApi::postReqUsersByIds($token, $userIds);
        $users = $response->data->users ?? [];

        return $hakAkses->map(function ($item) use ($users) {
            $user = collect($users)->firstWhere('id', $item->user_id);

            return (object) [
                'id' => $item->id ?? null,
                'user_id' => $item->user_id,
                'user' => $user ?? null,
                'data_akses' => collect(explode(',', $item->akses))
                    ->map(fn ($v) => trim($v))
                    ->sort()
                    ->values()
                    ->toArray(),
            ];
        })->values()->all();
    }

    public function postChange(Request $request)
    {
        $auth = $request->attributes->get('auth');

        if (! in_array('Admin', $auth->akses) && ! in_array('Admin', $auth->roles)) {
            return redirect()->back()->with('error', 'Anda tidak memiliki izin untuk mengubah hak akses.');
        }

        $userId = $request->get('userId');
        $akses = implode(',', $request->get('hakAkses'));

        HakAksesModel::where('user_id', $userId)->delete();

        HakAksesModel::create([
            'id' => \Illuminate\Support\Str::uuid()->toString(),
            'user_id' => $userId,
            'akses' => trim($akses, ','),
        ]);

        return redirect()->back()->with('success', 'Hak akses berhasil diperbarui.');
    }

    public function postDelete(Request $request)
    {
        $auth = $request->attributes->get('auth');

        if (! in_array('Admin', $auth->akses) && ! in_array('Admin', $auth->roles)) {
            return redirect()->back()->with('error', 'Anda tidak memiliki izin untuk mengubah hak akses.');
        }

        HakAksesModel::where('user_id', $request->get('userId'))->delete();

        return redirect()->back()->with('success', 'Hak akses pengguna berhasil dihapus.');
    }

    public function postDeleteSelected(Request $request)
    {
        $auth = $request->attributes->get('auth');

        if (! in_array('Admin', $auth->akses) && ! in_array('Admin', $auth->roles)) {
            return redirect()->back()->with('error', 'Anda tidak memiliki izin untuk mengubah hak akses.');
        }

        HakAksesModel::whereIn('user_id', $request->get('userIds'))->delete();

        return redirect()->back()->with('success', 'Hak akses untuk pengguna yang dipilih berhasil dihapus.');
    }
}
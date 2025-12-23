<?php

namespace App\Http\Controllers\Auth;

use App\Helper\ApiHelper;
use App\Helper\ToolsHelper;
use App\Http\Api\UserApi;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

##authentication

class AuthController extends Controller
{
    // Login
    // ===========================================
    public function login()
    {
        $urlLoginSSO = config('sdi.sso_authorize_url').'?'.http_build_query([
            'client_id' => config('sdi.sso_client_id'),
        ]);

        $data = [
            'urlLoginSSO' => $urlLoginSSO,
        ];

        return Inertia::render('auth/login-page', $data);
    }

    public function postLoginCheck(Request $request)
    {
        $authToken = $request->authToken;

        $resLoginInfo = UserApi::getLoginInfo($authToken);
        if (! $resLoginInfo || $resLoginInfo->status != 'success') {
            return redirect()->route('auth.logout');
        }

        ToolsHelper::setAuthToken($authToken);

        $response = UserApi::getMe($authToken);
        if (! $response || $response->status != 'success') {
            return redirect()->route('auth.totp');
        }

        // Login ke Laravel
        $this->loginLaravelUser($response->data->user);

        return redirect()->route('home');
    }

    public function postLogin(Request $request)
    {
        $request->validate([
            'username' => 'required|string|max:50',
            'password' => 'required|string',
        ]);

        $response = UserApi::postLogin(
            $request->systemId ?? 'Unknown',
            config('app.name'),
            $request->info ?? 'Unknown',
            $request->username,
            $request->password
        );

        if (! isset($response->data->token)) {
            return back()->withErrors([
                'username' => 'Gagal login, silakan coba lagi.',
            ])->onlyInput('username');
        }

        ToolsHelper::setAuthToken($response->data->token);

        $resUser = UserApi::getMe($response->data->token);
        if ($resUser && isset($resUser->data->user)) {
            $this->loginLaravelUser($resUser->data->user);
        }

        return redirect()->route('auth.totp');
    }

    // Logout
    // ===========================================
    public function logout()
    {
        ToolsHelper::setAuthToken('');
        Auth::logout();

        return Inertia::render('auth/logout-page');
    }

    // TOTP
    // ===========================================
    public function totp()
    {
        $authToken = ToolsHelper::getAuthToken();
        if (! $authToken) {
            return redirect()->route('auth.login');
        }

        $resLoginInfo = UserApi::getLoginInfo($authToken);
        if (! $resLoginInfo || $resLoginInfo->status != 'success') {
            ToolsHelper::setAuthToken('');
            Auth::logout();

            return redirect()->route('auth.logout');
        }

        $response = UserApi::getMe($authToken);
        if (! $response || $response->status == 'success') {
            return redirect()->route('home');
        }

        $totpSetup = UserApi::postTotpSetup($authToken);
        $qrCode = null;
        if ($totpSetup && $totpSetup->status == 'success') {
            $qrCode = $totpSetup->data->qrCode;
        }

        $data = [
            'authToken' => $authToken,
            'qrCode' => $qrCode,
        ];

        return Inertia::render('auth/totp-page', $data);
    }

    public function postTotp(Request $request)
    {
        $authToken = ToolsHelper::getAuthToken();
        if (! $authToken) {
            return redirect()->route('auth.login');
        }

        $request->validate([
            'kodeOTP' => 'required|string|size:6',
        ], [
            'kodeOTP.required' => 'Kode verifikasi wajib diisi.',
            'kodeOTP.size' => 'Kode verifikasi harus terdiri dari 6 digit.',
        ]);

        $response = UserApi::postTotpVerify($authToken, $request->kodeOTP);
        if (! $response || $response->status != 'success') {
            return back()->withErrors([
                'kodeOTP' => 'Kode verifikasi tidak valid. Silakan coba lagi.',
            ])->onlyInput('kodeOTP');
        }

        return redirect()->route('home');
    }

    // SSO Callback
    public function ssoCallback(Request $request)
    {
        $code = $request->query('code');
        if (! $code) {
            return redirect()->route('auth.login')->with('error', 'Kode otorisasi tidak ditemukan');
        }

        $urlToken = config('sdi.sso_token_url');

        $response = ApiHelper::sendRequest($urlToken, 'POST', [
            'client_id' => config('sdi.sso_client_id'),
            'client_secret' => config('sdi.sso_client_secret'),
            'code' => $code,
        ]);

        if (! isset($response->access_token)) {
            return redirect()->route('auth.login')->with('error', 'Gagal mendapatkan token akses dari SSO');
        }

        ToolsHelper::setAuthToken($response->access_token);

        $resUser = UserApi::getMe($response->access_token);
        if ($resUser && isset($resUser->data->user)) {
            $this->loginLaravelUser($resUser->data->user);
        }

        return redirect()->route('home');
    }

    // ================= Helper: Login Laravel =================
    private function loginLaravelUser($apiUser)
    {
        $user = User::updateOrCreate(
            ['email' => $apiUser->email],  // cek berdasarkan email
            [
                'id' => $apiUser->id,       // update id jika ada perubahan
                'name' => $apiUser->name,
                'password' => bcrypt('dummy-password'), // tidak dipakai tapi wajib ada
            ]
        );

        Auth::login($user);
    }
}

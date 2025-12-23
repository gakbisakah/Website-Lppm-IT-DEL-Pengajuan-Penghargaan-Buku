<?php

namespace App\Http\Api;

use App\Helper\ApiHelper;

class UserApi
{
    private static function getUrl($path)
    {
        return config('sdi.api_users_url').$path;
    }

    // Fungsi umum untuk mengirimkan request API
    private static function sendRequest($method, $path, $data = [], $authToken = '')
    {
        $url = self::getUrl($path);
        $method = strtolower($method);

        return ApiHelper::sendRequest($url, $method, $data, $authToken);
    }

    // Fungsi khusus untuk mengirimkan file (upload)
    private static function sendRequestWithFile($method, $path, $data = [], $authToken = '', $fileKey = 'file', $file = null)
    {
        $url = self::getUrl($path);

        return ApiHelper::sendRequestWithFile($url, $method, $data, $authToken, $fileKey, $file);
    }

    // Post Register
    public static function postRegister($username, $password)
    {
        $data = [
            'username' => $username,
            'password' => $password,
        ];

        return self::sendRequest('post', '/auth/register', $data);
    }

    // Post Login
    public static function postLogin($system_id, $platform, $info, $username, $password)
    {
        $data = [
            'system_id' => $system_id,
            'platform' => $platform,
            'info' => $info,
            'username' => $username,
            'password' => $password,
        ];

        return self::sendRequest('post', '/auth/login', $data);
    }

    // Get Login Info
    public static function getLoginInfo($authToken)
    {
        $data = [];

        return self::sendRequest('get', '/auth/login/info', $data, $authToken);
    }

    // Get Login Info All
    public static function getLoginInfoAll($authToken)
    {
        $data = [];

        return self::sendRequest('get', '/auth/login/info/all', $data, $authToken);
    }

    // Post Logout
    public static function postLogout($authToken)
    {
        $data = [];

        return self::sendRequest('post', '/auth/logout', $data, $authToken);
    }

    // Post Logout All
    public static function postLogoutAll($authToken)
    {
        $data = [];

        return self::sendRequest('post', '/auth/logout/all', $data, $authToken);
    }

    // Post Logout By Token Id
    public static function postLogoutByTokenId($authToken, $loginTokenId)
    {
        $data = [];

        return self::sendRequest('post', "/auth/logout/$loginTokenId", $data, $authToken);
    }

    // Post Forget Password Info
    public static function postForgetPasswordInfo($email)
    {
        $data = [
            'email' => $email,
        ];

        return self::sendRequest('post', '/auth/forget/info', $data);
    }

    // Post Forget Password Send Email
    public static function postForgetPasswordSendEmail($email)
    {
        $data = [
            'email' => $email,
        ];

        return self::sendRequest('post', '/auth/forget/send-email', $data);
    }

    // Post Forget Password Reset
    public static function postForgetPasswordReset($email, $token, $password)
    {
        $data = [
            'email' => $email,
            'token' => $token,
            'password' => $password,
        ];

        return self::sendRequest('post', '/auth/forget/reset-password', $data);
    }

    // Post TOTP Setup
    public static function postTotpSetup($authToken)
    {
        $data = [];

        return self::sendRequest('post', '/auth/totp/setup', $data, $authToken);
    }

    // Post TOTP Verify
    public static function postTotpVerify($authToken, $code)
    {
        $data = [
            'code' => $code,
        ];

        return self::sendRequest('post', '/auth/totp/verify', $data, $authToken);
    }

    // Roles
    // ------------------------------

    // Get All Roles
    public static function getRoles($authToken)
    {
        $data = [];

        return self::sendRequest('get', '/roles', $data, $authToken);
    }

    // Post Roles
    public static function postRole($authToken, $name)
    {
        $data = [
            'name' => $name,
        ];

        return self::sendRequest('post', '/roles', $data, $authToken);
    }

    // Delete Roles
    public static function deleteRole($authToken, $roleId)
    {
        $data = [];

        return self::sendRequest('delete', "/roles/$roleId", $data, $authToken);
    }

    // Users
    // ------------------------------

    // Get Users
    public static function getUsers($authToken, $search = '', $limit = 100, $alias = '')
    {
        $data = [
            'search' => $search,
            'limit' => $limit,
            'alias' => $alias,
        ];

        return self::sendRequest('get', '/users', $data, $authToken);
    }

    // Get Users Online
    public static function getUsersOnline($authToken)
    {
        $data = [];

        return self::sendRequest('get', '/users/online', $data, $authToken);
    }

    // Get Users Birthday
    public static function getUsersBirthday($authToken, $timeBirthday)
    {
        $data = [];

        return self::sendRequest('get', "/users/birthday/$timeBirthday", $data, $authToken);
    }

    // Get Me
    public static function getMe($authToken)
    {
        $data = [];

        return self::sendRequest('get', '/users/me', $data, $authToken);
    }

    // Put Me Photo
    public static function putMePhoto($authToken, $photo)
    {
        $data = [];

        return self::sendRequestWithFile('put', '/users/me/photo', $data, $authToken, 'photo', $photo);
    }

    // Post Request Users By User IDs
    public static function postReqUsersByIds($authToken, $userIds)
    {
        if (is_array($userIds)) {
            $userIds = implode(',', $userIds);
        }

        $data = [
            'user_ids' => $userIds,
        ];

        return self::sendRequest('post', '/users/request', $data, $authToken);
    }

    // Post Request Users By Usernames
    public static function postReqUsersByUsernames($authToken, $usernames)
    {
        $data = [
            'usernames' => $usernames,
        ];

        return self::sendRequest('post', '/users/request-by-usernames', $data, $authToken);
    }

    // Put Me Password
    public static function putMePassword($authToken, $password, $oldPassword)
    {
        $data = [
            'password' => $password,
            'old_password' => $oldPassword,
        ];

        $response = self::sendRequest('put', '/users/me/password', $data, $authToken);

        return $response ? json_decode(json_encode($response)) : null;
    }

    // Put Me Whatsapp
    public static function putMeWhatsapp($authToken, $whatsapp, $password)
    {
        $data = [
            'password' => $password,
            'whatsapp' => $whatsapp,
        ];

        $response = self::sendRequest('put', '/users/me/whatsapp', $data, $authToken);

        return $response ? json_decode(json_encode($response)) : null;
    }

    // Delete Me
    public static function deleteMe($authToken, $password, $code)
    {
        $data = [
            'password' => $password,
            'code' => $code,
        ];

        return self::sendRequest('delete', '/users/me', $data, $authToken);
    }

    // Get Users Name by IDs
    public static function getUsersNameByIds($authToken, $userIds)
    {
        $data = [];

        return self::sendRequest('get', "/users/name/$userIds", $data, $authToken);
    }

    // Get User by user id
    public static function getUserById($authToken, $userId)
    {
        $data = [];

        return self::sendRequest('get', "/users/$userId", $data, $authToken);
    }

    // Get User by Username
    public static function getUserByUsername($authToken, $username)
    {
        $data = [];

        return self::sendRequest('get', "/users/username/$username", $data, $authToken);
    }

    // Reset User TOTP
    public static function deleteUserTotp($authToken, $userId, $password)
    {
        $data = [
            'password' => $password,
        ];

        return self::sendRequest('delete', "/users/totp/$userId", $data, $authToken);
    }
}

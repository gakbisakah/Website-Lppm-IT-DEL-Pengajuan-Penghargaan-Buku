<?php

namespace App\Helper;

use Illuminate\Support\Facades\Http;

class ApiHelper
{
    /**
     * Mengirim HTTP request ke URL tertentu
     *
     * @param  string  $url  URL tujuan request
     * @param  string  $method  HTTP method (GET, POST, PUT, DELETE, etc.)
     * @param  array  $data  Data yang dikirim (optional)
     * @param  string  $authToken  Token autentikasi Bearer (optional)
     * @return object Response dari server dalam format object
     *
     * @throws \Throwable Jika terjadi error pada HTTP request
     */
    public static function sendRequest($url, $method, $data = [], $authToken = '')
    {
        $method = strtolower($method);

        try {
            $response = Http::asJson()
                ->withHeaders([
                    'Accept' => 'application/json',
                    'Authorization' => 'Bearer '.$authToken,
                ])
                ->$method($url, $data);

            return $response->object();
        } catch (\Throwable $e) {
            return (object) [
                'status' => 'error',
                'message' => 'Gagal menghubungi server: '.$e->getMessage(),
            ];
        }
    }

    /**
     * Mengirim HTTP request dengan file attachment
     *
     * @param  string  $url  URL tujuan request
     * @param  string  $method  HTTP method (GET, POST, PUT, DELETE, etc.)
     * @param  array  $data  Data form yang dikirim
     * @param  string  $authToken  Token autentikasi Bearer
     * @param  string  $fileKey  Nama key untuk file upload (default: 'file')
     * @param  \Illuminate\Http\UploadedFile|null  $file  File yang akan diupload
     * @return object Response dari server dalam format object
     *
     * @example
     * $response = HttpClient::sendRequestWithFile(
     *     'https://api.example.com/upload',
     *     'POST',
     *     ['title' => 'Document'],
     *     'token123',
     *     'document',
     *     $request->file('document')
     * );
     */
    public static function sendRequestWithFile($url, $method, $data = [], $authToken = '', $fileKey = 'file', $file = null)
    {
        try {
            $request = Http::withHeaders([
                'Accept' => 'application/json',
                'Authorization' => 'Bearer '.$authToken,
            ]);

            $method = strtolower($method);

            if ($file) {
                $response = $request->attach(
                    $fileKey,
                    fopen($file->getRealPath(), 'r'),
                    $file->getClientOriginalName()
                )->$method($url, $data);
            } else {
                $response = $request->$method($url, $data);
            }

            return $response->object();
        } catch (\Throwable $e) {
            return (object) [
                'status' => 'error',
                'message' => 'Gagal menghubungi server: '.$e->getMessage(),
            ];
        }
    }
}

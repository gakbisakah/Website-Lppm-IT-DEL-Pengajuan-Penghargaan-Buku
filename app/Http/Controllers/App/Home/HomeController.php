<?php

namespace App\Http\Controllers\App\Home;

use App\Helper\ToolsHelper;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Request;

class HomeController extends Controller
{
    public function index(Request $request)
    {
        $auth = $request->attributes->get('auth');
        $authToken = ToolsHelper::getAuthToken();

        return Inertia::render('app/home/home-page', [
            'auth' => Inertia::always($auth),
            'pageName' => Inertia::always('Beranda'),
            'authToken' => Inertia::always($authToken),
        ]);
    }
}

<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class HakAksesController extends Controller
{
    public function index()
    {
        // Path mengarah ke resources/js/Pages/App/HakAkses/HakAksesPage.jsx
        return Inertia::render('App/HakAkses/HakAksesPage');
    }
}

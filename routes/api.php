<?php

use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\GroupController;
use App\Http\Controllers\MfaController;
use App\Http\Controllers\ResourceController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Organized cleanly following the INT221 Advanced Routing syllabus:
| - Route Groups, Route Prefixing (Unit III)
| - Parameter Constraints (Unit III)
| - Named Routes (Unit III)
|
*/

// --- Public Authentication Routes ---
Route::name('auth.')->group(function () {
    Route::post('/register', [AuthController::class, 'register'])->name('register');
    Route::post('/login', [AuthController::class, 'login'])->name('login');

    // Google OAuth Routes
    Route::prefix('auth/google')->group(function () {
        Route::get('/redirect', [AuthController::class, 'redirectToGoogle'])->name('google.redirect');
        Route::get('/callback', [AuthController::class, 'handleGoogleCallback'])->name('google.callback');
    });
});

// --- Parameter Constraints (Unit III) for Status Checking ---
Route::get('/users/status/{unique_id}', [AuthController::class, 'checkStatus'])
    ->where('unique_id', '[A-Z]{2}-\d{6}')
    ->name('users.status');

// --- MFA Route Group ---
Route::prefix('mfa')->name('mfa.')->group(function () {
    Route::post('/setup', [MfaController::class, 'setup'])->name('setup');
    Route::post('/enable', [MfaController::class, 'enable'])->name('enable');
    Route::post('/verify', [MfaController::class, 'verify'])->name('verify');
});

// --- Protected Operator Node Ports (Unit III: Route Groups and Middleware) ---
Route::middleware('auth')->group(function () {
    
    // User Operations
    Route::post('/logout', [AuthController::class, 'logout'])->name('auth.logout');
    Route::get('/user', function (Request $request) {
        return $request->user();
    })->name('auth.user');
    Route::post('/users/validate', [AuthController::class, 'validateParticipation'])->name('users.validate');

    // Groups Routes (Unit III: Route Prefixing & Grouping)
    Route::prefix('groups')->name('groups.')->group(function () {
        Route::get('/', [GroupController::class, 'index'])->name('index');
        Route::get('/discover', [GroupController::class, 'discover'])->name('discover');
        Route::post('/', [GroupController::class, 'store'])->middleware('validated')->name('store');
        
        // Specific Group Operations
        Route::prefix('{id}')->group(function () {
            Route::get('/', [GroupController::class, 'show'])->name('show');
            Route::get('/resources', [ResourceController::class, 'groupResources'])->name('resources');
            Route::post('/join', [GroupController::class, 'join'])->name('join');
            Route::post('/leave', [GroupController::class, 'leave'])->name('leave');
            
            // Membership & Administrative Controls
            Route::get('/requests', [GroupController::class, 'requests'])->name('requests');
            Route::post('/approve/{userId}', [GroupController::class, 'approve'])->name('approve');
            Route::post('/reject/{userId}', [GroupController::class, 'reject'])->name('reject');
            Route::get('/members', [GroupController::class, 'members'])->name('members');
            Route::post('/promote/{userId}', [GroupController::class, 'promote'])->name('promote');
            Route::post('/demote/{userId}', [GroupController::class, 'demote'])->name('demote');
        })->where('id', '[0-9]+');
    });

    // Resources Unified System Routes (Unit III Restful Resource-like endpoints)
    Route::prefix('resources')->name('resources.')->group(function () {
        Route::get('/categories/summary', [ResourceController::class, 'categorySummary'])->name('categories.summary');
        Route::get('/', [ResourceController::class, 'index'])->name('index');
        Route::post('/', [ResourceController::class, 'store'])->middleware('validated')->name('store');
        
        Route::prefix('{id}')->group(function () {
            Route::get('/', [ResourceController::class, 'show'])->name('show');
            Route::get('/metrics', [ResourceController::class, 'metrics'])->name('metrics');
            Route::put('/', [ResourceController::class, 'update'])->middleware('validated')->name('update');
            Route::delete('/', [ResourceController::class, 'destroy'])->middleware('validated')->name('destroy');
        })->where('id', '[0-9]+');
    });

    // Analytics
    Route::get('/analytics', [AnalyticsController::class, 'index'])->name('analytics.index');
});


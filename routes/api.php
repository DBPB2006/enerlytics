<?php

use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\GroupController;
use App\Http\Controllers\MfaController;
use App\Http\Controllers\ResourceController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/auth/google/redirect', [AuthController::class, 'redirectToGoogle']);
Route::get('/auth/google/callback', [AuthController::class, 'handleGoogleCallback']);

Route::get('/users/status/{unique_id}', [AuthController::class, 'checkStatus']);

Route::middleware('auth')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::post('/users/validate', [AuthController::class, 'validateParticipation']);

    // Groups
    Route::get('/groups', [GroupController::class, 'index']);
    Route::get('/groups/discover', [GroupController::class, 'discover']);
    Route::get('/groups/{id}', [GroupController::class, 'show']);
    Route::get('/groups/{id}/resources', [ResourceController::class, 'groupResources']);
    Route::post('/groups', [GroupController::class, 'store'])->middleware('validated');
    Route::post('/groups/{id}/join', [GroupController::class, 'join']);
    Route::post('/groups/{id}/leave', [GroupController::class, 'leave']);

    // Membership Management
    Route::get('/groups/{id}/requests', [GroupController::class, 'requests']);
    Route::post('/groups/{id}/approve/{userId}', [GroupController::class, 'approve']);
    Route::post('/groups/{id}/reject/{userId}', [GroupController::class, 'reject']);
    Route::get('/groups/{id}/members', [GroupController::class, 'members']);
    Route::post('/groups/{id}/promote/{userId}', [GroupController::class, 'promote']);
    Route::post('/groups/{id}/demote/{userId}', [GroupController::class, 'demote']);

    // Resources (Unified System)
    Route::get('/resources/categories/summary', [ResourceController::class, 'categorySummary']);
    Route::get('/resources', [ResourceController::class, 'index']);
    Route::post('/resources', [ResourceController::class, 'store'])->middleware('validated');
    Route::get('/resources/{id}', [ResourceController::class, 'show']);
    Route::get('/resources/{id}/metrics', [ResourceController::class, 'metrics']);
    Route::put('/resources/{id}', [ResourceController::class, 'update'])->middleware('validated');

    Route::delete('/resources/{id}', [ResourceController::class, 'destroy'])->middleware('validated');

    // Analytics
    Route::get('/analytics', [AnalyticsController::class, 'index']);
});

Route::post('/mfa/setup', [MfaController::class, 'setup']);
Route::post('/mfa/enable', [MfaController::class, 'enable']);
Route::post('/mfa/verify', [MfaController::class, 'verify']);

<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Laravel\Socialite\Facades\Socialite;

class AuthController extends Controller
{
    /**
     * Redirect to Google OAuth provider (Unit II Redirects)
     */
    public function redirectToGoogle(Request $request)
    {
        $mode = $request->query('mode', 'login');
        $mfa = $request->query('mfa_opt_in', 0);

        $state = json_encode([
            'mode' => $mode,
            'mfa' => $mfa,
        ]);

        return Socialite::driver('google')
            ->stateless()
            ->with(['state' => $state])
            ->redirect();
    }

    /**
     * Handle Google OAuth Callback (Unit II redirects & Unit IV session management)
     */
    public function handleGoogleCallback(Request $request)
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();
            $state = json_decode($request->query('state'), true);

            $mode = $state['mode'] ?? 'login';
            $mfaOptIn = $state['mfa'] ?? 0;

            $user = User::where('email', $googleUser->getEmail())->first();

            if (! $user) {
                $user = User::create([
                    'name' => $googleUser->getName(),
                    'email' => $googleUser->getEmail(),
                    'google_id' => $googleUser->getId(),
                    'avatar' => $googleUser->getAvatar(),
                    'password' => Hash::make(uniqid()),
                    'mfa_required' => (bool) $mfaOptIn,
                    'role' => 'citizen',
                    'is_validated' => true,
                    'unique_id' => null,
                ]);
            }

            // Enforce that if user is a community leader or belongs to any community group, MFA is required.
            if ($user->role === 'community_leader' || $user->groups()->exists()) {
                if (! $user->mfa_required) {
                    $user->update(['mfa_required' => true]);
                }
            }

            // MFA Check MUST happen BEFORE token creation
            if ($user->mfa_required) {
                if (! $user->mfa_enabled) {
                    return redirect("http://localhost:5173/auth/callback?mfa_setup_required=1&user_id={$user->id}");
                }

                return redirect("http://localhost:5173/auth/callback?mfa_required=1&user_id={$user->id}");
            }

            Auth::login($user);
            
            // Unit IV: Storing session data and regenerating session identifier
            $request->session()->regenerate();

            return redirect("http://localhost:5173/auth/callback?token=session_token");

        } catch (\Exception $e) {
            Log::error('GOOGLE OAUTH ERROR: '.$e->getMessage());

            return redirect('http://localhost:5173/login?error='.urlencode($e->getMessage()));
        }
    }

    /**
     * Register a new operator (Unit V validations with custom messages & Unit IV sessions)
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'sometimes|string|in:citizen,energy_provider,community_leader',
        ], [
            'name.required' => 'The operator name is mandatory.',
            'email.required' => 'A valid email address is required.',
            'email.email' => 'Please provide a standard email format.',
            'email.unique' => 'This email is already registered in the grid.',
            'password.required' => 'A secure password is required.',
            'password.min' => 'The password must contain at least 8 characters.',
        ]);

        $role = $validated['role'] ?? 'citizen';
        $mfaOptIn = filter_var($request->input('mfa_opt_in'), FILTER_VALIDATE_BOOLEAN);

        // Generate unique_id for energy providers or community leaders
        $uniqueId = null;
        if (in_array($role, ['energy_provider', 'community_leader'])) {
            $prefix = $role === 'energy_provider' ? 'EP' : 'CL';
            do {
                $uniqueId = $prefix . '-' . str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
            } while (User::where('unique_id', $uniqueId)->exists());
        }

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'mfa_required' => $mfaOptIn || ($role === 'community_leader'),
            'role' => $role,
            'unique_id' => $uniqueId,
            'is_validated' => ($role === 'citizen'),
        ]);

        if ($user->mfa_required) {
            return response()->json([
                'mfa_setup_required' => true,
                'user_id' => $user->id,
            ], 201);
        }

        Auth::login($user);
        
        // Unit IV: Session management
        $request->session()->regenerate();

        return response()->json([
            'user' => $user,
            'token' => 'session_token',
        ], 201);
    }

    /**
     * Log in credentials check (Unit V validation & Unit IV sessions)
     */
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ], [
            'email.required' => 'Email is required to verify identity.',
            'email.email' => 'Please provide a valid email format.',
            'password.required' => 'Password is required to decrypt token.',
        ]);

        if (! Auth::attempt($credentials)) {
            return response()->json([
                'message' => 'Invalid credentials',
            ], 401);
        }

        $user = Auth::user();

        // Enforce that if user is a community leader or belongs to any community group, MFA is required.
        if ($user->role === 'community_leader' || $user->groups()->exists()) {
            if (! $user->mfa_required) {
                $user->update(['mfa_required' => true]);
            }
        }

        if ($user->mfa_required) {
            if (! $user->mfa_enabled) {
                return response()->json([
                    'mfa_setup_required' => true,
                    'user_id' => $user->id,
                ]);
            }

            return response()->json([
                'mfa_required' => true,
                'user_id' => $user->id,
            ]);
        }

        // Unit IV: Sessions management
        $request->session()->regenerate();

        return response()->json([
            'user' => $user,
            'token' => 'session_token',
        ]);
    }

    /**
     * Terminate operator session (Unit IV sessions - deleting session data)
     */
    public function logout(Request $request)
    {
        Auth::logout();
        
        // Unit IV: Invalidate and regenerate CSRF session tokens
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'message' => 'Logged out successfully',
        ]);
    }

    /**
     * Validate citizen registration (Unit V form validation checks)
     */
    public function validateParticipation(Request $request)
    {
        $request->validate([
            'unique_id' => ['required', 'string', new \App\Rules\ValidUniqueId],
        ], [
            'unique_id.required' => 'Please input a unique member validation ID.',
        ]);

        $user = User::where('unique_id', $request->unique_id)->first();

        if (! $user) {
            return response()->json(['message' => 'Invalid or non-existent unique ID.'], 404);
        }

        if ($user->is_validated) {
            return response()->json(['message' => 'Participation is already validated.', 'user' => $user]);
        }

        $user->update(['is_validated' => true]);

        return response()->json([
            'message' => 'Participation validated successfully.',
            'user' => $user,
        ]);
    }

    /**
     * Check registration status
     */
    public function checkStatus($unique_id)
    {
        $user = User::where('unique_id', $unique_id)->first();

        if (! $user) {
            return response()->json(['message' => 'Unique ID not found.'], 404);
        }

        return response()->json([
            'unique_id' => $user->unique_id,
            'role' => $user->role,
            'is_validated' => $user->is_validated,
            'validated_at' => $user->is_validated ? $user->updated_at : null,
        ]);
    }
}


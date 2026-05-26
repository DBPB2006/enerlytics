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
     * Redirect to Google OAuth provider
     */
    public function redirectToGoogle(Request $request)
    {
        $mode = $request->query('mode', 'login');
        $mfa = $request->query('mfa_opt_in', 0);
        $role = $request->query('role', 'citizen');

        $state = json_encode([
            'mode' => $mode,
            'mfa' => $mfa,
            'role' => $role,
        ]);

        return Socialite::driver('google')
            ->stateless()
            ->with(['state' => $state])
            ->redirect();
    }

    /**
     * Handle Google OAuth Callback
     */
    public function handleGoogleCallback(Request $request)
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();
            $state = json_decode($request->query('state'), true);

            $mode = $state['mode'] ?? 'login';
            $mfaOptIn = $state['mfa'] ?? 0;
            $role = $state['role'] ?? 'citizen';

            $user = User::where('email', $googleUser->getEmail())->first();

            if (! $user) {
                // Generate unique_id for energy providers or community leaders
                $uniqueId = null;
                if (in_array($role, ['energy_provider', 'community_leader'])) {
                    $prefix = $role === 'energy_provider' ? 'EP' : 'CL';
                    do {
                        $uniqueId = $prefix . '-' . str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
                    } while (User::where('unique_id', $uniqueId)->exists());
                }

                $user = User::create([
                    'name' => $googleUser->getName(),
                    'email' => $googleUser->getEmail(),
                    'google_id' => $googleUser->getId(),
                    'avatar' => $googleUser->getAvatar(),
                    'password' => Hash::make(uniqid()),
                    'mfa_required' => (bool) $mfaOptIn || ($role === 'community_leader') || ($role === 'energy_provider'),
                    'role' => $role,
                    'is_validated' => ($role === 'citizen'),
                    'unique_id' => $uniqueId,
                ]);
            }

            // Link Google credentials if they log in with Google and it's not linked yet
            if (empty($user->google_id)) {
                $user->update([
                    'google_id' => $googleUser->getId(),
                    'avatar' => $googleUser->getAvatar(),
                ]);
            }

            // Enforce that if user is a community leader, energy provider, or belongs to any community group, MFA is required.
            if ($user->role === 'community_leader' || $user->role === 'energy_provider' || $user->groups()->exists()) {
                if (! $user->mfa_required) {
                    $user->update(['mfa_required' => true]);
                }
            }

            // Self-heal missing unique Validation IDs for operators (e.g. existing accounts logging in via Google)
            if (in_array($user->role, ['energy_provider', 'community_leader']) && empty($user->unique_id)) {
                $prefix = $user->role === 'energy_provider' ? 'EP' : 'CL';
                do {
                    $uniqueId = $prefix . '-' . str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
                } while (User::where('unique_id', $uniqueId)->exists());
                $user->update(['unique_id' => $uniqueId]);
            }

            // MFA Check MUST happen BEFORE token creation
            if ($user->mfa_required) {
                if (! $user->mfa_enabled) {
                    return redirect("http://localhost:5173/auth/callback?mfa_setup_required=1&user_id={$user->id}");
                }

                return redirect("http://localhost:5173/auth/callback?mfa_required=1&user_id={$user->id}");
            }

            Auth::login($user);
            
            // Regenerate session identifier upon successful OAuth login
            $request->session()->regenerate();

            return redirect("http://localhost:5173/auth/callback?token=session_token");

        } catch (\Exception $e) {
            Log::error('GOOGLE OAUTH ERROR: '.$e->getMessage());

            return redirect('http://localhost:5173/login?error='.urlencode($e->getMessage()));
        }
    }

    /**
     * Register a new operator
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'regex:/^[a-zA-Z\s]+$/'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users', 'regex:/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/'],
            'password' => ['required', 'string', 'min:8', 'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+=\-\[\]{}|;:,.<>?~/]).+$/'],
            'role' => 'sometimes|string|in:citizen,energy_provider,community_leader',
        ], [
            'name.required' => 'The operator name is mandatory.',
            'name.regex' => 'The operator name must contain only letters and spaces.',
            'email.required' => 'A valid email address is required.',
            'email.email' => 'Please provide a standard email format.',
            'email.regex' => 'Please provide a standard email format with a valid domain extension.',
            'email.unique' => 'This email is already registered in the grid.',
            'password.required' => 'A secure password is required.',
            'password.min' => 'The password must contain at least 8 characters.',
            'password.regex' => 'The password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
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
            'mfa_required' => $mfaOptIn || ($role === 'community_leader') || ($role === 'energy_provider'),
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
        
        // Establish authenticated session for the registered user
        $request->session()->regenerate();

        return response()->json([
            'user' => $user,
            'token' => 'session_token',
        ], 201);
    }

    /**
     * Log in credentials check
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

        // Enforce that if user is a community leader, energy provider, or belongs to any community group, MFA is required.
        if ($user->role === 'community_leader' || $user->role === 'energy_provider' || $user->groups()->exists()) {
            if (! $user->mfa_required) {
                $user->update(['mfa_required' => true]);
            }
        }

        // Self-heal missing unique Validation IDs for operators (e.g. existing accounts logging in via standard credentials)
        if (in_array($user->role, ['energy_provider', 'community_leader']) && empty($user->unique_id)) {
            $prefix = $user->role === 'energy_provider' ? 'EP' : 'CL';
            do {
                $uniqueId = $prefix . '-' . str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
            } while (User::where('unique_id', $uniqueId)->exists());
            $user->update(['unique_id' => $uniqueId]);
        }

        if ($user->mfa_required) {
            Auth::logout(); // Ensure session is protected until OTP is validated!

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

        // Establish authenticated session for the verified user
        $request->session()->regenerate();

        return response()->json([
            'user' => $user,
            'token' => 'session_token',
        ]);
    }

    /**
     * Terminate operator session
     */
    public function logout(Request $request)
    {
        Auth::logout();
        
        // Invalidate and regenerate CSRF session tokens to prevent session fixation
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'message' => 'Logged out successfully',
        ]);
    }

    /**
     * Validate citizen registration
     */
    public function validateParticipation(Request $request)
    {
        $request->validate([
            'unique_id' => ['required', 'string', new \App\Rules\ValidUniqueId],
        ], [
            'unique_id.required' => 'Please input a unique member validation ID.',
        ]);

        $loggedInUser = Auth::user();
        if ($loggedInUser->unique_id !== $request->unique_id) {
            return response()->json([
                'message' => 'The provided validation ID does not match your account.'
            ], 403);
        }

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


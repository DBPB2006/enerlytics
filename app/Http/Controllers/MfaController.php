<?php

namespace App\Http\Controllers;

use App\Models\User;
use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Writer;
use Illuminate\Http\Request;
use PragmaRX\Google2FA\Google2FA;

class MfaController extends Controller
{
    public function setup(Request $request)
    {
        $request->validate(['user_id' => 'required|exists:users,id']);
        $user = User::findOrFail($request->user_id);

        $google2fa = new Google2FA;

        if (! $user->mfa_secret) {
            $secret = $google2fa->generateSecretKey();
            $user->update(['mfa_secret' => $secret]);
        } else {
            $secret = $user->mfa_secret;
        }

        $qrCodeUrl = $google2fa->getQRCodeUrl(
            config('app.name'),
            $user->email,
            $secret
        );

        $renderer = new ImageRenderer(
            new RendererStyle(200),
            new SvgImageBackEnd
        );
        $writer = new Writer($renderer);
        $qrCode = $writer->writeString($qrCodeUrl);

        return response()->json([
            'qrCode' => $qrCode,
            'secret' => $secret,
        ]);
    }

    public function enable(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'code' => 'required',
        ]);

        $user = User::findOrFail($request->user_id);
        $google2fa = new Google2FA;

        $valid = $google2fa->verifyKey($user->mfa_secret, $request->code);

        if ($valid) {
            $user->update(['mfa_enabled' => true]);
            \Illuminate\Support\Facades\Auth::login($user);
            $request->session()->regenerate();

            return response()->json([
                'token' => 'session_token',
                'user' => $user,
            ]);
        }

        return response()->json(['message' => 'Invalid OTP'], 422);
    }

    public function verify(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'otp' => 'required',
        ]);

        $user = User::findOrFail($request->user_id);
        $google2fa = new Google2FA;

        $valid = $google2fa->verifyKey($user->mfa_secret, $request->otp);

        if ($valid) {
            \Illuminate\Support\Facades\Auth::login($user);
            $request->session()->regenerate();

            return response()->json([
                'token' => 'session_token',
                'user' => $user,
            ]);
        }

        return response()->json(['message' => 'Invalid OTP'], 422);
    }
}

<?php

namespace App\Services;

class SolarService
{
    public function getIrradiance($lat, $lon)
    {
        try {
            $response = \Illuminate\Support\Facades\Http::timeout(3)->get("https://api.open-meteo.com/v1/forecast", [
                'latitude' => $lat,
                'longitude' => $lon,
                'daily' => 'shortwave_radiation_sum',
                'timezone' => 'auto'
            ]);

            if ($response->successful()) {
                $data = $response->json();
                $radiationSum = $data['daily']['shortwave_radiation_sum'][0] ?? null;
                if ($radiationSum) {
                    return round($radiationSum / 3.6, 2);
                }
            }
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Open-Meteo API Error: ' . $e->getMessage());
        }

        $latRad = deg2rad($lat);
        $base = cos($latRad);
        return max(0.5, round(1.5 + (abs($base) * 5.5), 2));
    }
}

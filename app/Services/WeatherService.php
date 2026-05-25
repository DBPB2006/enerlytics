<?php

namespace App\Services;

class WeatherService
{
    public function getWeatherData($lat, $lon)
    {
        try {
            $apiKey = config('services.openweather.key');
            if ($apiKey) {
                $response = \Illuminate\Support\Facades\Http::timeout(3)->get("https://api.openweathermap.org/data/2.5/weather", [
                    'lat' => $lat,
                    'lon' => $lon,
                    'appid' => $apiKey,
                    'units' => 'metric'
                ]);

                if ($response->successful()) {
                    $data = $response->json();
                    return [
                        'wind_speed' => $data['wind']['speed'] ?? 5.0,
                        'temp' => $data['main']['temp'] ?? 25.0,
                        'humidity' => $data['main']['humidity'] ?? 60,
                        'pressure' => $data['main']['pressure'] ?? 1013,
                    ];
                }
            }
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('OpenWeather API Error: ' . $e->getMessage());
        }

        return [
            'wind_speed' => 5.0,
            'temp' => 25.0,
            'humidity' => 60,
            'pressure' => 1013,
        ];
    }

    public function getWindSpeed($lat, $lon)
    {
        $data = $this->getWeatherData($lat, $lon);
        return $data['wind_speed'];
    }
}

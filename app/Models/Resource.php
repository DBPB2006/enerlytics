<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Resource extends Model
{
    protected $fillable = [
        'created_by',
        'group_id',
        'title',
        'description',
        'blueprint_name',
        'type',
        'latitude',
        'longitude',
        'location_name',
        'region',
        'capacity',
        'status',
        'accuracy',
        'panel_area',
        'rotor_area',
        'flow_rate',
        'head',
        'efficiency',
        'irradiance',
        'wind_speed',
        'river_flow',
    ];

    protected $casts = [

        'latitude' => 'float',
        'longitude' => 'float',
        'capacity' => 'float',
        'efficiency' => 'float',
        'panel_area' => 'float',
        'rotor_area' => 'float',
        'flow_rate' => 'float',
        'head' => 'float',
        'irradiance' => 'float',
        'wind_speed' => 'float',
        'river_flow' => 'float',
    ];

    protected $appends = [
        'utilization',
        'energy_insight',
        'insight',
    ];

    protected static function booted()
    {
        static::saving(function ($resource) {
            if ($resource->type === 'solar') {
                if ($resource->irradiance === null || $resource->irradiance <= 0 || $resource->isDirty(['latitude', 'longitude'])) {
                    try {
                        $solarService = new \App\Services\SolarService();
                        $resource->irradiance = $solarService->getIrradiance($resource->latitude, $resource->longitude);
                    } catch (\Exception $e) {
                        \Illuminate\Support\Facades\Log::error('Solar Service Error on saving resource: ' . $e->getMessage());
                    }
                }
            } elseif ($resource->type === 'wind') {
                if ($resource->wind_speed === null || $resource->wind_speed <= 0 || $resource->isDirty(['latitude', 'longitude'])) {
                    try {
                        $weatherService = new \App\Services\WeatherService();
                        $resource->wind_speed = $weatherService->getWindSpeed($resource->latitude, $resource->longitude);
                    } catch (\Exception $e) {
                        \Illuminate\Support\Facades\Log::error('Weather Service Error on saving resource: ' . $e->getMessage());
                    }
                }
            }
        });
    }

    public function getUtilizationAttribute()
    {
        if (isset($this->attributes['utilization'])) {
            return $this->attributes['utilization'];
        }
        $this->attachEnergyData();
        return $this->utilization ?? 0;
    }

    public function getEnergyInsightAttribute()
    {
        if (isset($this->attributes['energy_insight'])) {
            return $this->attributes['energy_insight'];
        }
        $this->attachEnergyData();
        return $this->energy_insight ?? null;
    }

    public function getInsightAttribute()
    {
        if (isset($this->attributes['insight'])) {
            return $this->attributes['insight'];
        }
        $this->attachEnergyData();
        return $this->insight ?? '';
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function group()
    {
        return $this->belongsTo(Group::class);
    }

    public function metrics()
    {
        return $this->hasMany(ResourceMetric::class);
    }

    private $energyDataAttached = false;

    /**
     * Attach environmental and calculation data to a resource object
     */
    public function attachEnergyData()
    {
        if ($this->energyDataAttached) {
            return $this;
        }
        $this->energyDataAttached = true;
        $calculation = [
            'estimated_output' => 0,
            'unit' => 'N/A',
            'efficiency_score' => 'N/A',
        ];

        try {
            $calculator = new \App\Services\EnergyCalculator();
            if ($this->type === 'solar') {
                $solarService = new \App\Services\SolarService();
                $irradiance = ($this->irradiance !== null && $this->irradiance > 0)
                    ? $this->irradiance
                    : $solarService->getIrradiance($this->latitude, $this->longitude);
                $calculation = $calculator->calculateSolar(
                    $irradiance,
                    $this->panel_area ?: 0,
                    $this->efficiency ?: 0.7
                );
                $this->environmental_data = ['irradiance' => $irradiance];
            } elseif ($this->type === 'wind') {
                $weatherService = new \App\Services\WeatherService();
                $windSpeed = ($this->wind_speed !== null && $this->wind_speed > 0)
                    ? $this->wind_speed
                    : $weatherService->getWindSpeed($this->latitude, $this->longitude);
                $calculation = $calculator->calculateWind(
                    $windSpeed,
                    $this->rotor_area ?: 0,
                    $this->efficiency ?: 0.4
                );
                $this->environmental_data = ['wind_speed' => $windSpeed];
            } elseif ($this->type === 'hydro') {
                $flow = ($this->river_flow !== null && $this->river_flow > 0)
                    ? $this->river_flow
                    : ($this->flow_rate ?: 0);
                $calculation = $calculator->calculateHydro(
                    $flow,
                    $this->head ?: 0,
                    $this->efficiency ?: 0.8
                );
                $this->environmental_data = ['flow_rate' => $flow, 'head' => $this->head];
            } elseif ($this->type === 'biomass') {
                $weatherService = new \App\Services\WeatherService();
                $weather = $weatherService->getWeatherData($this->latitude, $this->longitude);
                $moisture = round($weather['humidity'] * 0.25, 1);
                $feedRate = round($this->capacity * 0.8, 1);
                
                $calculation = $calculator->calculateBiomass(
                    $this->capacity ?: 5.0,
                    $this->efficiency ?: 0.45,
                    $moisture
                );
                $this->environmental_data = [
                    'feed_rate' => $feedRate,
                    'moisture' => $moisture,
                    'ambient_temp' => $weather['temp']
                ];
            } elseif ($this->type === 'geothermal') {
                $weatherService = new \App\Services\WeatherService();
                $weather = $weatherService->getWeatherData($this->latitude, $this->longitude);
                $wellDepth = 3.0;
                $coreTemp = round($weather['temp'] + ($wellDepth * 50), 1);
                
                $calculation = $calculator->calculateGeothermal(
                    $this->capacity ?: 2.5,
                    $this->efficiency ?: 0.90,
                    $coreTemp
                );
                $this->environmental_data = [
                    'well_depth' => $wellDepth,
                    'steam_temp' => $coreTemp,
                    'pressure' => round(10 + ($weather['pressure'] / 100), 1)
                ];
            }
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Energy Calculation Error: '.$e->getMessage());
        }

        $calculation['estimated_output'] = min($calculation['estimated_output'], $this->capacity);
        $this->energy_insight = $calculation;

        // Add utilization and insight for consistency with analytics
        $this->utilization = $this->capacity > 0 ? round(($calculation['estimated_output'] / $this->capacity) * 100, 4) : 0;
        $this->insight = $this->generateInsightString($this->type, $calculation['efficiency_score']);

        return $this;
    }

    private function generateInsightString($type, $score)
    {
        if ($score === 'high') {
            return 'Excellent '.$type.' conditions detected.';
        } elseif ($score === 'medium') {
            return 'Stable output with room for optimization.';
        }

        return 'Low performance. Check environmental factors or maintenance.';
    }
}

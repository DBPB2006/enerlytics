<?php

namespace App\Console\Commands;

use App\Models\Resource;
use App\Models\ResourceMetric;
use App\Services\EnergyCalculator;
use App\Services\SolarService;
use App\Services\WeatherService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('capture:metrics')]
#[Description('Capture real-time environmental data and calculate production for all resources')]

class CaptureResourceMetrics extends Command
{
    /**
     * Execute the console command.
     */
    public function handle(
        WeatherService $weatherService,
        SolarService $solarService,
        EnergyCalculator $calculator
    ) {
        $resources = Resource::all();
        $count = 0;

        foreach ($resources as $resource) {
            $wind = null;
            $irradiance = null;
            $outputData = ['estimated_output' => 0];

            try {
                if ($resource->type === 'solar') {
                    $irradiance = $solarService->getIrradiance($resource->latitude, $resource->longitude);
                    $outputData = $calculator->calculateSolar($irradiance, $resource->panel_area, $resource->efficiency);
                } elseif ($resource->type === 'wind') {
                    $wind = $weatherService->getWindSpeed($resource->latitude, $resource->longitude);
                    $outputData = $calculator->calculateWind($wind, $resource->rotor_area, $resource->efficiency);
                } elseif ($resource->type === 'hydro') {
                    $outputData = $calculator->calculateHydro($resource->flow_rate, $resource->head, $resource->efficiency);
                } elseif ($resource->type === 'biomass') {
                    $outputData = $calculator->calculateBiomass($resource->capacity, $resource->efficiency);
                } elseif ($resource->type === 'geothermal') {
                    $outputData = $calculator->calculateGeothermal($resource->capacity, $resource->efficiency);
                }

                $output = $outputData['estimated_output'];
                $utilization = $resource->capacity > 0 ? round(($output / $resource->capacity) * 100, 2) : 0;

                ResourceMetric::create([
                    'resource_id' => $resource->id,
                    'wind_speed' => $wind,
                    'irradiance' => $irradiance,
                    'estimated_output' => $output,
                    'utilization' => $utilization,
                    'recorded_at' => now(),
                ]);

                $count++;
            } catch (\Exception $e) {
                $this->error("Failed to capture metrics for resource {$resource->id}: {$e->getMessage()}");
            }
        }

        $this->info("Successfully captured metrics for {$count} resources.");
    }
}

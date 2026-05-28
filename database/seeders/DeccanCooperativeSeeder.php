<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Group;
use App\Models\Resource;
use App\Models\ResourceMetric;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class DeccanCooperativeSeeder extends Seeder
{
    public function run(): void
    {
        $prembhuvan = User::firstOrCreate(
            ['email' => 'dbprembhuvan@gmail.com'],
            [
                'name' => 'Prem Bhuvan Doddanari',
                'password' => bcrypt('password'),
                'role' => 'citizen',
                'is_validated' => true,
            ]
        );

        $sathvik = User::firstOrCreate(
            ['email' => 'dbpb@gmail.com'],
            [
                'name' => 'sathvik',
                'password' => bcrypt('password'),
                'role' => 'energy_provider',
                'unique_id' => 'EP-984512',
                'is_validated' => true,
            ]
        );

        $manoj = User::firstOrCreate(
            ['email' => 'manoj@gmail.com'],
            [
                'name' => 'manoj',
                'password' => bcrypt('password'),
                'role' => 'community_leader',
                'unique_id' => 'CL-124598',
                'is_validated' => true,
            ]
        );

        $deccanGroup = Group::firstOrCreate(
            ['name' => 'Deccan Clean Energy Union'],
            [
                'owner_id' => $manoj->id,
                'location' => 'Karnataka, India',
                'description' => 'A unified community network managing decentralized solar, wind, and micro-hydro assets across Karnataka.',
            ]
        );

        $deccanGroup->users()->syncWithoutDetaching([
            $manoj->id => ['role' => 'owner', 'status' => 'approved'],
            $sathvik->id => ['role' => 'admin', 'status' => 'approved'],
            $prembhuvan->id => ['role' => 'member', 'status' => 'approved'],
        ]);

        $resourcesData = [
            [
                'title' => 'Bangalore Municipal Solar Array',
                'type' => 'solar',
                'latitude' => 12.9716,
                'longitude' => 77.5946,
                'location_name' => 'Bangalore',
                'region' => 'Karnataka',
                'capacity' => 15.0,
                'status' => 'active',
                'accuracy' => 'verified',
                'efficiency' => 0.82,
                'panel_area' => 10000,
                'group_id' => $deccanGroup->id,
                'created_by' => $sathvik->id,
            ],
            [
                'title' => 'Chitradurga Wind Park',
                'type' => 'wind',
                'latitude' => 14.2300,
                'longitude' => 76.4000,
                'location_name' => 'Chitradurga',
                'region' => 'Karnataka',
                'capacity' => 30.0,
                'status' => 'active',
                'accuracy' => 'verified',
                'efficiency' => 0.45,
                'rotor_area' => 18000,
                'group_id' => $deccanGroup->id,
                'created_by' => $sathvik->id,
            ],
            [
                'title' => 'Kodagu River Micro-Hydro',
                'type' => 'hydro',
                'latitude' => 12.4244,
                'longitude' => 75.7382,
                'location_name' => 'Kodagu (Coorg)',
                'region' => 'Karnataka',
                'capacity' => 5.5,
                'status' => 'active',
                'accuracy' => 'verified',
                'efficiency' => 0.85,
                'flow_rate' => 150,
                'head' => 15,
                'group_id' => $deccanGroup->id,
                'created_by' => $manoj->id,
            ],
            [
                'title' => 'Tumakuru Bio-Energy Station',
                'type' => 'biomass',
                'latitude' => 13.3379,
                'longitude' => 77.1173,
                'location_name' => 'Tumakuru',
                'region' => 'Karnataka',
                'capacity' => 10.0,
                'status' => 'active',
                'accuracy' => 'verified',
                'efficiency' => 0.42,
                'group_id' => $deccanGroup->id,
                'created_by' => $manoj->id,
            ],
        ];

        foreach ($resourcesData as $data) {
            $resource = Resource::firstOrCreate(['title' => $data['title']], $data);

            if ($resource->wasRecentlyCreated || $resource->metrics()->count() === 0) {
                $now = Carbon::now();
                for ($i = 24; $i >= 0; $i--) {
                    $recordedAt = clone $now;
                    $recordedAt->subHours($i);
                    $hour = $recordedAt->hour;

                    $metric = new ResourceMetric();
                    $metric->resource_id = $resource->id;
                    $metric->recorded_at = $recordedAt;

                    if ($resource->type === 'solar') {
                        $sunFactor = max(0, sin(($hour - 6) * M_PI / 12));
                        $irradiance = 800 * $sunFactor + rand(0, 30);
                        $output = ($irradiance / 1000) * $resource->capacity * $resource->efficiency;
                        
                        $metric->irradiance = $irradiance;
                        $metric->estimated_output = round($output, 2);
                        $metric->utilization = $resource->capacity > 0 ? round(($output / $resource->capacity) * 100, 2) : 0;
                    } elseif ($resource->type === 'wind') {
                        $windSpeed = 5 + rand(0, 100)/10 + (sin($hour * M_PI / 12) * 5);
                        $output = min($resource->capacity, pow($windSpeed, 3) * 0.002 * $resource->capacity * $resource->efficiency);
                        
                        $metric->wind_speed = $windSpeed;
                        $metric->estimated_output = round($output, 2);
                        $metric->utilization = $resource->capacity > 0 ? round(($output / $resource->capacity) * 100, 2) : 0;
                    } elseif ($resource->type === 'hydro') {
                        $flowPotential = 2 + sin($hour * M_PI / 12) * 0.5 + rand(0, 20)/100;
                        $output = $resource->capacity * $resource->efficiency * ($flowPotential / 2.5);
                        
                        $metric->wind_speed = null;
                        $metric->irradiance = null;
                        $metric->estimated_output = round($output, 2);
                        $metric->utilization = $resource->capacity > 0 ? round(($output / $resource->capacity) * 100, 2) : 0;
                    } elseif ($resource->type === 'biomass') {
                        $outputFactor = 0.8 + (rand(0, 20) / 100);
                        $output = min($resource->capacity, $resource->capacity * $resource->efficiency * $outputFactor);
                        
                        $metric->wind_speed = null;
                        $metric->irradiance = null;
                        $metric->estimated_output = round($output, 2);
                        $metric->utilization = $resource->capacity > 0 ? round(($output / $resource->capacity) * 100, 2) : 0;
                    }

                    $metric->save();
                }
            }
        }
    }
}

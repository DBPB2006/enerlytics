<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Group;
use App\Models\Resource;
use App\Models\ResourceMetric;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class DemoSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create Mock Users
        $testUser = User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'password' => bcrypt('password'),
                'role' => 'community_leader',
                'unique_id' => 'CL-000001',
                'is_validated' => true,
            ]
        );

        $rajesh = User::firstOrCreate(
            ['email' => 'rajesh@example.com'],
            [
                'name' => 'Rajesh Kumar',
                'password' => bcrypt('password'),
                'role' => 'energy_provider',
                'unique_id' => 'EP-451298',
                'is_validated' => true,
            ]
        );

        $priya = User::firstOrCreate(
            ['email' => 'priya@example.com'],
            [
                'name' => 'Priya Sharma',
                'password' => bcrypt('password'),
                'role' => 'community_leader',
                'unique_id' => 'CL-883204',
                'is_validated' => true,
            ]
        );

        $amit = User::firstOrCreate(
            ['email' => 'amit@example.com'],
            [
                'name' => 'Amit Patel',
                'password' => bcrypt('password'),
                'role' => 'citizen',
                'is_validated' => true,
            ]
        );

        // 2. Create Mock Groups (Communities) in India
        $group1 = Group::firstOrCreate(
            ['name' => 'Karnataka Solar & Wind Cooperative'],
            [
                'owner_id' => $testUser->id,
                'location' => 'Bangalore, Karnataka, India',
                'description' => 'A neighborhood clean energy cooperative tracking rooftop PV solar panels and rural wind feeds.',
            ]
        );
        $group1->users()->syncWithoutDetaching([
            $testUser->id => ['role' => 'owner', 'status' => 'approved'],
            $priya->id => ['role' => 'member', 'status' => 'approved'],
            $rajesh->id => ['role' => 'member', 'status' => 'approved'],
            $amit->id => ['role' => 'member', 'status' => 'approved'],
        ]);

        $group2 = Group::firstOrCreate(
            ['name' => 'Tamil Nadu Clean Wind Alliance'],
            [
                'owner_id' => $rajesh->id,
                'location' => 'Kanyakumari, Tamil Nadu, India',
                'description' => 'A large regional alliance tracking large wind turbines operating in coastal and high-altitude areas.',
            ]
        );
        $group2->users()->syncWithoutDetaching([
            $rajesh->id => ['role' => 'owner', 'status' => 'approved'],
            $testUser->id => ['role' => 'admin', 'status' => 'approved'],
            $amit->id => ['role' => 'member', 'status' => 'pending'], // Pending request to show UI actions
        ]);

        $group3 = Group::firstOrCreate(
            ['name' => 'Kerala Hydro Federation'],
            [
                'owner_id' => $priya->id,
                'location' => 'Munnar, Kerala, India',
                'description' => 'Decentralized federation auditing river streams and gravity hydroelectric generators in rural Kerala.',
            ]
        );
        $group3->users()->syncWithoutDetaching([
            $priya->id => ['role' => 'owner', 'status' => 'approved'],
            $testUser->id => ['role' => 'member', 'status' => 'approved'],
            $rajesh->id => ['role' => 'admin', 'status' => 'approved'],
            $amit->id => ['role' => 'member', 'status' => 'pending'], // Pending request
        ]);

        $group4 = Group::firstOrCreate(
            ['name' => 'Punjab Agricultural Biomass Cooperative'],
            [
                'owner_id' => $testUser->id,
                'location' => 'Patiala, Punjab, India',
                'description' => 'Converting agricultural stubble and crop residue into clean synthetic gas loads for community grids.',
            ]
        );
        $group4->users()->syncWithoutDetaching([
            $testUser->id => ['role' => 'owner', 'status' => 'approved'],
            $amit->id => ['role' => 'member', 'status' => 'approved'],
            $rajesh->id => ['role' => 'member', 'status' => 'approved'],
        ]);

        $group5 = Group::firstOrCreate(
            ['name' => 'Ladakh Geothermal Alliance'],
            [
                'owner_id' => $rajesh->id,
                'location' => 'Leh, Ladakh, India',
                'description' => 'Leveraging volcanic hot springs and subterranean steam wells to provide high-stability grid baseloads.',
            ]
        );
        $group5->users()->syncWithoutDetaching([
            $rajesh->id => ['role' => 'owner', 'status' => 'approved'],
            $testUser->id => ['role' => 'member', 'status' => 'approved'],
            $priya->id => ['role' => 'admin', 'status' => 'approved'],
        ]);

        // Group 6: Test User is NOT in this group (to showcase the "Discover Groups" feature)
        $group6 = Group::firstOrCreate(
            ['name' => 'Gujarat Solarpower Federation'],
            [
                'owner_id' => $rajesh->id,
                'location' => 'Mundra, Gujarat, India',
                'description' => 'Cooperative monitoring coastal solar intensity and large grid PV conversion units.',
            ]
        );
        $group6->users()->syncWithoutDetaching([
            $rajesh->id => ['role' => 'owner', 'status' => 'approved'],
            $priya->id => ['role' => 'member', 'status' => 'approved'],
        ]);

        // 3. Create Resources situated in India
        $resourcesData = [
            // Group 1
            [
                'title' => 'Pavagada Solar Complex',
                'type' => 'solar',
                'latitude' => 14.25,
                'longitude' => 77.45,
                'location_name' => 'Pavagada, Karnataka',
                'region' => 'Karnataka',
                'capacity' => 50.0,
                'status' => 'active',
                'accuracy' => 'verified',
                'efficiency' => 0.85,
                'panel_area' => 35000,
                'group_id' => $group1->id,
                'created_by' => $testUser->id,
            ],
            [
                'title' => 'Hebbal Rooftop Solar Cluster',
                'type' => 'solar',
                'latitude' => 13.04,
                'longitude' => 77.59,
                'location_name' => 'Hebbal, Bangalore',
                'region' => 'Karnataka',
                'capacity' => 12.5,
                'status' => 'active',
                'accuracy' => 'verified',
                'efficiency' => 0.80,
                'panel_area' => 8000,
                'group_id' => $group1->id,
                'created_by' => $testUser->id,
            ],
            // Group 2
            [
                'title' => 'Muppandal Wind Farm Phase I',
                'type' => 'wind',
                'latitude' => 8.25,
                'longitude' => 77.55,
                'location_name' => 'Muppandal, Tamil Nadu',
                'region' => 'Tamil Nadu',
                'capacity' => 45.0,
                'status' => 'active',
                'accuracy' => 'verified',
                'efficiency' => 0.45,
                'rotor_area' => 25000,
                'group_id' => $group2->id,
                'created_by' => $rajesh->id,
            ],
            [
                'title' => 'Palakkad Gap Wind Park',
                'type' => 'wind',
                'latitude' => 10.78,
                'longitude' => 76.65,
                'location_name' => 'Palakkad, Kerala Border',
                'region' => 'Tamil Nadu',
                'capacity' => 22.8,
                'status' => 'active',
                'accuracy' => 'verified',
                'efficiency' => 0.42,
                'rotor_area' => 14000,
                'group_id' => $group2->id,
                'created_by' => $rajesh->id,
            ],
            // Group 3
            [
                'title' => 'Idukki Gravity Hydro System',
                'type' => 'hydro',
                'latitude' => 9.85,
                'longitude' => 77.06,
                'location_name' => 'Idukki, Kerala',
                'region' => 'Kerala',
                'capacity' => 32.5,
                'status' => 'active',
                'accuracy' => 'verified',
                'efficiency' => 0.90,
                'flow_rate' => 850,
                'head' => 40,
                'group_id' => $group3->id,
                'created_by' => $priya->id,
            ],
            [
                'title' => 'Munnar Flow Micro-Hydro',
                'type' => 'hydro',
                'latitude' => 10.09,
                'longitude' => 77.06,
                'location_name' => 'Munnar, Kerala',
                'region' => 'Kerala',
                'capacity' => 4.2,
                'status' => 'active',
                'accuracy' => 'verified',
                'efficiency' => 0.82,
                'flow_rate' => 120,
                'head' => 12,
                'group_id' => $group3->id,
                'created_by' => $priya->id,
            ],
            // Group 4
            [
                'title' => 'Patiala Agricultural Biomass Plant',
                'type' => 'biomass',
                'latitude' => 30.34,
                'longitude' => 76.38,
                'location_name' => 'Patiala, Punjab',
                'region' => 'Punjab',
                'capacity' => 15.0,
                'status' => 'active',
                'accuracy' => 'verified',
                'efficiency' => 0.45,
                'group_id' => $group4->id,
                'created_by' => $testUser->id,
            ],
            [
                'title' => 'Jalandhar Bio-Gas Station',
                'type' => 'biomass',
                'latitude' => 31.32,
                'longitude' => 75.57,
                'location_name' => 'Jalandhar, Punjab',
                'region' => 'Punjab',
                'capacity' => 8.4,
                'status' => 'active',
                'accuracy' => 'verified',
                'efficiency' => 0.40,
                'group_id' => $group4->id,
                'created_by' => $testUser->id,
            ],
            // Group 5
            [
                'title' => 'Puga Valley Geothermal Well A',
                'type' => 'geothermal',
                'latitude' => 33.22,
                'longitude' => 78.43,
                'location_name' => 'Puga Valley, Ladakh',
                'region' => 'Ladakh',
                'capacity' => 5.0,
                'status' => 'active',
                'accuracy' => 'verified',
                'efficiency' => 0.90,
                'group_id' => $group5->id,
                'created_by' => $rajesh->id,
            ],
            [
                'title' => 'Chumathang Thermal Well',
                'type' => 'geothermal',
                'latitude' => 33.36,
                'longitude' => 78.35,
                'location_name' => 'Chumathang, Ladakh',
                'region' => 'Ladakh',
                'capacity' => 3.0,
                'status' => 'active',
                'accuracy' => 'verified',
                'efficiency' => 0.88,
                'group_id' => $group5->id,
                'created_by' => $rajesh->id,
            ],
            // Group 6 (Gujarat)
            [
                'title' => 'Mundra Coastal Solar Array',
                'type' => 'solar',
                'latitude' => 22.84,
                'longitude' => 69.80,
                'location_name' => 'Mundra, Gujarat',
                'region' => 'Gujarat',
                'capacity' => 28.0,
                'status' => 'active',
                'accuracy' => 'verified',
                'efficiency' => 0.82,
                'panel_area' => 18000,
                'group_id' => $group6->id,
                'created_by' => $rajesh->id,
            ],
        ];

        foreach ($resourcesData as $data) {
            $resource = Resource::create($data);

            // Backfill 24 hours of metrics
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
                } elseif ($resource->type === 'geothermal') {
                    $outputFactor = 0.95 + (rand(0, 5) / 100);
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

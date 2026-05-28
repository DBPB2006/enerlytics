<?php

namespace App\Http\Controllers;

use App\Models\Group;
use App\Models\Resource;
use Illuminate\Http\Request;

class ResourceController extends Controller
{
    // ==========================================
    // 1. Access Control Helpers (Private)
    // ==========================================

    /**
     * Reusable role checker helper validating pivot memberships
     */
    private function hasRole($group, $roles)
    {
        return $group->users()
            ->where('user_id', auth()->id())
            ->whereIn('group_user.role', (array) $roles)
            ->wherePivot('status', 'approved')
            ->exists();
    }

    /**
     * Check if the authenticated user has read access to the resource
     */
    private function hasReadAccess($resource)
    {
        if ($resource->group_id) {
            return $resource->group->users()
                ->where('user_id', auth()->id())
                ->wherePivot('status', 'approved')
                ->exists();
        }

        return $resource->created_by === auth()->id() || auth()->user()->role === 'energy_provider';
    }

    /**
     * Check if the authenticated user has write/edit access to the resource
     */
    private function hasWriteAccess($resource)
    {
        if (! $resource->group_id) {
            return $resource->created_by === auth()->id() || auth()->user()->role === 'energy_provider';
        }

        $group = $resource->group;
        $isApprovedMember = $group->users()
            ->where('user_id', auth()->id())
            ->wherePivot('status', 'approved')
            ->exists();

        return $resource->created_by === auth()->id() ||
            $this->hasRole($group, ['owner', 'admin']) ||
            (auth()->user()->role === 'energy_provider' && $isApprovedMember);
    }

    /**
     * Check if the authenticated user has delete access to the resource
     */
    private function hasDeleteAccess($resource)
    {
        if (auth()->user()->role === 'energy_provider') {
            return false;
        }

        if (! $resource->group_id) {
            return $resource->created_by === auth()->id();
        }

        return $resource->created_by === auth()->id() || $this->hasRole($resource->group, ['owner']);
    }

    /**
     * Calculate average efficiency from a list of scores
     */
    private function calculateAverageEfficiency($scores)
    {
        if (empty($scores)) {
            return 'N/A';
        }

        $weights = ['high' => 3, 'medium' => 2, 'low' => 1];
        $totalWeight = 0;
        foreach ($scores as $score) {
            $totalWeight += $weights[$score] ?? 1;
        }

        $avg = $totalWeight / count($scores);

        if ($avg >= 2.5) {
            return 'high';
        }
        if ($avg >= 1.5) {
            return 'medium';
        }

        return 'low';
    }

    // ==========================================
    // 2. Resource CRUD Operations (Public)
    // ==========================================

    /**
     * Display all accessible resources for the authenticated user
     */
    public function index(Request $request)
    {
        $userId = auth()->id();
        $query = Resource::where(function ($query) use ($userId) {
            $query->where(function ($q) use ($userId) {
                $q->whereNull('group_id')
                    ->where('created_by', $userId);
            })
                ->orWhere(function ($q) use ($userId) {
                    $q->whereNotNull('group_id')
                        ->whereHas('group.users', function ($sub) use ($userId) {
                            $sub->where('users.id', $userId)
                                ->where('group_user.status', 'approved');
                        });
                });
        });

        if ($request->filled('search')) {
            $query->where('title', 'like', '%'.$request->input('search').'%');
        }

        if ($request->filled('type')) {
            $query->where('type', $request->input('type'));
        }

        $resources = $query->with(['group', 'creator'])->get();

        foreach ($resources as $resource) {
            $resource->attachEnergyData();
        }

        $totalCapacity = $resources->sum('capacity');

        return response()->json($resources)
            ->header('X-Total-Capacity', round($totalCapacity, 2));
    }

    /**
     * Validate and store a newly created resource in the grid
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:solar,wind,hydro,biomass,geothermal',
            'latitude' => ['required', new \App\Rules\ValidCoordinate('latitude')],
            'longitude' => ['required', new \App\Rules\ValidCoordinate('longitude')],
            'location_name' => 'required|string',
            'region' => 'required|string',
            'capacity' => 'required|numeric|min:0',
            'status' => 'required|in:active,inactive,maintenance',
            'accuracy' => 'required|in:approximate,verified',
            'group_id' => 'nullable|exists:groups,id',
            'blueprint_name' => 'nullable|string',

            // Resource-specific validation
            'efficiency' => 'required|numeric|min:0|max:1',
            'panel_area' => 'required_if:type,solar|nullable|numeric|min:0',
            'rotor_area' => 'required_if:type,wind|nullable|numeric|min:0',
            'flow_rate' => 'required_if:type,hydro|nullable|numeric|min:0',
            'head' => 'required_if:type,hydro|nullable|numeric|min:0',
            'irradiance' => 'nullable|numeric|min:0',
            'wind_speed' => 'nullable|numeric|min:0',
            'river_flow' => 'nullable|numeric|min:0',
        ], [
            'title.required' => 'The resource title is required.',
            'type.required' => 'The generation type is mandatory.',
            'latitude.required' => 'Latitude coordinates are required.',
            'latitude.between' => 'Latitude must be between -90 and 90 degrees.',
            'longitude.required' => 'Longitude coordinates are required.',
            'longitude.between' => 'Longitude must be between -180 and 180 degrees.',
            'capacity.required' => 'The resource capacity rating is mandatory.',
            'capacity.min' => 'Capacity cannot be negative.',
            'efficiency.required' => 'Efficiency factor is mandatory.',
            'efficiency.min' => 'Efficiency factor must be at least 0.',
            'efficiency.max' => 'Efficiency factor cannot exceed 1.0 (100%).',
        ]);

        if (! empty($validated['group_id'])) {
            $group = Group::findOrFail($validated['group_id']);
            
            $isApprovedMember = $group->users()
                ->where('user_id', auth()->id())
                ->wherePivot('status', 'approved')
                ->exists();

            if (auth()->user()->role === 'energy_provider') {
                if (! $isApprovedMember) {
                    return response()->json(['error' => 'Forbidden: You must be an approved member of this group to register resources under it'], 403);
                }
            } else {
                if (! $this->hasRole($group, ['owner'])) {
                    return response()->json(['error' => 'Forbidden: Only group owners or Energy Providers can create resources under this group'], 403);
                }
            }
        }

        $resource = new Resource($validated);
        $resource->created_by = auth()->id();
        $resource->save();

        $resource->attachEnergyData();

        return response()->json([
            'message' => 'Resource created successfully',
            'resource' => $resource,
        ], 201);
    }

    /**
     * Display the specified resource details
     */
    public function show($id)
    {
        $resource = Resource::with(['group', 'creator'])->findOrFail($id);

        if (! $this->hasReadAccess($resource)) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $resource->attachEnergyData();

        return response()->json($resource);
    }

    /**
     * Validate and update the specified resource details
     */
    public function update(Request $request, $id)
    {
        $resource = Resource::findOrFail($id);

        if (! $this->hasWriteAccess($resource)) {
            return response()->json(['error' => 'Forbidden: Insufficient permissions for community resource'], 403);
        }

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'blueprint_name' => 'nullable|string|max:255',
            'status' => 'sometimes|required|in:active,inactive,maintenance',
            'capacity' => 'sometimes|required|numeric|min:0',
            'latitude' => ['sometimes', 'required', new \App\Rules\ValidCoordinate('latitude')],
            'longitude' => ['sometimes', 'required', new \App\Rules\ValidCoordinate('longitude')],
            'location_name' => 'sometimes|required|string',
            'region' => 'sometimes|required|string',
            'panel_area' => 'nullable|numeric|min:0',
            'rotor_area' => 'nullable|numeric|min:0',
            'flow_rate' => 'nullable|numeric|min:0',
            'head' => 'nullable|numeric|min:0',
            'efficiency' => 'nullable|numeric|min:0|max:1',
            'irradiance' => 'nullable|numeric|min:0',
            'wind_speed' => 'nullable|numeric|min:0',
            'river_flow' => 'nullable|numeric|min:0',
        ], [
            'capacity.min' => 'Capacity cannot be negative.',
            'efficiency.min' => 'Efficiency must be at least 0.',
            'efficiency.max' => 'Efficiency cannot exceed 1.0 (100%).',
            'latitude.required' => 'Latitude coordinates are required.',
            'longitude.required' => 'Longitude coordinates are required.',
        ]);

        $resource->update($validated);
        $resource->attachEnergyData();

        return response()->json($resource);
    }

    /**
     * Delete the specified resource from the database
     */
    public function destroy($id)
    {
        if (auth()->user()->role === 'energy_provider') {
            return response()->json(['error' => 'Forbidden: Energy Providers are restricted from deleting resources.'], 403);
        }

        $resource = Resource::findOrFail($id);

        if (! $this->hasDeleteAccess($resource)) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $resource->delete();

        return response()->json(['message' => 'Resource deleted successfully']);
    }

    /**
     * Validate resource creation/edit data step-by-step on the backend
     */
    public function validateResource(Request $request)
    {
        $step = (int) $request->input('step', 1);

        if ($step === 1) {
            $request->validate([
                'title' => 'required|string|min:3|max:255',
                'type' => 'required|in:solar,wind,hydro,biomass,geothermal',
                'capacity' => 'required|numeric|gt:0',
                'region' => 'required|string|max:255',
                'latitude' => ['required', new \App\Rules\ValidCoordinate('latitude')],
                'longitude' => ['required', new \App\Rules\ValidCoordinate('longitude')],
                'location_name' => 'required|string|max:255',
            ], [
                'title.required' => 'Resource title is required.',
                'title.min' => 'Title must be at least 3 characters.',
                'capacity.required' => 'Capacity rating must be a positive number greater than 0.',
                'capacity.gt' => 'Capacity rating must be a positive number greater than 0.',
                'region.required' => 'Region/Sub division is required.',
                'location_name.required' => 'City/Location Area is required.',
            ]);
        } elseif ($step === 2) {
            $type = $request->input('type');
            $rules = [];
            $messages = [];

            if ($type === 'solar') {
                $rules = [
                    'panel_area' => 'required|numeric|gt:0',
                    'efficiency' => 'required|numeric|min:0|max:1',
                ];
                $messages = [
                    'panel_area.required' => 'Panel surface area is required.',
                    'panel_area.gt' => 'Panel surface area must be greater than 0.',
                    'efficiency.required' => 'Cell efficiency rating is required.',
                    'efficiency.min' => 'Efficiency rating must be between 0.00 and 1.00 (e.g. 0.18).',
                    'efficiency.max' => 'Efficiency rating must be between 0.00 and 1.00 (e.g. 0.18).',
                ];
            } elseif ($type === 'wind') {
                $rules = [
                    'rotor_area' => 'required|numeric|gt:0',
                ];
                $messages = [
                    'rotor_area.required' => 'Rotor swept area is required.',
                    'rotor_area.gt' => 'Rotor swept area must be greater than 0.',
                ];
            } elseif ($type === 'hydro') {
                $rules = [
                    'flow_rate' => 'required|numeric|gt:0',
                    'head' => 'required|numeric|gt:0',
                ];
                $messages = [
                    'flow_rate.required' => 'Gravity flow rate is required.',
                    'flow_rate.gt' => 'Gravity flow rate must be greater than 0.',
                    'head.required' => 'Hydraulic head height is required.',
                    'head.gt' => 'Hydraulic head height must be greater than 0.',
                ];
            }

            if (!empty($rules)) {
                $request->validate($rules, $messages);
            }
        }

        return response()->json(['valid' => true]);
    }

    /**
     * Preview estimated energy output and metrics on the backend
     */
    public function calculate(Request $request)
    {
        $type = $request->input('type');
        $capacity = (float) $request->input('capacity', 0);
        $efficiency = $request->filled('efficiency') ? (float) $request->input('efficiency') : null;
        $lat = $request->input('latitude');
        $lon = $request->input('longitude');
        
        $calculator = new \App\Services\EnergyCalculator();
        $output = 0;
        $score = 'LOW';

        if ($type === 'solar') {
            $area = (float) $request->input('panel_area', 0);
            $eff = $efficiency ?? 0.15;
            
            $irr = null;
            if ($request->filled('irradiance')) {
                $irr = (float) $request->input('irradiance');
            } elseif ($lat !== null && $lon !== null) {
                try {
                    $irr = (new \App\Services\SolarService())->getIrradiance($lat, $lon);
                } catch (\Exception $e) {
                    \Illuminate\Support\Facades\Log::error('Solar Service Preview calculation error: ' . $e->getMessage());
                }
            }
            $irr = $irr ?? 150;

            $calc = $calculator->calculateSolar($irr, $area, $eff);
            $output = $calc['estimated_output'];
            $output = min($output, $capacity);
            $score = $irr > 200 ? 'HIGH' : ($irr > 100 ? 'MEDIUM' : 'LOW');
        } elseif ($type === 'wind') {
            $area = (float) $request->input('rotor_area', 0);
            $eff = $efficiency ?? 0.4;
            
            $speed = null;
            if ($request->filled('wind_speed')) {
                $speed = (float) $request->input('wind_speed');
            } elseif ($lat !== null && $lon !== null) {
                try {
                    $speed = (new \App\Services\WeatherService())->getWindSpeed($lat, $lon);
                } catch (\Exception $e) {
                    \Illuminate\Support\Facades\Log::error('Weather Service Preview calculation error: ' . $e->getMessage());
                }
            }
            $speed = $speed ?? 5.0;

            $calc = $calculator->calculateWind($speed, $area, $eff);
            $output = $calc['estimated_output'];
            $output = min($output, $capacity);
            $score = $speed > 10 ? 'HIGH' : ($speed > 5 ? 'MEDIUM' : 'LOW');
        } elseif ($type === 'hydro') {
            $flow = (float) $request->input('flow_rate', 0) ?: (float) $request->input('river_flow', 0);
            $head = (float) $request->input('head', 0);
            $eff = $efficiency ?? 0.8;
            $calc = $calculator->calculateHydro($flow, $head, $eff);
            $output = $calc['estimated_output'];
            $output = min($output, $capacity);
            $score = $flow > 15 ? 'HIGH' : ($flow > 5 ? 'MEDIUM' : 'LOW');
        } else {
            $output = $capacity * 0.35;
            $score = 'HIGH';
        }

        return response()->json([
            'estimated_output' => round($output, 2),
            'efficiency_score' => $score,
            'accuracy' => 'PREVIEW_ESTIMATE',
        ]);
    }

    // ==========================================
    // 3. Telemetry & Analytics Services (Public)
    // ==========================================

    /**
     * Fetch community resources for a specific group
     */
    public function groupResources($id)
    {
        $group = Group::findOrFail($id);

        $isMember = $group->users()
            ->where('user_id', auth()->id())
            ->wherePivot('status', 'approved')
            ->exists();

        if (! $isMember) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $resources = Resource::where('group_id', $group->id)->with(['group', 'creator'])->get();

        foreach ($resources as $resource) {
            $resource->attachEnergyData();
        }

        return response()->json($resources);
    }

    /**
     * Get summary for all resource categories
     */
    public function categorySummary()
    {
        $userId = auth()->id();
        $resources = Resource::where(function ($query) use ($userId) {
            $query->where(function ($q) use ($userId) {
                $q->whereNull('group_id')
                    ->where('created_by', $userId);
            })
                ->orWhere(function ($q) use ($userId) {
                    $q->whereNotNull('group_id')
                        ->whereHas('group.users', function ($sub) use ($userId) {
                            $sub->where('users.id', $userId)
                                ->where('group_user.status', 'approved');
                        });
                });
        })->get();

        $summary = [
            'solar' => ['count' => 0, 'total_output' => 0, 'total_capacity' => 0, 'scores' => []],
            'wind' => ['count' => 0, 'total_output' => 0, 'total_capacity' => 0, 'scores' => []],
            'hydro' => ['count' => 0, 'total_output' => 0, 'total_capacity' => 0, 'scores' => []],
            'biomass' => ['count' => 0, 'total_output' => 0, 'total_capacity' => 0, 'scores' => []],
            'geothermal' => ['count' => 0, 'total_output' => 0, 'total_capacity' => 0, 'scores' => []],
        ];

        foreach ($resources as $resource) {
            $resource->attachEnergyData();
            $type = $resource->type;
            if (isset($summary[$type])) {
                $summary[$type]['count']++;
                $summary[$type]['total_output'] += $resource->energy_insight['estimated_output'] ?? 0;
                $summary[$type]['total_capacity'] += $resource->capacity ?? 0;
                $summary[$type]['scores'][] = $resource->energy_insight['efficiency_score'];
            }
        }

        foreach ($summary as $type => &$data) {
            $data['avg_efficiency'] = $this->calculateAverageEfficiency($data['scores']);
            $data['total_output'] = round($data['total_output'], 2);
            $data['total_capacity'] = round($data['total_capacity'], 1);
            $data['co2_displacement'] = round($data['total_output'] * 280);
            $data['trend'] = $this->calculateCategoryTrend($type, $data['total_output']);
            unset($data['scores']);
        }

        return response()->json($summary);
    }

    /**
     * Retrieve historic telemetry metrics, generating simulated values if none exist
     */
    public function metrics($id)
    {
        $resource = Resource::findOrFail($id);

        if (! $this->hasReadAccess($resource)) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $metrics = $resource->metrics()
            ->where('recorded_at', '>=', now()->subHours(24))
            ->orderBy('recorded_at', 'asc')
            ->get();

        if ($metrics->isEmpty()) {
            $now = \Carbon\Carbon::now();
            for ($i = 24; $i >= 0; $i--) {
                $recordedAt = clone $now;
                $recordedAt->subHours($i);
                $hour = $recordedAt->hour;

                $metric = new \App\Models\ResourceMetric();
                $metric->resource_id = $resource->id;
                $metric->recorded_at = $recordedAt;

                if ($resource->type === 'solar') {
                    $sunFactor = max(0, sin(($hour - 6) * M_PI / 12));
                    $irradiance = 800 * $sunFactor + rand(0, 30);
                    $output = ($irradiance / 1000) * $resource->capacity * ($resource->efficiency ?: 0.18);
                    
                    $metric->irradiance = $irradiance;
                    $metric->estimated_output = round($output, 2);
                    $metric->utilization = $resource->capacity > 0 ? round(($output / $resource->capacity) * 100, 2) : 0;
                } elseif ($resource->type === 'wind') {
                    $windSpeed = 5 + rand(0, 100)/10 + (sin($hour * M_PI / 12) * 5);
                    $output = min($resource->capacity, pow($windSpeed, 3) * 0.002 * $resource->capacity * ($resource->efficiency ?: 0.35));
                    
                    $metric->wind_speed = $windSpeed;
                    $metric->estimated_output = round($output, 2);
                    $metric->utilization = $resource->capacity > 0 ? round(($output / $resource->capacity) * 100, 2) : 0;
                } else {
                    $outputFactor = 0.8 + (rand(0, 20) / 100);
                    $output = min($resource->capacity, $resource->capacity * ($resource->efficiency ?: 0.5) * $outputFactor);
                    
                    $metric->estimated_output = round($output, 2);
                    $metric->utilization = $resource->capacity > 0 ? round(($output / $resource->capacity) * 100, 2) : 0;
                }

                $metric->save();
            }

            $metrics = $resource->metrics()
                ->where('recorded_at', '>=', now()->subHours(24))
                ->orderBy('recorded_at', 'asc')
                ->get();
        }

        $formatted = $metrics->map(function ($metric) {
            return [
                'time' => $metric->recorded_at->format('H:i'),
                'output' => $metric->estimated_output,
                'wind' => $metric->wind_speed,
                'irradiance' => $metric->irradiance,
                'utilization' => $metric->utilization,
            ];
        });

        return response()->json($formatted);
    }

    /**
     * Compute simulated hourly output trend for a category
     */
    private function calculateCategoryTrend($type, $totalOutput)
    {
        $lowerType = strtolower($type);
        $roundVal = function($val) { return round($val, 1); };

        if ($lowerType === 'solar') {
            return [
                ['hour' => '08:00', 'output' => $roundVal($totalOutput * 0.15)],
                ['hour' => '10:00', 'output' => $roundVal($totalOutput * 0.55)],
                ['hour' => '12:00', 'output' => $roundVal($totalOutput * 1.0)],
                ['hour' => '14:00', 'output' => $roundVal($totalOutput * 0.9)],
                ['hour' => '16:00', 'output' => $roundVal($totalOutput * 0.45)],
                ['hour' => '18:00', 'output' => $roundVal($totalOutput * 0.1)],
            ];
        } elseif ($lowerType === 'wind') {
            return [
                ['hour' => '08:00', 'output' => $roundVal($totalOutput * 0.65)],
                ['hour' => '10:00', 'output' => $roundVal($totalOutput * 0.75)],
                ['hour' => '12:00', 'output' => $roundVal($totalOutput * 0.92)],
                ['hour' => '14:00', 'output' => $roundVal($totalOutput * 0.82)],
                ['hour' => '16:00', 'output' => $roundVal($totalOutput * 0.88)],
                ['hour' => '18:00', 'output' => $roundVal($totalOutput * 1.0)],
            ];
        } elseif ($lowerType === 'hydro') {
            return [
                ['hour' => '08:00', 'output' => $roundVal($totalOutput * 0.95)],
                ['hour' => '10:00', 'output' => $roundVal($totalOutput * 0.96)],
                ['hour' => '12:00', 'output' => $roundVal($totalOutput * 1.0)],
                ['hour' => '14:00', 'output' => $roundVal($totalOutput * 0.98)],
                ['hour' => '16:00', 'output' => $roundVal($totalOutput * 0.95)],
                ['hour' => '18:00', 'output' => $roundVal($totalOutput * 0.95)],
            ];
        } elseif ($lowerType === 'biomass') {
            return [
                ['hour' => '08:00', 'output' => $roundVal($totalOutput * 0.68)],
                ['hour' => '10:00', 'output' => $roundVal($totalOutput * 0.85)],
                ['hour' => '12:00', 'output' => $roundVal($totalOutput * 1.0)],
                ['hour' => '14:00', 'output' => $roundVal($totalOutput * 1.0)],
                ['hour' => '16:00', 'output' => $roundVal($totalOutput * 0.78)],
                ['hour' => '18:00', 'output' => $roundVal($totalOutput * 0.68)],
            ];
        } else {
            return [
                ['hour' => '08:00', 'output' => $roundVal($totalOutput * 1.0)],
                ['hour' => '10:00', 'output' => $roundVal($totalOutput * 1.0)],
                ['hour' => '12:00', 'output' => $roundVal($totalOutput * 1.0)],
                ['hour' => '14:00', 'output' => $roundVal($totalOutput * 1.0)],
                ['hour' => '16:00', 'output' => $roundVal($totalOutput * 1.0)],
                ['hour' => '18:00', 'output' => $roundVal($totalOutput * 1.0)],
            ];
        }
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\Group;
use App\Models\Resource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ResourceController extends Controller
{
    /**
     * Reusable role checker helper (Unit VI: Relationships & Pivot tables)
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
     * Display all accessible resources (Unit VI: Eloquent CRUD / Query builder)
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

        // Unit IV: Request retrieval
        if ($request->filled('search')) {
            $query->where('title', 'like', '%'.$request->input('search').'%');
        }

        if ($request->filled('type')) {
            $query->where('type', $request->input('type'));
        }

        $resources = $query->with('group')->get();

        foreach ($resources as $resource) {
            $resource->attachEnergyData();
        }

        return response()->json($resources);
    }

    /**
     * Fetch community resources for a specific group (Unit VI: Pivot constraints)
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

        $resources = Resource::where('group_id', $group->id)->with('group')->get();

        foreach ($resources as $resource) {
            $resource->attachEnergyData();
        }

        return response()->json($resources);
    }

    /**
     * Store a newly created resource (Unit V validation & Unit VI Eloquent insert)
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
            // Community resource context
            $group = Group::findOrFail($validated['group_id']);
            if (! $this->hasRole($group, ['owner'])) {
                return response()->json(['error' => 'Forbidden: Only group owners can create resources under this group'], 403);
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
     * Display the specified resource details (Unit VI Eloquent query)
     */
    public function show($id)
    {
        $resource = Resource::with('group')->findOrFail($id);

        if ($resource->group_id) {
            // Community resource
            $isMember = $resource->group->users()
                ->where('user_id', auth()->id())
                ->wherePivot('status', 'approved')
                ->exists();

            if (! $isMember) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }
        } else {
            // Individual resource
            if ($resource->created_by !== auth()->id()) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }
        }

        $resource->attachEnergyData();

        return response()->json($resource);
    }

    /**
     * Update the specified resource (Unit V validation & Unit VI Eloquent update)
     */
    public function update(Request $request, $id)
    {
        $resource = Resource::findOrFail($id);

        if (! $resource->group_id) {
            // Individual
            if ($resource->created_by !== auth()->id()) {
                return response()->json(['error' => 'Forbidden: Access denied to individual resource'], 403);
            }
        } else {
            // Community
            $group = $resource->group;
            if (
                auth()->id() !== $resource->created_by &&
                ! $this->hasRole($group, ['owner'])
            ) {
                return response()->json(['error' => 'Forbidden: Insufficient permissions for community resource'], 403);
            }
        }

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'sometimes|required|in:active,inactive,maintenance',
            'capacity' => 'sometimes|required|numeric|min:0',
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
        ]);

        $resource->update($validated);
        $resource->attachEnergyData();

        return response()->json($resource);
    }

    /**
     * Remove the specified resource (Unit VI Eloquent delete)
     */
    public function destroy($id)
    {
        $resource = Resource::findOrFail($id);

        if (! $resource->group_id) {
            // Individual
            if ($resource->created_by !== auth()->id()) {
                return response()->json(['error' => 'Forbidden'], 403);
            }
        } else {
            // Community
            $group = $resource->group;
            if (
                auth()->id() !== $resource->created_by &&
                ! $this->hasRole($group, ['owner'])
            ) {
                return response()->json(['error' => 'Forbidden'], 403);
            }
        }

        $resource->delete();

        return response()->json(['message' => 'Resource deleted successfully']);
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
            'solar' => ['count' => 0, 'total_output' => 0, 'scores' => []],
            'wind' => ['count' => 0, 'total_output' => 0, 'scores' => []],
            'hydro' => ['count' => 0, 'total_output' => 0, 'scores' => []],
            'biomass' => ['count' => 0, 'total_output' => 0, 'scores' => []],
            'geothermal' => ['count' => 0, 'total_output' => 0, 'scores' => []],
        ];

        foreach ($resources as $resource) {
            $resource->attachEnergyData();
            $type = $resource->type;
            if (isset($summary[$type])) {
                $summary[$type]['count']++;
                $summary[$type]['total_output'] += $resource->energy_insight['estimated_output'] ?? 0;
                $summary[$type]['scores'][] = $resource->energy_insight['efficiency_score'];
            }
        }

        foreach ($summary as $type => &$data) {
            $data['avg_efficiency'] = $this->calculateAverageEfficiency($data['scores']);
            $data['total_output'] = round($data['total_output'], 2);
            unset($data['scores']);
        }

        return response()->json($summary);
    }

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

    /**
     * Retrieve historic metrics/simulate if empty (Unit VI database seeding / Eloquent query)
     */
    public function metrics($id)
    {
        $resource = Resource::findOrFail($id);

        if ($resource->group_id) {
            $isMember = $resource->group->users()
                ->where('user_id', auth()->id())
                ->wherePivot('status', 'approved')
                ->exists();

            if (! $isMember) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }
        } else {
            if ($resource->created_by !== auth()->id()) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }
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

}

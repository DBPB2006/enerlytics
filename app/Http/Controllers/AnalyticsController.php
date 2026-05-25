<?php

namespace App\Http\Controllers;

use App\Models\Resource;
class AnalyticsController extends Controller
{

    public function index()
    {
        $userId = auth()->id();

        // Fetch all accessible resources (Personal + Community)
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

        $processedResources = [];
        $totalOutput = 0;
        $communityOutput = 0;
        $topResource = null;
        $distribution = [
            'solar' => 0,
            'wind' => 0,
            'hydro' => 0,
            'biomass' => 0,
            'geothermal' => 0,
        ];
        $scores = [];

        $categories = [
            'solar' => ['count' => 0, 'total_capacity' => 0],
            'wind' => ['count' => 0, 'total_capacity' => 0],
            'hydro' => ['count' => 0, 'total_capacity' => 0],
            'biomass' => ['count' => 0, 'total_capacity' => 0],
            'geothermal' => ['count' => 0, 'total_capacity' => 0],
        ];

        foreach ($resources as $resource) {
            $resource->attachEnergyData();

            $output = $resource->energy_insight['estimated_output'] ?? 0;
            $totalOutput += $output;

            if ($resource->group_id) {
                $communityOutput += $output;
            }

            if (! $topResource || $output > ($topResource['output'] ?? 0)) {
                $topResource = [
                    'title' => $resource->title,
                    'output' => $output,
                ];
            }

            $distribution[$resource->type]++;
            $scores[] = $resource->energy_insight['efficiency_score'];

            if (isset($categories[$resource->type])) {
                $categories[$resource->type]['count']++;
                $categories[$resource->type]['total_capacity'] += $resource->capacity ?? 0;
            }

            $processedResources[] = [
                'id' => $resource->id,
                'title' => $resource->title,
                'type' => $resource->type,
                'estimated_output' => $output,
                'unit' => $resource->energy_insight['unit'],
                'efficiency_score' => $resource->energy_insight['efficiency_score'],
                'utilization' => $resource->utilization,
                'insight' => $resource->insight,
                'latitude' => $resource->latitude,
                'longitude' => $resource->longitude,
            ];
        }

        $resourceIds = $resources->pluck('id')->toArray();
        $metricsQuery = \App\Models\ResourceMetric::whereIn('resource_id', $resourceIds)
            ->where('recorded_at', '>=', now()->subHours(24))
            ->orderBy('recorded_at', 'asc')
            ->get();

        $charts = [
            'pulse' => [],
            'correlation' => [],
            'trend' => [],
        ];

        // Group metrics by hour
        $groupedMetrics = $metricsQuery->groupBy(function($item) {
            return \Carbon\Carbon::parse($item->recorded_at)->format('Y-m-d H:00');
        });

        foreach ($groupedMetrics as $time => $hourlyMetrics) {
            $formattedTime = \Carbon\Carbon::parse($time)->format('H:i');
            $totalOutputHourly = $hourlyMetrics->sum('estimated_output');
            
            $charts['pulse'][] = [
                'time' => $formattedTime,
                'output' => round($totalOutputHourly, 2)
            ];

            $avgVector = 0;
            $vectorsCount = 0;
            foreach ($hourlyMetrics as $m) {
                if (!is_null($m->irradiance)) { $avgVector += $m->irradiance; $vectorsCount++; }
                if (!is_null($m->wind_speed)) { $avgVector += $m->wind_speed; $vectorsCount++; }
            }
            
            $charts['correlation'][] = [
                'time' => $formattedTime,
                'output' => round($totalOutputHourly, 2),
                'vector' => $vectorsCount > 0 ? round($avgVector / $vectorsCount, 2) : 0,
            ];

            $avgUtilization = $hourlyMetrics->avg('utilization');
            $charts['trend'][] = [
                'time' => $formattedTime,
                'utilization' => round($avgUtilization, 2),
            ];
        }

        return response()->json([
            'summary' => [
                'total_resources' => count($resources),
                'total_output' => round($totalOutput, 2),
                'average_efficiency' => $this->calculateAverageEfficiency($scores),
            ],
            'categories' => $categories,
            'charts' => $charts,
            'resources' => $processedResources,
            'community' => [
                'total_output' => round($communityOutput, 2),
                'top_resource' => $topResource ? $topResource['title'] : 'N/A',
                'distribution' => $this->calculateDistributionPercentages($distribution),
            ],
        ]);
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

    private function calculateDistributionPercentages($distribution)
    {
        $total = array_sum($distribution);
        if ($total === 0) {
            return $distribution;
        }

        $percentages = [];
        foreach ($distribution as $type => $count) {
            $percentages[$type] = round(($count / $total) * 100);
        }

        return $percentages;
    }
}

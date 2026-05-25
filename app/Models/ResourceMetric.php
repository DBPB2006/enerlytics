<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ResourceMetric extends Model
{
    protected $fillable = [
        'resource_id',
        'wind_speed',
        'irradiance',
        'estimated_output',
        'utilization',
        'recorded_at',
    ];

    protected $casts = [
        'recorded_at' => 'datetime',
        'wind_speed' => 'float',
        'irradiance' => 'float',
        'estimated_output' => 'float',
        'utilization' => 'float',
    ];

    public function resource()
    {
        return $this->belongsTo(Resource::class);
    }
}

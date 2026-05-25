<?php

namespace App\Services;

class EnergyCalculator
{
    public function calculateSolar($irradiance, $area, $efficiency)
    {
        $area = $area ?? 0;
        $efficiency = $efficiency ?? 0.7;
        
        $outputKwh = $irradiance * $area * $efficiency;
        $outputMw = $outputKwh / 24 / 1000;

        return [
            'estimated_output' => round($outputMw, 2),
            'unit' => 'MW',
            'efficiency_score' => $this->getScoreFromOutput($outputMw),
        ];
    }

    public function calculateWind($windSpeed, $area, $efficiency)
    {
        $area = $area ?? 0;
        $efficiency = $efficiency ?? 0.4;
        $rho = 1.225;
        
        $outputW = 0.5 * $rho * $area * pow($windSpeed, 3) * $efficiency;
        $outputMw = $outputW / 1000000;

        return [
            'estimated_output' => round($outputMw, 2),
            'unit' => 'MW',
            'efficiency_score' => $this->getScoreFromOutput($outputMw),
        ];
    }

    public function calculateHydro($flowRate, $head, $efficiency)
    {
        $flowRate = $flowRate ?? 0;
        $head = $head ?? 0;
        $efficiency = $efficiency ?? 0.8;
        $rho = 1000;
        $g = 9.81;
        
        $outputW = $rho * $g * $flowRate * $head * $efficiency;
        $outputMw = $outputW / 1000000;

        return [
            'estimated_output' => round($outputMw, 2),
            'unit' => 'MW',
            'efficiency_score' => $this->getScoreFromOutput($outputMw),
        ];
    }

    public function calculateBiomass($capacity, $efficiency, $moisture = 15.0)
    {
        $capacity = $capacity ?? 0;
        $efficiency = $efficiency ?? 0.45;
        
        // Stubble dryness factor lowers gasification output if moisture is high
        $drynessFactor = max(0.5, 1 - ($moisture / 100));
        $outputMw = $capacity * $efficiency * $drynessFactor;

        return [
            'estimated_output' => round($outputMw, 2),
            'unit' => 'MW',
            'efficiency_score' => $this->getScoreFromOutput($outputMw),
        ];
    }

    public function calculateGeothermal($capacity, $efficiency, $coreTemp = 180.0)
    {
        $capacity = $capacity ?? 0;
        $efficiency = $efficiency ?? 0.90;
        
        // Geothermal output scales with steam temperature relative to 180C baseline design temp
        $tempFactor = min(1.2, max(0.7, $coreTemp / 180.0));
        $outputMw = $capacity * $efficiency * $tempFactor;

        return [
            'estimated_output' => round($outputMw, 2),
            'unit' => 'MW',
            'efficiency_score' => $this->getScoreFromOutput($outputMw),
        ];
    }

    private function getScoreFromOutput($output)
    {
        if ($output > 10) {
            return 'high';
        }
        if ($output > 3) {
            return 'medium';
        }
        return 'low';
    }
}

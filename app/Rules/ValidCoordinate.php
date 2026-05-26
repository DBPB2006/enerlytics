<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class ValidCoordinate implements ValidationRule
{
    protected $type;

    public function __construct(string $type = 'latitude')
    {
        $this->type = strtolower($type);
    }

    /**
     * Run the validation rule.
     *
     * @param  \Closure(string): \Illuminate\Translation\PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (!is_numeric($value)) {
            $fail("The {$attribute} must be a valid numeric coordinate.");
            return;
        }

        $num = (float) $value;

        if ($this->type === 'latitude') {
            if ($num < -90 || $num > 90) {
                $fail("The {$attribute} must be a valid latitude between -90 and 90 degrees.");
            }
        } elseif ($this->type === 'longitude') {
            if ($num < -180 || $num > 180) {
                $fail("The {$attribute} must be a valid longitude between -180 and 180 degrees.");
            }
        }
    }
}

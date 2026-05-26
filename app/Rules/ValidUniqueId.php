<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class ValidUniqueId implements ValidationRule
{
    /**
     * Run the validation rule.
     *
     * @param  \Closure(string): \Illuminate\Translation\PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (!is_string($value) || !preg_match('/^[A-Z]{2}-\d{6}$/', $value)) {
            $fail("The {$attribute} is invalid. It must consist of two uppercase prefix letters, a hyphen, and six numeric digits (e.g., EP-012345 or CL-987654).");
        }
    }
}

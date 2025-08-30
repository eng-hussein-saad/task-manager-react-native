export interface PasswordRules {
  minLength: number;
  minLowercase: number;
  minUppercase: number;
  minNumbers: number;
  minSymbols: number;
}

export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
}

export function validatePassword(
  password: string,
  rules: PasswordRules
): PasswordValidationResult {
  const errors: string[] = [];
  if (password.length < rules.minLength)
    errors.push(`At least ${rules.minLength} characters`);
  if ((password.match(/[a-z]/g) || []).length < rules.minLowercase)
    errors.push(`At least ${rules.minLowercase} lowercase letter`);
  if ((password.match(/[A-Z]/g) || []).length < rules.minUppercase)
    errors.push(`At least ${rules.minUppercase} uppercase letter`);
  if ((password.match(/[0-9]/g) || []).length < rules.minNumbers)
    errors.push(`At least ${rules.minNumbers} number`);
  if ((password.match(/[^\w\s]/g) || []).length < rules.minSymbols)
    errors.push(`At least ${rules.minSymbols} symbol`);
  return { valid: errors.length === 0, errors };
}

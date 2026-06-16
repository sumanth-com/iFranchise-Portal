export type PasswordRequirement = {
  id: string;
  label: string;
  test: (password: string) => boolean;
};

export const PASSWORD_REQUIREMENTS: PasswordRequirement[] = [
  {
    id: "length",
    label: "At least 8 characters",
    test: (p) => p.length >= 8,
  },
  {
    id: "upper",
    label: "One uppercase letter",
    test: (p) => /[A-Z]/.test(p),
  },
  {
    id: "lower",
    label: "One lowercase letter",
    test: (p) => /[a-z]/.test(p),
  },
  {
    id: "number",
    label: "One number",
    test: (p) => /\d/.test(p),
  },
  {
    id: "special",
    label: "One special character",
    test: (p) => /[^A-Za-z0-9]/.test(p),
  },
];

export type PasswordStrength = {
  score: number;
  label: "Weak" | "Fair" | "Good" | "Strong";
  passed: boolean;
  requirements: Array<PasswordRequirement & { met: boolean }>;
};

export function evaluatePasswordStrength(password: string): PasswordStrength {
  const requirements = PASSWORD_REQUIREMENTS.map((req) => ({
    ...req,
    met: req.test(password),
  }));
  const metCount = requirements.filter((r) => r.met).length;
  const passed = metCount === requirements.length;

  let label: PasswordStrength["label"] = "Weak";
  if (metCount >= 5) label = "Strong";
  else if (metCount >= 4) label = "Good";
  else if (metCount >= 3) label = "Fair";

  return {
    score: metCount,
    label,
    passed,
    requirements,
  };
}

export function validatePasswordPolicy(password: string): string | null {
  const strength = evaluatePasswordStrength(password);
  if (strength.passed) return null;

  const firstMissing = strength.requirements.find((r) => !r.met);
  return firstMissing
    ? `Password must include ${firstMissing.label.toLowerCase()}.`
    : "Password does not meet security requirements.";
}

export function formatInvestmentRange(
  min: number | null | undefined,
  max: number | null | undefined,
): string {
  if (min == null && max == null) return "Investment on request";
  if (min != null && max != null) {
    return `₹${formatIndian(min)} – ₹${formatIndian(max)}`;
  }
  if (min != null) return `From ₹${formatIndian(min)}`;
  return `Up to ₹${formatIndian(max!)}`;
}

function formatIndian(value: number): string {
  if (value >= 10_000_000) return `${(value / 10_000_000).toFixed(1)}Cr`;
  if (value >= 100_000) return `${(value / 100_000).toFixed(1)}L`;
  return value.toLocaleString("en-IN");
}

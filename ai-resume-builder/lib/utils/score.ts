export function scoreVariant(score: number): "success" | "warning" | "outline" {
  if (score >= 80) return "success"
  if (score >= 60) return "warning"
  return "outline"
}

export function scoreLabel(score: number) {
  if (score >= 85) return "Excellent"
  if (score >= 70) return "Strong"
  if (score >= 50) return "Needs work"
  return "Low"
}

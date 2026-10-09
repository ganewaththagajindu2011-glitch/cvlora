export type QualityTier = 'low' | 'medium' | 'high';
export function qualityTier(input: {
  cores: number;
  memory: number;
  reducedMotion: boolean;
  reducedData: boolean;
  fps: number;
}): QualityTier {
  if (
    input.reducedMotion ||
    input.reducedData ||
    input.cores <= 2 ||
    input.memory <= 2 ||
    input.fps < 35
  )
    return 'low';
  if (input.cores <= 4 || input.memory <= 4 || input.fps < 55) return 'medium';
  return 'high';
}

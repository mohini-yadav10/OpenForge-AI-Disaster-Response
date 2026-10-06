import { describe, it, expect } from 'vitest';
import { cosineSimilarity } from '../utils/math';

describe('cosineSimilarity', () => {
  it('calculates 1 for identical vectors', () => {
    const a = [1, 2, 3];
    const b = [1, 2, 3];
    expect(cosineSimilarity(a, b)).toBeCloseTo(1);
  });

  it('calculates 0 for orthogonal vectors', () => {
    const a = [1, 0, 0];
    const b = [0, 1, 0];
    expect(cosineSimilarity(a, b)).toBeCloseTo(0);
  });

  it('calculates correct value for different vectors', () => {
    const a = [1, 2, 3];
    const b = [4, 5, 6];
    // Dot product: 4 + 10 + 18 = 32
    // Norm A: sqrt(1+4+9) = sqrt(14)
    // Norm B: sqrt(16+25+36) = sqrt(77)
    // cos = 32 / sqrt(1078) ≈ 0.97463
    expect(cosineSimilarity(a, b)).toBeCloseTo(0.97463, 4);
  });

  it('returns 0 for zero vectors', () => {
    const a = [0, 0, 0];
    const b = [1, 2, 3];
    expect(cosineSimilarity(a, b)).toBe(0);
  });

  it('throws error for mismatched lengths', () => {
    const a = [1, 2];
    const b = [1, 2, 3];
    expect(() => cosineSimilarity(a, b)).toThrow('Vectors must have the same length');
  });
});

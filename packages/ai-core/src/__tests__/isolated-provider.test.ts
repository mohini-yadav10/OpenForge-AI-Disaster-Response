import { describe, it, expect } from 'vitest';
import { OpenWeightProvider } from '../provider';

describe('OpenWeightProvider Isolated', () => {
  it('bubbles up inference failures when Ollama is offline', async () => {
    const provider = new OpenWeightProvider();
    await expect(provider.generateText("Hello")).rejects.toThrow(/Inference Failed/);
  });
});

import { describe, it, expect } from 'vitest';
import { CalculatorTool, DateTimeTool } from '../tool';

describe('CalculatorTool', () => {
  it('evaluates basic math expressions correctly', async () => {
    const calc = new CalculatorTool();
    const result = await calc.execute({ expression: '245 * 18' });
    expect(result.result).toBe('4410');
  });

  it('handles invalid math expressions gracefully', async () => {
    const calc = new CalculatorTool();
    const result = await calc.execute({ expression: '100 / 0' });
    // In JS, 100/0 is Infinity
    expect(result.result).toBe('Infinity');
  });

  it('rejects malicious JavaScript payloads', async () => {
    const calc = new CalculatorTool();
    const result1 = await calc.execute({ expression: 'alert(1)' });
    expect(result1.error).toContain('Invalid characters');
    
    const result2 = await calc.execute({ expression: 'require("fs")' });
    expect(result2.error).toContain('Invalid characters');
    
    const result3 = await calc.execute({ expression: 'console.log(1)' });
    expect(result3.error).toContain('Invalid characters');
  });
});


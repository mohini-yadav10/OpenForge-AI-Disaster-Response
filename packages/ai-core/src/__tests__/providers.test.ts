import { describe, it, expect } from 'vitest';
import { ModelRegistry, ModelRouter } from '../providers/ModelRouter';
import { MockProvider } from '../provider';

describe('ModelRouter', () => {
  it('registers providers and routes based on deterministic rules', () => {
    const registry = new ModelRegistry();
    
    const defaultMock = new MockProvider();
    
    const advancedMock = new MockProvider();
    advancedMock.name = 'ProProvider'; // Rename for test

    registry.register(defaultMock);
    registry.register(advancedMock);

    const router = new ModelRouter(registry);
    console.log("REGISTERED PROVIDERS:", registry.getAll().map(p => p.name));

    // Should route to ProProvider for analytical tasks
    const p1 = router.route({ id: '1', input: 'analyze this complex equation' });
    expect(p1.name).toBe('ProProvider');

    // Should route to MockProvider for demo tasks
    const p2 = router.route({ id: '2', input: 'run a demo query' });
    expect(p2.name).toBe('MockProvider');

    // Default fallback
    const p3 = router.route({ id: '3', input: 'just say hello' });
    expect(p3.name).toBe('MockProvider'); // Default mock is first in registry
  });
});

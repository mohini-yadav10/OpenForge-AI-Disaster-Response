import { test, expect } from '@playwright/test';
import axios from 'axios';

test.describe('Real LLM Inference', () => {

  test('AI Assistant responds using real Ollama model', async ({ page }) => {
    test.setTimeout(60000); // LLM might take a bit longer
    
    // 1. Check if Ollama is available and has the configured model
    const ollamaUrl = process.env.MODEL_BASE_URL || 'http://localhost:11434/api';
    const modelName = process.env.MODEL_NAME || 'llama3';
    
    try {
      const response = await axios.get(`${ollamaUrl.replace('/api', '')}/api/tags`, { timeout: 2000 });
      const models = response.data.models || [];
      const hasModel = models.some((m: any) => m.name === modelName || m.name.startsWith(modelName + ':'));
      
      if (!hasModel) {
        test.skip(true, `Model ${modelName} is not installed in Ollama. Skipping real inference test.`);
        return;
      }
    } catch (err) {
      test.skip(true, `Ollama is not available at ${ollamaUrl}. Skipping real inference test.`);
      return;
    }

    // Model exists, proceed with real inference test
    await page.goto('/chat');
    
    // Ask question
    const input = page.getByPlaceholder('Message OpenForge...');
    await input.fill('What should I do during a flood?');
    await input.press('Enter');
    
    // Wait for the response (Bot avatar indicates a response)
    // We expect a non-empty text response that isn't the error message
    // The generation text might take a few seconds
    
    const botMessages = page.locator('.prose'); // ReactMarkdown wrappers
    
    // Wait for at least one bot message to be fully rendered (meaning generating state is gone)
    await expect(page.getByText('Thinking...')).toBeVisible();
    await expect(page.getByText('Thinking...')).toBeHidden({ timeout: 45000 });
    
    // Get the last bot message text
    const lastMessage = botMessages.last();
    const text = await lastMessage.textContent();
    
    // Assert it exists, is not empty, and is not an error message
    expect(text).toBeTruthy();
    expect(text?.length).toBeGreaterThan(10);
    expect(text).not.toContain('Local model "llama3" is not installed');
    expect(text).not.toContain('Error connecting to server');
  });

});

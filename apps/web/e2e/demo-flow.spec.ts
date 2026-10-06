import { test, expect } from '@playwright/test';

test.describe('DisasterAI Critical Demo E2E', () => {

  test('Dashboard loads and displays key sections', async ({ page }) => {
    await page.goto('/');
    
    // Verify Dashboard loads
    await expect(page.getByText('OpenForge DisasterAI')).toBeVisible();
    
    // Verify key sections
    await expect(page.getByText('Active Events')).toBeVisible();
    await expect(page.getByText('High-Risk Areas')).toBeVisible();
    await expect(page.getByText('Early Warnings')).toBeVisible();
    await expect(page.getByText('Incident Reports')).toBeVisible();
    
    // Verify Demo labels where applicable
    await expect(page.getByText('DEMO / SIMULATED', { exact: false }).first()).toBeVisible();
  });

  test('Risk Map loads and displays demo scenario', async ({ page }) => {
    await page.goto('/risk-map');
    
    // Verify page loads
    await expect(page.getByTestId('risk-map')).toBeVisible();
    
    // Verify DEMO label
    await expect(page.getByText('DEMO / SIMULATED DATA')).toBeVisible();
    
    // Verify legends exist (case insensitive matching)
    await expect(page.getByText('LOW', { exact: true })).toBeVisible();
    await expect(page.getByText('MEDIUM', { exact: true })).toBeVisible();
    await expect(page.getByText('HIGH', { exact: true })).toBeVisible();
    await expect(page.getByText('CRITICAL', { exact: true })).toBeVisible();
    
    // Wait for scenarios to load (at least one marker)
    const marker = page.getByTestId('risk-marker').first();
    await expect(marker).toBeVisible();
    
    // Click marker
    await marker.click();
    
    // Verify details panel
    const details = page.getByTestId('risk-details');
    await expect(details).toBeVisible();
    
    // We expect some basic data in details (e.g. Flood, Critical)
    await expect(details.getByText('Flood')).toBeVisible();
    await expect(details.getByText('Critical', { exact: true })).toBeVisible();
  });

  test('Incidents page allows reporting a new incident', async ({ page }) => {
    await page.goto('/incidents');
    
    // Verify list renders
    await expect(page.getByText('Active Incidents')).toBeVisible();
    await expect(page.getByText('Report New Incident')).toBeVisible();
    
    // Generate unique incident data
    const timestamp = Date.now().toString();
    const testLocation = `Test Location ${timestamp}`;
    
    // Fill form
    await page.getByTestId('incident-type-select').selectOption('Wildfire');
    await page.getByTestId('incident-location-input').fill(testLocation);
    await page.getByTestId('incident-severity-select').selectOption('High');
    await page.getByTestId('incident-description-input').fill('E2E Test Wildfire description');
    
    // Submit
    await page.getByTestId('incident-submit-btn').click();
    
    // Verify success feedback
    await expect(page.getByText('Incident reported successfully!')).toBeVisible();
    
    // Verify new incident appears in the list
    await expect(page.getByTestId('incident-card').filter({ hasText: testLocation })).toBeVisible();
  });

  test('AI Model Missing Error Handling', async ({ page }) => {
    // Mock the /api/chat endpoint ONLY for this test
    await page.route('**/api/chat', async route => {
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ error: "model 'llama3' not found" })
      });
    });

    await page.goto('/chat');
    
    // Ask a question
    const input = page.getByPlaceholder('Message OpenForge...');
    await input.fill('What should I do during a flood?');
    await input.press('Enter');
    
    // Verify specific explicit error message is displayed in the chat
    await expect(page.getByText('Local model "llama3" is not installed. Run: ollama pull llama3')).toBeVisible();
  });

});

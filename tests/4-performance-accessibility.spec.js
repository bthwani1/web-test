const { test, expect } = require('@playwright/test');

test.describe('Performance and Accessibility Tests', () => {
  test('Page loads within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    
    // Wait for main content to load
    await expect(page.locator('h1')).toContainText('رحلة _ Rahla');
    await expect(page.locator('.product-card')).toHaveCount({ min: 1 });
    
    const loadTime = Date.now() - startTime;
    
    // Page should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
    
    console.log(`Page load time: ${loadTime}ms`);
  });
  
  test('Images are optimized and load properly', async ({ page }) => {
    await page.goto('/');
    
    // Wait for images to load
    await page.waitForLoadState('networkidle');
    
    // Check image loading
    const images = page.locator('img');
    const imageCount = await images.count();
    
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      
      // Check if image has proper attributes
      await expect(img).toHaveAttribute('alt');
      await expect(img).toHaveAttribute('loading', 'lazy');
      
      // Check if image loaded successfully
      const isLoaded = await img.evaluate(el => el.complete && el.naturalWidth > 0);
      expect(isLoaded).toBe(true);
    }
  });
  
  test('Page is responsive on different screen sizes', async ({ page }) => {
    await page.goto('/');
    
    // Test mobile viewport (375x667)
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('.product-card')).toBeVisible();
    await expect(page.locator('h1')).toBeVisible();
    
    // Test tablet viewport (768x1024)
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('.product-card')).toBeVisible();
    await expect(page.locator('.products-grid')).toBeVisible();
    
    // Test desktop viewport (1920x1080)
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator('.product-card')).toBeVisible();
    await expect(page.locator('.products-grid')).toBeVisible();
    
    // Check that layout adapts properly
    const gridElement = page.locator('.products-grid');
    const gridStyles = await gridElement.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return {
        display: styles.display,
        gridTemplateColumns: styles.gridTemplateColumns
      };
    });
    
    expect(gridStyles.display).toBe('grid');
  });
  
  test('Keyboard navigation works properly', async ({ page }) => {
    await page.goto('/');
    
    // Test Tab navigation
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Check if focus is visible
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    // Test Enter key on buttons
    const firstButton = page.locator('.add-to-cart').first();
    await firstButton.focus();
    await page.keyboard.press('Enter');
    
    // Verify button action was triggered
    await expect(page.locator('#cartList')).toBeVisible();
    
    // Test Escape key
    await page.keyboard.press('Escape');
    
    // Test arrow keys if applicable
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowUp');
  });
  
  test('Screen reader accessibility features work', async ({ page }) => {
    await page.goto('/');
    
    // Check for proper heading structure
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    
    // Check for alt text on images
    const images = page.locator('img');
    const imageCount = await images.count();
    
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const altText = await img.getAttribute('alt');
      expect(altText).toBeTruthy();
      expect(altText.length).toBeGreaterThan(0);
    }
    
    // Check for proper button labels
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);
      const text = await button.textContent();
      const ariaLabel = await button.getAttribute('aria-label');
      
      // Button should have either text content or aria-label
      expect(text || ariaLabel).toBeTruthy();
    }
    
    // Check for proper form labels
    const inputs = page.locator('input');
    const inputCount = await inputs.count();
    
    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledBy = await input.getAttribute('aria-labelledby');
      
      if (id) {
        // Check if there's a label with matching for attribute
        const label = page.locator(`label[for="${id}"]`);
        const hasLabel = await label.count() > 0;
        const hasAriaLabel = ariaLabel || ariaLabelledBy;
        
        expect(hasLabel || hasAriaLabel).toBe(true);
      }
    }
  });
  
  test('Page handles slow network conditions', async ({ page }) => {
    // Simulate slow 3G network
    await page.route('**/*', route => {
      // Add delay to simulate slow network
      setTimeout(() => route.continue(), 100);
    });
    
    const startTime = Date.now();
    await page.goto('/');
    
    // Wait for critical content to load
    await expect(page.locator('h1')).toContainText('رحلة _ Rahla');
    
    const loadTime = Date.now() - startTime;
    
    // Even with slow network, page should load within 10 seconds
    expect(loadTime).toBeLessThan(10000);
    
    console.log(`Slow network load time: ${loadTime}ms`);
  });
  
  test('Page works without JavaScript', async ({ page }) => {
    // Disable JavaScript
    await page.setJavaScriptEnabled(false);
    
    await page.goto('/');
    
    // Check that basic content is still visible
    const body = page.locator('body');
    await expect(body).toBeVisible();
    
    // Check that images still load
    const images = page.locator('img');
    const imageCount = await images.count();
    
    if (imageCount > 0) {
      await expect(images.first()).toBeVisible();
    }
    
    // Re-enable JavaScript for other tests
    await page.setJavaScriptEnabled(true);
  });
  
  test('Page handles high contrast mode', async ({ page }) => {
    await page.goto('/');
    
    // Simulate high contrast mode
    await page.emulateMedia({ colorScheme: 'dark' });
    
    // Check that content is still visible
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('.product-card')).toBeVisible();
    
    // Check text contrast (basic check)
    const h1 = page.locator('h1');
    const textColor = await h1.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return styles.color;
    });
    
    expect(textColor).toBeTruthy();
  });
  
  test('Performance metrics are acceptable', async ({ page }) => {
    // Start performance measurement
    await page.goto('/');
    
    // Get performance metrics
    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      return {
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        firstPaint: performance.getEntriesByType('paint').find(entry => entry.name === 'first-paint')?.startTime,
        firstContentfulPaint: performance.getEntriesByType('paint').find(entry => entry.name === 'first-contentful-paint')?.startTime
      };
    });
    
    // Check performance thresholds
    expect(metrics.domContentLoaded).toBeLessThan(2000); // DOM ready within 2s
    expect(metrics.loadTime).toBeLessThan(3000); // Full load within 3s
    
    if (metrics.firstContentfulPaint) {
      expect(metrics.firstContentfulPaint).toBeLessThan(1500); // FCP within 1.5s
    }
    
    console.log('Performance metrics:', metrics);
  });
});

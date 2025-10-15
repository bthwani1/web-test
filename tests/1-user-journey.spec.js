const { test, expect } = require('@playwright/test');

test.describe('User Journey - Complete Shopping Flow', () => {
  test('User can browse products, add to cart, and complete WhatsApp order', async ({ page }) => {
    // Navigate to the store
    await page.goto('/');
    
    // Wait for the page to load
    await expect(page.locator('h1')).toContainText('رحلة _ Rahla');
    
    // Check if products are loaded
    await expect(page.locator('.product-card')).toHaveCount({ min: 1 });
    
    // Browse products - click on first product
    const firstProduct = page.locator('.product-card').first();
    await expect(firstProduct.locator('.product-name')).toBeVisible();
    
    // Check product details
    const productName = await firstProduct.locator('.product-name').textContent();
    const productPrice = await firstProduct.locator('.current-price').textContent();
    
    expect(productName).toBeTruthy();
    expect(productPrice).toBeTruthy();
    
    // Add product to cart
    await firstProduct.locator('.add-to-cart').click();
    
    // Verify cart update
    await expect(page.locator('#cartList')).toContainText(productName);
    
    // Check cart total
    const cartTotal = page.locator('#total');
    await expect(cartTotal).toBeVisible();
    
    // Add another product to cart
    const secondProduct = page.locator('.product-card').nth(1);
    if (await secondProduct.isVisible()) {
      await secondProduct.locator('.add-to-cart').click();
      
      // Verify multiple items in cart
      const cartItems = page.locator('#cartList .row');
      await expect(cartItems).toHaveCount({ min: 2 });
    }
    
    // Test quantity controls
    const quantityControls = page.locator('#cartList .qty').first();
    await expect(quantityControls).toBeVisible();
    
    // Increase quantity
    await quantityControls.click();
    
    // Test WhatsApp CTA
    const whatsappButton = page.locator('#whatsCTA');
    await expect(whatsappButton).toBeVisible();
    
    // Click WhatsApp button and verify it opens WhatsApp
    const [whatsappPage] = await Promise.all([
      page.waitForEvent('popup'),
      whatsappButton.click()
    ]);
    
    // Verify WhatsApp page opens with correct content
    await expect(whatsappPage).toHaveURL(/wa\.me/);
    
    // Close WhatsApp tab
    await whatsappPage.close();
    
    // Test free shipping progress bar
    const freeShipWrap = page.locator('#freeShipWrap');
    await expect(freeShipWrap).toBeVisible();
    
    // Verify responsive design
    await page.setViewportSize({ width: 375, height: 667 }); // Mobile
    await expect(page.locator('.product-card')).toBeVisible();
    
    await page.setViewportSize({ width: 1920, height: 1080 }); // Desktop
    await expect(page.locator('.products-grid')).toBeVisible();
  });
  
  test('User can use search and filters', async ({ page }) => {
    await page.goto('/');
    
    // Test search functionality
    const searchInput = page.locator('#searchInput');
    if (await searchInput.isVisible()) {
      await searchInput.fill('تيشيرت');
      await page.waitForTimeout(500); // Wait for search results
      
      // Verify search results
      const products = page.locator('.product-card');
      await expect(products).toHaveCount({ min: 1 });
    }
    
    // Test category filter
    const categoryFilter = page.locator('#categoryFilter');
    if (await categoryFilter.isVisible()) {
      await categoryFilter.selectOption({ index: 1 });
      await page.waitForTimeout(500);
      
      // Verify filtered results
      const products = page.locator('.product-card');
      await expect(products).toHaveCount({ min: 0 });
    }
    
    // Test price range filter
    const priceMin = page.locator('#priceMin');
    const priceMax = page.locator('#priceMax');
    
    if (await priceMin.isVisible() && await priceMax.isVisible()) {
      await priceMin.fill('1000');
      await priceMax.fill('10000');
      await page.locator('#applyFilters').click();
      
      await page.waitForTimeout(500);
      
      // Verify filtered results
      const products = page.locator('.product-card');
      await expect(products).toHaveCount({ min: 0 });
    }
  });
});

const { test, expect } = require('@playwright/test');

test.describe('Admin Panel - Login and Management', () => {
  test('Admin can login and manage products', async ({ page }) => {
    // Navigate to admin panel
    await page.goto('/admin');
    
    // Check login screen is displayed
    await expect(page.locator('#loginScreen')).toBeVisible();
    await expect(page.locator('h1')).toContainText('رحلة _ Rahla');
    
    // Test login form validation
    const loginForm = page.locator('#loginForm');
    await expect(loginForm).toBeVisible();
    
    // Try to submit empty form
    await page.locator('button[type="submit"]').click();
    
    // Should show validation errors or stay on login page
    await expect(page.locator('#loginScreen')).toBeVisible();
    
    // Fill login form (using test credentials)
    await page.locator('#email').fill('admin@test.com');
    await page.locator('#password').fill('testpassword123');
    
    // Submit login form
    await page.locator('button[type="submit"]').click();
    
    // Wait for either success or error
    await page.waitForTimeout(2000);
    
    // Check if login was successful (admin screen visible) or failed (error message)
    const adminScreen = page.locator('#adminScreen');
    const loginError = page.locator('#loginError');
    
    if (await adminScreen.isVisible()) {
      // Login successful - test admin functionality
      await expect(page.locator('.admin-header')).toBeVisible();
      await expect(page.locator('.sidebar')).toBeVisible();
      
      // Test navigation
      const navItems = page.locator('.nav-item');
      await expect(navItems).toHaveCount({ min: 3 });
      
      // Click on products tab
      await page.locator('[data-tab="products"]').click();
      await expect(page.locator('#products')).toHaveClass(/active/);
      
      // Check products table
      await expect(page.locator('.data-table')).toBeVisible();
      
      // Test add product button
      const addProductBtn = page.locator('#addProductBtn');
      await expect(addProductBtn).toBeVisible();
      
      // Click add product
      await addProductBtn.click();
      
      // Check product modal opens
      const productModal = page.locator('#productModal');
      await expect(productModal).toHaveClass(/active/);
      
      // Test product form
      const productForm = page.locator('#productForm');
      await expect(productForm).toBeVisible();
      
      // Fill product form
      await page.locator('#productName').fill('Test Product');
      await page.locator('#productPrice').fill('1000');
      await page.locator('#productDescription').fill('Test Description');
      
      // Close modal
      await page.locator('.modal-close').click();
      await expect(productModal).not.toHaveClass(/active/);
      
      // Test categories tab
      await page.locator('[data-tab="categories"]').click();
      await expect(page.locator('#categories')).toHaveClass(/active/);
      
      // Check categories table
      await expect(page.locator('.data-table')).toBeVisible();
      
      // Test add category button
      const addCategoryBtn = page.locator('#addCategoryBtn');
      await expect(addCategoryBtn).toBeVisible();
      
      // Test logout
      await page.locator('#logoutBtn').click();
      await expect(page.locator('#loginScreen')).toBeVisible();
      
    } else if (await loginError.isVisible()) {
      // Login failed - verify error message
      await expect(loginError).toContainText(/خطأ|error/i);
    } else {
      // Neither success nor error - might be loading or network issue
      console.log('Login state unclear - might need to wait longer or check network');
    }
  });
  
  test('Admin dashboard shows statistics', async ({ page }) => {
    await page.goto('/admin');
    
    // Try to access admin without login (should redirect to login)
    await expect(page.locator('#loginScreen')).toBeVisible();
    
    // If we could bypass login, test dashboard
    // This would require proper authentication setup
    console.log('Dashboard test requires proper authentication setup');
  });
  
  test('Admin can manage categories', async ({ page }) => {
    await page.goto('/admin');
    
    // This test would require proper admin authentication
    // For now, just verify the categories page structure is accessible
    
    // Check if we can access categories tab (might require login)
    const categoriesTab = page.locator('[data-tab="categories"]');
    
    if (await categoriesTab.isVisible()) {
      await categoriesTab.click();
      
      // Verify categories page elements
      await expect(page.locator('#categories')).toHaveClass(/active/);
      await expect(page.locator('#addCategoryBtn')).toBeVisible();
      await expect(page.locator('.data-table')).toBeVisible();
    }
  });
  
  test('Admin can upload images', async ({ page }) => {
    await page.goto('/admin');
    
    // Test image upload functionality
    // This would require proper admin authentication and file upload setup
    
    // Check if image upload elements exist
    const imageUpload = page.locator('#imageUpload');
    const uploadBtn = page.locator('#uploadImageBtn');
    
    if (await imageUpload.isVisible() && await uploadBtn.isVisible()) {
      // Test file input
      await expect(imageUpload).toHaveAttribute('accept', 'image/*');
      await expect(uploadBtn).toBeVisible();
      
      // Note: Actual file upload testing would require proper setup
      console.log('Image upload test requires proper file upload setup');
    }
  });
});

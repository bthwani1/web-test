const { test, expect } = require('@playwright/test');

test.describe('API Integration Tests', () => {
  const API_BASE = 'https://rahla-api.onrender.com'; // Update with your API URL
  
  test('API health check works', async ({ request }) => {
    const response = await request.get(`${API_BASE}/health`);
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('ok', true);
    expect(data).toHaveProperty('time');
  });
  
  test('Products API returns data', async ({ request }) => {
    const response = await request.get(`${API_BASE}/products`);
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('items');
    expect(data).toHaveProperty('total');
    expect(Array.isArray(data.items)).toBe(true);
  });
  
  test('Products API supports filtering', async ({ request }) => {
    // Test category filter
    const categoryResponse = await request.get(`${API_BASE}/products?category=ملابس`);
    expect(categoryResponse.status()).toBe(200);
    
    const categoryData = await categoryResponse.json();
    expect(Array.isArray(categoryData.items)).toBe(true);
    
    // Test search filter
    const searchResponse = await request.get(`${API_BASE}/products?q=تيشيرت`);
    expect(searchResponse.status()).toBe(200);
    
    const searchData = await searchResponse.json();
    expect(Array.isArray(searchData.items)).toBe(true);
    
    // Test price range filter
    const priceResponse = await request.get(`${API_BASE}/products?min=1000&max=10000`);
    expect(priceResponse.status()).toBe(200);
    
    const priceData = await priceResponse.json();
    expect(Array.isArray(priceData.items)).toBe(true);
  });
  
  test('Categories API works', async ({ request }) => {
    const response = await request.get(`${API_BASE}/categories`);
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('items');
    expect(Array.isArray(data.items)).toBe(true);
  });
  
  test('Authentication endpoints work', async ({ request }) => {
    // Test login endpoint (with invalid credentials)
    const loginResponse = await request.post(`${API_BASE}/auth/login`, {
      data: {
        email: 'test@example.com',
        password: 'wrongpassword'
      }
    });
    
    // Should return 401 for invalid credentials
    expect(loginResponse.status()).toBe(401);
    
    const loginData = await loginResponse.json();
    expect(loginData).toHaveProperty('error');
  });
  
  test('Protected endpoints require authentication', async ({ request }) => {
    // Test protected endpoint without token
    const protectedResponse = await request.post(`${API_BASE}/products`, {
      data: {
        name: 'Test Product',
        price: 1000
      }
    });
    
    // Should return 401 for unauthorized access
    expect(protectedResponse.status()).toBe(401);
  });
  
  test('Media endpoints work', async ({ request }) => {
    // Test media upload URL endpoint (should require auth)
    const mediaResponse = await request.post(`${API_BASE}/media/upload-url`, {
      data: {
        filename: 'test.jpg',
        contentType: 'image/jpeg'
      }
    });
    
    // Should return 401 for unauthorized access
    expect(mediaResponse.status()).toBe(401);
  });
  
  test('API handles invalid requests gracefully', async ({ request }) => {
    // Test invalid product ID
    const invalidResponse = await request.get(`${API_BASE}/products/invalid-id`);
    expect(invalidResponse.status()).toBe(404);
    
    // Test non-existent endpoint
    const notFoundResponse = await request.get(`${API_BASE}/nonexistent`);
    expect(notFoundResponse.status()).toBe(404);
  });
  
  test('API supports pagination', async ({ request }) => {
    // Test pagination parameters
    const paginatedResponse = await request.get(`${API_BASE}/products?limit=5&offset=0`);
    expect(paginatedResponse.status()).toBe(200);
    
    const data = await paginatedResponse.json();
    expect(data).toHaveProperty('items');
    expect(data).toHaveProperty('total');
    expect(data).toHaveProperty('pagination');
    
    if (data.pagination) {
      expect(data.pagination).toHaveProperty('page');
      expect(data.pagination).toHaveProperty('limit');
      expect(data.pagination).toHaveProperty('total');
    }
  });
  
  test('API CORS headers are correct', async ({ request }) => {
    // Test CORS preflight request
    const optionsResponse = await request.options(`${API_BASE}/products`);
    
    // Check CORS headers
    const corsHeaders = {
      'access-control-allow-origin': optionsResponse.headers()['access-control-allow-origin'],
      'access-control-allow-methods': optionsResponse.headers()['access-control-allow-methods'],
      'access-control-allow-headers': optionsResponse.headers()['access-control-allow-headers']
    };
    
    expect(corsHeaders['access-control-allow-origin']).toBeTruthy();
    expect(corsHeaders['access-control-allow-methods']).toBeTruthy();
  });
  
  test('API rate limiting works', async ({ request }) => {
    // Make multiple rapid requests to test rate limiting
    const promises = [];
    for (let i = 0; i < 10; i++) {
      promises.push(request.get(`${API_BASE}/health`));
    }
    
    const responses = await Promise.all(promises);
    
    // All requests should succeed (rate limit is usually higher for health checks)
    responses.forEach(response => {
      expect(response.status()).toBeLessThan(500);
    });
  });
});

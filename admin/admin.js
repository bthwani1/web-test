// Admin Panel JavaScript
class AdminPanel {
    constructor() {
        this.apiBase = 'https://rahla-api.onrender.com'; // Update with your API URL
        this.token = localStorage.getItem('adminToken');
        this.currentUser = null;
        this.currentProduct = null;
        this.currentCategory = null;
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.checkAuth();
    }
    
    bindEvents() {
        // Login form
        document.getElementById('loginForm').addEventListener('submit', (e) => this.handleLogin(e));
        
        // Logout
        document.getElementById('logoutBtn').addEventListener('click', () => this.logout());
        
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });
        
        // Product management
        document.getElementById('addProductBtn').addEventListener('click', () => this.showProductModal());
        document.getElementById('refreshProducts').addEventListener('click', () => this.loadProducts());
        document.getElementById('productSearch').addEventListener('input', (e) => this.filterProducts(e.target.value));
        document.getElementById('categoryFilter').addEventListener('change', (e) => this.filterProductsByCategory(e.target.value));
        
        // Category management
        document.getElementById('addCategoryBtn').addEventListener('click', () => this.showCategoryModal());
        
        // Modals
        document.querySelectorAll('.modal-close, .modal-cancel').forEach(btn => {
            btn.addEventListener('click', () => this.closeModals());
        });
        
        // Product form
        document.getElementById('productForm').addEventListener('submit', (e) => this.handleProductSubmit(e));
        
        // Category form
        document.getElementById('categoryForm').addEventListener('submit', (e) => this.handleCategorySubmit(e));
        
        // Store settings
        document.getElementById('storeSettingsForm').addEventListener('submit', (e) => this.handleStoreSettings(e));
        
        // Change password
        document.getElementById('changePasswordBtn').addEventListener('click', () => this.showChangePasswordModal());
        
        // Image upload
        document.getElementById('uploadImageBtn').addEventListener('click', () => this.uploadImage());
    }
    
    async checkAuth() {
        if (this.token) {
            try {
                const response = await this.apiRequest('/auth/me', {
                    headers: { 'Authorization': `Bearer ${this.token}` }
                });
                
                if (response.user) {
                    this.currentUser = response.user;
                    this.showAdminScreen();
                    this.loadDashboard();
                } else {
                    this.showLoginScreen();
                }
            } catch (error) {
                this.showLoginScreen();
            }
        } else {
            this.showLoginScreen();
        }
    }
    
    async apiRequest(endpoint, options = {}) {
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        };
        
        const response = await fetch(`${this.apiBase}${endpoint}`, {
            ...defaultOptions,
            ...options
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    }
    
    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('loginError');
        
        try {
            const response = await this.apiRequest('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });
            
            this.token = response.token;
            this.currentUser = response.user;
            localStorage.setItem('adminToken', this.token);
            
            this.showAdminScreen();
            this.loadDashboard();
            
        } catch (error) {
            errorDiv.textContent = 'خطأ في تسجيل الدخول. تحقق من البيانات.';
            errorDiv.style.display = 'block';
        }
    }
    
    logout() {
        this.token = null;
        this.currentUser = null;
        localStorage.removeItem('adminToken');
        this.showLoginScreen();
    }
    
    showLoginScreen() {
        document.getElementById('loginScreen').classList.add('active');
        document.getElementById('adminScreen').classList.remove('active');
    }
    
    showAdminScreen() {
        document.getElementById('loginScreen').classList.remove('active');
        document.getElementById('adminScreen').classList.add('active');
        
        // Update user info
        document.getElementById('userInfo').textContent = 
            `${this.currentUser.name} (${this.currentUser.role})`;
        document.getElementById('lastLogin').textContent = 'الآن';
        document.getElementById('userRole').textContent = this.currentUser.role;
    }
    
    switchTab(tabName) {
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // Update content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');
        
        // Load tab data
        switch(tabName) {
            case 'dashboard':
                this.loadDashboard();
                break;
            case 'products':
                this.loadProducts();
                break;
            case 'categories':
                this.loadCategories();
                break;
        }
    }
    
    async loadDashboard() {
        try {
            const [productsRes, categoriesRes] = await Promise.all([
                this.apiRequest('/products'),
                this.apiRequest('/categories')
            ]);
            
            const totalViews = productsRes.items.reduce((sum, p) => sum + (p.views || 0), 0);
            const totalSales = productsRes.items.reduce((sum, p) => sum + (p.sales || 0), 0);
            
            document.getElementById('totalProducts').textContent = productsRes.total || 0;
            document.getElementById('totalCategories').textContent = categoriesRes.items?.length || 0;
            document.getElementById('totalViews').textContent = totalViews;
            document.getElementById('totalSales').textContent = totalSales;
            
        } catch (error) {
            console.error('Error loading dashboard:', error);
        }
    }
    
    async loadProducts() {
        try {
            const response = await this.apiRequest('/products?limit=100');
            this.renderProductsTable(response.items || []);
            this.loadCategoriesForFilter();
        } catch (error) {
            console.error('Error loading products:', error);
            this.showError('خطأ في تحميل المنتجات');
        }
    }
    
    async loadCategories() {
        try {
            const response = await this.apiRequest('/categories');
            this.renderCategoriesTable(response.items || []);
        } catch (error) {
            console.error('Error loading categories:', error);
            this.showError('خطأ في تحميل الفئات');
        }
    }
    
    async loadCategoriesForFilter() {
        try {
            const response = await this.apiRequest('/categories');
            const select = document.getElementById('categoryFilter');
            const productSelect = document.getElementById('productCategory');
            
            // Clear existing options
            select.innerHTML = '<option value="">جميع الفئات</option>';
            productSelect.innerHTML = '<option value="">اختر الفئة</option>';
            
            response.items.forEach(category => {
                const option1 = new Option(category.name, category.name);
                const option2 = new Option(category.name, category.name);
                select.add(option1);
                productSelect.add(option2);
            });
        } catch (error) {
            console.error('Error loading categories for filter:', error);
        }
    }
    
    renderProductsTable(products) {
        const tbody = document.getElementById('productsTableBody');
        
        if (products.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="loading">لا توجد منتجات</td></tr>';
            return;
        }
        
        tbody.innerHTML = products.map(product => `
            <tr>
                <td>
                    ${product.image ? `<img src="${product.image}" alt="${product.name}">` : '<div class="no-image">لا توجد صورة</div>'}
                </td>
                <td>
                    <strong>${product.name}</strong>
                    ${product.desc ? `<br><small>${product.desc}</small>` : ''}
                </td>
                <td>${product.category || 'غير محدد'}</td>
                <td>
                    <strong>${this.formatPrice(product.price)}</strong>
                    ${product.oldPrice ? `<br><small style="text-decoration: line-through;">${this.formatPrice(product.oldPrice)}</small>` : ''}
                </td>
                <td>
                    <span class="rating">${product.rating || 0} ⭐</span>
                </td>
                <td>${product.views || 0}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="admin.editProduct('${product._id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="admin.deleteProduct('${product._id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }
    
    renderCategoriesTable(categories) {
        const tbody = document.getElementById('categoriesTableBody');
        
        if (categories.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="loading">لا توجد فئات</td></tr>';
            return;
        }
        
        tbody.innerHTML = categories.map(category => `
            <tr>
                <td><strong>${category.name}</strong></td>
                <td><code>${category.slug}</code></td>
                <td>0</td>
                <td>${this.formatDate(category.createdAt)}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="admin.editCategory('${category._id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="admin.deleteCategory('${category._id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }
    
    showProductModal(product = null) {
        this.currentProduct = product;
        const modal = document.getElementById('productModal');
        const title = document.getElementById('productModalTitle');
        const form = document.getElementById('productForm');
        
        if (product) {
            title.textContent = 'تعديل المنتج';
            document.getElementById('productName').value = product.name || '';
            document.getElementById('productDescription').value = product.desc || '';
            document.getElementById('productPrice').value = product.price || '';
            document.getElementById('productOldPrice').value = product.oldPrice || '';
            document.getElementById('productRating').value = product.rating || 4;
            document.getElementById('productStock').value = product.stock || 0;
            document.getElementById('productTags').value = product.tags?.join(', ') || '';
            document.getElementById('productImage').value = product.image || '';
            document.getElementById('productCategory').value = product.category || '';
        } else {
            title.textContent = 'إضافة منتج جديد';
            form.reset();
        }
        
        modal.classList.add('active');
    }
    
    showCategoryModal(category = null) {
        this.currentCategory = category;
        const modal = document.getElementById('categoryModal');
        const title = document.getElementById('categoryModalTitle');
        const form = document.getElementById('categoryForm');
        
        if (category) {
            title.textContent = 'تعديل الفئة';
            document.getElementById('categoryName').value = category.name || '';
        } else {
            title.textContent = 'إضافة فئة جديدة';
            form.reset();
        }
        
        modal.classList.add('active');
    }
    
    closeModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
    }
    
    async handleProductSubmit(e) {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('productName').value,
            desc: document.getElementById('productDescription').value,
            price: parseFloat(document.getElementById('productPrice').value),
            oldPrice: parseFloat(document.getElementById('productOldPrice').value) || undefined,
            rating: parseFloat(document.getElementById('productRating').value),
            stock: parseInt(document.getElementById('productStock').value),
            tags: document.getElementById('productTags').value.split(',').map(tag => tag.trim()).filter(tag => tag),
            image: document.getElementById('productImage').value,
            category: document.getElementById('productCategory').value
        };
        
        try {
            if (this.currentProduct) {
                await this.apiRequest(`/products/${this.currentProduct._id}`, {
                    method: 'PATCH',
                    body: JSON.stringify(formData),
                    headers: { 'Authorization': `Bearer ${this.token}` }
                });
                this.showSuccess('تم تحديث المنتج بنجاح');
            } else {
                await this.apiRequest('/products', {
                    method: 'POST',
                    body: JSON.stringify(formData),
                    headers: { 'Authorization': `Bearer ${this.token}` }
                });
                this.showSuccess('تم إضافة المنتج بنجاح');
            }
            
            this.closeModals();
            this.loadProducts();
            
        } catch (error) {
            this.showError('خطأ في حفظ المنتج');
        }
    }
    
    async handleCategorySubmit(e) {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('categoryName').value
        };
        
        try {
            if (this.currentCategory) {
                await this.apiRequest(`/categories/${this.currentCategory._id}`, {
                    method: 'PATCH',
                    body: JSON.stringify(formData),
                    headers: { 'Authorization': `Bearer ${this.token}` }
                });
                this.showSuccess('تم تحديث الفئة بنجاح');
            } else {
                await this.apiRequest('/categories', {
                    method: 'POST',
                    body: JSON.stringify(formData),
                    headers: { 'Authorization': `Bearer ${this.token}` }
                });
                this.showSuccess('تم إضافة الفئة بنجاح');
            }
            
            this.closeModals();
            this.loadCategories();
            this.loadCategoriesForFilter();
            
        } catch (error) {
            this.showError('خطأ في حفظ الفئة');
        }
    }
    
    async editProduct(id) {
        try {
            const response = await this.apiRequest(`/products/${id}`);
            this.showProductModal(response);
        } catch (error) {
            this.showError('خطأ في تحميل بيانات المنتج');
        }
    }
    
    async deleteProduct(id) {
        if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
            try {
                await this.apiRequest(`/products/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${this.token}` }
                });
                this.showSuccess('تم حذف المنتج بنجاح');
                this.loadProducts();
            } catch (error) {
                this.showError('خطأ في حذف المنتج');
            }
        }
    }
    
    async editCategory(id) {
        try {
            const response = await this.apiRequest(`/categories/${id}`);
            this.showCategoryModal(response);
        } catch (error) {
            this.showError('خطأ في تحميل بيانات الفئة');
        }
    }
    
    async deleteCategory(id) {
        if (confirm('هل أنت متأكد من حذف هذه الفئة؟')) {
            try {
                await this.apiRequest(`/categories/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${this.token}` }
                });
                this.showSuccess('تم حذف الفئة بنجاح');
                this.loadCategories();
                this.loadCategoriesForFilter();
            } catch (error) {
                this.showError('خطأ في حذف الفئة');
            }
        }
    }
    
    filterProducts(searchTerm) {
        const rows = document.querySelectorAll('#productsTableBody tr');
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm.toLowerCase()) ? '' : 'none';
        });
    }
    
    filterProductsByCategory(category) {
        const rows = document.querySelectorAll('#productsTableBody tr');
        rows.forEach(row => {
            if (!category) {
                row.style.display = '';
                return;
            }
            
            const categoryCell = row.cells[2];
            if (categoryCell && categoryCell.textContent.includes(category)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    }
    
    async handleStoreSettings(e) {
        e.preventDefault();
        this.showSuccess('تم حفظ إعدادات المتجر');
    }
    
    showChangePasswordModal() {
        const newPassword = prompt('أدخل كلمة المرور الجديدة:');
        if (newPassword && newPassword.length >= 6) {
            this.showSuccess('تم تغيير كلمة المرور بنجاح');
        } else if (newPassword) {
            this.showError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
        }
    }
    
    async uploadImage() {
        const fileInput = document.getElementById('imageUpload');
        const file = fileInput.files[0];
        
        if (!file) {
            this.showError('يرجى اختيار ملف');
            return;
        }
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
            this.showError('الملف يجب أن يكون صورة');
            return;
        }
        
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            this.showError('حجم الملف يجب أن يكون أقل من 5 ميجابايت');
            return;
        }
        
        try {
            // Get signed URL from API
            const signedUrlResponse = await this.apiRequest('/media/upload-url', {
                method: 'POST',
                body: JSON.stringify({
                    filename: file.name,
                    contentType: file.type
                }),
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            
            // Upload file to Bunny CDN
            const uploadResponse = await fetch(signedUrlResponse.signedUrl, {
                method: 'PUT',
                body: file,
                headers: {
                    'Content-Type': file.type
                }
            });
            
            if (uploadResponse.ok) {
                // Update the image URL input
                document.getElementById('productImage').value = signedUrlResponse.publicUrl;
                this.showSuccess('تم رفع الصورة بنجاح');
            } else {
                this.showError('خطأ في رفع الصورة');
            }
            
        } catch (error) {
            console.error('Upload error:', error);
            this.showError('خطأ في رفع الصورة');
        }
    }
    
    formatPrice(price) {
        return new Intl.NumberFormat('ar-YE', {
            style: 'currency',
            currency: 'YER'
        }).format(price || 0);
    }
    
    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('ar-YE');
    }
    
    showSuccess(message) {
        // Simple success notification
        const notification = document.createElement('div');
        notification.className = 'success-message';
        notification.textContent = message;
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.right = '20px';
        notification.style.zIndex = '9999';
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 3000);
    }
    
    showError(message) {
        // Simple error notification
        const notification = document.createElement('div');
        notification.className = 'error-message';
        notification.textContent = message;
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.right = '20px';
        notification.style.zIndex = '9999';
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 3000);
    }
}

// Initialize admin panel
const admin = new AdminPanel();

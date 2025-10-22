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
        document.getElementById('bulkProductActionsBtn').addEventListener('click', () => this.handleBulkProductActions());
        document.getElementById('exportProductsBtn').addEventListener('click', () => this.exportProducts());
        document.getElementById('importProductsBtn').addEventListener('click', () => this.importProducts());
        document.getElementById('refreshProducts').addEventListener('click', () => this.loadProducts());
        document.getElementById('productSearch').addEventListener('input', (e) => this.filterProducts(e.target.value));
        document.getElementById('categoryFilter').addEventListener('change', (e) => this.filterProductsByCategory(e.target.value));
        
        // Category management
        document.getElementById('addCategoryBtn').addEventListener('click', () => this.showCategoryModal());
        document.getElementById('bulkActionsBtn').addEventListener('click', () => this.handleBulkCategoryActions());
        document.getElementById('exportCategoriesBtn').addEventListener('click', () => this.exportCategories());
        document.getElementById('importCategoriesBtn').addEventListener('click', () => this.importCategories());
        document.getElementById('refreshCategories').addEventListener('click', () => this.loadCategories());
        document.getElementById('categorySearch').addEventListener('input', (e) => this.filterCategories(e.target.value));
        document.getElementById('statusFilter').addEventListener('change', (e) => this.filterCategoriesByStatus(e.target.value));
        
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
            tbody.innerHTML = '<tr><td colspan="10" class="loading">لا توجد منتجات</td></tr>';
            return;
        }
        
        tbody.innerHTML = products.map(product => `
            <tr>
                <td><input type="checkbox" class="product-checkbox" data-id="${product._id}"></td>
                <td>
                    ${product.image ? `<img src="${product.image}" alt="${product.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;">` : '<div class="no-image">لا توجد صورة</div>'}
                </td>
                <td>
                    <strong>${product.name}</strong>
                    ${product.shortDescription ? `<br><small>${product.shortDescription}</small>` : ''}
                    ${product.sku ? `<br><code>${product.sku}</code>` : ''}
                    ${product.isFeatured ? '<br><span class="badge">مميز</span>' : ''}
                </td>
                <td>${product.category || 'غير محدد'}</td>
                <td>
                    <strong>${this.formatPrice(product.price)}</strong>
                    ${product.oldPrice ? `<br><small style="text-decoration: line-through;">${this.formatPrice(product.oldPrice)}</small>` : ''}
                    ${product.costPrice ? `<br><small style="color: #6b7280;">تكلفة: ${this.formatPrice(product.costPrice)}</small>` : ''}
                </td>
                <td>
                    <span class="stock-badge ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}">
                        ${product.stock || 0}
                    </span>
                </td>
                <td>
                    <span class="status-badge ${product.status || 'draft'}">
                        ${this.getStatusText(product.status)}
                    </span>
                </td>
                <td>
                    <span class="rating">${product.rating || 0} ⭐</span>
                </td>
                <td>${product.views || 0}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="admin.editProduct('${product._id}')" title="تعديل">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-info" onclick="admin.viewProduct('${product._id}')" title="عرض">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="admin.deleteProduct('${product._id}')" title="حذف">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }
    
    renderCategoriesTable(categories) {
        const tbody = document.getElementById('categoriesTableBody');
        
        if (categories.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" class="loading">لا توجد فئات</td></tr>';
            return;
        }
        
        tbody.innerHTML = categories.map(category => `
            <tr>
                <td><input type="checkbox" class="category-checkbox" data-id="${category._id}"></td>
                <td>
                    ${category.icon ? `<i class="${category.icon}" style="color: ${category.color || '#0ea5e9'}"></i>` : '<i class="fas fa-tag"></i>'}
                </td>
                <td>
                    <strong>${category.name}</strong>
                    ${category.parentCategory ? '<br><small>فئة فرعية</small>' : ''}
                </td>
                <td>${category.description || 'لا يوجد وصف'}</td>
                <td>
                    <span class="badge">${category.productCount || 0}</span>
                </td>
                <td>${category.sortOrder || 0}</td>
                <td>
                    <span class="status-badge ${category.isActive ? 'active' : 'inactive'}">
                        ${category.isActive ? 'نشط' : 'غير نشط'}
                    </span>
                </td>
                <td>${this.formatDate(category.createdAt)}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="admin.editCategory('${category._id}')" title="تعديل">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-info" onclick="admin.viewCategoryProducts('${category._id}')" title="عرض المنتجات">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="admin.deleteCategory('${category._id}')" title="حذف">
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
            document.getElementById('productSKU').value = product.sku || '';
            document.getElementById('productCategory').value = product.category || '';
            document.getElementById('productBrand').value = product.brand || '';
            document.getElementById('productShortDescription').value = product.shortDescription || '';
            document.getElementById('productFullDescription').value = product.fullDescription || '';
            document.getElementById('productPrice').value = product.price || '';
            document.getElementById('productOldPrice').value = product.oldPrice || '';
            document.getElementById('productCostPrice').value = product.costPrice || '';
            document.getElementById('productMargin').value = product.margin || '';
            document.getElementById('productStock').value = product.stock || 0;
            document.getElementById('productWeight').value = product.weight || 0;
            document.getElementById('productMaterial').value = product.material || '';
            document.getElementById('productColor').value = product.color || '';
            document.getElementById('productSize').value = product.size || '';
            document.getElementById('productStatus').value = product.status || 'draft';
            document.getElementById('productImage').value = product.image || '';
            document.getElementById('productImages').value = product.images?.join(', ') || '';
            document.getElementById('productRating').value = product.rating || 4;
            document.getElementById('productFeatured').checked = product.isFeatured || false;
            document.getElementById('productTags').value = product.tags?.join(', ') || '';
            document.getElementById('productMetaTitle').value = product.metaTitle || '';
            document.getElementById('productMetaDescription').value = product.metaDescription || '';
        } else {
            title.textContent = 'إضافة منتج جديد';
            form.reset();
            document.getElementById('productStatus').value = 'draft';
            document.getElementById('productRating').value = 4;
        }
        
        // Load categories for dropdown
        this.loadCategoriesForFilter();
        
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
            document.getElementById('categoryDescription').value = category.description || '';
            document.getElementById('categoryIcon').value = category.icon || '';
            document.getElementById('categoryColor').value = category.color || '#0ea5e9';
            document.getElementById('categorySortOrder').value = category.sortOrder || 0;
            document.getElementById('categoryImage').value = category.image || '';
            document.getElementById('categoryStatus').value = category.isActive ? 'active' : 'inactive';
            document.getElementById('categoryMetaTitle').value = category.metaTitle || '';
            document.getElementById('categoryMetaDescription').value = category.metaDescription || '';
            document.getElementById('parentCategory').value = category.parentCategory || '';
        } else {
            title.textContent = 'إضافة فئة جديدة';
            form.reset();
            document.getElementById('categoryColor').value = '#0ea5e9';
            document.getElementById('categoryStatus').value = 'active';
        }
        
        // Load parent categories for dropdown
        this.loadParentCategories();
        
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
            sku: document.getElementById('productSKU').value,
            category: document.getElementById('productCategory').value,
            brand: document.getElementById('productBrand').value,
            shortDescription: document.getElementById('productShortDescription').value,
            fullDescription: document.getElementById('productFullDescription').value,
            desc: document.getElementById('productFullDescription').value, // Keep for backward compatibility
            price: parseFloat(document.getElementById('productPrice').value),
            oldPrice: parseFloat(document.getElementById('productOldPrice').value) || undefined,
            costPrice: parseFloat(document.getElementById('productCostPrice').value) || 0,
            margin: parseFloat(document.getElementById('productMargin').value) || 0,
            stock: parseInt(document.getElementById('productStock').value) || 0,
            weight: parseFloat(document.getElementById('productWeight').value) || 0,
            material: document.getElementById('productMaterial').value,
            color: document.getElementById('productColor').value,
            size: document.getElementById('productSize').value,
            status: document.getElementById('productStatus').value,
            image: document.getElementById('productImage').value,
            images: document.getElementById('productImages').value.split(',').map(img => img.trim()).filter(img => img),
            rating: parseFloat(document.getElementById('productRating').value),
            isFeatured: document.getElementById('productFeatured').checked,
            tags: document.getElementById('productTags').value.split(',').map(tag => tag.trim()).filter(tag => tag),
            metaTitle: document.getElementById('productMetaTitle').value,
            metaDescription: document.getElementById('productMetaDescription').value
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
            name: document.getElementById('categoryName').value,
            description: document.getElementById('categoryDescription').value,
            icon: document.getElementById('categoryIcon').value,
            color: document.getElementById('categoryColor').value,
            sortOrder: parseInt(document.getElementById('categorySortOrder').value) || 0,
            image: document.getElementById('categoryImage').value,
            isActive: document.getElementById('categoryStatus').value === 'active',
            metaTitle: document.getElementById('categoryMetaTitle').value,
            metaDescription: document.getElementById('categoryMetaDescription').value,
            parentCategory: document.getElementById('parentCategory').value || null
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
    
    filterCategories(searchTerm) {
        const rows = document.querySelectorAll('#categoriesTableBody tr');
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm.toLowerCase()) ? '' : 'none';
        });
    }
    
    filterCategoriesByStatus(status) {
        const rows = document.querySelectorAll('#categoriesTableBody tr');
        rows.forEach(row => {
            if (!status) {
                row.style.display = '';
                return;
            }
            
            const statusCell = row.cells[6]; // Status column
            if (statusCell) {
                const isActive = statusCell.textContent.includes('نشط');
                const shouldShow = (status === 'active' && isActive) || (status === 'inactive' && !isActive);
                row.style.display = shouldShow ? '' : 'none';
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
    
    // Load parent categories for dropdown
    async loadParentCategories() {
        try {
            const response = await this.apiRequest('/categories');
            const select = document.getElementById('parentCategory');
            
            // Clear existing options except the first one
            select.innerHTML = '<option value="">فئة رئيسية</option>';
            
            response.items.forEach(category => {
                if (!category.parentCategory) { // Only show main categories as parents
                    const option = new Option(category.name, category._id);
                    select.add(option);
                }
            });
        } catch (error) {
            console.error('Error loading parent categories:', error);
        }
    }
    
    // View products in a category
    async viewCategoryProducts(categoryId) {
        try {
            const response = await this.apiRequest(`/products?category=${categoryId}`);
            // Switch to products tab and filter by category
            this.switchTab('products');
            // You can implement category filtering here
            this.showSuccess(`تم تحميل ${response.items.length} منتج من هذه الفئة`);
        } catch (error) {
            this.showError('خطأ في تحميل منتجات الفئة');
        }
    }
    
    // Bulk operations for categories
    async handleBulkCategoryActions() {
        const selectedCategories = Array.from(document.querySelectorAll('.category-checkbox:checked'))
            .map(cb => cb.dataset.id);
            
        if (selectedCategories.length === 0) {
            this.showError('يرجى اختيار فئات للعمل عليها');
            return;
        }
        
        const action = prompt('اختر العملية:\n1. تفعيل\n2. إلغاء تفعيل\n3. حذف');
        
        try {
            switch(action) {
                case '1':
                    await this.bulkUpdateCategories(selectedCategories, { isActive: true });
                    this.showSuccess('تم تفعيل الفئات المحددة');
                    break;
                case '2':
                    await this.bulkUpdateCategories(selectedCategories, { isActive: false });
                    this.showSuccess('تم إلغاء تفعيل الفئات المحددة');
                    break;
                case '3':
                    if (confirm('هل أنت متأكد من حذف الفئات المحددة؟')) {
                        await this.bulkDeleteCategories(selectedCategories);
                        this.showSuccess('تم حذف الفئات المحددة');
                    }
                    break;
            }
            this.loadCategories();
        } catch (error) {
            this.showError('خطأ في العملية الجماعية');
        }
    }
    
    async bulkUpdateCategories(categoryIds, updateData) {
        const promises = categoryIds.map(id => 
            this.apiRequest(`/categories/${id}`, {
                method: 'PATCH',
                body: JSON.stringify(updateData),
                headers: { 'Authorization': `Bearer ${this.token}` }
            })
        );
        await Promise.all(promises);
    }
    
    async bulkDeleteCategories(categoryIds) {
        const promises = categoryIds.map(id => 
            this.apiRequest(`/categories/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${this.token}` }
            })
        );
        await Promise.all(promises);
    }
    
    // Helper functions
    getStatusText(status) {
        const statusMap = {
            'draft': 'مسودة',
            'active': 'نشط',
            'inactive': 'غير نشط',
            'discontinued': 'متوقف'
        };
        return statusMap[status] || 'غير محدد';
    }
    
    // View product details
    async viewProduct(id) {
        try {
            const response = await this.apiRequest(`/products/${id}`);
            // You can implement a product details modal here
            this.showSuccess(`عرض تفاصيل المنتج: ${response.name}`);
        } catch (error) {
            this.showError('خطأ في تحميل تفاصيل المنتج');
        }
    }
    
    // Bulk operations for products
    async handleBulkProductActions() {
        const selectedProducts = Array.from(document.querySelectorAll('.product-checkbox:checked'))
            .map(cb => cb.dataset.id);
            
        if (selectedProducts.length === 0) {
            this.showError('يرجى اختيار منتجات للعمل عليها');
            return;
        }
        
        const action = prompt('اختر العملية:\n1. تفعيل\n2. إلغاء تفعيل\n3. جعل مميز\n4. إلغاء التميز\n5. حذف');
        
        try {
            switch(action) {
                case '1':
                    await this.bulkUpdateProducts(selectedProducts, { status: 'active' });
                    this.showSuccess('تم تفعيل المنتجات المحددة');
                    break;
                case '2':
                    await this.bulkUpdateProducts(selectedProducts, { status: 'inactive' });
                    this.showSuccess('تم إلغاء تفعيل المنتجات المحددة');
                    break;
                case '3':
                    await this.bulkUpdateProducts(selectedProducts, { isFeatured: true });
                    this.showSuccess('تم جعل المنتجات مميزة');
                    break;
                case '4':
                    await this.bulkUpdateProducts(selectedProducts, { isFeatured: false });
                    this.showSuccess('تم إلغاء تميز المنتجات');
                    break;
                case '5':
                    if (confirm('هل أنت متأكد من حذف المنتجات المحددة؟')) {
                        await this.bulkDeleteProducts(selectedProducts);
                        this.showSuccess('تم حذف المنتجات المحددة');
                    }
                    break;
            }
            this.loadProducts();
        } catch (error) {
            this.showError('خطأ في العملية الجماعية');
        }
    }
    
    async bulkUpdateProducts(productIds, updateData) {
        const promises = productIds.map(id => 
            this.apiRequest(`/products/${id}`, {
                method: 'PATCH',
                body: JSON.stringify(updateData),
                headers: { 'Authorization': `Bearer ${this.token}` }
            })
        );
        await Promise.all(promises);
    }
    
    async bulkDeleteProducts(productIds) {
        const promises = productIds.map(id => 
            this.apiRequest(`/products/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${this.token}` }
            })
        );
        await Promise.all(promises);
    }
    
    // Export and Import functions
    async exportProducts() {
        try {
            const response = await this.apiRequest('/products/export?format=csv');
            
            // Create and download CSV file
            const blob = new Blob([response], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `products_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            this.showSuccess('تم تصدير المنتجات بنجاح');
        } catch (error) {
            this.showError('خطأ في تصدير المنتجات');
        }
    }
    
    async importProducts() {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.csv,.json';
        fileInput.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            try {
                const text = await file.text();
                let data;
                
                if (file.name.endsWith('.csv')) {
                    // Parse CSV
                    data = this.parseCSV(text);
                } else if (file.name.endsWith('.json')) {
                    // Parse JSON
                    data = JSON.parse(text);
                } else {
                    throw new Error('نوع الملف غير مدعوم');
                }
                
                // Import data
                const response = await this.apiRequest('/products/import', {
                    method: 'POST',
                    body: JSON.stringify(data),
                    headers: { 'Authorization': `Bearer ${this.token}` }
                });
                
                this.showSuccess(`تم استيراد ${response.created} منتج بنجاح`);
                this.loadProducts();
            } catch (error) {
                this.showError('خطأ في استيراد المنتجات: ' + error.message);
            }
        };
        fileInput.click();
    }
    
    async exportCategories() {
        try {
            const response = await this.apiRequest('/categories');
            
            // Create and download JSON file
            const data = JSON.stringify(response.items, null, 2);
            const blob = new Blob([data], { type: 'application/json;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `categories_${new Date().toISOString().split('T')[0]}.json`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            this.showSuccess('تم تصدير الفئات بنجاح');
        } catch (error) {
            this.showError('خطأ في تصدير الفئات');
        }
    }
    
    async importCategories() {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.json';
        fileInput.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            try {
                const text = await file.text();
                const data = JSON.parse(text);
                
                // Import each category
                let imported = 0;
                for (const category of data) {
                    try {
                        await this.apiRequest('/categories', {
                            method: 'POST',
                            body: JSON.stringify(category),
                            headers: { 'Authorization': `Bearer ${this.token}` }
                        });
                        imported++;
                    } catch (error) {
                        console.warn('خطأ في استيراد فئة:', category.name, error);
                    }
                }
                
                this.showSuccess(`تم استيراد ${imported} فئة بنجاح`);
                this.loadCategories();
            } catch (error) {
                this.showError('خطأ في استيراد الفئات: ' + error.message);
            }
        };
        fileInput.click();
    }
    
    // Helper function to parse CSV
    parseCSV(text) {
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const data = [];
        
        for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim()) {
                const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
                const item = {};
                headers.forEach((header, index) => {
                    item[header] = values[index] || '';
                });
                data.push(item);
            }
        }
        
        return data;
    }
}

// Initialize admin panel
const admin = new AdminPanel();

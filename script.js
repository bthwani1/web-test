// إعدادات المتجر
const settings = {
    storeName: "رحلة _ Rahla",
    currency: "YER",
    FREE_SHIPPING_THRESHOLD: 15000,
    API_BASE: "https://rahla-api.onrender.com",
    WHATSAPP: "9677XXXXXXXX" // غيّر الرقم
};

// إعدادات CDN
const CDN = "https://rahlacdn.b-cdn.net";
const img = (p,w=560) => `${CDN}/${p}?width=${w}&quality=70&format=auto&v=1`;

// بيانات المنتجات
const products = [
    { 
        id: "p1", 
        name: "تيشيرت رحلة", 
        price: 4500, 
        oldPrice: 6000, 
        category: "ملابس", 
        tags: ["جديد"], 
        rating: 4.6,
        image: img("products/rahla-tee.jpg"), 
        desc: "قماش قطني 100%" 
    },
    { 
        id: "p2", 
        name: "كوب سفر", 
        price: 3500, 
        category: "اكسسوارات", 
        tags: ["عروض"], 
        rating: 4.3,
        image: img("products/rahla-mug.jpg"), 
        desc: "عازل للحرارة" 
    },
    { 
        id: "p3", 
        name: "حقيبة قماش", 
        price: 5200, 
        category: "اكسسوارات", 
        tags: ["الأكثر مبيعًا"], 
        rating: 4.7,
        image: img("products/rahla-bag.jpg"), 
        desc: "خياطة متينة" 
    }
];

// DOM Elements
const productsGrid = document.getElementById('productsGrid');
const filterButtons = document.querySelectorAll('.filter-btn');
const logo = document.querySelector('.logo');
const heroTitle = document.querySelector('.hero-title');

// تحديث عنوان المتجر
document.title = settings.storeName;
logo.innerHTML = `<i class="fas fa-store"></i> ${settings.storeName}`;
heroTitle.textContent = `أهلاً بك في ${settings.storeName}`;

// إظهار زر WhatsApp في الهيدر إذا كان مفعلاً
if (settings.WHATSAPP) {
    const whatsappHeaderBtn = document.getElementById('whatsapp-header-btn');
    if (whatsappHeaderBtn) {
        whatsappHeaderBtn.style.display = 'block';
    }
}

// تنسيق العملة
function formatPrice(price) {
    return `${price.toLocaleString()} ${settings.currency}`;
}

// تحسين الصور باستخدام CDN
function optimizeImage(url, width = 560, quality = 70) {
    // إذا كانت الصورة من Unsplash، أضف معاملات التحسين
    if (url.includes('unsplash.com')) {
        const baseUrl = url.split('?')[0];
        return `${baseUrl}?w=${width}&h=${Math.round(width * 0.75)}&fit=crop&crop=center&auto=format&q=${quality}`;
    }
    
    // إذا كانت الصورة من CDN الخاص بنا، استخدم دالة img الجديدة
    if (url.includes(CDN)) {
        // استخرج مسار الصورة من URL
        const pathMatch = url.match(new RegExp(CDN.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '/([^?]+)'));
        if (pathMatch) {
            return img(pathMatch[1], width);
        }
        return url.replace(/width=\d+&quality=\d+/, `width=${width}&quality=${quality}`);
    }
    
    // للصور الأخرى من placeholder
    if (url.includes('placeholder.com') || url.includes('via.placeholder.com')) {
        return `${CDN}/${encodeURIComponent(url)}?width=${width}&quality=${quality}&format=auto`;
    }
    
    return url;
}

// تحسين الصور حسب حجم الشاشة
function getOptimizedImageSize() {
    const screenWidth = window.innerWidth;
    if (screenWidth < 480) return 300;      // هواتف صغيرة
    if (screenWidth < 768) return 400;      // هواتف كبيرة
    if (screenWidth < 1024) return 500;     // أجهزة لوحية
    return 560;                             // أجهزة سطح المكتب
}

// تحسين جودة الصور حسب الاتصال
function getOptimizedQuality() {
    // تحسين الجودة حسب سرعة الاتصال
    if ('connection' in navigator) {
        const connection = navigator.connection;
        if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
            return 50;  // جودة منخفضة للاتصال البطيء
        }
        if (connection.effectiveType === '3g') {
            return 60;  // جودة متوسطة للاتصال المتوسط
        }
    }
    return 70;  // جودة عالية للاتصال السريع
}

// دالة للتواصل عبر WhatsApp (جاهزة للتفعيل لاحقاً)
function contactViaWhatsApp(product = null) {
    if (!settings.WHATSAPP) {
        console.log('WhatsApp غير مفعل في الإعدادات');
        return;
    }
    
    let message = `مرحباً، أريد الاستفسار عن منتجاتكم`;
    if (product) {
        message = `مرحباً، أريد الاستفسار عن ${product.name} - السعر: ${formatPrice(product.price)}`;
    }
    
    const whatsappUrl = `https://wa.me/${settings.WHATSAPP}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}

// دالة للتفاعل مع API
async function apiRequest(endpoint, options = {}) {
    try {
        const url = `${settings.API_BASE}${endpoint}`;
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            },
        };
        
        const response = await fetch(url, { ...defaultOptions, ...options });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API Request Error:', error);
        throw error;
    }
}

// دالة لجلب المنتجات من API (للاستخدام المستقبلي)
async function fetchProductsFromAPI() {
    try {
        const products = await apiRequest('/products');
        return products;
    } catch (error) {
        console.log('استخدام المنتجات المحلية بدلاً من API');
        return null;
    }
}

// دالة لإرسال طلب شراء إلى API (للاستخدام المستقبلي)
async function submitOrder(orderData) {
    try {
        const result = await apiRequest('/orders', {
            method: 'POST',
            body: JSON.stringify(orderData)
        });
        return result;
    } catch (error) {
        console.error('خطأ في إرسال الطلب:', error);
        throw error;
    }
}

// إنشاء النجوم للتقييم
function createStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let starsHTML = '';
    
    for (let i = 0; i < 5; i++) {
        if (i < fullStars) {
            starsHTML += '<i class="fas fa-star"></i>';
        } else if (i === fullStars && hasHalfStar) {
            starsHTML += '<i class="fas fa-star-half-alt"></i>';
        } else {
            starsHTML += '<i class="far fa-star"></i>';
        }
    }
    
    return starsHTML;
}

// إنشاء بطاقة المنتج
function createProductCard(product) {
    const discountPercentage = product.oldPrice ? 
        Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : 0;
    
    const tagsHTML = product.tags.map(tag => {
        const tagClass = tag === 'جديد' ? 'new' : 'offer';
        return `<span class="tag ${tagClass}">${tag}</span>`;
    }).join('');

    const freeShipping = product.price >= settings.FREE_SHIPPING_THRESHOLD ? 
        '<div class="free-shipping"><i class="fas fa-shipping-fast"></i> شحن مجاني</div>' : '';

    return `
        <div class="product-card" data-category="${product.category}">
            <div class="product-image-container">
                <img src="${optimizeImage(product.image, getOptimizedImageSize(), getOptimizedQuality())}" alt="${product.name}" class="product-image" loading="lazy">
                ${discountPercentage > 0 ? `<div class="discount-badge">-${discountPercentage}%</div>` : ''}
            </div>
            <div class="product-info">
                <div class="product-category">${product.category}</div>
                <h3 class="product-name">${product.name}</h3>
                <p class="product-desc">${product.desc}</p>
                
                <div class="product-rating">
                    <div class="stars">${createStars(product.rating)}</div>
                    <span class="rating-text">${product.rating}</span>
                </div>
                
                <div class="product-tags">
                    ${tagsHTML}
                </div>
                
                <div class="product-price">
                    <span class="current-price">${formatPrice(product.price)}</span>
                    ${product.oldPrice ? `<span class="old-price">${formatPrice(product.oldPrice)}</span>` : ''}
                </div>
                
                ${freeShipping}
                
                <div class="product-actions">
                    <button class="add-to-cart" onclick="addToCart('${product.id}')">
                        <i class="fas fa-cart-plus"></i>
                        أضف إلى السلة
                    </button>
                    ${settings.WHATSAPP ? `
                    <button class="whatsapp-btn" onclick="contactViaWhatsApp(${JSON.stringify(product).replace(/"/g, '&quot;')})">
                        <i class="fab fa-whatsapp"></i>
                        استفسر
                    </button>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
}

// عرض المنتجات
function displayProducts(productsToShow = products) {
    productsGrid.innerHTML = productsToShow.map(createProductCard).join('');
}

// فلترة المنتجات
function filterProducts(category) {
    const filteredProducts = category === 'all' ? 
        products : products.filter(product => product.category === category);
    
    displayProducts(filteredProducts);
}

// إضافة منتج للسلة
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        // إنشاء إشعار
        showNotification(`${product.name} تم إضافته إلى السلة`);
        
        // إضافة تأثير بصري للزر
        const button = event.target.closest('.add-to-cart');
        button.style.background = '#51cf66';
        button.innerHTML = '<i class="fas fa-check"></i> تم الإضافة';
        
        setTimeout(() => {
            button.style.background = '';
            button.innerHTML = '<i class="fas fa-cart-plus"></i> أضف إلى السلة';
        }, 2000);
    }
}

// عرض الإشعارات
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;
    
    // إضافة أنماط الإشعار
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #51cf66;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 1000;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: 600;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// إضافة أنماط CSS للإشعارات
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .product-image-container {
        position: relative;
        overflow: hidden;
    }
    
    .discount-badge {
        position: absolute;
        top: 10px;
        right: 10px;
        background: #ff4757;
        color: white;
        padding: 0.3rem 0.6rem;
        border-radius: 15px;
        font-size: 0.8rem;
        font-weight: bold;
    }
    
    .free-shipping {
        background: #51cf66;
        color: white;
        padding: 0.5rem;
        border-radius: 8px;
        text-align: center;
        margin-bottom: 1rem;
        font-size: 0.9rem;
        font-weight: 600;
    }
    
    .free-shipping i {
        margin-left: 0.5rem;
    }
`;
document.head.appendChild(notificationStyles);

// إعداد مستمعي الأحداث
filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        // إزالة الكلاس النشط من جميع الأزرار
        filterButtons.forEach(btn => btn.classList.remove('active'));
        // إضافة الكلاس النشط للزر المحدد
        button.classList.add('active');
        // فلترة المنتجات
        filterProducts(button.dataset.category);
    });
});

// تحديث روابط التنقل
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        
        // إزالة الكلاس النشط من جميع الروابط
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        // إضافة الكلاس النشط للرابط المحدد
        link.classList.add('active');
        
        // التنقل السلس للقسم المحدد
        const targetId = link.getAttribute('href').substring(1);
        if (targetId === 'products') {
            document.querySelector('.products-section').scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// تهيئة التطبيق
document.addEventListener('DOMContentLoaded', () => {
    displayProducts();
    
    // إضافة تأثير التحميل
    productsGrid.style.opacity = '0';
    setTimeout(() => {
        productsGrid.style.transition = 'opacity 0.5s ease';
        productsGrid.style.opacity = '1';
    }, 100);
});

// إضافة تأثيرات تفاعلية إضافية
document.addEventListener('mousemove', (e) => {
    const cards = document.querySelectorAll('.product-card');
    cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
            card.style.transform = `translateY(-10px) rotateY(${(x - rect.width/2) / 20}deg) rotateX(${(y - rect.height/2) / 20}deg)`;
        } else {
            card.style.transform = 'translateY(0) rotateY(0deg) rotateX(0deg)';
        }
    });
});

console.log(`مرحباً بك في ${settings.storeName}!`);
console.log(`العملة: ${settings.currency}`);
console.log(`حد الشحن المجاني: ${formatPrice(settings.FREE_SHIPPING_THRESHOLD)}`);
console.log(`API Base URL: ${settings.API_BASE}`);
console.log(`CDN URL: ${CDN}`);

// تعليقات توضيحية للإعدادات
console.log(`
📋 إعدادات المتجر:
- اسم المتجر: ${settings.storeName}
- العملة: ${settings.currency}
- حد الشحن المجاني: ${formatPrice(settings.FREE_SHIPPING_THRESHOLD)}
- API Base: ${settings.API_BASE}
- CDN URL: ${CDN}
- WhatsApp: ${settings.WHATSAPP ? 'مفعل' : 'غير مفعل'}

💡 لتفعيل WhatsApp:
1. أضف رقم الهاتف في settings.WHATSAPP
2. قم بإلغاء التعليق عن السطر: settings.WHATSAPP = "9677XXXXXXXX"
3. أعد تحميل الصفحة

🚀 المميزات المتاحة:
- عرض 3 منتجات مع الصور المحسنة
- فلترة حسب الفئة (ملابس، اكسسوارات)
- إضافة للسلة مع إشعارات
- شحن مجاني للمنتجات فوق ${formatPrice(settings.FREE_SHIPPING_THRESHOLD)}
- تصميم متجاوب لجميع الأجهزة
- تحسين الأداء والسرعة
- دعم API للبيانات الديناميكية
- دوال جاهزة للتفاعل مع الخادم
- دالة img() محسنة للصور

🌐 إعداد Bunny CDN:
✅ تم إعداد CDN بنجاح!
- CDN URL: ${CDN}
- الصور تستخدم: /products/rahla-tee.jpg، /products/rahla-mug.jpg، /products/rahla-bag.jpg
- التحسين التلقائي: width, quality, format=auto

📝 مسارات الصور:
- تيشيرت رحلة: ${CDN}/products/rahla-tee.jpg
- كوب سفر: ${CDN}/products/rahla-mug.jpg
- حقيبة قماش: ${CDN}/products/rahla-bag.jpg

💡 لرفع صور جديدة:
1. ارفع الصور إلى مجلد /products/ في CDN
2. حدث مسارات الصور في مصفوفة products
3. استخدم معاملات التحسين: ?width=560&quality=70&format=auto
`);

// ===== إعدادات عامة =====
export const settings = {
  storeName: "رحلة _ Rahla",
  currency: "YER",
  FREE_SHIPPING_THRESHOLD: 15000,
  WHATSAPP: "9677XXXXXXXX", // عدّل لاحقًا
  CDN: "https://rahlacdn.b-cdn.net",
  API_BASE: "https://web-test-d179.onrender.com", // Backend API
  DEBUG: false, // إضافة وضع التصحيح
  RETRY_ATTEMPTS: 3, // عدد محاولات إعادة المحاولة
  TIMEOUT: 10000 // مهلة زمنية للطلبات
};
export const img = (path, w=560) =>
  `${settings.CDN}/${path}?width=${w}&quality=70&format=auto&v=1`;

// توليد srcset و sizes تلقائيًا للصورة المعطاة (بُنيت عبر img())
const buildResponsiveAttrs = (imageUrl)=>{
  try {
    const widths = [420, 720, 1080];
    const makeUrl = (w)=> imageUrl.replace(/width=\d+/, `width=${w}`);
    const srcset = widths.map(w=>`${makeUrl(w)} ${w}w`).join(", ");
    const sizes = "(max-width: 600px) 90vw, 560px";
    return { srcset, sizes };
  } catch (error) {
    console.error('Error building responsive attributes:', error);
    return { srcset: imageUrl, sizes: "100vw" };
  }
};

// معالجة الأخطاء المحسنة
const handleError = (error, context = 'Unknown') => {
  console.error(`Error in ${context}:`, error);
  if (settings.DEBUG) {
    alert(`خطأ في ${context}: ${error.message}`);
  }
  // إرسال الخطأ إلى Sentry إذا كان متاحًا
  if (window.Sentry) {
    window.Sentry.captureException(error, { tags: { context } });
  }
};

// وظيفة إعادة المحاولة
const retryOperation = async (operation, maxAttempts = settings.RETRY_ATTEMPTS) => {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxAttempts) {
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
};

// ===== بيانات مبدئية =====
export const products = [
  { id:"p1", slug:"rahla-tee", name:"تيشيرت رحلة", price:4500, oldPrice:6000,
    category:"ملابس", tags:["جديد"], rating:4.6,
    image: img("rahlamedia/products/rahla-tee.jpg"), desc:"قماش قطني 100%" },
  { id:"p2", slug:"rahla-mug", name:"كوب سفر", price:3500, 
    category:"اكسسوارات", tags:["عروض"], rating:4.3,
    image: img("rahlamedia/products/rahla-mug.jpg"), desc:"عازل للحرارة" },
  { id:"p3", slug:"rahla-bag", name:"حقيبة قماش", price:5200, 
    category:"اكسسوارات", tags:["الأكثر مبيعًا"], rating:4.7,
    image: img("rahlamedia/products/rahla-bag.jpg"), desc:"خياطة متينة" }
];

// ===== تنسيق العملة =====
export const money = (x)=> new Intl.NumberFormat("ar-YE",{style:"currency",currency:settings.currency}).format(x||0);

// ===== سلة محلية (localStorage) =====
const CART_KEY = "rahla_cart";
export const readCart = ()=> JSON.parse(localStorage.getItem(CART_KEY)||"[]");
export const writeCart = (c)=> localStorage.setItem(CART_KEY, JSON.stringify(c));
export const addToCart = (p, qty=1)=>{
  const c = readCart(); const i = c.find(x=>x.id===p.id);
  if(i) i.qty += qty; else c.push({ id:p.id, name:p.name, price:p.price, qty });
  writeCart(c); renderCart();
  // GA4 add_to_cart
  window.gtag?.('event','add_to_cart',{
    value: p.price * qty,
    currency: settings.currency,
    items: [{ 
      item_id: p.id, 
      item_name: p.name,
      category: p.category,
      price: p.price,
      quantity: qty
    }]
  });
  
  // PostHog tracking (if available)
  window.posthog?.capture('product_added_to_cart', {
    product_id: p.id,
    product_name: p.name,
    category: p.category,
    price: p.price,
    quantity: qty,
    total_value: p.price * qty
  });
};
export const removeFromCart = (id)=>{
  writeCart(readCart().filter(x=>x.id!==id)); renderCart();
};

// ===== واتساب CTA =====
export const openWhatsAppCTA = ()=>{
  const c = readCart();
  const lines = c.map(i=>`- ${i.name} × ${i.qty} = ${i.price*i.qty}`);
  const total = c.reduce((s,i)=>s+i.price*i.qty,0);
  const msg = `طلب جديد من ${settings.storeName}\n${lines.join("\n")}\nالإجمالي: ${money(total)}`;
  const url = `https://wa.me/${settings.WHATSAPP}?text=${encodeURIComponent(msg)}`;
  window.open(url,"_blank");
};

// ===== خصم تلقائي وعرض بطاقات =====
const discountBadge = (p)=>{
  if(!p.oldPrice || p.oldPrice<=p.price) return "";
  const off = Math.round((1 - p.price/p.oldPrice)*100);
  return `<span class="badge">خصم ${off}%</span>`;
};

export function renderCatalog(list=products){
  const grid = document.getElementById("productsGrid"); 
  if (!grid) return;
  grid.innerHTML="";
  list.forEach(p=>{
    const el = document.createElement("article");
    el.className="product-card";
    const ra = buildResponsiveAttrs(p.image);
    el.innerHTML = `
      <img class="product-image" src="${p.image}" srcset="${ra.srcset}" sizes="${ra.sizes}" alt="${p.name} - ${p.desc}" loading="lazy" decoding="async" width="560" height="420">
      <div class="product-info">
        <h2 class="product-name">${p.name}</h2>
        <div class="product-price">
          <strong class="current-price">${money(p.price)}</strong>
          ${p.oldPrice ? `<span class="old-price">${money(p.oldPrice)}</span>` : ""}
          ${discountBadge(p)}
        </div>
        <button class="add-to-cart" data-id="${p.id}" aria-label="إضافة ${p.name} إلى سلة التسوق">أضف للسلة</button>
      </div>`;
    grid.appendChild(el);
  });
}

// ===== SEO - JSON-LD آلي =====
export function injectProductLD(p){
  const data = {
    "@context":"https://schema.org",
    "@type":"Product",
    "name": p.name,
    "image": p.image.replace("width=560","width=800"),
    "description": p.desc || "",
    "brand": { "@type":"Brand","name": settings.storeName },
    "offers": {
      "@type":"Offer",
      "priceCurrency": settings.currency,
      "price": String(p.price),
      "availability":"https://schema.org/InStock"
    },
    "aggregateRating": p.rating ? { "@type":"AggregateRating","ratingValue": String(p.rating),"reviewCount":"1" } : undefined
  };
  const s = document.createElement("script");
  s.type="application/ld+json";
  s.textContent = JSON.stringify(data);
  document.body.appendChild(s);
}

// ===== فلترة =====
export function applyFilters({q="", cats=[], tags=[], min=null, max=null}){
  let list = [...products];

  // نطاق السعر
  list = list.filter(p=>{
    const okMin = min!=null ? p.price>=min : true;
    const okMax = max!=null ? p.price<=max : true;
    const okCat = cats.length ? cats.includes(p.category) : true;
    const okTag = tags.length ? p.tags?.some(t=>tags.includes(t)) : true;
    return okMin && okMax && okCat && okTag;
  });

  // بحث Fuse
  q = q.trim();
  if(q){
    const fuse = new Fuse(list, { keys:["name","desc","tags"], threshold:0.35, ignoreLocation:true });
    list = fuse.search(q).map(r=>r.item);
  }
  return list;
}

// ===== حالة الفلاتر + تحديث الكتالوج =====
const filterState = { q: "", cats: [], tags: [], min: null, max: null };
const refreshProducts = ()=>{
  const list = applyFilters(filterState);
  renderCatalog(list);
};

// ===== عرض السلة + شريط الشحن المجاني =====
export function renderCart(){
  const list = document.getElementById("cartList");
  const totalEl = document.getElementById("total");
  const bar = document.getElementById("freeShipWrap");
  const c = readCart();
  
  if (list) {
    list.innerHTML = c.map(i=>`
      <div class="row">
        <span>${i.name}</span>
        <div>
          <button class="qty" data-op="-" data-id="${i.id}">−</button>
          <span>${i.qty}</span>
          <button class="qty" data-op="+" data-id="${i.id}">+</button>
          <button class="rm" data-id="${i.id}">حذف</button>
        </div>
      </div>`).join("") || "<p class='muted'>السلة فارغة</p>";
  }
  
  const total = c.reduce((s,i)=>s+i.price*i.qty,0);
  if (totalEl) totalEl.textContent = money(total);
  
  if (bar) {
    const left = Math.max(0, settings.FREE_SHIPPING_THRESHOLD-total);
    bar.innerHTML = left>0
      ? `<div class="progress"><span style="width:${100*(1-left/settings.FREE_SHIPPING_THRESHOLD)}%"></span></div>
         <small>تبقّى ${money(left)} للحصول على شحن مجاني</small>`
      : `<small>🎉 شحن مجاني متاح</small>`;
  }
}

// ===== إدارة الفلترة =====
export function handleFilters(){
  const searchInput = document.getElementById('searchInput');
  const categoryFilter = document.getElementById('categoryFilter');
  const priceMin = document.getElementById('priceMin');
  const priceMax = document.getElementById('priceMax');
  const tagFilter = document.getElementById('tagFilter');
  const applyBtn = document.getElementById('applyFilters');
  const clearBtn = document.getElementById('clearFilters');

  function applyCurrentFilters(){
    const filters = {
      q: searchInput?.value || "",
      cats: categoryFilter?.value ? [categoryFilter.value] : [],
      tags: tagFilter?.value ? [tagFilter.value] : [],
      min: priceMin?.value ? parseInt(priceMin.value) : null,
      max: priceMax?.value ? parseInt(priceMax.value) : null
    };
    
    const filteredProducts = applyFilters(filters);
    renderCatalog(filteredProducts);
  }

  function clearAllFilters(){
    if(searchInput) searchInput.value = "";
    if(categoryFilter) categoryFilter.value = "";
    if(priceMin) priceMin.value = "";
    if(priceMax) priceMax.value = "";
    if(tagFilter) tagFilter.value = "";
    renderCatalog(products);
  }

  // أحداث البحث الفوري
  if(searchInput) searchInput.addEventListener('input', applyCurrentFilters);
  if(applyBtn) applyBtn.addEventListener('click', applyCurrentFilters);
  if(clearBtn) clearBtn.addEventListener('click', clearAllFilters);
}

// ===== أحداث =====
document.addEventListener("click",(e)=>{
  if(e.target.matches(".add-to-cart")){
    const id = e.target.dataset.id;
    const p = products.find(x=>x.id===id);
    addToCart(p,1);
  }
  if(e.target.matches(".qty")){
    const id=e.target.dataset.id, op=e.target.dataset.op;
    const c = readCart(); const it=c.find(x=>x.id===id); if(!it) return;
    it.qty = Math.max(1, it.qty + (op==="+"?1:-1)); writeCart(c); renderCart();
  }
  if(e.target.matches(".rm")) removeFromCart(e.target.dataset.id);
  if(e.target.id==="whatsCTA") openWhatsAppCTA();
  
  // فلترة سريعة بالفئات
  if(e.target.matches(".filter-btn")){
    const category = e.target.dataset.category;
    const filteredProducts = category === 'all' ? products : 
      applyFilters({cats: [category]});
    renderCatalog(filteredProducts);
    
    // تحديث الأزرار النشطة
    document.querySelectorAll('.filter-btn').forEach(btn => 
      btn.classList.remove('active'));
    e.target.classList.add('active');
  }

  // تبديل فئة التصنيف
  if(e.target.matches('.filter-btn')){
    const cat = e.target.dataset.category;
    // تحديث الحالة
    filterState.cats = (cat && cat!=="all") ? [cat] : [];
    // تحديث المظهر النشط
    const btns = document.querySelectorAll('.filter-btn');
    btns.forEach(b=> b.classList.toggle('active', b===e.target));
    // تطبيق الفلاتر
    refreshProducts();
  }
});

// ===== تحسين الأداء =====
// تحميل الصور بشكل كسول
const lazyImages = document.querySelectorAll('img[loading="lazy"]');
if ('IntersectionObserver' in window) {
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src || img.src;
        img.classList.remove('lazy');
        observer.unobserve(img);
        }
    });
});

  lazyImages.forEach(img => imageObserver.observe(img));
}

// ===== API Integration =====
const TOKEN_KEY = 'authToken';
export const setAuthToken = (t)=> localStorage.setItem(TOKEN_KEY, t||'');
export const getAuthToken = ()=> localStorage.getItem(TOKEN_KEY)||'';

export const apiRequest = async (endpoint, options = {}) => {
  try {
    const token = getAuthToken();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), settings.TIMEOUT);
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      signal: controller.signal
    };
    
    const response = await fetch(`${settings.API_BASE}${endpoint}`, {
      ...defaultOptions,
      ...options
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`HTTP ${response.status}: ${errorData.error || response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    handleError(error, 'apiRequest');
    throw error;
  }
};

export const loginApi = async (email, password)=>{
  try {
    const res = await fetch(`${settings.API_BASE}/auth/login`, {
      method:'POST', 
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${res.status}`);
    }
    
    const data = await res.json();
    if (data.token) {
      setAuthToken(data.token);
      // تتبع تسجيل الدخول
      window.gtag?.('event', 'login', { method: 'email' });
      window.posthog?.capture('user_logged_in', { method: 'email' });
    }
    return data;
  } catch (error) {
    handleError(error, 'loginApi');
    throw error;
  }
};

export const getCurrentUser = async ()=>{
  try {
    const data = await apiRequest('/auth/me');
    return data.user;
  } catch (error) {
    console.log('User not authenticated');
    return null;
  }
};

// Load admin panel with user info and products list
export const loadAdminPanel = async ()=>{
  const user = await getCurrentUser();
  if (!user) return;
  
  const adminPanel = document.getElementById('adminPanel');
  const userInfo = document.getElementById('userInfo');
  if (adminPanel) adminPanel.style.display = 'block';
  if (userInfo) userInfo.innerHTML = `مرحباً ${user.name} (${user.role})`;
  
  // Load products for admin
  try {
    const data = await apiRequest('/products');
    const products = data.items || data;
    const adminList = document.getElementById('adminProductsList');
    if (adminList) {
      adminList.innerHTML = products.map(p => `
        <div style="border:1px solid #ddd;padding:0.5rem;margin:0.25rem 0;border-radius:4px;">
          <strong>${p.name}</strong> - ${money(p.price)}
          <button onclick="editProduct('${p._id}')" style="margin-left:0.5rem;padding:0.25rem 0.5rem;background:#0ea5e9;color:#fff;border:none;border-radius:3px;">تعديل</button>
          <button onclick="deleteProduct('${p._id}')" style="margin-left:0.25rem;padding:0.25rem 0.5rem;background:#dc2626;color:#fff;border:none;border-radius:3px;">حذف</button>
        </div>
      `).join('');
    }
  } catch (error) {
    console.error('Failed to load products:', error);
  }
};

// Global functions for admin actions
window.editProduct = async (id) => {
  // TODO: Implement edit modal
  alert('تعديل المنتج: ' + id);
};

window.deleteProduct = async (id) => {
  if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
  try {
    await apiRequest(`/products/${id}`, { method: 'DELETE' });
    await loadAdminPanel();
    document.getElementById('adminMsg').textContent = 'تم حذف المنتج';
  } catch (error) {
    document.getElementById('adminMsg').textContent = 'فشل حذف المنتج';
  }
};

// دالة لجلب المنتجات من API
export const fetchProducts = async () => {
  try {
    const data = await apiRequest('/products');
    return Array.isArray(data) ? data : (data.items || null);
  } catch (error) {
    console.log('استخدام المنتجات المحلية بدلاً من API');
    return null;
  }
};

// ===== تهيئة التطبيق =====
const initializeApp = async () => {
  try {
    // محاولة جلب المنتجات من API
    const apiProducts = await fetchProducts();
    if (apiProducts && apiProducts.length > 0) {
      // استخدام المنتجات من API
      renderCatalog(apiProducts);
      console.log('تم تحميل المنتجات من API');
    } else {
      // استخدام المنتجات المحلية
      renderCatalog(products);
      console.log('تم تحميل المنتجات المحلية');
    }
  } catch (error) {
    // في حالة الخطأ، استخدام المنتجات المحلية
    renderCatalog(products);
    console.log('تم تحميل المنتجات المحلية (خطأ في API)');
  }
  
  renderCart();
  handleFilters();
};

// ===== تشغيل أولي =====
document.addEventListener('DOMContentLoaded', () => {
  // تحديث عنوان المتجر
  document.title = settings.storeName;
  const logo = document.querySelector('.logo');
  if (logo) logo.innerHTML = `<i class="fas fa-store"></i> ${settings.storeName}`;
  
  const heroTitle = document.querySelector('.hero-title');
  if (heroTitle) heroTitle.textContent = `أهلاً بك في ${settings.storeName}`;
  
  // إظهار زر WhatsApp في الهيدر إذا كان مفعلاً
  if (settings.WHATSAPP) {
    const whatsappHeaderBtn = document.getElementById('whatsapp-header-btn');
    if (whatsappHeaderBtn) whatsappHeaderBtn.style.display = 'block';
  }
  
  // تشغيل العرض الأولي
  initializeApp();
  
  // Check if user is already logged in
  if (getAuthToken()) {
    loadAdminPanel();
  }

  // Login wiring
  const btn = document.getElementById('loginBtn');
  if (btn) {
    btn.addEventListener('click', async ()=>{
      const email = document.getElementById('loginEmail')?.value || '';
      const password = document.getElementById('loginPass')?.value || '';
      const msg = document.getElementById('loginMsg');
      try{
        const r = await loginApi(email, password);
        if(r.token){ 
          msg && (msg.textContent='تم الدخول');
          await loadAdminPanel();
        }
        else { msg && (msg.textContent=r.error||'فشل الدخول'); }
      }catch(e){ msg && (msg.textContent='خطأ بالشبكة'); }
    });
  }

  // Admin create product flow (sign-upload then create)
  const createBtn = document.getElementById('btnCreateProd');
  if (createBtn) {
    createBtn.addEventListener('click', async ()=>{
      const name = document.getElementById('pName')?.value?.trim();
      const price = Number(document.getElementById('pPrice')?.value||0);
      const category = document.getElementById('pCategory')?.value?.trim();
      if (!name || !price) { const msg = document.getElementById('adminMsg'); msg && (msg.textContent='رجاء أدخل الاسم والسعر'); return; }
      const fileEl = document.getElementById('pImageFile');
      const msg = document.getElementById('adminMsg');
      try{
        let imageUrl = '';
        const file = fileEl?.files?.[0];
        if (file) {
          const key = `rahlamedia/products/${Date.now()}-${file.name}`;
          const sig = await apiRequest('/media/sign-upload', { method:'POST', body: JSON.stringify({ key, contentType: file.type }) });
          await fetch(sig.url, { method: 'PUT', headers: sig.headers, body: file });
          imageUrl = sig.publicUrl;
        }
        const body = { name, price, category, image: imageUrl, tags: [], desc: '' };
        await apiRequest('/products', { method:'POST', body: JSON.stringify(body) });
        msg && (msg.textContent = 'تم إنشاء المنتج');
      }catch(e){ msg && (msg.textContent = 'فشل الإنشاء'); }
    });
  }
  
  console.log(`مرحباً بك في ${settings.storeName}!`);
  console.log(`العملة: ${settings.currency}`);
  console.log(`CDN URL: ${settings.CDN}`);
});

// PWA Installation prompt
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    console.log('PWA: Install prompt triggered');
    deferredPrompt = e;
});

// PWA Installation complete
window.addEventListener('appinstalled', (evt) => {
    console.log('PWA: App was installed successfully');
});

// Web Vitals Collection
if (typeof webVitals !== 'undefined') {
  webVitals.getLCP((metric) => {
    console.log('LCP:', metric);
    // Send to GA4
    window.gtag?.('event', 'web_vitals', {
      metric_name: 'LCP',
      value: Math.round(metric.value),
      metric_id: metric.id
    });
    // Send to PostHog
    window.posthog?.capture('web_vitals', {
      metric_name: 'LCP',
      value: Math.round(metric.value),
      metric_id: metric.id
    });
  });

  webVitals.getINP((metric) => {
    console.log('INP:', metric);
    window.gtag?.('event', 'web_vitals', {
      metric_name: 'INP',
      value: Math.round(metric.value),
      metric_id: metric.id
    });
    window.posthog?.capture('web_vitals', {
      metric_name: 'INP',
      value: Math.round(metric.value),
      metric_id: metric.id
    });
  });

  webVitals.getCLS((metric) => {
    console.log('CLS:', metric);
    window.gtag?.('event', 'web_vitals', {
      metric_name: 'CLS',
      value: Math.round(metric.value * 1000) / 1000,
      metric_id: metric.id
    });
    window.posthog?.capture('web_vitals', {
      metric_name: 'CLS',
      value: Math.round(metric.value * 1000) / 1000,
      metric_id: metric.id
    });
  });
}

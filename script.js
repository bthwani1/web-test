// ===== إعدادات عامة =====
export const settings = {
    storeName: "رحلة _ Rahla",
    currency: "YER",
    FREE_SHIPPING_THRESHOLD: 15000,
  WHATSAPP: "9677XXXXXXXX", // عدّل لاحقًا
  CDN: "https://rahlacdn.b-cdn.net"
};
export const img = (path, w=560) =>
  `${settings.CDN}/${path}?width=${w}&quality=70&format=auto&v=1`;

// توليد srcset و sizes تلقائيًا للصورة المعطاة (بُنيت عبر img())
const buildResponsiveAttrs = (imageUrl)=>{
  const widths = [420, 720, 1080];
  const makeUrl = (w)=> imageUrl.replace(/width=\d+/, `width=${w}`);
  const srcset = widths.map(w=>`${makeUrl(w)} ${w}w`).join(", ");
  const sizes = "(max-width: 600px) 90vw, 560px";
  return { srcset, sizes };
};

// ===== بيانات مبدئية =====
export const products = [
  { id:"p1", slug:"rahla-tee", name:"تيشيرت رحلة", price:4500, oldPrice:6000,
    category:"ملابس", tags:["جديد"], rating:4.6,
    image: img("products/rahla-tee.jpg"), desc:"قماش قطني 100%" },
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
    value: qty,
    currency: settings.currency,
    items: [{ item_id: p.id, item_name: p.name }]
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
  renderCatalog(); 
  renderCart();
  handleFilters();

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

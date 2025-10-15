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

// ===== بيانات مبدئية =====
export const products = [
  { id:"p1", slug:"rahla-tee", name:"تيشيرت رحلة", price:4500, oldPrice:6000,
    category:"ملابس", tags:["جديد"], rating:4.6,
    image: img("products/rahla-tee.jpg"), desc:"قماش قطني 100%" }
  // أضف لاحقًا p2/p3… بعد رفع صورها إلى Bunny
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
    el.innerHTML = `
      <img class="product-image" src="${p.image}" alt="${p.name}" loading="lazy" decoding="async" width="560" height="420">
      <div class="product-info">
        <h2 class="product-name">${p.name}</h2>
        <div class="product-price">
          <strong class="current-price">${money(p.price)}</strong>
          ${p.oldPrice ? `<span class="old-price">${money(p.oldPrice)}</span>` : ""}
          ${discountBadge(p)}
        </div>
        <button class="add-to-cart" data-id="${p.id}">أضف للسلة</button>
      </div>`;
    grid.appendChild(el);
  });
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

  // البحث (اختياري: إذا وُجد مدخل بحث)
  const searchEl = document.getElementById('searchInput') || document.getElementById('search');
  if (searchEl) {
    searchEl.addEventListener('input', () => { filterState.q = searchEl.value || ""; refreshProducts(); });
  }

  // نطاق السعر (اختياري: إذا وُجدتا حقول السعر)
  const minEl = document.getElementById('minPrice');
  const maxEl = document.getElementById('maxPrice');
  const onPriceChange = ()=>{
    const vMin = minEl && minEl.value!=='' ? Number(minEl.value) : null;
    const vMax = maxEl && maxEl.value!=='' ? Number(maxEl.value) : null;
    filterState.min = Number.isFinite(vMin) ? vMin : null;
    filterState.max = Number.isFinite(vMax) ? vMax : null;
    refreshProducts();
  };
  if (minEl) minEl.addEventListener('input', onPriceChange);
  if (maxEl) maxEl.addEventListener('input', onPriceChange);

  // الوسوم (اختياري: عناصر تحمل class=tag-filter و data-tag)
  document.addEventListener('click', (ev)=>{
    if (ev.target.matches('.tag-filter')){
      const tag = ev.target.dataset.tag;
      if (!tag) return;
      const i = filterState.tags.indexOf(tag);
      if (i>=0) filterState.tags.splice(i,1); else filterState.tags.push(tag);
      ev.target.classList.toggle('active');
      refreshProducts();
    }
  });
  
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

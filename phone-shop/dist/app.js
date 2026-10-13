"use strict";
const phones = [{ id: 1, name: 'Nova One Pro', brand: 'Nova', price: 899, camera: 108, battery: 5000, display: '6.7″ OLED', color: '#b9a6e1', tag: 'The flagship' }, { id: 2, name: 'Nova One', brand: 'Nova', price: 649, camera: 64, battery: 4800, display: '6.4″ OLED', color: '#a4b9d6', tag: 'Everyday favorite' }, { id: 3, name: 'Orbit Ultra', brand: 'Orbit', price: 1099, camera: 200, battery: 5500, display: '6.8″ AMOLED', color: '#45485c', tag: 'Camera powerhouse' }, { id: 4, name: 'Orbit Go', brand: 'Orbit', price: 349, camera: 50, battery: 5000, display: '6.5″ LCD', color: '#e2b79c', tag: 'Big value' }, { id: 5, name: 'Aero Air', brand: 'Aero', price: 549, camera: 48, battery: 4200, display: '6.3″ OLED', color: '#a5d2c2', tag: 'Light and lovely' }, { id: 6, name: 'Aero Mini', brand: 'Aero', price: 299, camera: 32, battery: 4000, display: '5.9″ LCD', color: '#dac19d', tag: 'Pocket perfect' }];
const el = (id) => document.getElementById(id);
const money = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
let cart = [];
try {
    const raw = JSON.parse(localStorage.getItem('pulse-cart') || '[]');
    if (Array.isArray(raw))
        cart = raw.filter((x) => phones.some(p => p.id === x.id) && [128, 256, 512].includes(x.storage) && Number.isInteger(x.qty) && x.qty > 0 && x.qty <= 10 && typeof x.color === 'string').map((x) => ({ ...x, color: ['Lavender', 'Midnight', 'Silver'].includes(x.color) ? x.color : 'Lavender' }));
}
catch { }
let brand = 'All';
const compare = new Set();
let current = phones[0];
const phone = (id) => phones.find(p => p.id === id);
const price = (i) => phone(i.id).price + (i.storage === 256 ? 80 : i.storage === 512 ? 180 : 0);
const total = () => cart.reduce((s, i) => s + price(i) * i.qty, 0);
const image = (p) => `assets/phone-${p.id}.svg`;
function toast(s) { el('toast').textContent = s; el('toast').classList.add('visible'); setTimeout(() => el('toast').classList.remove('visible'), 2500); }
function openDialog(id) { el(id).showModal(); }
function closeDialog(id) { el(id).close(); }
function save() { try {
    localStorage.setItem('pulse-cart', JSON.stringify(cart));
}
catch { } el('cart-count').textContent = String(cart.reduce((s, i) => s + i.qty, 0)); renderCart(); }
function render() { let list = phones.filter(p => (brand === 'All' || p.brand === brand) && p.name.toLowerCase().includes(el('search').value.toLowerCase()) && p.price <= Number(el('budget').value)); const sort = el('sort').value; if (sort !== 'featured')
    list.sort((a, b) => sort === 'low' ? a.price - b.price : b.price - a.price); el('result-count').textContent = `${list.length} phones · Illustrative USD prices`; el('products').innerHTML = list.length ? list.map(p => `<article class="product"><div class="product-image"><span class="badge">${p.tag}</span><button class="compare-toggle" data-compare="${p.id}" aria-label="Compare ${p.name}" aria-pressed="${compare.has(p.id)}">${compare.has(p.id) ? '✓' : '+'}</button><img src="${image(p)}" alt="${p.name} illustration"></div><div class="product-meta"><span class="eyebrow">${p.brand}</span><h3>${p.name}</h3><p>Your everyday, upgraded.</p><div class="spec-tags"><span>${p.camera} MP</span><span>${p.battery} mAh</span><span>128 GB</span></div><div class="product-bottom"><div class="price"><strong>${money(p.price)}</strong><small>Base price</small></div><button class="details-button" data-detail="${p.id}">Choose phone ↗</button></div></div></article>`).join('') : '<p class="empty">No phones match. Try a different search or budget.</p>'; el('compare-count').textContent = String(compare.size); }
function detail(id) { current = phone(id); const p = current; el('product-content').innerHTML = `<div class="detail-grid"><img class="detail-image" src="${image(p)}" alt="${p.name}"><div><span class="eyebrow">${p.brand}</span><h2 id="product-title">${p.name}</h2><div class="detail-specs"><div><b>${p.display}</b>Display</div><div><b>${p.camera} MP</b>Camera</div><div><b>${p.battery} mAh</b>Battery</div><div><b>5G</b>Connectivity</div></div><label>Finish<select id="finish"><option>Lavender</option><option>Midnight</option><option>Silver</option></select></label><label>Storage<select id="storage"><option value="128">128 GB · included</option><option value="256">256 GB · +$80</option><option value="512">512 GB · +$180</option></select></label><p class="detail-price" id="detail-price">${money(p.price)}</p><button id="add" class="primary wide">Add to bag ↗</button></div></div>`; el('storage').onchange = () => el('detail-price').textContent = money(p.price + ({ 128: 0, 256: 80, 512: 180 }[Number(el('storage').value)])); el('add').onclick = () => { const storage = Number(el('storage').value), color = el('finish').value; const item = cart.find(i => i.id === p.id && i.storage === storage && i.color === color); if (item) {
    if (item.qty >= 10) {
        toast('Maximum 10 per configuration');
        return;
    }
    item.qty++;
}
else
    cart.push({ id: p.id, storage, color, qty: 1 }); save(); closeDialog('product-dialog'); toast(`${p.name} added to your bag`); }; openDialog('product-dialog'); }
function renderCart() { el('cart-items').innerHTML = cart.length ? cart.map((i, index) => `<div class="cart-row"><img src="${image(phone(i.id))}" alt=""><div><h3>${phone(i.id).name}</h3><p>${i.storage} GB · ${i.color} · ${money(price(i))}</p><button class="remove" data-remove="${index}">Remove</button></div><div class="quantity"><button data-qty="${index}" data-delta="-1" aria-label="Decrease quantity">−</button><span>${i.qty}</span><button data-qty="${index}" data-delta="1" aria-label="Increase quantity">+</button></div></div>`).join('') : '<p class="empty">Your bag is waiting for its first upgrade.</p>'; el('cart-total').innerHTML = `<div class="total-row"><span>Demo shipping</span><b>Free</b></div><div class="total-row final"><span>Total</span><b>${money(total())}</b></div>`; el('checkout-open').disabled = !cart.length; }
function renderCompare() { el('compare-content').innerHTML = compare.size ? `<div class="comparison">${[...compare].map(id => { const p = phone(id); return `<article><img src="${image(p)}" alt="${p.name}"><h3>${p.name}</h3><dl><dt>Base price</dt><dd>${money(p.price)}</dd><dt>Display</dt><dd>${p.display}</dd><dt>Camera</dt><dd>${p.camera} MP</dd><dt>Battery</dt><dd>${p.battery} mAh</dd></dl><button data-compare="${id}">Remove from comparison</button></article>`; }).join('')}</div>` : '<p class="empty">Use the + button on a phone to compare up to three models.</p>'; }
document.addEventListener('click', e => { const b = e.target.closest('[data-detail],[data-compare],[data-remove],[data-qty],[data-brand],[data-guide]'); if (!b)
    return; const d = b.dataset; if (d.detail)
    detail(Number(d.detail)); if (d.compare) {
    const id = Number(d.compare);
    if (compare.has(id))
        compare.delete(id);
    else if (compare.size < 3)
        compare.add(id);
    else
        toast('Compare up to three phones');
    render();
    renderCompare();
} if (d.remove !== undefined) {
    cart.splice(Number(d.remove), 1);
    save();
} if (d.qty !== undefined) {
    const i = cart[Number(d.qty)];
    i.qty = Math.min(10, i.qty + Number(d.delta));
    if (!i.qty)
        cart.splice(Number(d.qty), 1);
    save();
} if (d.brand) {
    brand = d.brand;
    document.querySelectorAll('[data-brand]').forEach(x => x.classList.toggle('active', x.dataset.brand === brand));
    render();
} if (d.guide) {
    brand = 'All';
    el('search').value = '';
    el('budget').value = d.guide === 'budget' ? '400' : '2000';
    el('sort').value = 'featured';
    document.querySelectorAll('[data-brand]').forEach(x => x.classList.toggle('active', x.dataset.brand === 'All'));
    render();
    if (d.guide !== 'budget') {
        const ids = phones.filter(p => d.guide === 'camera' ? p.camera >= 108 : p.battery >= 5000).map(p => p.id);
        document.querySelectorAll('.product').forEach(x => { const id = Number(x.querySelector('[data-detail]').dataset.detail); x.hidden = !ids.includes(id); });
        el('result-count').textContent = `${ids.length} ${d.guide} picks`;
    }
    el('shop').scrollIntoView();
} });
['search', 'budget', 'sort'].forEach(id => el(id).addEventListener('input', render));
['product', 'cart', 'compare', 'checkout', 'success'].forEach(id => { el(`${id}-close`).onclick = () => closeDialog(`${id}-dialog`); });
el('cart-open').onclick = () => openDialog('cart-dialog');
function showCompare() { renderCompare(); openDialog('compare-dialog'); }
el('compare-open').onclick = showCompare;
el('footer-compare').onclick = showCompare;
el('hero-detail').onclick = () => detail(1);
el('spotlight-detail').onclick = () => detail(5);
el('checkout-open').onclick = () => { if (!cart.length)
    return; closeDialog('cart-dialog'); el('checkout-summary').textContent = `Demo total: ${money(total())} · Free demo shipping`; openDialog('checkout-dialog'); };
el('checkout-form').onsubmit = e => { e.preventDefault(); if (!cart.length)
    return; el('success-message').textContent = `Demo order for ${cart.reduce((s, i) => s + i.qty, 0)} phone(s), totaling ${money(total())}.`; cart = []; save(); el('checkout-form').reset(); closeDialog('checkout-dialog'); openDialog('success-dialog'); };
render();
save();
// Follow the device theme until a preference is explicitly chosen.
const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
let preferredTheme = null;
try {
    preferredTheme = localStorage.getItem('pulse-theme');
}
catch { }
function applyTheme(dark) {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    el('theme-toggle').setAttribute('aria-pressed', String(dark));
}
applyTheme(preferredTheme === 'dark' || (preferredTheme !== 'light' && systemTheme.matches));
el('theme-toggle').onclick = () => {
    preferredTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(preferredTheme === 'dark');
    try {
        localStorage.setItem('pulse-theme', preferredTheme);
    }
    catch { }
};
systemTheme.addEventListener('change', event => {
    if (preferredTheme !== 'dark' && preferredTheme !== 'light')
        applyTheme(event.matches);
});

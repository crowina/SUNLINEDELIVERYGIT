/* ═══════════════════════════════════════════════════
   SUNLINE — script.js
   Cart management + checkout redirect
═══════════════════════════════════════════════════ */

// ── Cart helpers ──────────────────────────────────

function getCart() {
  try {
    return JSON.parse(localStorage.getItem('cart') || '[]');
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function getCartTotal(cart) {
  return cart.reduce((sum, item) => sum + item.price * (item.qty || 1), 0);
}

function getCartCount(cart) {
  return cart.reduce((sum, item) => sum + (item.qty || 1), 0);
}

// ── Update all cart counters on page ─────────────

function updateCartCounters() {
  const cart = getCart();
  const count = getCartCount(cart);
  document.querySelectorAll('[data-cart-count]').forEach(el => {
    el.textContent = count;
  });
}

// ── Add item to cart ──────────────────────────────

function addToCart(name, price) {
  const cart = getCart();
  const existing = cart.find(item => item.name === name);
  if (existing) {
    existing.qty = (existing.qty || 1) + 1;
  } else {
    cart.push({ name, price, qty: 1 });
  }
  saveCart(cart);
  updateCartCounters();
  showAddedFeedback(name);
}

// ── Brief "Added" visual feedback ─────────────────

function showAddedFeedback(name) {
  // Find the button that triggered it and flash it
  document.querySelectorAll('[data-add-to-cart]').forEach(btn => {
    if (btn.dataset.name === name) {
      const original = btn.textContent;
      btn.textContent = 'Добавлено ✓';
      btn.disabled = true;
      setTimeout(() => {
        btn.textContent = original;
        btn.disabled = false;
      }, 1500);
    }
  });
}

// ── Render cart page ──────────────────────────────

function renderCart() {
  const itemsEl = document.querySelector('[data-cart-items]');
  const totalEl = document.querySelector('[data-cart-total]');
  const msgEl = document.querySelector('[data-cart-message]');
  if (!itemsEl) return;

  const cart = getCart();

  if (cart.length === 0) {
    itemsEl.innerHTML = '<p style="color:var(--color-muted,#888);padding:1rem 0">Корзина пуста. <a href="catalog.html">Перейти в каталог</a></p>';
    if (totalEl) totalEl.textContent = '0 ₽';
    return;
  }

  itemsEl.innerHTML = '';
  cart.forEach((item, index) => {
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:1rem 0;border-bottom:1px solid var(--color-border,#e8e4df);gap:1rem;';
    div.innerHTML = `
      <div style="flex:1">
        <strong style="display:block;margin-bottom:0.25rem">${item.name}</strong>
        <span style="font-size:0.85rem;color:var(--color-muted,#888)">${item.price.toLocaleString('ru-RU')} ₽ × ${item.qty || 1}</span>
      </div>
      <div style="display:flex;align-items:center;gap:0.75rem">
        <button data-qty-btn data-index="${index}" data-delta="-1" style="background:none;border:1px solid var(--color-border,#ccc);width:28px;height:28px;cursor:pointer;font-size:1rem;display:flex;align-items:center;justify-content:center">−</button>
        <span style="min-width:1.5rem;text-align:center">${item.qty || 1}</span>
        <button data-qty-btn data-index="${index}" data-delta="1" style="background:none;border:1px solid var(--color-border,#ccc);width:28px;height:28px;cursor:pointer;font-size:1rem;display:flex;align-items:center;justify-content:center">+</button>
        <span style="min-width:5rem;text-align:right;font-weight:500">${(item.price * (item.qty || 1)).toLocaleString('ru-RU')} ₽</span>
        <button data-remove-btn data-index="${index}" style="background:none;border:none;cursor:pointer;color:var(--color-muted,#888);font-size:1.1rem;padding:0 0.25rem" title="Удалить">×</button>
      </div>
    `;
    itemsEl.appendChild(div);
  });

  // Qty buttons
  itemsEl.querySelectorAll('[data-qty-btn]').forEach(btn => {
    btn.addEventListener('click', () => {
      const cart = getCart();
      const idx = parseInt(btn.dataset.index);
      const delta = parseInt(btn.dataset.delta);
      cart[idx].qty = Math.max(1, (cart[idx].qty || 1) + delta);
      saveCart(cart);
      updateCartCounters();
      renderCart();
    });
  });

  // Remove buttons
  itemsEl.querySelectorAll('[data-remove-btn]').forEach(btn => {
    btn.addEventListener('click', () => {
      const cart = getCart();
      cart.splice(parseInt(btn.dataset.index), 1);
      saveCart(cart);
      updateCartCounters();
      renderCart();
    });
  });

  const total = getCartTotal(cart);
  if (totalEl) totalEl.textContent = total.toLocaleString('ru-RU') + ' ₽';
  if (msgEl) msgEl.textContent = '';
}

// ── Checkout redirect ─────────────────────────────

function handleCheckout() {
  const cart = getCart();
  if (cart.length === 0) {
    const msgEl = document.querySelector('[data-cart-message]');
    if (msgEl) msgEl.textContent = 'Корзина пуста — добавьте товары перед оформлением.';
    return;
  }
  window.location.href = 'checkout.html';
}

// ── Clear cart ────────────────────────────────────

function handleClearCart() {
  saveCart([]);
  updateCartCounters();
  renderCart();
}

// ── Bind all buttons on page load ─────────────────

document.addEventListener('DOMContentLoaded', () => {
  updateCartCounters();

  // "Add to cart" buttons (catalog, product pages)
  document.querySelectorAll('[data-add-to-cart]').forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.dataset.name;
      const price = parseInt(btn.dataset.price, 10);
      if (name && price) addToCart(name, price);
    });
  });

  // Cart page
  renderCart();

  // "Checkout" button
  const checkoutBtn = document.querySelector('[data-checkout]');
  if (checkoutBtn) checkoutBtn.addEventListener('click', handleCheckout);

  // "Clear cart" button
  const clearBtn = document.querySelector('[data-clear-cart]');
  if (clearBtn) clearBtn.addEventListener('click', handleClearCart);
});

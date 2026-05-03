(function () {
  const CART_KEY = 'waggy_cart';
  let cart = [];

  function loadCart() {
    try {
      const stored = localStorage.getItem(CART_KEY);
      cart = stored ? JSON.parse(stored) : [];
    } catch (e) {
      cart = [];
    }
  }

  function saveCart() {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }

  function getTotalItems() {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  function getTotalPrice() {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2);
  }

  function updateBadges() {
    const total = getTotalItems();
    document.querySelectorAll('#cart-badge, #cart-badge-mobile, #cart-badge-desktop').forEach(badge => {
      if (badge) badge.textContent = total;
    });
  }

  function renderCart() {
    const container = document.getElementById('cart-items-container');
    const totalContainer = document.getElementById('cart-total-container');
    const totalEl = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('cart-checkout-btn');

    if (!container) return;

    if (cart.length === 0) {
      container.innerHTML = `
        <div class="text-center py-5">
          <p class="text-muted">Your cart is empty</p>
          <button class="btn btn-outline-primary btn-lg rounded-1 mt-3" data-bs-dismiss="offcanvas">Continue Shopping</button>
        </div>`;
      if (totalContainer) totalContainer.classList.add('d-none');
      if (checkoutBtn) checkoutBtn.classList.add('d-none');
      updateBadges();
      return;
    }

    let html = '<ul class="list-group mb-3">';
    cart.forEach(item => {
      const subtotal = (item.price * item.quantity).toFixed(2);
      html += `
        <li class="list-group-item d-flex justify-content-between lh-sm align-items-center">
          <div class="d-flex align-items-center">
            <img src="${item.image}" alt="${item.name}" class="me-3 rounded" style="width: 50px; height: 50px; object-fit: cover;">
            <div>
              <h6 class="my-0">${item.name}</h6>
              <small class="text-body-secondary">$${item.price} x ${item.quantity}</small>
            </div>
          </div>
          <div class="d-flex align-items-center">
            <button class="btn btn-sm btn-outline-secondary me-2 cart-qty-dec" data-id="${item.id}">−</button>
            <span class="me-2 fw-bold">${item.quantity}</span>
            <button class="btn btn-sm btn-outline-secondary me-3 cart-qty-inc" data-id="${item.id}">+</button>
            <span class="text-body-secondary me-3">$${subtotal}</span>
            <button class="btn btn-sm btn-outline-danger cart-remove" data-id="${item.id}" title="Remove item">✕</button>
          </div>
        </li>`;
    });
    html += '</ul>';
    html += '<div class="text-center"><button class="btn btn-outline-primary btn-lg rounded-1 w-100" data-bs-dismiss="offcanvas">Continue Shopping</button></div>';

    container.innerHTML = html;

    if (totalEl) totalEl.textContent = '$' + getTotalPrice();
    if (totalContainer) totalContainer.classList.remove('d-none');
    if (checkoutBtn) {
      checkoutBtn.classList.remove('d-none');
      checkoutBtn.onclick = function () {
        window.location.href = 'checkout.html';
      };
    }

    container.querySelectorAll('.cart-qty-dec').forEach(btn => {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        decreaseQuantity(this.getAttribute('data-id'));
      });
    });

    container.querySelectorAll('.cart-qty-inc').forEach(btn => {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        increaseQuantity(this.getAttribute('data-id'));
      });
    });

    container.querySelectorAll('.cart-remove').forEach(btn => {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        removeItem(this.getAttribute('data-id'));
      });
    });

    updateBadges();
  }

  function addToCart(product) {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    saveCart();
    renderCart();
  }

  function increaseQuantity(id) {
    const item = cart.find(item => item.id === id);
    if (item) {
      item.quantity += 1;
      saveCart();
      renderCart();
    }
  }

  function decreaseQuantity(id) {
    const item = cart.find(item => item.id === id);
    if (!item) return;
    item.quantity -= 1;
    if (item.quantity <= 0) {
      cart = cart.filter(i => i.id !== id);
    }
    saveCart();
    renderCart();
  }

  function removeItem(id) {
    cart = cart.filter(item => item.id !== id);
    saveCart();
    renderCart();
  }

  function initAddToCartButtons() {
    document.querySelectorAll('.btn-cart').forEach(button => {
      button.addEventListener('click', function (e) {
        e.preventDefault();
        const id = this.getAttribute('data-id');
        const name = this.getAttribute('data-name');
        const price = parseFloat(this.getAttribute('data-price'));
        const image = this.getAttribute('data-image');
        if (id && name && !isNaN(price) && image) {
          addToCart({ id, name, price, image });
        }
      });
    });
  }

  loadCart();
  renderCart();
  initAddToCartButtons();

  window.addEventListener('load', () => {
    initAddToCartButtons();
  });
})();
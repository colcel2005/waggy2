(function () {
  const CART_KEY = 'waggy_cart';
  let cart = [];

  // Cargar carrito desde localStorage
  function loadCart() {
    try {
      const stored = localStorage.getItem(CART_KEY);
      if (stored) {
        cart = JSON.parse(stored);
      } else {
        cart = [];
      }
    } catch (e) {
      cart = [];
    }
  }

  // Guardar carrito en localStorage
  function saveCart() {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }

  // Obtener cantidad total de artículos
  function getTotalItems() {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  // Obtener precio total
  function getTotalPrice() {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2);
  }

  // Actualizar todos los badges del carrito
  function updateBadges() {
    const total = getTotalItems();
    const badges = document.querySelectorAll('#cart-badge, #cart-badge-mobile, #cart-badge-desktop');
    badges.forEach(badge => {
      if (badge) {
        badge.textContent = total;
      }
    });
  }

  // Renderizar el interior del offcanvas del carrito
  function renderCart() {
    const container = document.getElementById('cart-items-container');
    const totalContainer = document.getElementById('cart-total-container');
    const totalEl = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('cart-checkout-btn');

    if (!container) return;

    if (cart.length === 0) {
      container.innerHTML = '<div class="text-center py-5"><p class="text-muted">Your cart is empty</p></div>';
      if (totalContainer) totalContainer.classList.add('d-none');
      if (checkoutBtn) checkoutBtn.classList.add('d-none');
    } else {
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
              <button class="btn btn-sm btn-outline-secondary me-2 cart-decrease" data-id="${item.id}">-</button>
              <span class="me-2">${item.quantity}</span>
              <button class="btn btn-sm btn-outline-secondary me-3 cart-increase" data-id="${item.id}">+</button>
              <span class="text-body-secondary">$${subtotal}</span>
              <button class="btn btn-sm btn-outline-danger ms-3 cart-remove" data-id="${item.id}">&times;</button>
            </div>
          </li>`;
      });
      html += '</ul>';

      container.innerHTML = html;

      if (totalEl) totalEl.textContent = '$' + getTotalPrice();
      if (totalContainer) totalContainer.classList.remove('d-none');
      if (checkoutBtn) {
        checkoutBtn.classList.remove('d-none');
        // Redirigir al checkout
        checkoutBtn.onclick = function () {
          window.location.href = 'checkout.html';
        };
      }

      // Asignar eventos a los botones dentro del offcanvas
      container.querySelectorAll('.cart-increase').forEach(btn => {
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          const id = this.getAttribute('data-id');
          increaseQuantity(id);
        });
      });

      container.querySelectorAll('.cart-decrease').forEach(btn => {
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          const id = this.getAttribute('data-id');
          decreaseQuantity(id);
        });
      });

      container.querySelectorAll('.cart-remove').forEach(btn => {
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          const id = this.getAttribute('data-id');
          removeItem(id);
        });
      });
    }

    updateBadges();
  }

  // Añadir producto al carrito
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

  // Incrementar cantidad
  function increaseQuantity(id) {
    const item = cart.find(item => item.id === id);
    if (item) {
      item.quantity += 1;
      saveCart();
      renderCart();
    }
  }

  // Decrementar cantidad (o eliminar si llega a 0)
  function decreaseQuantity(id) {
    const item = cart.find(item => item.id === id);
    if (item) {
      item.quantity -= 1;
      if (item.quantity <= 0) {
        cart = cart.filter(i => i.id !== id);
      }
      saveCart();
      renderCart();
    }
  }

  // Eliminar producto completamente
  function removeItem(id) {
    cart = cart.filter(item => item.id !== id);
    saveCart();
    renderCart();
  }

  // Inicializar eventos en los botones "Add to Cart"
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

  // Inicio
  loadCart();
  renderCart();
  initAddToCartButtons();

  // Re-inicializar botones después de cada actualización dinámica de Swiper/Isotope (si es necesario)
  window.addEventListener('load', () => {
    initAddToCartButtons();
  });
})();
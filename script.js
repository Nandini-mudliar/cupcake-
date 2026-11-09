// Mobile navigation
const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector(".main-nav");
if (menuToggle && mainNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = mainNav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });
  mainNav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
    mainNav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  }));
}

// Simple newsletter feedback
const newsletter = document.querySelector("#newsletter");
if (newsletter) {
  newsletter.addEventListener("submit", event => {
    event.preventDefault();
    document.querySelector("#newsletter-message").textContent = "You're on the list — sweet news coming soon!";
    newsletter.reset();
  });
}

// Shopping cart (used on order.html)
const orderGrid = document.querySelector("#order-grid");
if (orderGrid) {
  const cart = {};
  const cartItems = document.querySelector("#cart-items");
  const subtotalEl = document.querySelector("#subtotal");
  const deliveryEl = document.querySelector("#delivery");
  const totalEl = document.querySelector("#total");
  const deliveryHint = document.querySelector("#delivery-hint");

  const money = value => `₹${value}`;
  function renderCart() {
    const entries = Object.entries(cart).filter(([, item]) => item.qty > 0);
    const subtotal = entries.reduce((sum, [, item]) => sum + item.price * item.qty, 0);
    const delivery = subtotal === 0 || subtotal >= 499 ? 0 : 40;
    if (!entries.length) {
      cartItems.innerHTML = '<p class="empty-cart">Your box is waiting for cupcakes!<br><span>Choose a treat to get started.</span></p>';
    } else {
      cartItems.innerHTML = entries.map(([name, item]) => `
        <div class="cart-line">
          <div><strong>${name}</strong><small>${money(item.price)} each · ${money(item.price * item.qty)}</small></div>
          <div class="quantity">
            <button type="button" data-action="minus" data-name="${name}" aria-label="Remove one ${name}">−</button>
            <b>${item.qty}</b>
            <button type="button" data-action="plus" data-name="${name}" aria-label="Add one ${name}">+</button>
          </div>
        </div>`).join("");
    }
    subtotalEl.textContent = money(subtotal);
    deliveryEl.textContent = delivery === 0 ? "FREE" : money(delivery);
    totalEl.textContent = money(subtotal + delivery);
    deliveryHint.textContent = subtotal >= 499 ? "Lovely! Your order qualifies for free delivery." : "Free delivery on orders over ₹499.";
  }

  orderGrid.addEventListener("click", event => {
    const button = event.target.closest(".add-button");
    if (!button) return;
    const card = button.closest(".order-item");
    const name = card.dataset.name;
    const price = Number(card.dataset.price);
    if (!cart[name]) cart[name] = { price, qty: 0 };
    cart[name].qty++;
    renderCart();
    button.textContent = "✓";
    setTimeout(() => button.textContent = "+", 650);
  });

  cartItems.addEventListener("click", event => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;
    const item = cart[button.dataset.name];
    if (!item) return;
    item.qty += button.dataset.action === "plus" ? 1 : -1;
    if (item.qty <= 0) delete cart[button.dataset.name];
    renderCart();
  });

  const params = new URLSearchParams(window.location.search);
  const requestedItem = params.get("item");
  if (requestedItem) {
    const match = [...orderGrid.querySelectorAll(".order-item")].find(card => card.dataset.name === requestedItem);
    if (match) match.querySelector(".add-button").click();
  }

  document.querySelector("#checkout-form").addEventListener("submit", event => {
    event.preventDefault();
    const entries = Object.entries(cart).filter(([, item]) => item.qty > 0);
    if (!entries.length) {
      alert("Please add at least one cupcake to your sweet box.");
      return;
    }
    const form = new FormData(event.currentTarget);
    const subtotal = entries.reduce((sum, [, item]) => sum + item.price * item.qty, 0);
    const delivery = subtotal === 0 || subtotal >= 499 ? 0 : 40;
    const lines = entries.map(([name, item]) => `${name} × ${item.qty} — ${money(item.price * item.qty)}`).join("\\n");
    alert(`Thank you, ${form.get("customer")}!\\n\\nYour Cupid Cupcake order:\\n${lines}\\n\\nTotal: ${money(subtotal + delivery)}\\nDelivery address: ${form.get("address")}\\n\\nThis is a demo checkout. No payment or order has been sent.`);
  });
}

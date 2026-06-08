const products = {
  linen: {
    name: "Льняной комплект",
    price: 7900,
    image: "assets/linen-set.jpg",
    page: "product-linen.html"
  },
  dress: {
    name: "Полосатое платье",
    price: 6400,
    image: "assets/cotton-dress.jpg",
    page: "product-dress.html"
  },
  shirt: {
    name: "Resort-рубашка",
    price: 4800,
    image: "assets/resort-shirt.jpg",
    page: "product-shirt.html"
  }
};

const cartKey = "sunline-cart";

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(cartKey)) || [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(cartKey, JSON.stringify(cart));
  updateCartCount();
}

function formatPrice(value) {
  return new Intl.NumberFormat("ru-RU").format(value) + " ₽";
}

function updateCartCount() {
  const count = getCart().reduce((sum, item) => sum + item.quantity, 0);
  document.querySelectorAll("[data-cart-count]").forEach((element) => {
    element.textContent = count;
  });
}

function addToCart(id) {
  const cart = getCart();
  const item = cart.find((cartItem) => cartItem.id === id);

  if (item) {
    item.quantity += 1;
  } else {
    cart.push({ id, quantity: 1 });
  }

  saveCart(cart);
}

function renderCart() {
  const itemsContainer = document.querySelector("[data-cart-items]");
  const totalElement = document.querySelector("[data-cart-total]");
  const messageElement = document.querySelector("[data-cart-message]");

  if (!itemsContainer || !totalElement) return;

  const cart = getCart();
  itemsContainer.innerHTML = "";

  if (cart.length === 0) {
    itemsContainer.innerHTML = '<div class="empty-cart">Корзина пока пустая. Загляните в каталог и выберите летний образ.</div>';
    totalElement.textContent = formatPrice(0);
    if (messageElement) messageElement.textContent = "";
    return;
  }

  let total = 0;

  cart.forEach((cartItem) => {
    const product = products[cartItem.id];
    if (!product) return;

    total += product.price * cartItem.quantity;

    const item = document.createElement("article");
    item.className = "cart-item";
    item.innerHTML = `
      <a href="${product.page}"><img src="${product.image}" alt="${product.name}"></a>
      <div>
        <a href="${product.page}"><h2>${product.name}</h2></a>
        <p>${formatPrice(product.price)} × ${cartItem.quantity}</p>
      </div>
      <button class="text-button" type="button" data-remove-from-cart="${cartItem.id}">Удалить</button>
    `;
    itemsContainer.appendChild(item);
  });

  totalElement.textContent = formatPrice(total);
}

document.addEventListener("click", (event) => {
  const addButton = event.target.closest("[data-add-to-cart]");
  if (addButton) {
    addToCart(addButton.dataset.addToCart);
    addButton.textContent = "Добавлено";
    window.setTimeout(() => {
      addButton.textContent = "В корзину";
      if (addButton.classList.contains("primary-button")) {
        addButton.textContent = "Добавить в корзину";
      }
    }, 1200);
  }

  const removeButton = event.target.closest("[data-remove-from-cart]");
  if (removeButton) {
    const id = removeButton.dataset.removeFromCart;
    const cart = getCart().filter((item) => item.id !== id);
    saveCart(cart);
    renderCart();
  }

  if (event.target.closest("[data-clear-cart]")) {
    saveCart([]);
    renderCart();
  }

  if (event.target.closest("[data-checkout]")) {
    const message = document.querySelector("[data-cart-message]");
    if (message) {
      message.textContent = getCart().length
        ? "Спасибо! Это демо-оформление: менеджер SUNLINE скоро свяжется с вами."
        : "Добавьте товар в корзину перед оформлением.";
    }
  }
});

updateCartCount();
renderCart();

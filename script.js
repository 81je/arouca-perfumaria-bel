document.addEventListener('DOMContentLoaded', function () {
  const menuButton = document.getElementById('menuButton');
  const menuPanel = document.getElementById('menuPanel');
  const searchInput = document.getElementById('searchInput');
  const productCards = [...document.querySelectorAll('.product-card')];
  const noResults = document.getElementById('noResults');
  const cartButton = document.getElementById('cartButton');
  const cartPanel = document.getElementById('cartPanel');
  const cartBackdrop = document.getElementById('cartBackdrop');
  const closeCartButton = document.getElementById('closeCartButton');
  const cartCount = document.getElementById('cartCount');
  const cartItems = document.getElementById('cartItems');
  const cartEmpty = document.getElementById('cartEmpty');
  const cartTotal = document.getElementById('cartTotal');
  const checkoutButton = document.getElementById('checkoutButton');
  const toast = document.getElementById('toast');
  const orderPanel = document.getElementById('orderPanel');
  const orderBackdrop = document.getElementById('orderBackdrop');
  const closeOrderButton = document.getElementById('closeOrderButton');
  const orderForm = document.getElementById('orderForm');
  const storeWhatsapp = document.getElementById('storeWhatsapp');

  // Produtos fictícios: substitua nomes, descrições e preços antes de vender.
  const products = [
    { id: 'perfume-elegance', name: 'Perfume Elegance', price: 89.90 },
    { id: 'creme-hidratante', name: 'Creme Hidratante', price: 39.90 },
    { id: 'batom-glamour', name: 'Batom Glamour', price: 29.90 }
  ];
  const storageKey = 'arouca-carrinho-demo-v1';
  let cart = [];
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
    if (Array.isArray(saved)) cart = saved.filter(row => products.some(p => p.id === row.id) && Number.isInteger(row.quantity) && row.quantity > 0);
  } catch (_) { cart = []; }

  function showToast(message) {
    toast.textContent = message;
    toast.hidden = false;
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => { toast.hidden = true; }, 2800);
  }
  function saveCart() {
    try { localStorage.setItem(storageKey, JSON.stringify(cart)); } catch (_) { /* armazenamento local indisponível */ }
  }
  function formatBRL(value) {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
  function openCart() {
    cartPanel.classList.add('open');
    cartPanel.setAttribute('aria-hidden', 'false');
    cartBackdrop.hidden = false;
  }
  function closeCart() {
    cartPanel.classList.remove('open');
    cartPanel.setAttribute('aria-hidden', 'true');
    cartBackdrop.hidden = true;
  }
  function renderCart() {
    cartItems.innerHTML = '';
    const quantity = cart.reduce((sum, item) => sum + item.quantity, 0);
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    cartCount.textContent = String(quantity);
    cartEmpty.hidden = cart.length > 0;
    cart.forEach(item => {
      const li = document.createElement('li');
      li.className = 'cart-item';
      const info = document.createElement('div');
      const title = document.createElement('strong');
      title.textContent = item.name;
      const price = document.createElement('small');
      price.textContent = `${formatBRL(item.price)} cada · Subtotal: ${formatBRL(item.price * item.quantity)}`;
      const controls = document.createElement('div');
      controls.className = 'quantity-controls';
      const minus = document.createElement('button');
      minus.type = 'button'; minus.textContent = '−';
      minus.setAttribute('aria-label', `Diminuir quantidade de ${item.name}`);
      minus.addEventListener('click', () => changeQuantity(item.id, -1));
      const qty = document.createElement('span'); qty.textContent = String(item.quantity);
      const plus = document.createElement('button');
      plus.type = 'button'; plus.textContent = '+';
      plus.setAttribute('aria-label', `Aumentar quantidade de ${item.name}`);
      plus.addEventListener('click', () => changeQuantity(item.id, 1));
      controls.append(minus, qty, plus);
      info.append(title, price, controls);
      const remove = document.createElement('button');
      remove.type = 'button'; remove.className = 'remove-item'; remove.textContent = 'Remover';
      remove.addEventListener('click', () => removeItem(item.id));
      li.append(info, remove); cartItems.append(li);
    });
    cartTotal.textContent = formatBRL(total);
    checkoutButton.disabled = cart.length === 0;
    checkoutButton.style.opacity = cart.length === 0 ? '.55' : '1';
    saveCart();
  }
  function addToCart(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;
    const existing = cart.find(item => item.id === id);
    if (existing) existing.quantity += 1;
    else cart.push({ ...product, quantity: 1 });
    renderCart();
    showToast(`${product.name} adicionado ao carrinho!`);
  }
  function changeQuantity(id, delta) {
    const item = cart.find(entry => entry.id === id);
    if (!item) return;
    item.quantity += delta;
    if (item.quantity <= 0) removeItem(id); else renderCart();
  }
  function removeItem(id) {
    cart = cart.filter(entry => entry.id !== id);
    renderCart();
  }

  menuButton.addEventListener('click', () => {
    const opening = menuPanel.hidden;
    menuPanel.hidden = !opening;
    menuButton.setAttribute('aria-expanded', String(opening));
  });
  menuPanel.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    menuPanel.hidden = true; menuButton.setAttribute('aria-expanded', 'false');
  }));
  searchInput.addEventListener('input', () => {
    const term = searchInput.value.trim().toLocaleLowerCase('pt-BR');
    let visible = 0;
    productCards.forEach(card => {
      const match = card.dataset.name.toLocaleLowerCase('pt-BR').includes(term);
      card.hidden = !match; if (match) visible++;
    });
    noResults.hidden = visible !== 0;
  });
  document.querySelectorAll('.add-button[data-id]').forEach(button => {
    button.addEventListener('click', () => addToCart(button.dataset.id));
  });
  cartButton.addEventListener('click', openCart);
  closeCartButton.addEventListener('click', closeCart);
  cartBackdrop.addEventListener('click', closeCart);
  function openOrderForm() {
    if (!cart.length) return;
    orderPanel.setAttribute('aria-hidden', 'false');
    orderBackdrop.hidden = false;
    storeWhatsapp.value = localStorage.getItem('arouca-whatsapp-loja') || '';
    document.getElementById('customerName').focus();
  }
  function closeOrderForm() { orderPanel.setAttribute('aria-hidden', 'true'); orderBackdrop.hidden = true; }
  checkoutButton.addEventListener('click', openOrderForm);
  closeOrderButton.addEventListener('click', closeOrderForm);
  orderBackdrop.addEventListener('click', closeOrderForm);
  orderForm.addEventListener('submit', function(event) {
    event.preventDefault();
    if (!cart.length) return;
    const rawNumber = storeWhatsapp.value.replace(/\D/g, '');
    if (rawNumber.length < 12 || rawNumber.length > 13 || !rawNumber.startsWith('55')) {
      showToast('Configure o WhatsApp da loja com DDI 55 + DDD + número.'); storeWhatsapp.focus(); return;
    }
    localStorage.setItem('arouca-whatsapp-loja', rawNumber);
    const name = document.getElementById('customerName').value.trim();
    const address = document.getElementById('customerAddress').value.trim();
    const payment = document.getElementById('paymentPreference').value;
    const notes = document.getElementById('orderNotes').value.trim();
    const lines = cart.map(item => `• ${item.name} — ${item.quantity} x ${formatBRL(item.price)} = ${formatBRL(item.price * item.quantity)}`);
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const message = ['Olá! Quero fazer um pedido na Arouca Perfumaria e Beleza.','','Nome: ' + name,'Entrega/bairro: ' + address,'','Meu pedido:',...lines,'','Total dos produtos: ' + formatBRL(total),'Pagamento desejado: ' + payment,notes ? 'Observações: ' + notes : '','Por favor, confirme disponibilidade, entrega/frete e valor final. Sei que o pedido só será confirmado pela loja.'].filter(Boolean).join('\n');
    window.open(`https://wa.me/${rawNumber}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
    closeOrderForm();
  });
  renderCart();
});

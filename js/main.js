const MENU = [
  { id: 1, name: 'Chicken Rice', category: 'Main Meal', price: 650, img: 'images/food/chicken-rice.jpg', emoji: '🍛', featured: true },
  { id: 2, name: 'Creamy Pasta', category: 'Main Meal', price: 700, img: 'images/food/creamy-pasta.jpg', emoji: '🍝', featured: true },
  { id: 3, name: 'Beef Burger', category: 'Snack', price: 750, img: 'images/food/beef-burger.jpg', emoji: '🍔', featured: true },
  { id: 4, name: 'Iced Tea', category: 'Beverage', price: 200, img: 'images/food/iced-tea.jpg', emoji: '🍹', featured: true },
  { id: 5, name: 'Chocolate Cake', category: 'Dessert', price: 450, img: 'images/food/creamy-pasta.jpg', emoji: '🍰', featured: false }
];

const $ = (id) => document.getElementById(id);
const cart = {};
let activeCat = 'All';

// Scroll reveal observer
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      const i = [...e.target.parentElement.children].indexOf(e.target);
      e.target.style.transitionDelay = `${(i % 4) * 0.1}s`;
      e.target.classList.add('in');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });

function renderMenu(cat = 'All') {
  const list = cat === 'All'
    ? MENU.filter((m) => m.featured)
    : MENU.filter((m) => m.category === cat);

  $('menuGrid').innerHTML = list.map((m) => `
    <article class="card">
      <div class="card__media">
        <img src="${m.img}" alt="${m.name}" loading="lazy">
        <span class="card__badge">${m.category}</span>
      </div>
      <div class="card__body">
        <h3>${m.name}</h3>
        <div class="card__row">
          <span class="card__price">Rs. ${m.price}</span>
          <button type="button" data-add="${m.id}">Add <span class="card__plus">+</span></button>
        </div>
      </div>
    </article>`).join('');

  document.querySelectorAll('#menuGrid .card').forEach((el) => io.observe(el));
}

renderMenu(activeCat);
document.querySelectorAll('.menu .reveal').forEach((el) => io.observe(el));

// Open hidden menu section when "Start Ordering" is pressed
const setDockActive = (id) => {
  document.querySelectorAll('.app-dock__item').forEach((el) => el.classList.toggle('active', el.id === id));
};

const openMenu = (scroll = true) => {
  const menu = $('menu');
  const isApp = document.body.classList.contains('app-mode');
  if (isApp) {
    document.body.classList.add('menu-open');
    setDockActive('dockMenu');
    window.scrollTo(0, 0);
  }
  if (!menu.classList.contains('is-open')) {
    menu.classList.add('is-open');
    menu.setAttribute('aria-hidden', 'false');
    menu.querySelectorAll('.reveal, .card').forEach((el) => {
      el.classList.remove('in');
      io.observe(el);
    });
  }
  if (scroll && !isApp) {
    requestAnimationFrame(() => {
      menu.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }
};

const closeMenuToHome = () => {
  const menu = $('menu');
  document.body.classList.remove('menu-open');
  menu.classList.remove('is-open');
  menu.setAttribute('aria-hidden', 'true');
  setDockActive('dockHome');
  window.scrollTo(0, 0);
};

$('startOrdering').addEventListener('click', (e) => {
  e.preventDefault();
  openMenu(true);
});

if (location.hash === '#menu') openMenu(true);

// Category filter clicks
$('menuCats').addEventListener('click', (e) => {
  const btn = e.target.closest('.cat-pill');
  if (!btn) return;
  document.querySelectorAll('.cat-pill').forEach((b) => b.classList.remove('active'));
  btn.classList.add('active');
  activeCat = btn.dataset.cat;
  renderMenu(activeCat);
});

// Drawer
const toggleDrawer = (open) => {
  $('drawer').classList.toggle('open', open);
  $('overlay').classList.toggle('open', open);
  $('drawer').setAttribute('aria-hidden', !open);
};
$('cartToggle').onclick = () => toggleDrawer(true);
$('barViewCart').onclick = () => toggleDrawer(true);
$('cartClose').onclick = $('overlay').onclick = () => toggleDrawer(false);

// Info Drawer
const toggleInfo = (open) => {
  if (!$('infoDrawer')) return;
  $('infoDrawer').classList.toggle('open', open);
  $('infoOverlay').classList.toggle('open', open);
  $('infoDrawer').setAttribute('aria-hidden', !open);
};
if ($('infoToggle')) {
  $('infoToggle').onclick = () => toggleInfo(true);
  $('infoClose').onclick = $('infoOverlay').onclick = () => toggleInfo(false);
}

function toast(msg) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toast.t);
  toast.t = setTimeout(() => t.classList.remove('show'), 2200);
}

function renderCart() {
  const items = Object.entries(cart);
  const count = items.reduce((s, [, q]) => s + q, 0);
  const total = items.reduce((s, [id, q]) => s + MENU.find((m) => m.id == id).price * q, 0);
  $('cartCount').textContent = count;
  $('cartTotal').textContent = 'Rs. ' + total;
  $('barCartCount').textContent = `${count} ${count === 1 ? 'item' : 'items'}`;
  $('barCartTotal').textContent = 'Rs. ' + total;
  if ($('dockCartCount')) $('dockCartCount').textContent = count;

  $('cartList').innerHTML = items.length
    ? items.map(([id, q]) => {
        const m = MENU.find((x) => x.id == id);
        return `<li><span>${m.emoji} ${m.name}</span>
          <span class="qty"><button data-dec="${id}">-</button><span>${q}</span><button data-inc="${id}">+</button></span></li>`;
      }).join('')
    : '<li class="drawer__empty">Your cart is empty.</li>';
}

document.addEventListener('click', (e) => {
  const t = e.target.closest('[data-add],[data-inc],[data-dec]');
  if (!t) return;
  const change = (id, d) => {
    cart[id] = (cart[id] || 0) + d;
    if (cart[id] <= 0) delete cart[id];
    renderCart();
  };
  if (t.dataset.add) {
    change(t.dataset.add, 1);
    const b = $('cartToggle');
    b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump');
    toast('Added to your order');
  }
  if (t.dataset.inc) change(t.dataset.inc, 1);
  if (t.dataset.dec) change(t.dataset.dec, -1);
});

$('checkout').onclick = () => {
  const entries = Object.entries(cart);
  if (!entries.length) return toast('Add something first');

  const u = JSON.parse(localStorage.getItem('edgeUser') || 'null');
  const existing = JSON.parse(localStorage.getItem('edgeOrders') || 'null');
  const orders = Array.isArray(existing) ? existing : [];
  const nextNum = 1047 + orders.length;
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  orders.unshift({
    orderId: `ORD-${nextNum}`,
    studentName: u ? u.name : 'Guest Student',
    studentId: u && u.id ? u.id : 'NSBM-GUEST',
    faculty: u && u.faculty ? u.faculty : 'Engineering',
    phone: (u && u.phone) || '077 000 0000',
    orderedAt: timeStr,
    pickupTime: '12:30 PM',
    status: 'Pending',
    note: 'Pre-ordered via website.',
    items: entries.map(([id, qty]) => {
      const m = MENU.find((x) => x.id == id);
      return { name: m.name, price: m.price, qty, img: m.img, emoji: m.emoji };
    })
  });
  localStorage.setItem('edgeOrders', JSON.stringify(orders));

  Object.keys(cart).forEach((k) => delete cart[k]);
  renderCart();
  toggleDrawer(false);
  toast('Pre-order placed! Pick up 9 AM - 5 PM');
};

renderCart();

// Login state in header
const isAppPage = document.body.classList.contains('app-mode');
if (isAppPage) sessionStorage.setItem('edgeAppMode', '1');

const user = JSON.parse(localStorage.getItem('edgeUser') || 'null');
if (user) {
  const lb = $('loginBtn');
  if ($('appWelcome')) {
    $('appWelcome').textContent = `👋 Hi, ${user.name} · 🏛️ ${user.faculty}`;
  }
  if (user.role === 'admin') {
    if (lb) {
      lb.textContent = 'Admin Panel';
      lb.href = 'admin.html';
    }
    if ($('dockAccount')) {
      $('dockAccount').href = 'admin.html';
      $('dockAccountLabel').textContent = 'Admin';
    }
  } else {
    if (lb) {
      lb.textContent = 'Hi, ' + user.name.split(' ')[0] + ' · Logout';
      lb.href = '#';
      lb.onclick = (e) => { e.preventDefault(); localStorage.removeItem('edgeUser'); location.reload(); };
    }
    if ($('dockAccountLabel')) $('dockAccountLabel').textContent = user.name.split(' ')[0];
  }
}

// Prevent page scrolling in app-mode (only allow horizontal category strip & drawer lists)
document.addEventListener('touchmove', (e) => {
  if (!e.target.closest('#menuCats, #cartList, .info-drawer__body')) {
    e.preventDefault();
  }
}, { passive: false });
window.addEventListener('wheel', (e) => {
  if (!e.target.closest('#menuCats, #cartList, .info-drawer__body')) {
    e.preventDefault();
  }
}, { passive: false });

// App Bottom Dock navigation
if ($('dockHome')) {
  $('dockHome').onclick = (e) => {
    e.preventDefault();
    closeMenuToHome();
  };
  $('dockMenu').onclick = (e) => {
    e.preventDefault();
    openMenu(true);
  };
  $('dockCart').onclick = () => {
    toggleDrawer(true);
  };
}

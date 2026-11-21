const DEMO_ORDERS = [
  {
    orderId: 'ORD-1046',
    studentName: 'Kavindu Perera',
    studentId: 'NSBM-24108',
    faculty: 'Engineering',
    phone: '077 412 8890',
    orderedAt: '11:42 AM',
    pickupTime: '12:15 PM',
    status: 'Pending',
    note: 'Extra chili paste on the side please.',
    items: [
      { name: 'Chicken Rice', price: 650, qty: 2, img: 'images/food/chicken-rice.jpg', emoji: '🍛' },
      { name: 'Iced Tea', price: 200, qty: 2, img: 'images/food/iced-tea.jpg', emoji: '🍹' }
    ]
  },
  {
    orderId: 'ORD-1045',
    studentName: 'Nethmi Jayawardena',
    studentId: 'NSBM-23819',
    faculty: 'Business',
    phone: '071 908 3312',
    orderedAt: '11:30 AM',
    pickupTime: '12:00 PM',
    status: 'Preparing',
    note: 'Less cheese on pasta.',
    items: [
      { name: 'Creamy Pasta', price: 700, qty: 1, img: 'images/food/creamy-pasta.jpg', emoji: '🍝' },
      { name: 'Iced Tea', price: 200, qty: 1, img: 'images/food/iced-tea.jpg', emoji: '🍹' }
    ]
  },
  {
    orderId: 'ORD-1044',
    studentName: 'Tharindu Silva',
    studentId: 'NSBM-22540',
    faculty: 'Science',
    phone: '076 550 1920',
    orderedAt: '11:15 AM',
    pickupTime: '11:45 AM',
    status: 'Ready',
    note: 'No onions in the burger.',
    items: [
      { name: 'Beef Burger', price: 750, qty: 2, img: 'images/food/beef-burger.jpg', emoji: '🍔' },
      { name: 'Chocolate Cake', price: 450, qty: 1, img: 'images/food/creamy-pasta.jpg', emoji: '🍰' }
    ]
  },
  {
    orderId: 'ORD-1043',
    studentName: 'Amaya Fernando',
    studentId: 'NSBM-24772',
    faculty: 'Arts',
    phone: '070 334 7811',
    orderedAt: '10:50 AM',
    pickupTime: '11:30 AM',
    status: 'Ready',
    note: 'Takeaway cutlery needed.',
    items: [
      { name: 'Chicken Rice', price: 650, qty: 1, img: 'images/food/chicken-rice.jpg', emoji: '🍛' },
      { name: 'Beef Burger', price: 750, qty: 1, img: 'images/food/beef-burger.jpg', emoji: '🍔' },
      { name: 'Iced Tea', price: 200, qty: 2, img: 'images/food/iced-tea.jpg', emoji: '🍹' }
    ]
  },
  {
    orderId: 'ORD-1042',
    studentName: 'Dilshan Rodrigo',
    studentId: 'NSBM-21904',
    faculty: 'Medicine',
    phone: '077 889 4410',
    orderedAt: '10:20 AM',
    pickupTime: '11:00 AM',
    status: 'Completed',
    note: 'Standard portion.',
    items: [
      { name: 'Creamy Pasta', price: 700, qty: 2, img: 'images/food/creamy-pasta.jpg', emoji: '🍝' }
    ]
  },
  {
    orderId: 'ORD-1041',
    studentName: 'Shenali Gunasekara',
    studentId: 'NSBM-23415',
    faculty: 'Law',
    phone: '075 210 6654',
    orderedAt: '09:45 AM',
    pickupTime: '10:15 AM',
    status: 'Completed',
    note: 'No sugar in iced tea.',
    items: [
      { name: 'Beef Burger', price: 750, qty: 1, img: 'images/food/beef-burger.jpg', emoji: '🍔' },
      { name: 'Iced Tea', price: 200, qty: 1, img: 'images/food/iced-tea.jpg', emoji: '🍹' }
    ]
  }
];

const $ = (id) => document.getElementById(id);
const homeUrl = sessionStorage.getItem('edgeAppMode') === '1' ? 'app.html' : 'index.html';
document.querySelectorAll('a[href="index.html"]').forEach((a) => (a.href = homeUrl));

// Verify admin user or default demo admin session
const currentUser = JSON.parse(localStorage.getItem('edgeUser') || 'null');
if (currentUser && currentUser.faculty) {
  $('adminFacultyBadge').textContent = `🏛️ ${currentUser.faculty} Admin`;
}

$('adminLogout').onclick = () => {
  localStorage.removeItem('edgeUser');
  location.href = 'login.html';
};

function getOrders() {
  const saved = JSON.parse(localStorage.getItem('edgeOrders') || '[]');
  if (!localStorage.getItem('edgeDemoSeeded')) {
    const existingIds = new Set(saved.map((o) => o.orderId));
    const merged = [...saved, ...DEMO_ORDERS.filter((d) => !existingIds.has(d.orderId))];
    localStorage.setItem('edgeOrders', JSON.stringify(merged));
    localStorage.setItem('edgeDemoSeeded', '1');
    return merged;
  }
  return saved;
}

function saveOrders(list) {
  localStorage.setItem('edgeOrders', JSON.stringify(list));
}

function calcTotal(order) {
  return order.items.reduce((sum, i) => sum + i.price * i.qty, 0);
}

let activeStatus = 'All';
let activeFaculty = 'All';
let searchQuery = '';

function toast(msg) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toast.t);
  toast.t = setTimeout(() => t.classList.remove('show'), 2200);
}

const NEXT_STATUS = {
  Pending: { next: 'Preparing', label: '🍳 Start Preparing' },
  Preparing: { next: 'Ready', label: '✅ Mark Ready' },
  Ready: { next: 'Completed', label: '🎉 Complete Pickup' },
  Completed: null
};

function renderDashboard() {
  const orders = getOrders();

  // Stats
  const totalOrders = orders.length;
  const activeOrders = orders.filter((o) => o.status === 'Pending' || o.status === 'Preparing').length;
  const readyOrders = orders.filter((o) => o.status === 'Ready').length;
  const revenue = orders.reduce((s, o) => s + calcTotal(o), 0);

  $('statTotal').textContent = totalOrders;
  $('statActive').textContent = activeOrders;
  $('statReady').textContent = readyOrders;
  $('statRevenue').textContent = 'Rs. ' + revenue.toLocaleString();

  // Filter
  const filtered = orders.filter((o) => {
    const matchStatus = activeStatus === 'All' || o.status === activeStatus;
    const matchFaculty = activeFaculty === 'All' || o.faculty === activeFaculty;
    const q = searchQuery.toLowerCase();
    const matchSearch = !q
      || o.orderId.toLowerCase().includes(q)
      || o.studentName.toLowerCase().includes(q)
      || o.studentId.toLowerCase().includes(q)
      || o.items.some((i) => i.name.toLowerCase().includes(q));
    return matchStatus && matchFaculty && matchSearch;
  });

  if (!filtered.length) {
    $('ordersGrid').innerHTML = `<div class="admin__empty">No orders match the current filter.</div>`;
    return;
  }

  $('ordersGrid').innerHTML = filtered.map((o) => {
    const total = calcTotal(o);
    const step = NEXT_STATUS[o.status];
    const statusClass = o.status.toLowerCase();
    return `
      <article class="order-card">
        <div class="order-card__top">
          <div>
            <span class="order-card__id">#${o.orderId}</span>
            <span class="order-card__time">🕒 Ordered ${o.orderedAt} · Pickup ${o.pickupTime}</span>
          </div>
          <span class="status-badge status-badge--${statusClass}">${o.status}</span>
        </div>

        <div class="order-card__student">
          <div>
            <h3>${o.studentName}</h3>
            <p>${o.studentId} · <span>${o.faculty}</span></p>
          </div>
          <button type="button" class="order-card__view" data-view="${o.orderId}">View Details</button>
        </div>

        <ul class="order-card__items">
          ${o.items.map((i) => `
            <li>
              <span>${i.emoji || '🍽️'} <strong>${i.qty}×</strong> ${i.name}</span>
              <span>Rs. ${i.price * i.qty}</span>
            </li>
          `).join('')}
        </ul>

        ${o.note ? `<p class="order-card__note">📝 "${o.note}"</p>` : ''}

        <div class="order-card__foot">
          <div class="order-card__total">
            <span>Total</span>
            <strong>Rs. ${total}</strong>
          </div>
          <div class="order-card__actions">
            ${step ? `<button type="button" class="btn order-card__advance" data-advance="${o.orderId}" data-next="${step.next}">${step.label}</button>` : `<span class="order-card__done">✓ Picked Up</span>`}
          </div>
        </div>
      </article>
    `;
  }).join('');
}

// Open Order Details Drawer
function openOrderDetail(orderId) {
  const orders = getOrders();
  const o = orders.find((x) => x.orderId === orderId);
  if (!o) return;
  const total = calcTotal(o);
  const statusClass = o.status.toLowerCase();

  $('modalOrderId').textContent = '#' + o.orderId;
  $('modalStudentName').textContent = o.studentName;

  $('modalBody').innerHTML = `
    <div class="detail-meta">
      <div><span>Status</span><strong class="status-badge status-badge--${statusClass}">${o.status}</strong></div>
      <div><span>Student ID</span><strong>${o.studentId}</strong></div>
      <div><span>Faculty</span><strong>🏛️ ${o.faculty}</strong></div>
      <div><span>Contact</span><strong>${o.phone || '077 000 0000'}</strong></div>
      <div><span>Ordered At</span><strong>${o.orderedAt}</strong></div>
      <div><span>Pickup Slot</span><strong>${o.pickupTime}</strong></div>
    </div>

    ${o.note ? `<div class="detail-note"><strong>Special Note:</strong> ${o.note}</div>` : ''}

    <h4 class="detail-sub">Ordered Items</h4>
    <ul class="detail-items">
      ${o.items.map((i) => `
        <li>
          <img src="${i.img || 'images/food/chicken-rice.jpg'}" alt="${i.name}">
          <div class="detail-items__info">
            <strong>${i.name}</strong>
            <small>Rs. ${i.price} × ${i.qty}</small>
          </div>
          <strong class="detail-items__price">Rs. ${i.price * i.qty}</strong>
        </li>
      `).join('')}
    </ul>

    <div class="drawer__total">
      <span>Order Total</span>
      <strong>Rs. ${total}</strong>
    </div>

    <div class="detail-status-btns">
      <span>Update Order Status:</span>
      <div class="detail-status-btns__row">
        ${['Pending', 'Preparing', 'Ready', 'Completed'].map((st) => `
          <button type="button" class="cat-pill ${o.status === st ? 'active' : ''}" data-setstatus="${o.orderId}" data-st="${st}">${st}</button>
        `).join('')}
      </div>
    </div>
  `;

  $('detailDrawer').classList.add('open');
  $('detailOverlay').classList.add('open');
  $('detailDrawer').setAttribute('aria-hidden', 'false');
}

const closeDetail = () => {
  $('detailDrawer').classList.remove('open');
  $('detailOverlay').classList.remove('open');
  $('detailDrawer').setAttribute('aria-hidden', 'true');
};
$('detailClose').onclick = $('detailOverlay').onclick = closeDetail;

// Event delegation for order cards & modal status updates
document.addEventListener('click', (e) => {
  const viewBtn = e.target.closest('[data-view]');
  if (viewBtn) {
    openOrderDetail(viewBtn.dataset.view);
    return;
  }

  const advBtn = e.target.closest('[data-advance]');
  if (advBtn) {
    const id = advBtn.dataset.advance;
    const next = advBtn.dataset.next;
    const orders = getOrders();
    const o = orders.find((x) => x.orderId === id);
    if (o) {
      o.status = next;
      saveOrders(orders);
      renderDashboard();
      toast(`#${id} marked as ${next}`);
    }
    return;
  }

  const setBtn = e.target.closest('[data-setstatus]');
  if (setBtn) {
    const id = setBtn.dataset.setstatus;
    const st = setBtn.dataset.st;
    const orders = getOrders();
    const o = orders.find((x) => x.orderId === id);
    if (o) {
      o.status = st;
      saveOrders(orders);
      renderDashboard();
      openOrderDetail(id);
      toast(`#${id} status updated to ${st}`);
    }
  }
});

// Filters
$('statusTabs').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-status]');
  if (!btn) return;
  document.querySelectorAll('#statusTabs .cat-pill').forEach((b) => b.classList.remove('active'));
  btn.classList.add('active');
  activeStatus = btn.dataset.status;
  renderDashboard();
});

$('facultyFilter').addEventListener('change', (e) => {
  activeFaculty = e.target.value;
  renderDashboard();
});

$('orderSearch').addEventListener('input', (e) => {
  searchQuery = e.target.value.trim();
  renderDashboard();
});

// Generate random fake order for demo
const SAMPLE_STUDENTS = [
  { name: 'Pasindu Bandara', id: 'NSBM-25112', faculty: 'Engineering' },
  { name: 'Hiruni De Silva', id: 'NSBM-24390', faculty: 'Business' },
  { name: 'Chamod Wickramasinghe', id: 'NSBM-23988', faculty: 'Science' },
  { name: 'Sanduni Senanayake', id: 'NSBM-25014', faculty: 'Arts' },
  { name: 'Ravindu Karunaratne', id: 'NSBM-22871', faculty: 'Law' }
];
const SAMPLE_FOODS = [
  { name: 'Chicken Rice', price: 650, img: 'images/food/chicken-rice.jpg', emoji: '🍛' },
  { name: 'Creamy Pasta', price: 700, img: 'images/food/creamy-pasta.jpg', emoji: '🍝' },
  { name: 'Beef Burger', price: 750, img: 'images/food/beef-burger.jpg', emoji: '🍔' },
  { name: 'Iced Tea', price: 200, img: 'images/food/iced-tea.jpg', emoji: '🍹' }
];

$('addFakeOrderBtn').onclick = () => {
  const orders = getOrders();
  const nextNum = 1041 + orders.length;
  const st = SAMPLE_STUDENTS[Math.floor(Math.random() * SAMPLE_STUDENTS.length)];
  const f1 = SAMPLE_FOODS[Math.floor(Math.random() * 3)];
  const f2 = SAMPLE_FOODS[3];
  const newOrder = {
    orderId: `ORD-${nextNum}`,
    studentName: st.name,
    studentId: st.id,
    faculty: st.faculty,
    phone: '077 555 ' + Math.floor(1000 + Math.random() * 8999),
    orderedAt: 'Just now',
    pickupTime: '1:15 PM',
    status: 'Pending',
    note: 'Demo pre-order generated.',
    items: [
      { ...f1, qty: Math.floor(1 + Math.random() * 2) },
      { ...f2, qty: 1 }
    ]
  };
  orders.unshift(newOrder);
  saveOrders(orders);
  renderDashboard();
  toast(`Generated fake order #${newOrder.orderId}`);
};

$('resetDemoBtn').onclick = () => {
  localStorage.setItem('edgeOrders', JSON.stringify(DEMO_ORDERS));
  renderDashboard();
  toast('Demo orders reset to defaults');
};

renderDashboard();

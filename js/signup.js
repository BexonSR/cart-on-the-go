const $ = (id) => document.getElementById(id);
const homeUrl = sessionStorage.getItem('edgeAppMode') === '1' ? 'app.html' : 'index.html';
const brandLink = document.querySelector('.login-hero .brand');
if (brandLink) brandLink.href = homeUrl;

$('signupForm').addEventListener('submit', (e) => {
  e.preventDefault();
  let ok = true;
  ['name', 'sid', 'email', 'phone', 'faculty'].forEach((id) => {
    const wrap = $(id).closest('.field');
    wrap.classList.remove('error');
    if (!$(id).value.trim()) {
      void wrap.offsetWidth;
      wrap.classList.add('error');
      ok = false;
    }
  });
  if (!ok) return;

  const account = {
    name: $('name').value.trim(),
    id: $('sid').value.trim(),
    email: $('email').value.trim(),
    phone: $('phone').value.trim(),
    faculty: $('faculty').value,
    role: 'student',
    createdAt: new Date().toISOString()
  };

  const accounts = JSON.parse(localStorage.getItem('edgeAccounts') || '[]');
  accounts.push(account);
  localStorage.setItem('edgeAccounts', JSON.stringify(accounts));
  localStorage.setItem('edgeUser', JSON.stringify(account));

  const t = $('toast');
  t.textContent = `Account created! Welcome, ${account.name}!`;
  t.classList.add('show');

  setTimeout(() => {
    location.href = homeUrl;
  }, 850);
});

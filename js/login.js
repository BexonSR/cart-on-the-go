const $ = (id) => document.getElementById(id);

$('loginForm').addEventListener('submit', (e) => {
  e.preventDefault();
  let ok = true;
  ['name', 'sid', 'faculty'].forEach((id) => {
    const wrap = $(id).closest('.field');
    wrap.classList.remove('error');
    if (!$(id).value.trim()) {
      void wrap.offsetWidth;
      wrap.classList.add('error');
      ok = false;
    }
  });
  if (!ok) return;

  localStorage.setItem('edgeUser', JSON.stringify({
    name: $('name').value.trim(), id: $('sid').value.trim(), faculty: $('faculty').value
  }));
  const t = $('toast');
  t.textContent = 'Welcome, ' + $('name').value.trim() + '!';
  t.classList.add('show');
  setTimeout(() => (location.href = 'index.html'), 900);
});

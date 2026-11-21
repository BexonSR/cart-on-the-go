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

  const name = $('name').value.trim();
  const sid = $('sid').value.trim();
  const faculty = $('faculty').value;
  const isAdmin = name.toLowerCase() === 'admin' && sid.toLowerCase() === 'admin';

  localStorage.setItem('edgeUser', JSON.stringify({
    name: isAdmin ? 'Admin' : name,
    id: sid,
    faculty,
    role: isAdmin ? 'admin' : 'student'
  }));

  const t = $('toast');
  t.textContent = isAdmin
    ? `Welcome Admin (${faculty})! Opening dashboard...`
    : `Welcome, ${name}!`;
  t.classList.add('show');

  setTimeout(() => {
    location.href = isAdmin ? 'admin.html' : 'index.html';
  }, 800);
});

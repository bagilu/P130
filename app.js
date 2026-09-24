(() => {
  const config = window.P130_CONFIG;
  const warning = document.querySelector('#configWarning');
  if (!config || !config.SUPABASE_URL || config.SUPABASE_URL.includes('YOUR_') || !config.SUPABASE_ANON_KEY || config.SUPABASE_ANON_KEY.includes('YOUR_')) {
    if (warning) warning.hidden = false;
    return;
  }

  const supabase = window.supabase.createClient(
    config.SUPABASE_URL,
    config.SUPABASE_ANON_KEY,
    { auth: { storageKey: 'P130-auth' } }
  );

  function getBaseUrl() {
    const configured = String(config.APP_URL || '').trim();
    if (configured && !configured.includes('YOUR_')) {
      return configured.endsWith('/') ? configured : configured + '/';
    }
    const path = window.location.pathname.endsWith('/')
      ? window.location.pathname
      : window.location.pathname.replace(/[^/]*$/, '');
    return window.location.origin + path;
  }

  const baseUrl = getBaseUrl();
  const notice = document.querySelector('#notice');
  const tabs = document.querySelector('.tabs');

  function message(text, error = false) {
    notice.textContent = text;
    notice.className = `notice${error ? ' error' : ''}`;
    notice.hidden = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function view(name) {
    document.querySelectorAll('.view').forEach(el => el.classList.remove('active'));
    document.querySelector(`#${name}Form, #${name}View`)?.classList.add('active');
    document.querySelectorAll('.tab').forEach(b => b.classList.toggle('active', b.dataset.view === name));
    if (tabs) tabs.hidden = name === 'account';
  }

  document.querySelectorAll('[data-view]').forEach(
    b => b.addEventListener('click', () => view(b.dataset.view))
  );

  async function showAccount() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return view('signin');

    const { data, error } = await supabase.rpc('p130_ensure_profile');
    if (error) return message('無法讀取帳號設定：' + error.message, true);

    document.querySelector('#accountEmail').textContent = user.email;
    document.querySelector('#profileName').value = data || '';
    view('account');
  }

  document.querySelector('#signinForm').addEventListener('submit', async e => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({
      email: document.querySelector('#signinEmail').value.trim(),
      password: document.querySelector('#signinPassword').value
    });
    if (error) return message('登入失敗：' + error.message, true);
    await showAccount();
    message('登入成功。您可在此管理帳號，或返回原本的專案。');
  });

  document.querySelector('#signupForm').addEventListener('submit', async e => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signUp({
      email: document.querySelector('#signupEmail').value.trim(),
      password: document.querySelector('#signupPassword').value,
      options: {
        emailRedirectTo: baseUrl,
        data: { display_name: document.querySelector('#signupName').value.trim() }
      }
    });
    if (error) return message('註冊失敗：' + error.message, true);
    if (data.user?.identities?.length === 0) {
      return message('此 Email 已註冊。請改用登入或忘記密碼。', true);
    }
    message('驗證信已寄出。請完成 Email 驗證後再登入。');
    view('signin');
  });

  document.querySelector('#profileForm').addEventListener('submit', async e => {
    e.preventDefault();
    const { error } = await supabase.rpc('p130_update_display_name', {
      p_display_name: document.querySelector('#profileName').value.trim()
    });
    if (error) return message('儲存失敗：' + error.message, true);
    message('顯示名稱已儲存。');
  });

  document.querySelector('#passwordForm').addEventListener('submit', async e => {
    e.preventDefault();
    const input = document.querySelector('#accountPassword');
    const { error } = await supabase.auth.updateUser({ password: input.value });
    if (error) return message('密碼更新失敗：' + error.message, true);
    input.value = '';
    message('密碼已更新。');
  });

  document.querySelector('#signoutButton').addEventListener('click', async () => {
    await supabase.auth.signOut();
    message('您已登出。');
    view('signin');
  });

  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session) showAccount();
  });
})();

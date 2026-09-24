(() => {
  const config = window.P130_CONFIG;
  const warning = document.querySelector('#configWarning');
  if (!config || !config.SUPABASE_URL || config.SUPABASE_URL.includes('YOUR_') || !config.SUPABASE_ANON_KEY || config.SUPABASE_ANON_KEY.includes('YOUR_')) {
    warning.hidden = false;
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
    const path = window.location.pathname.replace(/[^/]*$/, '');
    return window.location.origin + path;
  }

  const resetUrl = new URL('reset-password.html', getBaseUrl()).href;
  const notice = document.querySelector('#notice');

  function message(text, error = false) {
    notice.textContent = text;
    notice.className = `notice${error ? ' error' : ''}`;
    notice.hidden = false;
  }

  document.querySelector('#forgotForm').addEventListener('submit', async e => {
    e.preventDefault();
    const email = document.querySelector('#forgotEmail').value.trim();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: resetUrl
    });
    if (error) return message('無法寄送重設信：' + error.message, true);
    message('若此 Email 已註冊，重設密碼連結已寄出。請查看信箱。');
  });
})();

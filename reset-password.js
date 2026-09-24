(() => {
  const config = window.P130_CONFIG;
  const warning = document.querySelector('#configWarning');
  const notice = document.querySelector('#notice');
  const form = document.querySelector('#resetForm');

  if (!config || !config.SUPABASE_URL || config.SUPABASE_URL.includes('YOUR_') || !config.SUPABASE_ANON_KEY || config.SUPABASE_ANON_KEY.includes('YOUR_')) {
    warning.hidden = false;
    notice.textContent = '尚未設定 Supabase。';
    notice.className = 'notice error';
    return;
  }

  const supabase = window.supabase.createClient(
    config.SUPABASE_URL,
    config.SUPABASE_ANON_KEY,
    { auth: { storageKey: 'P130-auth' } }
  );

  function message(text, error = false) {
    notice.textContent = text;
    notice.className = `notice${error ? ' error' : ''}`;
    notice.hidden = false;
  }

  async function enableIfRecoverySessionExists() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      message('無法驗證重設連結：' + error.message, true);
      return;
    }
    if (session) {
      message('重設連結驗證成功，請設定新密碼。');
      form.hidden = false;
    } else {
      message('重設連結無效、已過期，或尚未完成驗證。請回到忘記密碼頁重新寄送。', true);
    }
  }

  supabase.auth.onAuthStateChange((event) => {
    if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
      message('重設連結驗證成功，請設定新密碼。');
      form.hidden = false;
    }
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const password = document.querySelector('#newPassword').value;
    const { error } = await supabase.auth.updateUser({ password });
    if (error) return message('更新失敗：' + error.message, true);

    await supabase.auth.signOut();
    form.hidden = true;
    message('密碼已更新。請回到原本的 P 系列專案，以新密碼登入。');
  });

  enableIfRecoverySessionExists();
})();

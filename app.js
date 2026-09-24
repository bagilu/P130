(() => {
  const config = window.P130_CONFIG;
  const warning = document.querySelector('#configWarning');
  if (!config || !config.SUPABASE_URL || config.SUPABASE_URL.includes('YOUR_') || !config.SUPABASE_ANON_KEY || config.SUPABASE_ANON_KEY.includes('YOUR_')) { warning.hidden = false; return; }
  const supabase = window.supabase.createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY, { auth: { storageKey: 'P130-auth' } });
  const appUrl = config.APP_URL || window.location.href.split('#')[0];
  const notice = document.querySelector('#notice');
  const tabs = document.querySelector('.tabs');
  function message(text, error = false) { notice.textContent = text; notice.className = `notice${error ? ' error' : ''}`; notice.hidden = false; window.scrollTo({top:0,behavior:'smooth'}); }
  function view(name) { document.querySelectorAll('.view').forEach(el => el.classList.remove('active')); document.querySelector(`#${name}Form, #${name}View`)?.classList.add('active'); document.querySelectorAll('.tab').forEach(b => b.classList.toggle('active', b.dataset.view === name)); tabs.hidden = ['forgot','recovery','account'].includes(name); }
  document.querySelectorAll('[data-view]').forEach(b => b.addEventListener('click', () => view(b.dataset.view)));
  async function showAccount() { const { data:{user} } = await supabase.auth.getUser(); if (!user) return view('signin'); const { data, error } = await supabase.rpc('p130_ensure_profile'); if (error) return message('無法讀取帳號設定：' + error.message, true); document.querySelector('#accountEmail').textContent = user.email; document.querySelector('#profileName').value = data || ''; view('account'); }
  document.querySelector('#signinForm').addEventListener('submit', async e => { e.preventDefault(); const {error} = await supabase.auth.signInWithPassword({email:signinEmail.value,password:signinPassword.value}); if(error) return message('登入失敗：'+error.message,true); await showAccount(); message('登入成功。您可在此管理帳號，或返回原本的專案。'); });
  document.querySelector('#signupForm').addEventListener('submit', async e => { e.preventDefault(); const {data,error} = await supabase.auth.signUp({email:signupEmail.value,password:signupPassword.value,options:{emailRedirectTo:appUrl,data:{display_name:signupName.value.trim()}}}); if(error) return message('註冊失敗：'+error.message,true); if(data.user?.identities?.length===0) return message('此 Email 已註冊。請改用登入或忘記密碼。',true); message('驗證信已寄出。請完成 Email 驗證後再登入。'); view('signin'); });
  document.querySelector('#forgotForm').addEventListener('submit', async e => { e.preventDefault(); const {error}=await supabase.auth.resetPasswordForEmail(forgotEmail.value,{redirectTo:appUrl}); if(error) return message('無法寄送重設信：'+error.message,true); message('若此 Email 已註冊，重設密碼連結已寄出。'); });
  document.querySelector('#recoveryForm').addEventListener('submit', async e => {e.preventDefault();const {error}=await supabase.auth.updateUser({password:recoveryPassword.value});if(error)return message('更新失敗：'+error.message,true);message('密碼已更新，請以新密碼登入。');view('signin');});
  document.querySelector('#profileForm').addEventListener('submit', async e => {e.preventDefault();const {error}=await supabase.rpc('p130_update_display_name',{p_display_name:profileName.value.trim()});if(error)return message('儲存失敗：'+error.message,true);message('顯示名稱已儲存。');});
  document.querySelector('#passwordForm').addEventListener('submit', async e => {e.preventDefault();const {error}=await supabase.auth.updateUser({password:accountPassword.value});if(error)return message('密碼更新失敗：'+error.message,true);accountPassword.value='';message('密碼已更新。');});
  document.querySelector('#signoutButton').addEventListener('click', async ()=>{await supabase.auth.signOut();message('您已登出。');view('signin');});
  supabase.auth.onAuthStateChange((event) => { if (event === 'PASSWORD_RECOVERY') { message('請設定新的密碼。'); view('recovery'); } });
  supabase.auth.getSession().then(({data:{session}}) => { if (session && !window.location.hash.includes('type=recovery')) showAccount(); });
})();

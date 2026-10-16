import { useState } from 'react';
import { ADMIN_API_CONFIGURED, verifyAdminToken } from '@/lib/api';

export default function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  return <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-4">
    <form className="max-w-sm w-full space-y-4" onSubmit={async event => {
      event.preventDefault(); setLoading(true); setError('');
      try { await verifyAdminToken(token); setToken(''); onSuccess(); }
      catch (reason) { setError(reason instanceof Error ? reason.message : 'Не удалось войти.'); }
      finally { setLoading(false); }
    }}>
      <h1 className="text-xl">Вход в админ-панель</h1>
      {!ADMIN_API_CONFIGURED ? <p role="status">Административный сервер ещё не настроен.</p> : <>
        <label htmlFor="admin-token" className="block">Ключ доступа администратора</label>
        <input id="admin-token" type="password" autoComplete="current-password" required value={token}
          onChange={event => setToken(event.target.value)} className="w-full p-3 rounded bg-white/10" />
        <button disabled={loading} className="w-full p-3 rounded bg-blue-600 disabled:opacity-50">{loading ? 'Проверка…' : 'Войти'}</button>
      </>}
      {error && <p role="alert" className="text-red-300">{error}</p>}
      <a className="block underline" href="/">На главную</a>
    </form>
  </main>;
}

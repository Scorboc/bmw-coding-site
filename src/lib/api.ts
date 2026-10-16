export const DATA_API_URL = import.meta.env.VITE_DATA_API_URL || 'https://functions.poehali.dev/1465efc7-1ef5-4210-8079-7bbd027f47a0';
export const AI_API_URL = import.meta.env.VITE_AI_API_URL || 'https://functions.poehali.dev/df31c433-12db-4a99-ab16-3d4ab626565d';
export const SERVICES_API_URL = import.meta.env.VITE_SERVICES_API_URL || 'https://functions.poehali.dev/9fe99b4b-14d3-46f7-821e-c6d3b183abbf';
export const ADMIN_API_CONFIGURED = Boolean(import.meta.env.VITE_DATA_API_URL);

export class ApiError extends Error {
  constructor(message: string, public status?: number) { super(message); }
}

export async function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const fallback = async () => {
    if ((init?.method ?? 'GET').toUpperCase() !== 'GET' || !String(input).startsWith(`${DATA_API_URL}?`)) return;
    try { return await (await import('./snapshot')).snapshotResponse(input); } catch { return; }
  };
  let response: Response;
  try {
    response = await fetch(input, { ...init, signal: init?.signal ?? AbortSignal.timeout(15000) });
  } catch {
    const snapshot = await fallback();
    if (snapshot) return snapshot;
    throw new ApiError('Сервис временно недоступен. Проверьте соединение или попробуйте позже.');
  }
  if (!response.ok) {
    const snapshot = await fallback();
    if (snapshot) return snapshot;
    const message = response.status === 402
      ? 'Сервис временно недоступен: исчерпан лимит сервера. Свяжитесь с сервисом для консультации.'
      : response.status === 401 || response.status === 403
        ? 'Доступ не подтверждён. Войдите снова.'
        : response.status === 503
          ? 'Сервис ещё не настроен. Попробуйте позже.'
          : 'Не удалось получить данные. Попробуйте позже.';
    throw new ApiError(message, response.status);
  }
  return response;
}

let adminToken = '';
export const hasAdminSession = () => Boolean(adminToken);
export const clearAdminSession = () => { adminToken = ''; };

export async function verifyAdminToken(token: string) {
  if (!ADMIN_API_CONFIGURED) throw new ApiError('Административный сервер ещё не настроен.');
  const response = await apiFetch(`${DATA_API_URL}?admin=1`, { headers: { Authorization: `Bearer ${token}` } });
  const data: unknown = await response.json();
  if (!Array.isArray(data)) throw new ApiError('Сервер администрирования вернул некорректный ответ.');
  adminToken = token;
}

export async function adminFetch(input: RequestInfo | URL, init?: RequestInit) {
  if (!ADMIN_API_CONFIGURED || !adminToken) throw new ApiError('Войдите в админ-панель.', 401);
  const headers = new Headers(init?.headers);
  headers.set('Authorization', `Bearer ${adminToken}`);
  try { return await apiFetch(input, { ...init, headers }); }
  catch (error) {
    if (error instanceof ApiError && [401, 403].includes(error.status ?? 0)) clearAdminSession();
    throw error;
  }
}

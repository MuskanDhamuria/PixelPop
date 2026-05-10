import { projectId, publicAnonKey } from '/utils/supabase/info';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-9f7f41c6`;

const parseJson = async <T>(response: Response): Promise<T> => {
  const contentType = response.headers.get('content-type') ?? '';
  const payload = contentType.includes('application/json')
    ? await response.json().catch(() => null)
    : await response.text().catch(() => '');

  if (!response.ok) {
    const message =
      payload && typeof payload === 'object' && 'error' in payload
        ? String(payload.error)
        : typeof payload === 'string' && payload
          ? payload
          : `Request failed with status ${response.status}`;

    throw new Error(message);
  }

  return payload as T;
};

export const apiGet = async <T>(path: string, accessToken?: string): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      apikey: publicAnonKey,
      Authorization: `Bearer ${accessToken ?? publicAnonKey}`,
    },
  });
  return parseJson<T>(response);
};

export const apiPut = async <T>(path: string, body: unknown, accessToken?: string): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      apikey: publicAnonKey,
      Authorization: `Bearer ${accessToken ?? publicAnonKey}`,
    },
    body: JSON.stringify(body),
  });
  return parseJson<T>(response);
};

export const apiPost = async <T>(path: string, body: unknown, accessToken?: string): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: publicAnonKey,
      Authorization: `Bearer ${accessToken ?? publicAnonKey}`,
    },
    body: JSON.stringify(body),
  });
  return parseJson<T>(response);
};

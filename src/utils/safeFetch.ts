/**
 * Safely parses a Fetch response as JSON.
 * Protects against HTML error pages (e.g. <!doctype html> from proxies, 404/502/504 fallback).
 */
export async function safeFetchJson<T = any>(res: Response): Promise<{ ok: boolean; status: number; data: T | null; error?: string }> {
  try {
    const contentType = res.headers.get('content-type') || '';
    const text = await res.text();
    
    // Check if the response is HTML or starts with '<'
    if (text.trim().startsWith('<') || (!contentType.includes('application/json') && !contentType.includes('text/json'))) {
      const errorMsg = res.ok 
        ? 'Phản hồi từ máy chủ không phải JSON (HTML)'
        : `Lỗi máy chủ (${res.status}): ${res.statusText || 'Không thể xử lý'}`;
      return { ok: false, status: res.status, data: null, error: errorMsg };
    }

    const data = JSON.parse(text);
    return { ok: res.ok, status: res.status, data, error: data?.error };
  } catch {
    return { ok: false, status: res.status, data: null, error: 'Dữ liệu trả về không đúng định dạng JSON' };
  }
}

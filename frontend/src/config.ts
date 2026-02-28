/**
 * サーバーベースURL（環境変数 VITE_SERVER_BASE_URL から取得）
 * 空の場合は同一オリジン（相対パス）を使用
 */
const SERVER_BASE_URL =
  (import.meta.env.VITE_SERVER_BASE_URL as string | undefined)?.replace(
    /\/$/,
    ""
  ) ?? "";

/**
 * サーバーベースURLとパスを結合した絶対URLを返す
 */
export function serverUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  if (!SERVER_BASE_URL) {
    return normalizedPath;
  }
  return `${SERVER_BASE_URL}${normalizedPath}`;
}

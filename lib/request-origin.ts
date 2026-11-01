/**
 * Validate browser POSTs when the app is behind a trusted reverse proxy.
 * CloudFront terminates HTTPS and forwards the viewer protocol separately;
 * the Worker runtime itself sees HTTP on the origin connection.
 */
export function isSameOriginRequest(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;

  const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const requestUrl = new URL(request.url);
  const proto = forwardedProto || requestUrl.protocol.slice(0, -1);
  const host = forwardedHost || request.headers.get("host") || requestUrl.host;

  try {
    return new URL(origin).origin === new URL(`${proto}://${host}`).origin;
  } catch {
    return false;
  }
}

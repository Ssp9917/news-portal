/** Build a pathname that includes the active locale segment. */
export function withLocale(locale: string, pathname: string) {
  if (!pathname || pathname === "/") return `/${locale}`;
  const p = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `/${locale}${p}`;
}

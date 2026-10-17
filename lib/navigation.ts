export function isRouteActive(href: string, path: string) {
  const normalize = (value: string) => "/" + value.replace(/^\/+|\/+$/g, "");
  const base = normalize(href);
  const current = normalize(path);
  if (base === "/") return current === "/" || current === "/news/latest";
  return current === base || current.startsWith(base + "/");
}

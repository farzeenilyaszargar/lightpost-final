// Only publisher-owned image hosts are proxied by the image optimizer.
export const publisherImageHosts = [
  "ichef.bbci.co.uk",
  "i.guim.co.uk",
] as const;
export function optimizableImage(src: string) {
  if (src.startsWith("/") && !src.startsWith("//")) return true;
  try {
    const url = new URL(src);
    return (
      url.protocol === "https:" &&
      publisherImageHosts.some((host) => host === url.hostname)
    );
  } catch {
    return false;
  }
}

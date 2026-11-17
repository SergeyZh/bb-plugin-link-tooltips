/** Keep web URLs exact; decode file URLs into a readable host path. */
export function linkDestination(href: string): string | null {
  if (!href.trim() || href.startsWith("#")) return null;
  if (!href.toLowerCase().startsWith("file://")) return href;
  try {
    const url = new URL(href);
    let path = decodeURIComponent(url.pathname);
    if (/^\/[a-z]:\//i.test(path)) path = path.slice(1);
    if (url.hostname && url.hostname !== "localhost") path = `//${url.hostname}${path}`;
    return `${path}${url.search}${url.hash}`;
  } catch {
    return href;
  }
}

/** Delegation covers streaming messages without observing or scanning the DOM. */
export function installLinkTooltips(doc: Document, signal: AbortSignal): () => void {
  let active: { anchor: HTMLAnchorElement; original: string | null; applied: string } | null = null;
  let disposed = false;
  const findAnchor = (target: EventTarget | null): HTMLAnchorElement | null => {
    const ElementClass = doc.defaultView?.Element;
    return ElementClass && target instanceof ElementClass
      ? target.closest<HTMLAnchorElement>("a[href]")
      : null;
  };
  const restore = () => {
    if (!active) return;
    const { anchor, original, applied } = active;
    // A host render or another plugin may have replaced the title meanwhile.
    if (anchor.getAttribute("title") === applied) {
      if (original === null) anchor.removeAttribute("title");
      else anchor.setAttribute("title", original);
    }
    active = null;
  };
  const onOver = (event: MouseEvent) => {
    const anchor = findAnchor(event.target);
    if (anchor === active?.anchor) return;
    restore();
    if (!anchor) return;
    const destination = linkDestination(anchor.getAttribute("href") ?? "");
    if (!destination) return;
    const original = anchor.getAttribute("title");
    const applied = original && original !== destination ? `${original}\n${destination}` : destination;
    active = { anchor, original, applied };
    anchor.setAttribute("title", applied);
  };
  const onOut = (event: MouseEvent) => {
    if (active && findAnchor(event.relatedTarget) !== active.anchor) restore();
  };
  const dispose = () => {
    if (disposed) return;
    disposed = true;
    doc.removeEventListener("mouseover", onOver, true);
    doc.removeEventListener("mouseout", onOut, true);
    doc.defaultView?.removeEventListener("blur", restore);
    signal.removeEventListener("abort", dispose);
    restore();
  };
  if (signal.aborted) return dispose;
  doc.addEventListener("mouseover", onOver, true);
  doc.addEventListener("mouseout", onOut, true);
  doc.defaultView?.addEventListener("blur", restore);
  signal.addEventListener("abort", dispose, { once: true });
  return dispose;
}

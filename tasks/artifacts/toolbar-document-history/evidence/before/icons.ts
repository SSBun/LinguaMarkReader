const paths = {
  sidebar: ["M4 4h16v16H4z", "M10 4v16"],
  list: ["M8 6h12M8 12h12M8 18h12", "M4 6h.01M4 12h.01M4 18h.01"],
  folder: ["M3 7V5h6l2 2h10v13H3z", "M3 10h18"],
  expandAll: ["m8 8 4-4 4 4", "m8 16 4 4 4-4"],
  collapseAll: ["m8 4 4 4 4-4", "m8 20 4-4 4 4"],
  locate: ["M19 12a7 7 0 1 1-14 0 7 7 0 0 1 14 0", "M12 2v4m0 12v4M2 12h4m12 0h4", "M13 12a1 1 0 1 1-2 0 1 1 0 0 1 2 0"],
  width: ["M4 5v14M20 5v14", "m9 9-3 3 3 3m6-6 3 3-3 3M6 12h12"],
  star: ["m12 3 2.8 5.7 6.3.9-4.6 4.5 1.1 6.3-5.6-3-5.6 3 1.1-6.3L2.9 9.6l6.3-.9z"],
  library: ["M4 4h4v16H4zM11 4h4v16h-4z", "m18 4 3 15"],
  settings: [
    "m9 3-.6 2.3-2 .9-2.1-.6-2 3.4L4 10.7v2.6L2.3 15l2 3.4 2.1-.6 2 .9L9 21h6l.6-2.3 2-.9 2.1.6 2-3.4-1.7-1.7v-2.6l1.7-1.7-2-3.4-2.1.6-2-.9L15 3z",
    "M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0",
  ],
} as const;

export function createToolbarIcon(name: keyof typeof paths): SVGSVGElement {
  const namespace = "http://www.w3.org/2000/svg";
  const icon = document.createElementNS(namespace, "svg");
  icon.classList.add("reader-toolbar-icon");
  icon.setAttribute("viewBox", "0 0 24 24");
  icon.setAttribute("fill", "none");
  icon.setAttribute("stroke", "currentColor");
  icon.setAttribute("stroke-width", "1.7");
  icon.setAttribute("stroke-linecap", "round");
  icon.setAttribute("stroke-linejoin", "round");
  icon.setAttribute("aria-hidden", "true");
  icon.setAttribute("focusable", "false");
  for (const data of paths[name]) {
    const path = document.createElementNS(namespace, "path");
    path.setAttribute("d", data);
    icon.append(path);
  }
  return icon;
}

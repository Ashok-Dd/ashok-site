/**
 * One shape for every project list on the site (PROJECTS, FREELANCE_PROJECTS, ...).
 * New projects only need an entry in data.jsx – optional `image` (url) adds a screenshot,
 * otherwise a cover is generated from the accent colour + icon.
 */
export const normalizeProject = (p, i = 0) => {
  const links = p.parts ?? (p.github || p.live ? [{ label: 'Source', href: p.github, live: p.live }] : []);
  return {
    id: p.id,
    num: p.num ?? String(i + 1).padStart(2, '0'),
    title: p.title,
    short: p.short,
    tag: p.tag,
    description: p.description,
    longDesc: p.longDesc ?? p.description,
    Icon: p.icon,
    accent: p.accentColor ?? '#1abc9c',
    image: p.image,
    tech: p.tech ?? [],
    features: p.features ?? [],
    stats: [...(p.stats ?? []), ...(p.rating ? [{ label: 'Rating', val: p.rating }] : [])],
    links,
    github: p.github ?? links.find((l) => l.href)?.href,
    live: p.live ?? links.find((l) => l.live)?.live,
  };
};

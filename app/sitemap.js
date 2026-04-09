export default function sitemap() {
  const base = 'https://tools.eoclondon.com';
  const now = new Date().toISOString();
  return [
    { url: base,                     lastModified: now, changeFrequency: 'monthly',  priority: 1.0 },
    { url: `${base}/cable-size`,     lastModified: now, changeFrequency: 'monthly',  priority: 0.9 },
    { url: `${base}/voltage-drop`,   lastModified: now, changeFrequency: 'monthly',  priority: 0.8 },
    { url: `${base}/adiabatic`,      lastModified: now, changeFrequency: 'monthly',  priority: 0.8 },
    { url: `${base}/zs`,             lastModified: now, changeFrequency: 'monthly',  priority: 0.8 },
    { url: `${base}/ev-charging-cost`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
  ];
}

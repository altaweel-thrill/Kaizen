// Update partners.json, then run npm run build to regenerate cards and detail pages.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../fit-and-you.webflow.io');
const partners = JSON.parse(fs.readFileSync(path.join(root, 'data/partners.json'), 'utf8'));
const escape = value => String(value).replace(/[&<>"']/g, character =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
const asset = value => {
  if (typeof value !== 'string' || !/^images\/[a-zA-Z0-9/_-]+\.(jpg|png|webp|svg)$/.test(value) ||
      !fs.existsSync(path.join(root, value))) throw Error('Invalid partner asset: ' + value);
  return escape(value);
};
if (!Array.isArray(partners) || new Set(partners.map(partner => partner.slug)).size !== partners.length) {
  throw Error('Partner records must have unique slugs.');
}
const arrow = '<span aria-hidden="true">↗</span>';
const cards = partners.map(partner => {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(partner.slug) ||
      !partner.name || !partner.category || !partner.description || !partner.gallery?.length) {
    throw Error('Incomplete partner record.');
  }
  if (partner.mapsUrl && !/^https:\/\/(?:maps\.app\.goo\.gl\/|share\.google\/|(?:www\.)?google\.[a-z.]+\/maps)/.test(partner.mapsUrl)) {
    throw Error('Use an official HTTPS Google Maps URL.');
  }
  const directory = path.join(root, 'partners', partner.slug);
  fs.mkdirSync(directory, { recursive: true });
  const prefix = '../../';
  const gallery = partner.gallery.map((photo, index) => `
    <a class="partner-gallery__item" href="${prefix}${asset(photo.src)}" data-gallery-image aria-label="View photo ${index + 1} — ${escape(photo.alt)}">
      <img src="${prefix}${asset(photo.thumbnail || photo.src)}" alt="${escape(photo.alt)}" width="1600" height="1067" loading="lazy" decoding="async">
      <span class="partner-gallery__zoom" aria-hidden="true">＋</span>
    </a>`).join('');
  fs.writeFileSync(path.join(directory, 'index.html'), `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escape(partner.name)} — Our Partners | Kaizen Fitness</title>
  <meta name="description" content="${escape(partner.description)}">
  <link rel="icon" href="../../images/favicon.png" type="image/png">
  <link rel="stylesheet" href="../../css/partners.css">
  <script src="../../js/partner-gallery.js" defer></script>
</head>
<body class="partner-page">
  <a class="partner-skip" href="#partner-content">Skip to content</a>
  <header class="partner-topbar partner-container">
    <a class="partner-brand" href="../../index.html" aria-label="Kaizen Fitness home"><img src="../../images/kaizen-logo.png" alt="Kaizen Fitness" width="425" height="229"></a>
    <a class="partner-back" href="../../index.html#our-partners"><span aria-hidden="true">←</span> Our Partners</a>
  </header>
  <main id="partner-content">
    <section class="partner-hero partner-container" aria-labelledby="partner-name">
      <div class="partner-hero__copy">
        <p class="partner-eyebrow">${escape(partner.category)}</p>
        <h1 id="partner-name">${escape(partner.name)}</h1>
        <p class="partner-description">${escape(partner.description)}</p>
      </div>
      <div class="partner-logo"><img src="${prefix}${asset(partner.logo)}" alt="${escape(partner.name)} official logo" width="1000" height="480"></div>
    </section>
    <div class="partner-cover partner-container"><img src="${prefix}${asset(partner.cover.src)}" alt="${escape(partner.cover.alt)}" width="1800" height="1200" fetchpriority="high"></div>
    <section class="partner-gallery partner-container" aria-labelledby="gallery-title">
      <div class="partner-section-heading"><p class="partner-eyebrow">THE FACILITY</p><h2 id="gallery-title">A closer look.</h2></div>
      <div class="partner-gallery__grid">${gallery}
      </div>
    </section>
    <section class="partner-location partner-container" aria-labelledby="location-title">
      <div><p class="partner-eyebrow">PLAN YOUR VISIT</p><h2 id="location-title">Location &amp; directions</h2></div>
      <div class="partner-location__details">
        ${partner.address ? `<address>${escape(partner.address)}</address>` : '<p class="partner-muted">Address details coming soon.</p>'}
        ${partner.mapsUrl ? `<a class="partner-button" href="${escape(partner.mapsUrl)}" target="_blank" rel="noopener noreferrer">Get directions on Google Maps ${arrow}</a>` : '<button class="partner-button" type="button" disabled aria-describedby="directions-note">Google Maps directions <span aria-hidden="true">↗</span></button><p class="partner-note" id="directions-note">Directions will be available when the location is confirmed.</p>'}
      </div>
    </section>
  </main>
  <footer class="partner-footer partner-container"><a href="../../index.html#our-partners">All partners</a><span>© 2026 Kaizen fit. All rights reserved.</span></footer>
  <dialog class="partner-lightbox" aria-label="Facility photo viewer">
    <button class="partner-lightbox__close" type="button" aria-label="Close photo">×</button>
    <img alt="">
    <p class="partner-lightbox__caption"></p>
    <div class="partner-lightbox__controls"><button type="button" data-gallery-prev aria-label="Previous photo">←</button><span data-gallery-count aria-live="polite"></span><button type="button" data-gallery-next aria-label="Next photo">→</button></div>
  </dialog>
</body>
</html>
`);
  return `      <a class="partner-card" href="partners/${escape(partner.slug)}/index.html" aria-labelledby="partner-${escape(partner.slug)}">
        <div class="partner-card__photo"><img src="${asset(partner.cover.src)}" alt="${escape(partner.cover.alt)}" width="1800" height="1200" loading="lazy" decoding="async"></div>
        <div class="partner-card__body"><div><p class="partner-card__category">${escape(partner.category)}</p><h3 id="partner-${escape(partner.slug)}">${escape(partner.name)}</h3></div><span class="partner-card__arrow" aria-hidden="true">↗</span></div>
      </a>`;
}).join('\n');
const section = `<!-- OUR PARTNERS START -->
<section id="our-partners" class="our-partners" aria-labelledby="our-partners-title">
  <div class="partner-container">
    <header class="our-partners__heading"><p class="partner-eyebrow">OUR NETWORK</p><h2 id="our-partners-title">Our Partners</h2></header>
    <div class="our-partners__grid">
${cards}
    </div>
  </div>
</section>
<!-- OUR PARTNERS END -->
`;
const homeFile = path.join(root, 'index.html');
let home = fs.readFileSync(homeFile, 'utf8');
if (home.includes('<!-- OUR PARTNERS START -->')) {
  home = home.replace(/<!-- OUR PARTNERS START -->[\s\S]*?<!-- OUR PARTNERS END -->\n?/, section);
} else {
  if (!home.includes('<section id="location"')) throw Error('Partners section insertion point missing.');
  home = home.replace('<section id="location"', section + '<section id="location"');
}
if (!home.includes('href="css/partners.css"')) {
  home = home.replace('</head>', '<link href="css/partners.css" rel="stylesheet">\n</head>');
}
fs.writeFileSync(homeFile, home);
console.log(`Built ${partners.length} partner detail pages and updated Our Partners.`);

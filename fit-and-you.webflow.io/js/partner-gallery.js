(() => {
  const links = [...document.querySelectorAll('[data-gallery-image]')];
  const dialog = document.querySelector('.partner-lightbox');
  if (!dialog || !links.length || typeof dialog.showModal !== 'function') return;
  const photo = dialog.querySelector('img');
  const caption = dialog.querySelector('.partner-lightbox__caption');
  const count = dialog.querySelector('[data-gallery-count]');
  let current = 0;
  let trigger;
  let previousOverflow;
  function display(index) {
    current = (index + links.length) % links.length;
    const thumbnail = links[current].querySelector('img');
    photo.src = links[current].href;
    photo.alt = thumbnail.alt;
    caption.textContent = thumbnail.alt;
    count.textContent = `${current + 1} / ${links.length}`;
  }
  links.forEach((link, index) => link.addEventListener('click', event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    trigger = link;
    display(index);
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.showModal();
    dialog.querySelector('.partner-lightbox__close').focus();
  }));
  dialog.querySelector('.partner-lightbox__close').addEventListener('click', () => dialog.close());
  dialog.querySelector('[data-gallery-prev]').addEventListener('click', () => display(current - 1));
  dialog.querySelector('[data-gallery-next]').addEventListener('click', () => display(current + 1));
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight') { event.preventDefault(); display(current + 1); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); display(current - 1); }
  });
  dialog.addEventListener('click', event => {
    const box = dialog.getBoundingClientRect();
    if (event.target === dialog &&
        (event.clientX < box.left || event.clientX > box.right ||
         event.clientY < box.top || event.clientY > box.bottom)) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.body.style.overflow = previousOverflow;
    trigger?.focus();
  });
})();

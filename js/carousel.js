/**
 * ==========================================================================
 * ARCHIVO VIVO — CONTROLADOR DEL CARRUSEL (INDEX)
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  const cards = document.querySelectorAll('.card');
  const dots = document.querySelectorAll('.dot');
  const prevBtn = document.querySelector('.prev-btn');
  const nextBtn = document.querySelector('.next-btn');

  if (!cards.length || !dots.length || (!prevBtn && !nextBtn)) return;

  let currentIndex = Array.from(cards).findIndex(card =>
    card.classList.contains('active')
  );

  if (currentIndex === -1) currentIndex = 0;

  const updateCarousel = (index) => {
    if (!cards.length) return;

    currentIndex = ((index % cards.length) + cards.length) % cards.length;
    const prevIndex = (currentIndex - 1 + cards.length) % cards.length;
    const nextIndex = (currentIndex + 1) % cards.length;

    cards.forEach((card, i) => {
      card.classList.remove('prev', 'active', 'next', 'highlight');
      if (i === currentIndex) card.classList.add('active', 'highlight');
      else if (i === prevIndex) card.classList.add('prev');
      else if (i === nextIndex) card.classList.add('next');
    });

    dots.forEach((dot, i) => {
      const isActive = i === currentIndex;
      dot.classList.toggle('active', isActive);
      dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    const activeCard = cards[currentIndex];
    if (activeCard) {
      const image = activeCard.querySelector('img');
      if (image) image.style.display = '';
      activeCard.setAttribute('aria-current', 'true');
      cards.forEach((card, i) => {
        if (i !== currentIndex) card.removeAttribute('aria-current');
      });
    }
  };

  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      updateCarousel(currentIndex - 1);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      updateCarousel(currentIndex + 1);
    });
  }

  dots.forEach((dot, index) => {
    dot.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      updateCarousel(index);
    });
  });

  // Navegación e interactividad de las tarjetas en el carrusel
  cards.forEach((card, index) => {
    card.style.cursor = 'pointer';

    card.addEventListener('click', (e) => {
      if (!card.classList.contains('active')) {
        e.preventDefault();
        updateCarousel(index);
      } else {
        const charId = card.getAttribute('data-id') || getCharacterIdFromTitle(
          card.querySelector('.card-title, h1, h2, h3, h4, span, p')?.textContent?.trim() || ''
        );
        window.location.href = `personaje.html?id=${charId}&from=index`;
      }
    });
  });

  updateCarousel(currentIndex);
});

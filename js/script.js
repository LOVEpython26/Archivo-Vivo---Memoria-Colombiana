/**
 * Determina la clave del personaje según el título o nombre encontrado
 * @param {string} text - Texto del título o nombre del personaje
 * @returns {string} - Clave del personaje
 */
function getCharacterIdFromTitle(text) {
  if (!text) return 'policarpa';

  const clean = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (clean.includes('bolivar') || clean.includes('simon')) return 'bolivar';
  if (clean.includes('santander')) return 'santander';
  if (clean.includes('mosquera') || clean.includes('tomas')) return 'mosquera';
  if (clean.includes('nunez') || clean.includes('rafael')) return 'nunez';
  if (clean.includes('garzon') || clean.includes('jaime')) return 'garzon';
  if (clean.includes('galan') || clean.includes('antonio')) return 'galan';
  if (clean.includes('gaitan') || clean.includes('eliecer')) return 'gaitan';
  if (clean.includes('policarpa') || clean.includes('pola')) return 'policarpa';

  return 'policarpa';
}

document.addEventListener('DOMContentLoaded', () => {
  const isCatalog = window.location.pathname.toLowerCase().includes('catalogo') || document.querySelector('.catalog-main') !== null;

  const cards = document.querySelectorAll('.card');
  const dots = document.querySelectorAll('.dot');
  const prevBtn = document.querySelector('.prev-btn');
  const nextBtn = document.querySelector('.next-btn');
  const searchInput = document.querySelector('.search-input');
  const searchForm = document.querySelector('.search-bar');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const catalogSections = document.querySelectorAll('.catalog-section');
  const characterHero = document.querySelector('.character-hero');

  // ==========================================================================
  // 1. Renderizado Dinámico de la Ficha del Personaje (personaje.html)
  // ==========================================================================
  if (characterHero) {
    // [CORRECCIÓN 1] Validación segura: Si data.js no cargó, no rompemos la página
    if (typeof personajesData === 'undefined') {
      console.error('Error: El archivo data.js no se cargó o tiene errores de sintaxis.');
      return; 
    }

    const urlParams = new URLSearchParams(window.location.search);
    const characterId = urlParams.get('id');
    const fromPage = urlParams.get('from'); 
    
    const data = (characterId && personajesData[characterId]) ? personajesData[characterId] : personajesData.policarpa;

    document.title = `${data.nombre} - Archivo Vivo`;

    const portraitImg = document.querySelector('.character-portrait-img');
    if (portraitImg) {
      portraitImg.src = data.imagen;
      portraitImg.alt = `Retrato histórico de ${data.nombre}`;
    }

    const nameEl = document.querySelector('#character-name, .character-name');
    if (nameEl) nameEl.textContent = data.nombre;

    const lifespanEl = document.querySelector('.character-lifespan');
    if (lifespanEl) {
      lifespanEl.textContent = data.piezas 
      ? `${data.anios} • ${data.piezas} PIEZAS` 
      : data.anios;
    }

    const bioEl = document.querySelector('.character-bio p');
    if (bioEl) bioEl.textContent = data.bio;

    const wikiLinkEl = document.querySelector('.character-wiki-link');
    if (wikiLinkEl) wikiLinkEl.href = data.wiki;
    
    // [NUEVO] Lógica para renderizar el video si el personaje lo tiene
    const videoSection = document.querySelector('.video-section');
    const videoIframe = document.querySelector('.character-video-iframe');
    
    if (videoSection && videoIframe) {
      if (data.video) {
        videoIframe.src = data.video;
        videoSection.style.display = ''; // Mostramos el contenedor
      } else {
        videoIframe.src = '';
        videoSection.style.display = 'none'; // Lo ocultamos si no hay link
      }
    }

    const backBtn = document.querySelector('.back-btn');
    if (backBtn) {
      if (fromPage === 'index') {
        backBtn.href = 'index.html';
      } else {
        backBtn.href = 'catalogo.html';
      }
    }
  }

   // ==========================================================================
  // 3. Lógica del Carrusel (index.html)
  // ==========================================================================
  let updateCarousel = null;

  if (cards.length > 0 && dots.length > 0 && (prevBtn || nextBtn)) {
    let currentIndex = Array.from(cards).findIndex(card =>
      card.classList.contains('active')
    );

    if (currentIndex === -1) currentIndex = 0;

    updateCarousel = function(index) {
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
        e.preventDefault(); e.stopPropagation();
        updateCarousel(currentIndex - 1);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.preventDefault(); e.stopPropagation();
        updateCarousel(currentIndex + 1);
      });
    }

    dots.forEach((dot, index) => {
      dot.addEventListener('click', (e) => {
        e.preventDefault(); e.stopPropagation();
        updateCarousel(index);
      });
    });

    updateCarousel(currentIndex);
  }

  // ==========================================================================
  // 2. Navegación e Interactividad de las Tarjetas (.card)
  // ==========================================================================
  cards.forEach((card, index) => {
    card.style.cursor = 'pointer';

    card.addEventListener('click', (e) => {
      const fromParam = isCatalog ? 'catalogo' : 'index';

      if (updateCarousel && !card.classList.contains('active')) {
        e.preventDefault(); 
        updateCarousel(index); 
      } 
      else {
        // [CORRECCIÓN 2] Ahora busca en más etiquetas (h1, h4, span, p) por si armaste la tarjeta diferente
        const charId = card.getAttribute('data-id') || getCharacterIdFromTitle(
          card.querySelector('.card-title, h1, h2, h3, h4, span, p')?.textContent?.trim() || ''
        );
        window.location.href = `personaje.html?id=${charId}&from=${fromParam}`;
      }
    });
  });

  // ==========================================================================
  // 4. Filtros por Época Histórica (catalogo.html)
  // ==========================================================================
  if (filterBtns.length > 0 && catalogSections.length > 0) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filterValue = btn.getAttribute('data-filter');

        catalogSections.forEach(section => {
          const sectionCategory = section.getAttribute('data-category');
          if (filterValue === 'all' || sectionCategory === filterValue) {
            section.style.display = '';
          } else {
            section.style.display = 'none';
          }
        });
      });
    });
  }

  // ==========================================================================
  // 5. Filtros de Piezas Documentales (personaje.html)
  // ==========================================================================
  const mediaFilterBtns = document.querySelectorAll('.media-filter-btn');
  if (mediaFilterBtns.length > 0) {
    mediaFilterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        mediaFilterBtns.forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
      });
    });
  }

  // ==========================================================================
  // 6. Buscador (Comportamiento Diferenciado por Vista)
  // ==========================================================================
  if (searchInput && searchForm) {
    
    const filterCatalogCards = (query) => {
      const queryLimpio = query.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

      cards.forEach(card => {
        const titleEl = card.querySelector('.card-title, h2, h3');
        const titleText = titleEl 
        ? titleEl.textContent.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") 
        : '';
      
        if (titleText.includes(queryLimpio)) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });

      if (catalogSections.length > 0) {
        catalogSections.forEach(section => {
          // [CORRECCIÓN 3] Evita el fallo en navegadores que quitan los espacios en el atributo style
          const visibleCards = Array.from(section.querySelectorAll('.card')).filter(c => c.style.display !== 'none');
          
          if (visibleCards.length === 0 && query !== '') {
            section.style.display = 'none';
          } else {
            const activeFilter = document.querySelector('.filter-btn.active')?.getAttribute('data-filter') || 'all';
            const sectionCategory = section.getAttribute('data-category');
            if (activeFilter === 'all' || sectionCategory === activeFilter) {
              section.style.display = '';
            }
          }
        });
      }
    };

    if (isCatalog) {
      const urlParams = new URLSearchParams(window.location.search);
      const searchQuery = urlParams.get('search');
      
      if (searchQuery) {
        searchInput.value = searchQuery; 
        filterCatalogCards(searchQuery.toLowerCase().trim()); 
      }
    }

    searchInput.addEventListener('input', (e) => {
      if (isCatalog) {
        const query = e.target.value.toLowerCase().trim();
        filterCatalogCards(query);
      }
    });

    searchForm.addEventListener('submit', (e) => {
      e.preventDefault(); 
      const query = searchInput.value.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      
      if (!isCatalog) {
        if (query) {
          window.location.href = `catalogo.html?search=${encodeURIComponent(query)}`;
        } else {
          window.location.href = 'catalogo.html';
        }
      }
    });
  }
});
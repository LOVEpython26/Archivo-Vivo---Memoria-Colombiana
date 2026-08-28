// ==========================================================================
// Base de Datos Local de Personajes Históricos
// ==========================================================================
const personajesData = {
  policarpa: {
    nombre: 'POLICARPA SALAVARRIETA',
    anios: '1795 — 1817',
    bio: 'Heroína de la Independencia de Colombia, conocida popularmente como «La Pola». Desarrolló labores de inteligencia y espionaje cruciales para las fuerzas patriotas durante la Reconquista española en Santafé de Bogotá, transmitiendo información estratégica, reclutando jóvenes y facilitando suministros a los combatientes independentistas hasta su captura y posterior fusilamiento en la Plaza Mayor.',
    imagen: 'assets/img/policarpa.jpg',
    wiki: 'https://es.wikipedia.org/wiki/Policarpa_Salavarrieta'
  },
  santander: {
    nombre: 'FRANCISCO DE PAULA SANTANDER',
    anios: '1792 — 1840',
    bio: 'Conocido como «El Hombre de las Leyes» y «Organizador de la Victoria». Prócer de la independencia, militar y estadista colombiano. Fue vicepresidente de la Gran Colombia y presidente de la República de la Nueva Granada, sentando las bases del sistema educativo público y el orden constitucional de la nación.',
    imagen: 'assets/img/santander.jpg',
    wiki: 'https://es.wikipedia.org/wiki/Francisco_de_Paula_Santander'
  },
  garzon: {
    nombre: 'JAIME GARZÓN',
    anios: '1960 — 1999',
    bio: 'Abogado, pedagogo, humorista, activista por la paz y periodista colombiano. A través de la sátira política y personajes icónicos como «Heriberto de la Calle» y «Dioselina Tibaná», cuestionó con agudeza las estructuras de poder en Colombia y facilitó la liberación de secuestrados antes de ser asesinado en 1999.',
    imagen: 'assets/img/jaime-garzon.jpg',
    wiki: 'https://es.wikipedia.org/wiki/Jaime_Garz%C3%B3n'
  },
  galan: {
    nombre: 'LUIS CARLOS GALÁN',
    anios: '1943 — 1989',
    bio: 'Abogado, periodista y político colombiano, oriundo de Bucaramanga, Santander. Fundador del Nuevo Liberalismo, destacó por su férrea oposición al clientelismo, la corrupción y los carteles del narcotráfico. Su oratoria apasionada y su visión de renovación moral del Estado lo convirtieron en uno de los líderes políticos más influyentes y queridos de la historia contemporánea del país, hasta su trágico magnicidio en plena campaña presidencial.',
    imagen: 'assets/img/galan.jpg',
    wiki: 'https://es.wikipedia.org/wiki/Luis_Carlos_Gal%C3%A1n'
  },
  gaitan: {
    nombre: 'JORGE ELIÉCER GAITÁN',
    anios: '1898 — 1948',
    bio: 'Jurista, escritor y político colombiano. Conocido como «El Caudillo del Pueblo», su oratoria influyente y su defensa de las causas populares marcaron un hito en la política del siglo XX hasta su magnicidio el 9 de abril de 1948.',
    imagen: 'assets/img/gaitan.jpg',
    wiki: 'https://es.wikipedia.org/wiki/Jorge_Eli%C3%A9cer_Gait%C3%A1n'
  }
};

/**
 * Determina la clave del personaje según el título o nombre encontrado
 * @param {string} text - Texto del título o nombre del personaje
 * @returns {string} - Clave del personaje
 */
function getCharacterIdFromTitle(text) {
  if (!text) return 'policarpa';
  const clean = text.toLowerCase();
  
  if (clean.includes('santander')) return 'santander';
  if (clean.includes('garz') || clean.includes('jaime')) return 'garzon';
  if (clean.includes('galán') || clean.includes('galan') || clean.includes('antonio')) return 'galan';
  if (clean.includes('gaitán') || clean.includes('gaitan') || clean.includes('eliécer') || clean.includes('eliecer')) return 'gaitan';
  if (clean.includes('policarpa') || clean.includes('pola')) return 'policarpa';
  
  return 'policarpa';
}

document.addEventListener('DOMContentLoaded', () => {
  // Variable global para saber si estamos en el catálogo
  const isCatalog = window.location.pathname.toLowerCase().includes('catalogo') || document.querySelector('.catalog-main') !== null;

  // Referencias a los elementos del DOM
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
    if (lifespanEl) lifespanEl.textContent = data.anios;

    const bioEl = document.querySelector('.character-bio p');
    if (bioEl) bioEl.textContent = data.bio;

    const wikiLinkEl = document.querySelector('.character-wiki-link');
    if (wikiLinkEl) wikiLinkEl.href = data.wiki;
    
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

    if (currentIndex === -1) {
      currentIndex = 0;
    }

    updateCarousel = function(index) {
      if (!cards.length) return;

      // ------------------------------------------------------------
      // Índice circular
      // ------------------------------------------------------------
      currentIndex = ((index % cards.length) + cards.length) % cards.length;

      // Índices anterior y siguiente también circulares
      const prevIndex =
        (currentIndex - 1 + cards.length) % cards.length;

      const nextIndex =
        (currentIndex + 1) % cards.length;

      // ------------------------------------------------------------
      // Actualizar TODAS las tarjetas
      // ------------------------------------------------------------
      cards.forEach((card, i) => {

        // Eliminar posiciones anteriores
        card.classList.remove(
          'prev',
          'active',
          'next',
          'highlight'
        );

        // Asignar nueva posición
        if (i === currentIndex) {
          card.classList.add('active', 'highlight');
        }
        else if (i === prevIndex) {
          card.classList.add('prev');
        }
        else if (i === nextIndex) {
          card.classList.add('next');
        }
      });

      // ------------------------------------------------------------
      // Actualizar indicadores
      // ------------------------------------------------------------
      dots.forEach((dot, i) => {
        const isActive = i === currentIndex;

        dot.classList.toggle('active', isActive);
        dot.setAttribute(
          'aria-selected',
          isActive ? 'true' : 'false'
        );
      });

      // ------------------------------------------------------------
      // Sincronizar el contenido visual de la tarjeta activa
      // ------------------------------------------------------------
      const activeCard = cards[currentIndex];

      if (activeCard) {

        // Imagen
        const image = activeCard.querySelector('img');

        if (image) {
          image.style.display = '';
        }

        // Guardar el personaje actualmente activo
        activeCard.setAttribute(
          'aria-current',
          'true'
        );

        // Asegurar que las demás tarjetas no sean la actual
        cards.forEach((card, i) => {
          if (i !== currentIndex) {
            card.removeAttribute('aria-current');
          }
        });
      }
    };

    // ------------------------------------------------------------
    // Botón ANTERIOR
    // ------------------------------------------------------------
    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        updateCarousel(currentIndex - 1);
      });
    }

    // ------------------------------------------------------------
    // Botón SIGUIENTE
    // ------------------------------------------------------------
    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        updateCarousel(currentIndex + 1);
      });
    }

    // ------------------------------------------------------------
    // Indicadores / puntos
    // ------------------------------------------------------------
    dots.forEach((dot, index) => {
      dot.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        updateCarousel(index);
      });
    });

    // ------------------------------------------------------------
    // Estado inicial
    // ------------------------------------------------------------
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
        const charId = card.getAttribute('data-id') || getCharacterIdFromTitle(
          card.querySelector('.card-title, h2, h3')?.textContent?.trim() || ''
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
      cards.forEach(card => {
        const titleEl = card.querySelector('.card-title, h2, h3');
        const titleText = titleEl ? titleEl.textContent.toLowerCase() : '';

        if (titleText.includes(query)) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });

      if (catalogSections.length > 0) {
        catalogSections.forEach(section => {
          const visibleCards = section.querySelectorAll('.card:not([style*="display: none"])');
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
      const query = searchInput.value.trim();

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
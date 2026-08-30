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
    // Validación de seguridad para data.js
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

    // Actualización del contador de piezas en la ficha
    const countText = document.querySelector('.character-pieces-count .count-text');
    const archiveSection = document.querySelector('.character-archive-section');
    const totalArchivos = (data.archivos && Array.isArray(data.archivos)) ? data.archivos.length : 0;

    if (countText) {
      if (totalArchivos === 1) {
        countText.textContent = '1 ARCHIVO AUDIOVISUAL EN EL FONDO DOCUMENTAL';
      } else if (totalArchivos > 1) {
        countText.textContent = `${totalArchivos} PIEZAS HISTÓRICAS EN EL FONDO DOCUMENTAL`;
      } else {
        countText.textContent = '0 PIEZAS EN EL FONDO DOCUMENTAL';
      }
    }

    // Elementos del Modal / Ventana Flotante
    const archiveModal = document.getElementById('archive-modal');
    const modalImg = document.getElementById('modal-img');
    const modalTitle = document.getElementById('modal-title');
    const modalText = document.getElementById('modal-text');
    const modalBtn = document.getElementById('modal-btn');
    let lastActiveElement = null;

    const openArchiveModal = (item) => {
      if (!archiveModal || !item) return;

      lastActiveElement = document.activeElement;

      if (modalImg) {
        modalImg.src = item.portada;
        modalImg.alt = item.titulo;
      }
      if (modalTitle) modalTitle.textContent = item.titulo || '';
      if (modalText) modalText.textContent = item.descripcionModal || item.descripcion || '';
      
      if (modalBtn) {
        modalBtn.href = item.url || '#';
        modalBtn.textContent = item.botonTexto || '▶ Ver en Banrepcultural';
      }

      archiveModal.classList.add('is-open');
      archiveModal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');

      const closeBtn = archiveModal.querySelector('.archive-modal-close');
      if (closeBtn) closeBtn.focus();
    };

    const closeArchiveModal = () => {
      if (!archiveModal) return;
      archiveModal.classList.remove('is-open');
      archiveModal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('modal-open');

      if (lastActiveElement && typeof lastActiveElement.focus === 'function') {
        lastActiveElement.focus();
      }
    };

    if (archiveModal) {
      archiveModal.querySelectorAll('[data-close-modal]').forEach(el => {
        el.addEventListener('click', (e) => {
          e.preventDefault();
          closeArchiveModal();
        });
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && archiveModal.classList.contains('is-open')) {
          closeArchiveModal();
        }
      });
    }

    // Renderizado dinámico de la tarjeta compacta en el perfil
    const renderArchiveItems = (filter = 'all') => {
      if (!archiveSection) return;

      if (!data.archivos || data.archivos.length === 0) {
        archiveSection.innerHTML = `
          <div class="empty-archive-state">
            <p class="empty-archive-msg">PRÓXIMAMENTE PIEZAS DOCUMENTALES DE ESTE PERSONAJE</p>
          </div>
        `;
        return;
      }

      const filteredItems = filter === 'all' 
        ? data.archivos 
        : data.archivos.filter(item => item.tipo.toLowerCase() === filter.toLowerCase());

      if (filteredItems.length === 0) {
        archiveSection.innerHTML = `
          <div class="empty-archive-state">
            <p class="empty-archive-msg">NO SE ENCONTRARON PIEZAS EN ESTA CATEGORÍA</p>
          </div>
        `;
        return;
      }

      const itemsHtml = filteredItems.map((item, idx) => `
        <article 
          class="archive-card" 
          data-archive-id="${item.id || idx}"
          data-type="${item.tipo}"
          role="button"
          tabindex="0"
          aria-haspopup="dialog"
          aria-label="Abrir detalles de ${item.titulo}"
        >
          <div class="archive-media">
            <img src="${item.portada}" alt="${item.titulo}" class="archive-img">
            <span class="archive-badge">${item.badge || item.tipo.toUpperCase()}</span>
            <div class="archive-card-overlay">
              <span class="archive-play-hint">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                <span>VER DETALLES</span>
              </span>
            </div>
          </div>
          <div class="archive-content-compact">
            <h3 class="archive-title-compact">${item.tituloCorto || item.titulo}</h3>
            ${item.copyright ? `<p class="archive-copyright">${item.copyright}</p>` : ''}
          </div>
        </article>
      `).join('');

      archiveSection.innerHTML = `<div class="archive-grid">${itemsHtml}</div>`;

      // Eventos de clic y teclado para abrir la ventana flotante (modal)
      const renderedCards = archiveSection.querySelectorAll('.archive-card');
      renderedCards.forEach((card, idx) => {
        const itemData = filteredItems[idx];
        
        card.addEventListener('click', (e) => {
          e.preventDefault();
          openArchiveModal(itemData);
        });

        card.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openArchiveModal(itemData);
          }
        });
      });
    };

    renderArchiveItems('all');

    // Manejo de filtros documentales (TODOS, VIDEO, AUDIO, DOCUMENTOS)
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

          const btnText = btn.textContent.trim().toUpperCase();
          let filterType = 'all';
          if (btnText.includes('VIDEO')) filterType = 'video';
          else if (btnText.includes('AUDIO')) filterType = 'audio';
          else if (btnText.includes('DOCUMENTO')) filterType = 'documento';

          renderArchiveItems(filterType);
        });
      });
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
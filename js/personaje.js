/**
 * ==========================================================================
 * ARCHIVO VIVO — CONTROLADOR DE LA FICHA DE PERSONAJE Y MODAL (PERSONAJE)
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  const characterHero = document.querySelector('.character-hero');
  if (!characterHero) return;

  // Validación de seguridad para data.js
  if (typeof personajesData === 'undefined') {
    console.error('Error: El archivo data.js no se cargó correctamente.');
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const characterId = urlParams.get('id');
  const fromPage = urlParams.get('from');

  const data = (characterId && personajesData[characterId]) ? personajesData[characterId] : personajesData.policarpa;

  document.title = `${data.nombre} - Archivo Vivo`;

  // 1. Carga de datos del Personaje
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

  // 2. Contador de piezas documentales
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

  // 3. Elementos y Control del Modal / Ventana Flotante
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

  // 4. Renderizado dinámico de la tarjeta minimalista en el perfil
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
        class="archive-card archive-card--minimal" 
        data-archive-id="${item.id || idx}"
        data-type="${item.tipo}"
        role="button"
        tabindex="0"
        aria-haspopup="dialog"
        aria-label="Abrir detalles de ${item.titulo}"
      >
        <div class="archive-media">
          <img src="${item.portada}" alt="${item.titulo}" class="archive-img">
          <span class="archive-badge-minimal">
            <svg class="play-icon-mini" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="11" height="11" fill="currentColor">
              <polygon points="6 3 20 12 6 21 6 3"></polygon>
            </svg>
            <span>Video / Archivo</span>
          </span>
        </div>
        <div class="archive-caption">
          <h3 class="archive-title-minimal">${item.tituloCorto || item.titulo}</h3>
        </div>
      </article>
    `).join('');

    archiveSection.innerHTML = `<div class="archive-grid">${itemsHtml}</div>`;

    // Eventos de interacción en tarjetas del fondo documental
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

  // 5. Filtros de Piezas Documentales (TODOS, VIDEO, AUDIO, DOCUMENTOS)
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

  // 6. Botón Volver contextual
  const backBtn = document.querySelector('.back-btn');
  if (backBtn) {
    if (fromPage === 'index') {
      backBtn.href = 'index.html';
    } else {
      backBtn.href = 'catalogo.html';
    }
  }
});

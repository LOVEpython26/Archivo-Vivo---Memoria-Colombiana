/**
 * ==========================================================================
 * ARCHIVO VIVO — CONTROLADOR DEL CATÁLOGO (CATALOGO)
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  const cards = document.querySelectorAll('.card');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const catalogSections = document.querySelectorAll('.catalog-section');
  const searchInput = document.querySelector('.search-input');
  const searchForm = document.querySelector('.search-bar');

  // 1. Navegación al hacer clic en tarjetas del catálogo
  cards.forEach(card => {
    card.style.cursor = 'pointer';

    card.addEventListener('click', () => {
      const charId = card.getAttribute('data-id') || getCharacterIdFromTitle(
        card.querySelector('.card-title, h1, h2, h3, h4, span, p')?.textContent?.trim() || ''
      );
      window.location.href = `personaje.html?id=${charId}&from=catalogo`;
    });
  });

  // 2. Filtros por Época Histórica
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

  // 3. Buscador en tiempo real dentro del catálogo
  if (searchInput) {
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

    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('search');
    
    if (searchQuery) {
      searchInput.value = searchQuery; 
      filterCatalogCards(searchQuery.toLowerCase().trim()); 
    }

    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      filterCatalogCards(query);
    });

    if (searchForm) {
      searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
      });
    }
  }
});

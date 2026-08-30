/**
 * ==========================================================================
 * ARCHIVO VIVO — MÓDULO COMÚN Y UTILIDADES
 * ==========================================================================
 */

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
  const searchInput = document.querySelector('.search-input');
  const searchForm = document.querySelector('.search-bar');
  const isCatalog = window.location.pathname.toLowerCase().includes('catalogo') || document.querySelector('.catalog-main') !== null;

  // Manejador global del formulario de búsqueda en el Header
  if (searchForm && searchInput && !isCatalog) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const query = searchInput.value.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      if (query) {
        window.location.href = `catalogo.html?search=${encodeURIComponent(query)}`;
      } else {
        window.location.href = 'catalogo.html';
      }
    });
  }
});

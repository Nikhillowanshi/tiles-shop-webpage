// main.js
(function () {
  'use strict';

  // Escape HTML (XSS safe text)
  function escapeHtml(text) {
    return String(text || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // ✅ Product Card Builder (with WhatsApp button)
  function buildCategoryCard(product, category) {
    const wrapper = document.createElement('div');
    wrapper.className = 'category-card-wrapper';

    const productLink = `product.html?id=${product.id}&cat=${encodeURIComponent(category)}`;

    // Fallback image
    const imgSrc =
      (product.images && product.images.length > 0)
        ? product.images[0]
        : product.image || "https://via.placeholder.com/300x200?text=No+Image";

    wrapper.innerHTML = `
      <a class="category-page__card" href="${productLink}">
        <img class="category-page__image" src="${escapeHtml(imgSrc)}" alt="${escapeHtml(product.name)}">
        <div class="category-page__info">
          <h3 class="category-page__title">${escapeHtml(product.name)}</h3>
          <p class="category-page__price">${escapeHtml(product.price)}</p>
        </div>
      </a>

    `;



    return wrapper;
  }

  // ✅ Render products for a category
  function renderCategoryProducts(category, options) {
    options = options || {};
    const container = document.getElementById('category-products');
    if (!container) return;
    container.innerHTML = '';

    const data = (window.products && window.products[category]) || [];
    let list = data.slice();

    // Search
    const query = (options.query || '').trim().toLowerCase();
    if (query)
      list = list.filter(p =>
        (p.name + ' ' + p.desc).toLowerCase().includes(query)
      );

    // Sorting
    if (options.sort === 'price-asc')
      list.sort((a, b) =>
        parseFloat(a.price.replace(/[^\d.]/g, '')) - parseFloat(b.price.replace(/[^\d.]/g, ''))
      );
    if (options.sort === 'price-desc')
      list.sort((a, b) =>
        parseFloat(b.price.replace(/[^\d.]/g, '')) - parseFloat(a.price.replace(/[^\d.]/g, ''))
      );
    if (options.sort === 'alpha')
      list.sort((a, b) => a.name.localeCompare(b.name));

    if (!list.length) {
      container.innerHTML = '<p class="no-results">No products found.</p>';
      return;
    }

    const fragment = document.createDocumentFragment();
    list.forEach(p => fragment.appendChild(buildCategoryCard(p, category)));
    container.appendChild(fragment);
  }

  // ✅ Single product page (slider + related products)
  function loadProductDetails() {
    const container = document.getElementById('product-details');
    if (!container) return;

    const params = new URLSearchParams(location.search);
    const id = parseInt(params.get('id'));
    const cat = params.get('cat');
    if (!cat || !window.products || !window.products[cat]) {
      container.innerHTML = '<p>Product not found (invalid category).</p>';
      return;
    }

    const product = window.products[cat].find(p => p.id === id);
    if (!product) {
      container.innerHTML = '<p>Product not found.</p>';
      return;
    }

    // Fallback images
    const images = product.images && product.images.length
      ? product.images
      : [product.image || "https://via.placeholder.com/600x400?text=No+Image"];

    container.innerHTML = `
      <div class="product-page__slider">
        <div class="slider-wrapper">
          ${images.map(
            (img, i) => `
            <div class="slide ${i === 0 ? 'active' : ''}">
              <img src="${escapeHtml(img)}" alt="${escapeHtml(product.name)} ${i + 1}">
            </div>
          `).join('')}
        </div>
        <button class="slider-btn prev">❮</button>
        <button class="slider-btn next">❯</button>
      </div>
      <h2 class="product-page__name">${escapeHtml(product.name)}</h2>
      <p class="product-page__price">${escapeHtml(product.price)}</p>
      <p class="product-page__desc">${escapeHtml(product.desc)}</p>
      <button class="whatsapp-btn" id="whatsapp-single">
        <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp">
        WhatsApp
      </button>
    `;

    // Slider logic
    const slides = container.querySelectorAll('.slide');
    const prevBtn = container.querySelector('.slider-btn.prev');
    const nextBtn = container.querySelector('.slider-btn.next');
    let currentIndex = 0;

    function showSlide(index) {
      slides.forEach((s, i) => s.classList.toggle('active', i === index));
    }

    prevBtn.addEventListener('click', () => {
      currentIndex = (currentIndex - 1 + slides.length) % slides.length;
      showSlide(currentIndex);
    });

    nextBtn.addEventListener('click', () => {
      currentIndex = (currentIndex + 1) % slides.length;
      showSlide(currentIndex);
    });

    // WhatsApp button for single product
    const singleBtn = document.getElementById('whatsapp-single');
    singleBtn.addEventListener('click', () => {
      const phone = "917879373754"; // 👈 अपना नंबर डालो
      const msg = `Hi, I'm interested in this product: ${location.href}`;
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, "_blank");
    });

    // Related products
    const relatedContainer = document.createElement('div');
    relatedContainer.className = 'related-products';
    relatedContainer.innerHTML = `
      <h3 class="related-title">Related Products</h3>
      <div class="related-products__list"></div>
    `;
    container.appendChild(relatedContainer);

    const relatedList = relatedContainer.querySelector('.related-products__list');
    const related = window.products[cat].filter(p => p.id !== id).slice(0, 4);
    related.forEach(p => relatedList.appendChild(buildCategoryCard(p, cat)));
  }

  // ✅ Home featured products
  function renderHomeFeatured(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    const cats = Object.keys(window.homeProducts || {});
    const frag = document.createDocumentFragment();

    cats.forEach(cat => {
      if (window.homeProducts[cat]) {
        window.homeProducts[cat].forEach(product => {
          frag.appendChild(buildCategoryCard(product, cat));
        });
      }
    });

    container.appendChild(frag);
  }

  // Expose
  window.renderCategoryProducts = renderCategoryProducts;
  window.loadProductDetails = loadProductDetails;
  window.renderHomeFeatured = renderHomeFeatured;

  // Auto initialize
  document.addEventListener('DOMContentLoaded', function () {
    if (document.body.classList.contains('home-page')) {
      renderHomeFeatured('home-featured');
    }

    const cat = document.body.dataset.category;
    if (cat) {
      const searchInput = document.getElementById('search-input');
      const sortSelect = document.getElementById('sort-select');
      renderCategoryProducts(cat);

      if (searchInput)
        searchInput.addEventListener('input', function () {
          renderCategoryProducts(cat, {
            query: this.value,
            sort: sortSelect ? sortSelect.value : 'default',
          });
        });

      if (sortSelect)
        sortSelect.addEventListener('change', function () {
          renderCategoryProducts(cat, {
            query: searchInput ? searchInput.value : '',
            sort: this.value,
          });
        });
    }

    if (document.getElementById('product-details')) {
      loadProductDetails();
    }
  });
})();

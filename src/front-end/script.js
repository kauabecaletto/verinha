document.addEventListener("DOMContentLoaded", function () {
  const accordions = document.querySelectorAll('.accordion');

  accordions.forEach(accordion => {
    const headers = accordion.querySelectorAll('.accordion-header');

    headers.forEach(header => {
      header.addEventListener('click', function () {
        const isExpanded = this.getAttribute('aria-expanded') === 'true';

        // Só fecha se outro for aberto (impede fechar o único aberto)
        if (!isExpanded) {
          headers.forEach(h => {
            h.setAttribute('aria-expanded', 'false');
            h.nextElementSibling.style.display = 'none';
          });

          this.setAttribute('aria-expanded', 'true');
          this.nextElementSibling.style.display = 'block';
        }
      });
    });

    // Garante que um item esteja aberto ao carregar
    let hasOpen = false;
    headers.forEach(header => {
      if (header.getAttribute('aria-expanded') === 'true') {
        header.nextElementSibling.style.display = 'block';
        hasOpen = true;
      }
    });
    if (!hasOpen && headers.length > 0) {
      headers[0].setAttribute('aria-expanded', 'true');
      headers[0].nextElementSibling.style.display = 'block';
    }
  });
});

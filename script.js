const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.primary-nav');

if (menuButton && nav) {
  menuButton.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(isOpen));
  });
}

const form = document.querySelector('.contact-form');
const note = document.querySelector('.form-note');

if (form && note) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const data = new FormData(form);
    const hasEmpty = [...data.values()].some((value) => !String(value).trim());

    if (hasEmpty) {
      note.textContent = 'Please complete all fields before submitting.';
      note.style.color = '#fca5a5';
      return;
    }

    note.textContent = 'Thanks! Your inquiry has been recorded. We will contact you shortly.';
    note.style.color = '#86efac';
    form.reset();
  });
}

const year = document.getElementById('year');
if (year) {
  year.textContent = new Date().getFullYear();
}

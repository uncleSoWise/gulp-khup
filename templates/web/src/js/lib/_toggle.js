/**
 * Function to export to theme.js
 *
 * example html for the button
 * <button class="nav__menu-link js-toggle" // include the js-toggle class to trigger the event
 *         data-html-class="submenu--is-active" // the class added to the html tag when active
 *         data-parent-toggle=".nav__menu-item" // will add an is-active class to this element
 *         data-ancestor-open="nav__toggle" // looks for another element to check if open. Handy for hamburgers
 *         aria-controls="js-navigation" // the open div to stay open when clicked. Able to detect clicks outside of
 *         type="button">
 * </button>
 * @function toggle
 */

const toggle = () => {
  if (!document.querySelectorAll('.js-toggle').length > 0) return false;
  const html = document.querySelector('html');
  const toggleButtons = Array.from(html.querySelectorAll('.js-toggle'));
  // const listItems = Array.from(html.querySelectorAll('.nav__menu-item'));
  // let isFromTouchEvent = false;



  /**
   * Close all open toggles and their related opened elements
   */
  function clearActives(el) {
    const elem = el.target.closest('.js-toggle');
    const isSameButton = elem.classList.contains('is-active');
    const dependentToggle = elem.getAttribute('data-ancestor-open');
    toggleButtons.forEach((toggleButton) => {
      if (toggleButton.classList.contains('is-active') && !isSameButton && !toggleButton.classList.contains(dependentToggle)) {
        toggleButton.click();
      }
    });
  }



  function toggleAttrs(elem) {
    clearActives(elem);

    const htmlClass = this.getAttribute('data-html-class');
    html.classList.toggle(htmlClass);

    this.classList.toggle('is-active');
    const state = this.getAttribute('aria-expanded') === 'true' ? 'false' : 'true';
    this.setAttribute('aria-expanded', state);

    if (this.classList.contains('show-hide__toggle')) {
      const content = this.closest('.show-hide__item').querySelector(
        '.show-hide__content'
      );
      content.setAttribute('aria-hidden', state);
      content.classList.toggle('is-visible');
    }

    if (this.classList.contains('footer__menu-toggle')) {
      const content = this.closest('.footer__menu-item').querySelector(
        '.footer__submenu'
      );
      content.setAttribute('aria-hidden', state);
      content.classList.toggle('is-visible');
    }

    if (this.getAttribute('data-focus')) {
      const el = this.getAttribute('data-focus');
      setTimeout(() => {
        html.querySelector(el).focus();
      }, 500);
    }

    if (this.getAttribute('data-parent-toggle')) {
      const el = this.getAttribute('data-parent-toggle');
      this.closest(el).classList.toggle('is-active');
    }
  }



  function close(e) {
    if (document.querySelector('.js-toggle.is-active')) {
      const active = document.querySelector('.js-toggle.is-active');
      const activeContainer = active.getAttribute('aria-controls');
      const specifiedElement = document.querySelector(`#${activeContainer}`);
      const isClickInside = specifiedElement.contains(e.target);
      const isClickTarget = active.contains(e.target);

      let isEscape = false;
      if (active) {
        const evt = e || window.event;
        if ('key' in evt) {
          isEscape = (evt.key === 'Escape' || evt.key === 'Esc');
        } else {
          isEscape = (evt.keyCode === 27);
        }
      }

      if ((!isClickInside && !isClickTarget) || isEscape) {
        active.click();
      }
    }
  }



  toggleButtons.forEach((toggleButton) => {
    toggleButton.addEventListener('click', toggleAttrs, false);
  });



  document.addEventListener('click', close, false);
  document.addEventListener('keydown', close);

  return null;
};

export default toggle;

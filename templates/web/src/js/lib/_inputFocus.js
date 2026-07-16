/* global jQuery */
/**
 * Function to export to theme.js
 */

if (!Element.prototype.matches) {
  Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
}

if (!Element.prototype.closest) {
  Element.prototype.closest = (s) => {
    let el = this;

    do {
      if (Element.prototype.matches.call(el, s)) return el;
      el = el.parentElement || el.parentNode;
    } while (el !== null && el.nodeType === 1);
    return null;
  };
}



const inputFocus = () => {
  if (!document.querySelectorAll('.gform_wrapper').length > 0) return false;

  function gatherFormInputs() {
    const forms = Array.from(document.querySelectorAll('form')); // Get all the forms
    const inputs = [];



    forms.forEach((form) => {
      [...form.elements].forEach((input) => {
        if (input.nodeName === 'INPUT' || input.nodeName === 'SELECT' || input.nodeName === 'TEXTAREA') {
          inputs.push(input);
        }
      });
      // console.log(form.elements);
    });

    const parentClasses = '.gfield';
    const activeClass = 'input-active';

    /**
     * Loop through all of the inputs on load and see if they have a value.
     * If they do, then add the needed class to the parent
     */
    inputs.forEach((input) => {
      if (input.value.length > 0 && input.closest(parentClasses) !== null && input.type !== 'hidden') {
        input.closest(parentClasses).classList.add(activeClass);
      }
    });

    /**
     * Loop through all of the form elements on focus
     * If the input contains a value then do not remove the class
     */
    forms.forEach((form) => {
      form.addEventListener('focus', (event) => {
        if (event.target.closest(parentClasses) !== null) {
          event.target.closest(parentClasses).classList.add(activeClass);
        }
      }, true);
      form.addEventListener('blur', (event) => {
        if (event.target.value !== undefined) {
          if (event.target.value.length < 1 && event.target.closest(parentClasses) !== null) {
            event.target.closest(parentClasses).classList.remove(activeClass);
          }
        } else if (event.target.innerText === '') {
          event.target.closest(parentClasses).classList.remove(activeClass);
        }
      }, true);
    });
  }
  gatherFormInputs();



  /**
   * Re-run the function when the form errors
   */
  jQuery(document).on('gform_post_render', (event, form_id, current_page) => {
    gatherFormInputs();
  });

  return null;
};

export default inputFocus;

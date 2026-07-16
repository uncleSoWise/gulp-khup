/**
 * [isElementInViewport description]
 * Source: https://stackoverflow.com/a/16327815
 *         https://gist.github.com/davidtheclark/5515733
 *
 * @param  {[type]}  elem [description]
 * @return {Boolean}      [description]
 */

const isElementInViewport = (elem, offset = 100) => {
  const rect = elem.getBoundingClientRect();
  // Get the scroll position of the page.
  const viewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

  // Get the position of the element on the page.
  const elemTop = rect.top;
  const elemBottom = rect.bottom;

  return ((elemTop < viewportHeight - offset) && (elemBottom > offset));
};

export default isElementInViewport;

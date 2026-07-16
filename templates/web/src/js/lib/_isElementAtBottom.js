/**
 * [isElementAtBottom description]
 * Source: https://stackoverflow.com/a/16327815
 *         https://gist.github.com/davidtheclark/5515733
 *
 * @param  {[type]}  elem [description]
 * @return {Boolean}      [description]
 */

const isElementAtBottom = (elem) => {
  const rect = elem.getBoundingClientRect();
  return (rect.bottom <= (window.innerHeight || document. documentElement.clientHeight) - 200);
};

export default isElementAtBottom;

/**
 * [isElementAtTop description]
 * Source: https://stackoverflow.com/a/16327815
 *         https://gist.github.com/davidtheclark/5515733
 *
 * @param  {[type]}  elem [description]
 * @return {Boolean}      [description]
 */

const isElementHalfWay = (elem) => {
  const rect = elem.getBoundingClientRect();
  const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0) / 2;
  // console.log(`Top: ${rect.top}`);
  // console.log(`Viewport: ${(divHeight + vh) * -1}`);
  return (rect.top < vh);
};

export default isElementHalfWay;

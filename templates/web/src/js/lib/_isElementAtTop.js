/**
 * [isElementAtTop description]
 * Source: https://stackoverflow.com/a/16327815
 *         https://gist.github.com/davidtheclark/5515733
 *
 * @param  {[type]}  elem [description]
 * @return {Boolean}      [description]
 */

const isElementAtTop = (elem, offset = 0) => {
  const rect = elem.getBoundingClientRect();
  // const navHeight = getComputedStyle(document.documentElement).getPropertyValue('--nav-height').replace('rem', '') * 16;
  // console.log(rect.top);

  return (rect.top <= (0 + offset));
};

export default isElementAtTop;

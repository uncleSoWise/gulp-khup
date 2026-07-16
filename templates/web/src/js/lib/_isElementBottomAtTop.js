/**
 */

const isElementBottomAtTop = (elem, offset = 0) => {
  const rect = elem.getBoundingClientRect();
  // const offset1 = window.innerHeight * offset;

  return (rect.bottom <= (0 + offset));
};

export default isElementBottomAtTop;

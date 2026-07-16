import toggle from './lib/_toggle';
import sliders from './lib/_sliders';

document.onreadystatechange = () => {
  switch (document.readyState) {
    case 'loading':
      // The document is still loading.
      break;
    case 'interactive':
      // The document has finished loading. We can now access the DOM elements.
      // But sub-resources such as images, stylesheets and frames are still loading.
      break;
    case 'complete':
      // The page is fully loaded.
      toggle();
      sliders();
      document.querySelector('html').classList.remove('no-js');
      document.querySelector('body').classList.remove('preload');
      break;
    default:
      break;
  }
};

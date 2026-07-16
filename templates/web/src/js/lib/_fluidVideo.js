/**
 * Grabs all iframes from the page.
 *
 * @return {Array}
 */

const captureAllVideos = () => {
  return Array.from(document.getElementsByTagName('iframe'));
};

/**
 * Calculates all aspect ratios for all iframes on the page.
 *
 * @param {Array} video
 * @return {Array | null}
 */

const captureAspectRatio = (video) => {
  if (video !== undefined) {
    const str = video.parentElement;
    if (str.classList.contains('carousel__media-wrap')) {
      return 0.322222;
    }
    return video.height / video.width;
  }
  return null;
};

/**
 * Removes inline width and height from iframes.
 *
 * @param {Array} video
 * @return {Array}
 */

const removeAttributes = (video) => {
  video.removeAttribute('width');
  video.removeAttribute('height');
  return video;
};

/**
 * Responsible for calculating new widths and heights for each video
 * while maintaining the aspect ratios returned from @function captureAspectRatio
 */

const calculateNewVideoDimensions = () => {
  const originalVideos = captureAllVideos();
  originalVideos.forEach((video) => {
    const aspectRatios = captureAspectRatio(video);
    removeAttributes(video);

    const fluidContainers = video.parentElement;

    let fluidVideoContainerWidths;
    if (fluidContainers !== null) {
      fluidVideoContainerWidths = fluidContainers.offsetWidth;
    }

    video.setAttribute('width', fluidVideoContainerWidths);
    video.setAttribute('height', fluidVideoContainerWidths * aspectRatios);
  });
};

/**
 * Fires when the browser window is re-sized.
 * This is the function to be exported for use in theme.js
 */

const fluidVideo = () => {
  window.addEventListener('load', calculateNewVideoDimensions, false);
  window.addEventListener('resize', calculateNewVideoDimensions, false);
  window.addEventListener('fullscreenchange', calculateNewVideoDimensions, false);
  window.addEventListener('webkitfullscreenchange', calculateNewVideoDimensions, false);
  window.addEventListener('mozfullscreenchange', calculateNewVideoDimensions, false);
  window.addEventListener('MSFullscreenChange', calculateNewVideoDimensions, false);
};

export default fluidVideo;

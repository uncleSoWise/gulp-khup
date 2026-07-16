import Swiper from 'swiper/bundle';

const sliders = () => {
  if (!document.querySelectorAll('.js-swiper').length > 0) return false;
  const html = document.querySelector('html');
  const carousels = Array.from(html.querySelectorAll('.js-swiper'));

  // eslint-disable-next-line max-len
  const disableAutoplay = window.matchMedia('(prefers-reduced-motion: reduce)') === true
    || window.matchMedia('(prefers-reduced-motion: reduce)').matches === true;

  const initPlayPause = (carousel, slider, pauseButtonClass, jumpOnPlay = false) => {
    if (!carousel.querySelector(`.${pauseButtonClass}`)) return;
    const pauseButton = carousel.querySelector(`.${pauseButtonClass}`);
    pauseButton.addEventListener('click', () => {
      if (slider.autoplay.running) {
        slider.autoplay.stop();
        pauseButton.classList.add(`${pauseButtonClass}--paused`);
        pauseButton.querySelector('.screen-reader-text').textContent = 'Play';
        pauseButton.setAttribute('aria-pressed', 'true');
      } else {
        slider.autoplay.start();
        if (jumpOnPlay) {
          slider.slideNext();
        }
        pauseButton.classList.remove(`${pauseButtonClass}--paused`);
        pauseButton.querySelector('.screen-reader-text').textContent = 'Pause';
        pauseButton.setAttribute('aria-pressed', 'false');
      }
    });
    // Dont use autoplay
    if (disableAutoplay) {
      pauseButton.click();
    }
  };



  carousels.forEach((carousel) => {
    if (carousel.classList.contains('cover-slider')) {
      const page = carousel.querySelector('.swiper-pagination');
      const reel = new Swiper(carousel, {
        init: false,
        direction: 'horizontal',
        loop: false,
        centeredSlides: false,
        spaceBetween: 0,
        slidesPerView: 1,
        pagination: {
          el: page,
          type: 'bullets',
          clickable: true
        },
        autoplay: {
          delay: 8000,
          disableOnInteraction: false
        },
        on: {
          afterInit: (slider) => {
            initPlayPause(carousel, slider, 'cover-slider__pause', true);
          }
        }
      });
      reel.init();
    }



    if (carousel.classList.contains('cast__list')) {
      const page = carousel.querySelector('.swiper-pagination');
      const castSlider = new Swiper(carousel, {
        init: false,
        direction: 'horizontal',
        // effect: 'fade',
        loop: false,
        centeredSlides: false,
        speed: 1000,
        spaceBetween: 30,
        slidesPerView: 1.5,
        watchSlidesProgress: true,
        navigation: {
          nextEl: carousel.querySelector('.swiper-button-next'),
          prevEl: carousel.querySelector('.swiper-button-prev')
        },
        pagination: {
          el: page,
          type: 'bullets',
          clickable: true,
          dynamicBullets: true,
          dynamicMainBullets: 4
        },
        breakpoints: {
          1280: {
            slidesPerView: 'auto'
          },
        }
      });
      castSlider.init();

      // Disable/enable castSlider at 1280px
      const handleCastSliderToggle = () => {
        if (window.innerWidth >= 1280) {
          castSlider.disable();
        } else {
          castSlider.enable();
        }
      };

      // Initial check
      handleCastSliderToggle();

      // Re-check on resize
      window.addEventListener('resize', handleCastSliderToggle);
    }
  });

  return null;
};

export default sliders;

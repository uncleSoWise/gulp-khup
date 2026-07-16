import * as basicLightbox from 'basiclightbox';

const modal = () => {
  if (!document.querySelectorAll('[class*="modal-trigger"]').length > 0) return false;
  const html = document.querySelector('html');
  const modalButtons = Array.from(html.querySelectorAll('.modal-trigger'));

  function createModal() {

    const target = this.getAttribute('rel');
    const instance = basicLightbox.create(html.querySelector(`${target}`), {
      onShow: () => {
        // document.body.style.position = 'fixed';
        // document.body.style.top = `-${scroll}px`;
        // document.querySelector('.content').style.width = '100vw';
        html.classList.add('modal--is-active');
      },
      onClose: () => {
        // const scrollY = document.body.style.top;
        // document.body.style.position = '';
        // document.body.style.top = '';
        // document.querySelector('.content').style.width = '';
        // window.scrollTo(0, parseInt(scrollY || '0') * -1);
        html.classList.remove('modal--is-active');
      }
    });
    instance.show();

    document.querySelector('.basicLightbox .icon--close').addEventListener('click', () => {
      instance.close();
    });
    return null;
  }



  modalButtons.forEach((modalButton) => {
    modalButton.addEventListener('click', (e) => {
      createModal(e);
    });
  });

  return null;
};

export default modal;

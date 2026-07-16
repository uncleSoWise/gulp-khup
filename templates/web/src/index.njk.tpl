{% extends "<%= inSubFolder %>_layout.njk" %}

{# HEAD meta #}
{% set page_title = "<%= appName %> - [<%= appVersion %>]" %}
{% set page_desc = "<%= appDescription %>" %}

{# page content #}
{% set body_class = 'home' %}
{% set site_tag = 'h1' %}

{% block content %}
    <section class="cover-slider js-swiper">
      <div class="cover-slider__wrap swiper-wrapper">
        <div class="cover-slider__item swiper-slide">
          <div class="cover-slider__banner">
            <img width="1600" height="900" src="https://placehold.co/1600x900/orange/white" class="cover-slider__image" alt="" loading="eager" decoding="async" />
          </div>

          <div class="cover-slider__content">
            <h1 class="cover-slider__headline h3">Headline</h1>
            <div class="cover-slider__copy">
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc auctor tristique arcu eu eleifend.</p>
            </div>

            <div class="cover-slider__buttons button-theme__group">
              <a class="cover-slider__button button-theme" href="#" >Button 1</a>
              <a class="cover-slider__button button-theme button-theme--secondary" href="#" >Button 2</a>
            </div>
          </div>
        </div>

        <div class="cover-slider__item swiper-slide">
          <div class="cover-slider__banner">
            <img width="1600" height="900" src="https://placehold.co/1600x900/red/white" class="cover-slider__image" alt="" loading="eager" decoding="async" />
          </div>

          <div class="cover-slider__content">
            <h1 class="cover-slider__headline h3">Headline</h1>
            <div class="cover-slider__copy">
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc auctor tristique arcu eu eleifend.</p>
            </div>

            <div class="cover-slider__buttons button-theme__group">
              <a class="cover-slider__button button-theme" href="#" >Button 1</a>
              <a class="cover-slider__button button-theme button-theme--secondary" href="#" >Button 2</a>
            </div>
          </div>
        </div>
      </div>

      <div class="cover-slider__nav">
        <div class="swiper-pagination"></div>
        <button class="cover-slider__pause" aria-pressed="false" aria-label="Play/Pause slideshow">
          <span class="screen-reader-text">Pause</span>
          <svg class="icon icon--play-pause" aria-labelledby="title-68dafadfce6a5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 9 11" width="9" height="11"><title id="title-68dafadfce6a5">Pause / Play</title><g class="icon--play-pause--pause" fill="currentColor"><path d="M0 0h4v11H0zm5 0h4v11H5z"/></g><g class="icon--play-pause--play"><path fill="currentColor" d="M0 5.21v5.21l.08-.05c.35-.21 7.49-4.33 8.13-4.69.61-.35.81-.47.8-.49-.01-.01-1.34-.78-2.96-1.72C4.42 2.55 2.42 1.39 1.59.91S.06.03.04.02L0 0v5.21Z"/></g></svg>
        </button>
      </div>
    </section>


    <section class="hero">
      <div class="hero__wrap">
        <div class="hero__banner">
          <img class="hero__image" src="" alt="" />
        </div>
        <div class="hero__content">
          <h2 class="hero__headline">A headline goes here</h2>
          <div class="hero__copy">
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc auctor tristique arcu eu eleifend. Nulla facilisi. Ut ut diam ex. Maecenas eget est purus. Sed id mi a ex iaculis lacinia. Cras tortor leo, varius ac massa sit amet, faucibus rhoncus eros. Cras rutrum tincidunt dui, sed efficitur magna consequat ut. Ut nec nisl quis magna efficitur vestibulum. Nam nec nisl in risus egestas tincidunt. Proin eu lacinia purus. Nullam dolor ante, tristique id purus nec, elementum luctus dolor.</p>
            <p>Vivamus sit amet ullamcorper risus. Integer urna est, eleifend in libero sit amet, sagittis consequat ex. Ut ac eros eu enim finibus convallis ut vitae magna. Sed dui neque, pellentesque ut eros at, tincidunt ultricies tortor. Ut et pellentesque mi. Maecenas et dapibus nibh. Donec gravida fringilla massa. Nulla eros magna, auctor id risus quis, pretium volutpat turpis. In ullamcorper magna erat, in sollicitudin dui aliquam a. Curabitur rutrum vulputate ullamcorper. Vestibulum volutpat metus in urna congue gravida. Nullam luctus erat in commodo fringilla. Vestibulum a leo vitae nisi finibus maximus non eget felis. Quisque vitae cursus lorem. Proin et leo ut augue vehicula fermentum non a nibh. Quisque erat libero, tristique eu mauris non, bibendum sodales leo.</p>
            <p>Praesent consequat suscipit ex a bibendum. Vestibulum non velit mauris. Morbi cursus a ipsum quis maximus. Praesent consectetur at tellus finibus molestie. Nunc pretium ullamcorper enim, sit amet mattis est auctor quis. Proin iaculis ipsum arcu, nec semper tellus aliquam et. Ut nec efficitur sapien. Curabitur sollicitudin neque quis ex pharetra euismod. Nullam orci est, iaculis et tellus ut, imperdiet suscipit nisi. Nulla porttitor justo commodo lobortis posuere. Curabitur condimentum urna vestibulum vulputate molestie. Quisque non sapien quis neque gravida ullamcorper. In congue luctus lectus, vitae consequat leo pellentesque vitae. Duis risus erat, tempus dictum nunc at, pulvinar tincidunt massa.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="intro">
      <h2 class="intro__headline">A short headline</h2>
      <div class="intro__content">
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer aliquam ornare eros. Nam quis volutpat sem. Proin purus justo, sollicitudin sed leo eget, lobortis consequat ipsum. Vestibulum sem eros, suscipit ac justo vitae, eleifend aliquet turpis. Suspendisse justo risus, consectetur et eros vitae, dapibus accumsan dui. Aenean nec leo diam. Sed imperdiet lacus quam, nec tempus magna varius et. Quisque fringilla arcu eget massa ornare ornare at nec ex.</p>
        <a class="button button--primary" href="#">Button Text</a>
      </div>
    </section>
{% endblock %}

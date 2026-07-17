<!DOCTYPE html>
<html <?php language_attributes(); ?> class="no-js">
<head>
  <?php if ( function_exists('get_field') ) { echo get_field( 'code_head', 'options' ) . "\n"; } ?>

  <meta charset="<?php bloginfo( 'charset' ); ?>" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <link rel="profile" href="http://gmpg.org/xfn/11" />

  <?php wp_head(); ?>
</head>

<body <?php body_class(); ?>>
  <?php if ( function_exists('get_field') ) { echo get_field( 'code_after_open_body', 'options' ) . "\n"; } ?>

  <a id="top" class="screen-reader-text" href="#content"><?php esc_html_e( 'Skip to content', '<%= appSlug %>' ); ?></a>

  <nav id="js-nav" class="nav">
    <div class="nav__wrap">

      <div class="nav__controls">
        <div class="nav__logo">
          <a class="nav__logo-link" href="<?php echo esc_url( home_url( '/' ) ); ?>" rel="home">
            <?php bloginfo( 'name' ); ?>
          </a>
        </div>

        <?php $description = get_bloginfo( 'description', 'display' );
        if ( $description || is_customize_preview() ) { ?>
          <p class="site-description"><?php echo $description; ?></p>
        <?php } ?>

        <button class="nav__toggle hamburger hamburger--squeeze" id="js-nav__toggle" data-html-class="nav--is-active" type="button" aria-label="Menu" aria-controls="js-navigation">
          <span class="hamburger-box">
            <span class="hamburger-inner"></span>
          </span>
        </button>
      </div>

      <div id="js-navigation" class="nav__options">
        <?php wp_nav_menu( array(
          'theme_location' => 'main-menu',
          'container'      => false,
          'menu_class'     => 'nav__list',
          'depth'          => 2,
          'walker'         => new Walker_Nav_Menu_Custom('nav__'),
        ) ); ?>
      </div>

    </div>
  </nav>

  <main id="content" class="content" role="main">

<?php
/*------------------------------------*\
  ASSETS
\*------------------------------------*/

/*
 * Register one or many Google fonts for theme use
 *
 * @return string
 */
function <%= appSlug %>_font_url() {
  $font_url = add_query_arg(
    array(
      'family' => 'Merriweather:300,400,700|Montserrat:400,400i,600,600i',
      'display' => 'swap',
    ), '//fonts.googleapis.com/css' );
  return $font_url;
}



/*
 * Enqueue scripts and styles for the front end.
 *
 * @return void
 */
function <%= appSlug %>_enqueue_assets() {
  // Add Google fonts — remove or replace per project.
  wp_enqueue_style( 'main-fonts', <%= appSlug %>_font_url(), array(), null );
  // Load our main stylesheet.
  wp_enqueue_style( 'main-css', get_template_directory_uri() . '/css/theme.css', array(), wp_get_theme()->get('Version') );
  // Load our main script.
  wp_enqueue_script( 'main-script', get_template_directory_uri() . '/js/theme.js', array(), wp_get_theme()->get('Version'), true );
}
add_action( 'wp_enqueue_scripts', '<%= appSlug %>_enqueue_assets' );



/**
 * Defer parsing of JavaScript
 */
function <%= appSlug %>_defer_parsing_of_js( $tag, $handle, $src ) {
  $defer_exclude1 = '';
  $array_with_values[] = $defer_exclude1;

  $array_with_values = array_filter( $array_with_values ); // remove empty entries

  if ( ! in_array( $handle, $array_with_values ) ) {
    return '<script src="' . $src . '" defer="defer" type="text/javascript"></script>' . "\n";
  }
  return $tag;
}
if ( ! is_admin() && (!strpos($_SERVER['REQUEST_URI'], 'gf_page=select_columns') > 0) ) {
  add_filter( 'script_loader_tag', '<%= appSlug %>_defer_parsing_of_js', 10, 3 );
}



/*
 * Critical Inline CSS helper
 *
 * @return null
 */
function <%= appSlug %>_critical_inline_styles() {
  if(!is_admin()){

    require_once(ABSPATH . 'wp-admin/includes/file.php');
    WP_Filesystem();
    global $wp_filesystem;

    $css_path = get_template_directory() . '/css/theme.inline.css';
    $file_contents = $wp_filesystem->get_contents( $css_path );

    $find = array('../img/', '../fonts/', "\n", "\r", '@charset "UTF-8";');
    $replace = array(get_template_directory_uri() . '/img/', get_template_directory_uri() . '/fonts/', '', '', '');
    $file_contents = str_replace($find, $replace, $file_contents);

    echo "\n<style id=\"critical-css\">" . $file_contents . "</style>\n";
  }
}
add_action( 'wp_head', '<%= appSlug %>_critical_inline_styles' );



/*
 * Custom Login Page
 *  - load custom stylesheet
 *  - update link URL on login banner image
 *  - update title text on login banner image
 */
function <%= appSlug %>_custom_login_css() {
  echo '<link rel="stylesheet" type="text/css" href="'.get_stylesheet_directory_uri().'/css/login.css" />';
}
add_action('login_head', '<%= appSlug %>_custom_login_css');
function <%= appSlug %>_loginpage_custom_link() {
  return home_url( '/' );
}
add_filter('login_headerurl','<%= appSlug %>_loginpage_custom_link');
function <%= appSlug %>_change_title_on_logo() {
  return 'Visit the ' . esc_attr( get_bloginfo( 'name', 'display' ) ) . ' Website';
}
add_filter('login_headertext', '<%= appSlug %>_change_title_on_logo');



/*------------------------------------*\
  IMAGES
\*------------------------------------*/

/*
 * Theme setup: supports, menus, image sizes
 */
function <%= appSlug %>_theme_setup() {
  // Add Menus to theme
  add_theme_support( 'menus' );

  // Add Featured Images to Posts (and post-type's)
  add_theme_support( 'post-thumbnails' );

  // Add theme support for the title tag
  add_theme_support( 'title-tag' );

  // Add theme support for feeds
  add_theme_support( 'automatic-feed-links' );

  // WP 6.0+ block editor support
  add_theme_support( 'editor-styles' );
  add_theme_support( 'wp-block-styles' );
  add_theme_support( 'responsive-embeds' );

  // Switch default core markup to valid HTML5.
  add_theme_support('html5', array(
    'search-form', 'comment-form', 'comment-list', 'script', 'style'
  ));

  //Set the content-width
  if ( ! isset( $content_width ) ) $content_width = 900;

  update_option('medium_large_size_w',800);
  update_option('medium_large_size_h',800);
  // Add theme image sizes
  add_image_size('1600px-wide', 1600, '', true);
  add_image_size('1400px-wide', 1400, '', true);
  add_image_size('1200px-wide', 1200, '', true);
  add_image_size('600px-wide', 600, '', true);
  add_image_size('400px-wide', 400, '', true);
  add_image_size('200px-wide', 200, '', true);
}
add_action( 'after_setup_theme', '<%= appSlug %>_theme_setup' );



/**
 * Remove the non proportionate sizes from the srcset.
 */
function only_proportionate_sizes_srcset_function( $image_meta, $size_array, $image_src ) {
  if( !is_array( $image_meta ) ) {
    return $image_meta;
  }
  $customSizes = [
    'hero',
  ];

  foreach($customSizes as $size) {
    if( !empty( $image_meta['sizes'] ) && !empty( $image_meta['sizes'][$size] ) ) {
      unset( $image_meta['sizes'][$size] );
    }
  }
  return $image_meta;
}
add_filter( 'wp_calculate_image_srcset_meta', 'only_proportionate_sizes_srcset_function', 10, 3 );



/*
 * Add Image Size Names
 */
function <%= appSlug %>_custom_image_sizes_choose( $sizes ) {
  $custom_sizes = array(
    '1600px-wide' => '1600px Wide',
    '1400px-wide' => '1400px Wide',
    '1200px-wide' => '1200px Wide',
    '600px-wide' => '600px Wide',
    '400px-wide' => '400px Wide',
    '200px-wide' => '200px Wide'
  );
  return array_merge( $sizes, $custom_sizes );
}
add_filter( 'image_size_names_choose', '<%= appSlug %>_custom_image_sizes_choose' );



/*
 * Link Images to None by default
 */
function <%= appSlug %>_link_images_to_none() {
  $image_set = get_option('image_default_link_type');
  if($image_set !== 'none'){
    update_option('image_default_link_type', 'none');
  }
}
add_action('admin_init', '<%= appSlug %>_link_images_to_none', 10);



/*------------------------------------*\
  WORDPRESS CONFIG
\*------------------------------------*/

/*
 * Register Navigation Menus
 */
function <%= appSlug %>_register_menus() {
  register_nav_menus(array(
    'main-menu'   => __('Main Menu', '<%= appSlug %>'),
    'footer-menu' => __('Footer Menu', '<%= appSlug %>'),
    'social-menu' => __('Social Menu', '<%= appSlug %>'),
  ));
}
add_action('init', '<%= appSlug %>_register_menus');



/*
 * Register a sidebar area for widgets
 */
function <%= appSlug %>_widgets_init() {
  register_sidebar( array(
    'name'          => __( 'Main Sidebar', '<%= appSlug %>' ),
    'id'            => 'main-sidebar',
    'description'   => __( 'The main sidebar used throughout the site', '<%= appSlug %>' ),
    'before_widget' => '',
    'after_widget'  => '',
    'before_title'  => '',
    'after_title'   => '',
  ));
}
add_action( 'widgets_init', '<%= appSlug %>_widgets_init' );



/**
 * Remove junk header tags
 */
remove_action( 'wp_head', 'adjacent_posts_rel_link_wp_head' );
remove_action( 'wp_head', 'wlwmanifest_link' );
remove_action( 'wp_head', 'rsd_link' );
remove_action( 'wp_head', 'wp_shortlink_wp_head' );
remove_action( 'wp_head', 'wp_generator' );
remove_action( 'wp_head', 'print_emoji_detection_script', 7 );
remove_action( 'admin_print_scripts', 'print_emoji_detection_script' );
remove_action( 'wp_print_styles', 'print_emoji_styles' );
remove_action( 'admin_print_styles', 'print_emoji_styles' );



/**
 * Dequeue default block / plugin styles we don't need
 */
function <%= appSlug %>_dequeue_default_styles() {
  wp_dequeue_style( 'wp-block-library' );
  wp_deregister_style( 'wp-block-library' );
  wp_dequeue_style( 'wp-block-library-theme' );
  wp_deregister_style( 'wp-block-library-theme' );
  wp_dequeue_style( 'classic-theme-styles' );
  wp_deregister_style( 'classic-theme-styles' );
  wp_dequeue_style( 'global-styles' );
  wp_deregister_style( 'global-styles' );
}
add_action( 'wp_print_styles', '<%= appSlug %>_dequeue_default_styles' );



/*
 * Remove Customize options from WP admin bar
 */
function <%= appSlug %>_before_admin_bar_render(){
  global $wp_admin_bar;
  $wp_admin_bar->remove_menu('customize');
}
add_action( 'wp_before_admin_bar_render', '<%= appSlug %>_before_admin_bar_render' );



/**
 * Add "Styles" drop-down to Classic Editor TinyMCE
 */
function tuts_mce_editor_buttons( $buttons ) {
  array_unshift( $buttons, 'styleselect' );
  return $buttons;
}
add_filter( 'mce_buttons_2', 'tuts_mce_editor_buttons' );

function tuts_mce_before_init( $settings ) {
  $settings['block_formats'] = 'Paragraph=p;Heading 2=h2;Heading 3=h3;Heading 4=h4;Heading 5=h5;Heading 6=h6;';

  $style_formats = array(
    array( 'title' => 'Button style', 'selector' => 'a', 'classes' => 'button-theme' ),
    array( 'title' => 'H2 style (36px)', 'selector' => 'h2,h3,h4,h5,h6', 'classes' => 'h2' ),
    array( 'title' => 'H3 style (26px)', 'selector' => 'h2,h3,h4,h5,h6', 'classes' => 'h3' ),
    array( 'title' => 'H4 style (22px)', 'selector' => 'h2,h3,h4,h5,h6', 'classes' => 'h4' ),
    array( 'title' => 'H5 style (16px)', 'selector' => 'h2,h3,h4,h5,h6', 'classes' => 'h5' ),
    array( 'title' => 'H6 style (12px)', 'selector' => 'h2,h3,h4,h5,h6', 'classes' => 'h6' ),
    array( 'title' => 'Medium',   'block' => 'p', 'classes' => 'fw-medium' ),
    array( 'title' => 'Semibold', 'block' => 'p', 'classes' => 'fw-semibold' ),
    array( 'title' => 'Extrabold','block' => 'p', 'classes' => 'fw-extrabold' ),
  );
  $settings['style_formats'] = json_encode( $style_formats );
  return $settings;
}
add_filter( 'tiny_mce_before_init', 'tuts_mce_before_init' );

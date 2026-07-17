<?php
/**
 * Allowed Block types are managed in the admin
 */
function <%= appSlug %>_allowed_block_types( $allowed_block_types, $editor_context ) {
  $allowed_block_types = array(
    // 'core/paragraph',
    // 'core/heading',
    // 'core/list',
    // 'core/classic',
    // 'core/image',
    // 'core/cover',
    // 'core/file',
    // 'core/media-text',
    // 'core/video',
    // 'core/buttons',
    // 'core/columns',
    // 'core/group',
    // 'core/separator',
    // 'core/spacer',
    // 'core/freeform',
    // 'core/html',
    'core/embed',
    // 'core/shortcode',

    // 'acf/hero',
  );
  if ( is_object( $editor_context->post ) && ( $editor_context->post->post_type == 'post' ) ) {
    $allowed_block_types = array(
      'core/paragraph',
      'core/heading',
      'core/list',
      'core/image',
      'core/file',
      'core/embed',
      'core/quote'
    );
  }

  return $allowed_block_types;
}

add_filter('allowed_block_types_all', '<%= appSlug %>_allowed_block_types', 10, 2);



/**
 * Enqueue CSS and JS for the block editor
 */
function <%= appSlug %>_gutenberg_assets() {
  wp_register_style( '<%= appSlug %>-block-styles', get_template_directory_uri() . '/css/editor-block-style.css', false );
  wp_enqueue_style( '<%= appSlug %>-block-styles' );

  wp_enqueue_script(
    '<%= appSlug %>-editor',
    get_stylesheet_directory_uri() . '/js/editor.js',
    array(
      'wp-element',
      'wp-hooks',
      'wp-blocks',
      'wp-edit-post',
      'wp-dom'
    ),
    wp_get_theme()->get('Version'),
    true
  );
}
add_action('enqueue_block_editor_assets', '<%= appSlug %>_gutenberg_assets');



/**
 * Block editor theme setup (colors, font sizes, etc.)
 * Source: https://richtabor.com/disable-gutenberg-colors/
 */
function <%= appSlug %>_gutenberg_setup()
{
  // add_theme_support( 'editor-font-sizes' );
  add_theme_support('disable-custom-font-sizes');
  add_theme_support('disable-custom-colors');
  add_theme_support('editor-color-palette');
}
add_action( 'after_setup_theme', '<%= appSlug %>_gutenberg_setup' );

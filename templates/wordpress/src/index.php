<?php
  get_header();
  $blog       = get_option( 'page_for_posts' );
  $term       = get_queried_object();
  $categories = get_terms( $term->taxonomy );
  $tax        = get_taxonomy( $term->taxonomy );
  $title      = single_term_title( '', false );
  $intro      = term_description();

  if ( is_home() ) {
    if ( function_exists('get_field') ) {
      $categories = get_field( 'category_dropdown', $blog );
      $tax        = get_taxonomy( 'category' );
      $title      = get_field( 'hero_title', $blog );
      $intro      = get_field( 'hero_copy', $blog );
    }
  }
?>

    <?php
    // TODO: replace these with your project's ACF field keys (found in ACF > Field Groups > Show Field Key)
    // Remove this block entirely if you are not using an acf/intro block on your blog page.
    $headline = goThroughBlocks( $blog, 'acf/intro', 'headline' );
    $copy     = goThroughBlocks( $blog, 'acf/intro', 'copy' );
    $block_content = '<!-- wp:acf/intro {
      "id": "block_YOUR_BLOCK_ID",
      "name": "acf/intro",
      "data":
      {
        "headline": "' . $headline . '",
        "_headline": "YOUR_FIELD_KEY",
        "copy": "' . $copy . '",
        "_copy": "YOUR_FIELD_KEY",
        "use_images": "0",
        "_use_images": "YOUR_FIELD_KEY"
      },
      "align": "full",
      "mode": "auto"
    } /-->';
    echo do_blocks($block_content); ?>

    <?php get_template_part('inc/loop'); ?>

    <?php pagination($paged, $wp_query->max_num_pages); ?>

<?php get_footer(); ?>

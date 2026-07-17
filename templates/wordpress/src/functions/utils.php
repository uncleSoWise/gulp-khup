<?php
if ( ! function_exists( 'pagination' ) ) {
  global $wp_query;
  function pagination( $paged = '', $max_page = '' ) {
    $big = 999999999; // need an unlikely integer

    if ( isset( $wp_query ) || ( isset( $max_page ) && $max_page > 1 ) ) {
      if ( !$paged ) { $paged = get_query_var('paged'); }
      if ( !$max_page ) { $max_page = $wp_query->max_num_pages; }
      echo '<div class="pagination">';
      echo paginate_links( array(
        'total'             => $max_page,
        'current'           => max( 1, $paged ),
        'base'              => str_replace( $big, '%#%', esc_url( get_pagenum_link( $big ) ) ),
        'prev_text'         => '&laquo;',
        'next_text'         => '&raquo;',
        'format'            => 'page/%#%/',
        'after_page_number' => ''
      ) );
      echo '</div>';
    }
  }
}



/**
 * Get field data from blocks on a given page
 */
function goThroughBlocks( $postId, $blockName, $field ) {
  $content = get_post_field('post_content', $postId);
  $blocks  = parse_blocks($content);
  $value = '';
  foreach( $blocks as $block ) {
    if(($block['blockName'] === $blockName) && array_key_exists('attrs', $block) && array_key_exists('data', $block['attrs'])) {
      $value = $block['attrs']['data'][$field];
    }
  }
  return $value;
}



/*
 * Check if on the login page
 */
function is_login_page() {
  return in_array($GLOBALS['pagenow'], array('wp-login.php', 'wp-register.php'));
}



/**
 * Check if current page is a given post type
 */
function is_post_type($type){
  global $wp_query;
  if($type == get_post_type($wp_query->post->ID)) return true;
  return false;
}



/*
 * Format phone number for visual display (123.456.7890)
 */
function phoneNumberFormatVisual($string){
  $result = '';
  $string = preg_replace("/[^0-9]/","",$string);
  $string = substr($string,0,10);
  if( preg_match( '/^(\d{3})(\d{3})(\d{4})$/', $string, $matches ) ) {
    $result = $matches[1] . '.' . $matches[2] . '.' . $matches[3];
  }
  return $result;
}



/*
 * Format phone number for tel: link
 */
function phoneNumberFormatTel($string){
  $result = '';
  $string = preg_replace("/[^0-9]/","",$string);
  $string = substr($string,0,10);
  $result = 'tel:+1' . $string;
  return $result;
}



/*
 * Get top most parent page ID
 */
function get_top_parent_id(){
  global $post;
  if ($post->post_parent) {
    $ancestors = get_post_ancestors($post->ID);
    $root = count($ancestors) - 1;
    $parent = $ancestors[$root];
  } else {
    $parent = $post->ID;
  }
  return $parent;
}

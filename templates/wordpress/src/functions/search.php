<?php
/*
 ##############################
 ########### Search ###########
 ##############################

  Source: https://gist.github.com/jserrao/d8b20a6c5c421b9d2a51

  Included are steps to help make this script easier for others to follow.
  All you have to do is add custom ACF post types into Step 1 and custom taxonomies into Step 10.
  XSS and SQL injection protection included.

  [list_searcheable_acf] — list all the custom fields to include in the search query
  @return [array] list of custom fields
*/

if ( function_exists('acf_get_field_groups') ) {

  // Define list of ACF fields to search through — do NOT include taxonomies here
  function list_searcheable_acf(){
    $options = array();

    $field_groups = acf_get_field_groups();
    foreach ( $field_groups as $group ) {
      $fields = get_posts(array(
        'posts_per_page'         => -1,
        'post_type'              => 'acf-field',
        'orderby'                => 'menu_order',
        'order'                  => 'ASC',
        'suppress_filters'       => true,
        'post_parent'            => $group['ID'],
        'post_status'            => 'any',
        'update_post_meta_cache' => false
      ));
      foreach ( $fields as $field ) {
        $options[] = $field->post_excerpt;
      }
    }

    $list_searcheable_acf = array_unique($options);
    return $list_searcheable_acf;
  }

} // end function_exists('acf_get_field_groups')

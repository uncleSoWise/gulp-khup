<?php
/*
 * Custom main nav menu walker
 * Copied from /wp-includes/nav-menu-template.php and updated
 * Preserves awesome helper classes, allows custom markup classes from BEM
 */
class Walker_Nav_Menu_Custom extends Walker_Nav_Menu {
  function __construct($css_class_prefix) {
    $this->css_class_prefix = $css_class_prefix;
    // Define menu item names appropriately
    $this->item_css_class_suffixes = array(
      'item'                      => 'menu-item',
      'parent_item'               => 'menu-item--parent',
      'active_item'               => 'menu-item--active',
      'parent_of_active_item'     => 'menu-item--parent--active',
      'ancestor_of_active_item'   => 'menu-item--ancestor--active',
      'link'                      => 'menu-link',
      'sub_menu'                  => 'submenu',
      'sub_menu_item'             => 'submenu-item',
      'sub_menu_link'             => 'submenu-link'
    );
  }



  // Check for children
  function display_element( $element, &$children_elements, $max_depth, $depth=0, $args, &$output ){
    $id_field = $this->db_fields['id'];
    if ( is_object( $args[0] ) ) {
      $args[0]->has_children = !empty( $children_elements[$element->$id_field] );
    }
    return parent::display_element( $element, $children_elements, $max_depth, $depth, $args, $output );
  }



  function start_lvl(&$output, $depth = 1, $args=array()) {
      $real_depth = $depth + 1;
      $indent = str_repeat("\t", $real_depth + 3);
      $prefix = $this->css_class_prefix;
      $suffix = $this->item_css_class_suffixes;

      $classes = array(
        $prefix . $suffix['sub_menu'],
        $prefix . $suffix['sub_menu']. '--' . $real_depth
      );

      $class_names = implode( ' ', $classes );

      // Add a ul wrapper to sub nav
      $output .= "\n" . $indent . '<ul class="'. $class_names .'">' ."\n";
  }



  // Add main/sub classes to li's and links
  function start_el( &$output, $item, $depth = 0, $args = array(), $id = 0 ) {

    global $wp_query;

    $indent = ( $depth > 0 ? str_repeat( "\t", $depth + 4 ) : str_repeat( "\t", $depth + 3 ) );

    $prefix = $this->css_class_prefix;
    $suffix = $this->item_css_class_suffixes;

    // Item classes
    $item_classes =  array(
      'item_class'                  => $depth == 0                                       ? $prefix . $suffix['item'] : '',
      'parent_class'                => $args->has_children                               ? $parent_class = $prefix . $suffix['parent_item'] : '',
      'active_menu_class'           => in_array("current-menu-item", $item->classes)     ? $prefix . $suffix['active_item'] : '',
      'active_menu_parent_class'    => in_array("current-menu-parent", $item->classes)   ? $prefix . $suffix['parent_of_active_item'] : '',
      'active_menu_ancestor_class'  => in_array("current-menu-ancestor", $item->classes) ? $prefix . $suffix['ancestor_of_active_item'] : '',
      'active_page_class'           => in_array("current-page-item", $item->classes)     ? $prefix . $suffix['active_item'] : '',
      'active_page_parent_class'    => in_array("current-page-parent", $item->classes)   ? $prefix . $suffix['parent_of_active_item'] : '',
      'active_page_ancestor_class'  => in_array("current-page-ancestor", $item->classes) ? $prefix . $suffix['ancestor_of_active_item'] : '',
      'depth_class'                 => $depth >= 1                                       ? $prefix . $suffix['sub_menu_item'] . ' ' . $prefix . $suffix['sub_menu'] . '--' . $depth . '-item' : '',
      'item_id_class'               => $prefix . 'item--'. $item->object_id
    );

    $class_string = implode("  ", array_filter($item_classes));

    $output .= $indent . '<li class="' . $class_string . '">';

    // Link classes
    $link_classes = array(
      'item_link'   => $depth == 0 ? $prefix . $suffix['link'] : '',
      'depth_class' => $depth >= 1 ? $prefix . $suffix['sub_menu_link'] : ''
    );
    $link_class_string = implode("  ", array_filter($link_classes));
    $link_class_output = 'class="' . $link_class_string . '"';

    // link attributes
    $attributes  = ! empty($item->attr_title) ? ' title="'  . esc_attr($item->attr_title) .'"' : '';
    $attributes .= ! empty($item->target)     ? ' target="' . esc_attr($item->target    ) .'"' : '';
    $attributes .= ! empty($item->xfn)        ? ' rel="'    . esc_attr($item->xfn       ) .'"' : '';
    $attributes .= ! empty($item->url) && $item->xfn != 'no-click' ? ' href="' . esc_attr($item->url) .'"' : '';

    if ( $item->title == 'Search' ) {
      $item_output = get_search_form( false );
    } else {
      $item_output = $args->before;
      $item_output .= '<a' . $attributes . ' ' . $link_class_output . '>';
      $item_output .=   $args->link_before;
      $item_output .= apply_filters('the_title', $item->title, $item->ID);
      $item_output .=   $args->link_after;
      $item_output .=   $args->after;
      $item_output .= '</a>';
    }

    $output .= apply_filters('walker_nav_menu_start_el', $item_output, $item, $depth, $args);
  }



  function end_el( &$output, $item, $depth = 0, $args = array() ) {
    $indent = str_repeat( "\t", $depth + 3 );
    $output .= "$indent</li>\n";
  }



  function end_lvl( &$output, $depth = 0, $args = array() ) {
    $indent = str_repeat( "\t", $depth + 4 );
    $output .= "$indent</ul>\n";
  }
}

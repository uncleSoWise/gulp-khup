<?php
/*------------------------------------*\
  Advanced Custom Fields
\*------------------------------------*/

if ( function_exists('get_field') ) {

  /**
   * Move the content editor into an acf tab (optional — uncomment to enable)
   */
  function <%= appSlug %>_acf_admin_head() { ?>
    <style type="text/css">
      .acf-field #wp-content-editor-tools {
        background: transparent;
        padding-top: 0;
      }
    </style>
  <?php }
  // add_action('acf/input/admin_head', '<%= appSlug %>_acf_admin_head');

} // end function_exists('get_field')



/*------------------------------------*\
  Gravity Forms
\*------------------------------------*/

if ( class_exists('GFForms') ) {

  /**
   * Enable hidden choice in Field Label Visibility settings
   */
  add_filter( 'gform_enable_field_label_visibility_settings', '__return_true' );

  /**
   * Disable the confirmation anchor scroll
   */
  add_filter( 'gform_confirmation_anchor', '__return_false' );

  /**
   * Convert submit input to a button element
   */
  function <%= appSlug %>_make_submit_input_into_a_button_element($button_input, $form) {
    preg_match("/<input([^\/>]*)(\s\/)*>/", $button_input, $button_match);
    $button_attrs = $button_match[1];
    $button_attrs = preg_replace('/type="[^"]*"/', '', $button_attrs);
    $button_attrs = preg_replace('/value="([^"]*)"/', '', $button_attrs);
    preg_match('/value="([^"]*)"/', $button_match[1], $value_match);
    $value = isset($value_match[1]) ? $value_match[1] : __('Submit', '<%= appSlug %>');
    return '<button ' . $button_attrs . '>' . $value . '</button>';
  }
  add_filter('gform_submit_button', '<%= appSlug %>_make_submit_input_into_a_button_element', 10, 2);

} // end class_exists('GFForms')

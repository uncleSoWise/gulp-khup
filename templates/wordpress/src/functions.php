<?php

/*------------------------------------*\
  External Modules/Files
\*------------------------------------*/

require_once(get_template_directory() . '/functions/walkers/Walker_Nav_Menu_Custom.php');

require_once(get_template_directory() . '/functions/config.php');
require_once(get_template_directory() . '/functions/gutenberg.php');
require_once(get_template_directory() . '/functions/plugins.php');
require_once(get_template_directory() . '/functions/search.php');
require_once(get_template_directory() . '/functions/utils.php');


/*------------------------------------*\
  Add theme specific functions below
\*------------------------------------*/
function stop_404_guessing() {
  if (is_404()) {
    remove_action( 'template_redirect', 'redirect_canonical' );
  }
}
add_action( 'wp', 'stop_404_guessing' );

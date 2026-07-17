  </main>
  <footer id="footer" class="footer" role="contentinfo">
    <p>
      <?php wp_nav_menu( array(
        'theme_location' => 'footer-menu',
        'container'      => false,
        'items_wrap'     => '%3$s',
        'depth'          => 0,
      ) ); ?>
      <span class="copyright">&copy; <?php _e( 'Copyright', '<%= appSlug %>' ); ?> <?php echo date('Y') ?> <?php bloginfo( 'name' ); ?> &mdash; <span class="no-wrap"><?php _e( 'All rights reserved.', '<%= appSlug %>' ); ?></span></span>
    </p>
    <?php wp_nav_menu( array( 'theme_location' => 'social-menu', 'container' => false, 'menu_class' => 'social', 'depth' => 1 ) ); ?>
  </footer>
  <?php wp_footer(); ?>
  <?php if ( function_exists('get_field') ) { echo "\n" . get_field( 'code_before_close_body', 'options' ) . "\n"; } ?>
</body>
</html>

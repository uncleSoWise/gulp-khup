<?php get_header(); ?>
      <section class="main clearfix" role="main">
        <article id="post-404" <?php post_class(); ?>>
          <h1 class="page-title"><?php _e( 'Page not found', '<%= appSlug %>' ); ?></h1>
          <div class="post-content">
            <p><?php _e( 'Apologies, but the page you requested could not be found. Perhaps searching will help.', '<%= appSlug %>' ); ?></p>
            <?php
              get_search_form();
              echo '<script>document.getElementById(\'s\') && document.getElementById(\'s\').focus();</script>' . PHP_EOL;
            ?>
          </div>
        </article>
      </section>
<?php get_sidebar(); ?>
<?php get_footer(); ?>

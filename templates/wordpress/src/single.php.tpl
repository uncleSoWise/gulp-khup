<?php
  get_header();
  the_post();
?>
      <section class="main clearfix" role="main">
        <article id="post-<?php the_ID(); ?>" <?php post_class('entry'); ?>>
          <h1 class="entry__title"><?php the_title(); ?></h1>
          <p class="entry__meta"><span class="date"><?php the_time('M j, Y'); ?></span></p>
          <div class="entry__content">
            <?php if ( has_post_thumbnail() ) : ?>
              <?php the_post_thumbnail( '800px-wide', array('class' => 'entry__image') ); ?>
            <?php endif; ?>
            <?php the_content(); ?>
          </div>
          <p class="entry__tags"><?php the_tags( __( 'Tags: ', '<%= appSlug %>' ), ', ', ''); ?></p>
          <p class="entry__categories"><?php _e( 'Categories: ', '<%= appSlug %>' ); the_category(', '); ?></p>
          <?php edit_post_link('Edit Post'); ?>
          <?php comments_template(); ?>
        </article>
      </section>
<?php get_sidebar(); ?>
<?php get_footer(); ?>

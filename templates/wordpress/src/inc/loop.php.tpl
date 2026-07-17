<?php
  $blog = get_option( 'page_for_posts' );
  $howMany = 3;

  if ( have_posts() ) {
    $count = 0; ?>
    <section class="blog-listing">
      <div class="blog-listing__list">
        <?php while (have_posts()) : the_post();

          if ( $count !== 0 && $count%$howMany == 0 ) { ?>
      </div>
    </section>
    <section class="blog-listing">
      <div class="blog-listing__list">
          <?php }

          $category = get_the_category(); ?>
          <div class="blog-listing__item">
            <a class="blog-listing__banner" href="<?php the_permalink(); ?>">
              <?php
                // Use featured image if available, fall back to ACF field (guarded), then skip
                $image_id = '';
                if ( has_post_thumbnail() ) {
                  $image_id = get_post_thumbnail_id();
                } elseif ( function_exists('get_field') ) {
                  $image_id = get_field( 'blog_fallback_image', 'options' );
                }
                if ( $image_id ) {
                  echo wp_get_attachment_image( $image_id, 'blog-thumb', '', array('class' => 'blog-listing__image') );
                }
              ?>
            </a>

            <div class="blog-listing__content">
              <?php if ( $category ) : ?>
                <p class="blog-listing__category"><?php echo esc_html( $category[0]->name ); ?></p>
              <?php endif; ?>
              <h2 class="blog-listing__title"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h2>
              <time class="blog-listing__date" datetime="<?php echo get_the_date('Y-m-d'); ?>"><?php the_date('F j, Y'); ?></time>
              <div class="blog-listing__excerpt"><?php the_excerpt(); ?></div>
              <a class="blog-listing__link" href="<?php the_permalink(); ?>"><?php _e( 'Read More', '<%= appSlug %>' ); ?></a>
            </div>
          </div>

        <?php $count++;
        endwhile; ?>
      </div>
    </section>
  <?php } ?>

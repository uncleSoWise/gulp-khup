<?php $blog = get_option( 'page_for_posts' ); ?>

          <div class="search-listing__wrap">
            <?php if ( have_posts() ) {
              while (have_posts()) { the_post(); ?>
                <article id="post-<?php the_ID(); ?>" class="search-listing__item">
                  <a class="search-listing__link" href="<?php the_permalink(); ?>">
                    <div class="search-listing__image-wrap">
                      <?php
                        $image_id = '';
                        if ( has_post_thumbnail() ) {
                          $image_id = get_post_thumbnail_id();
                        } elseif ( function_exists('get_field') ) {
                          $image_id = get_field( 'blog_fallback_image', 'options' );
                        }
                        if ( $image_id ) {
                          echo wp_get_attachment_image( $image_id, 'medium', '', array('class' => 'search-listing__image') );
                        }
                      ?>
                    </div>

                    <div class="search-listing__info">
                      <?php if ( is_post_type( 'post' ) ) { ?>
                        <time class="search-listing__date" datetime="<?php echo get_the_date('Y-m-d'); ?>"><?php the_date('F j, Y'); ?></time>
                      <?php } ?>
                      <h2 class="search-listing__title h3"><?php the_title(); ?></h2>
                      <div class="search-listing__excerpt"><?php the_excerpt(); ?></div>
                    </div>
                  </a>
                </article>
              <?php }
            } else { ?>
              <p><?php _e( 'No results found.', '<%= appSlug %>' ); ?></p>
            <?php } ?>
          </div>

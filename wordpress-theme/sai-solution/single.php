<?php
/**
 * SAI Solution Theme — single.php
 * Template for single posts/articles. (Usually not used in /solution — WP is for landing pages only)
 * @package SAI_Solution
 */

get_header();
?>

<main id="main" role="main">
  <article class="sai-section">
    <div class="sai-container" style="max-width:760px;margin:0 auto">

      <?php while ( have_posts() ): the_post(); ?>

        <?php if ( has_post_thumbnail() ): ?>
        <div style="margin-bottom:2rem;border-radius:16px;overflow:hidden">
          <?php the_post_thumbnail( 'sai-hero', [ 'style' => 'width:100%;height:auto;display:block' ] ); ?>
        </div>
        <?php endif; ?>

        <header style="margin-bottom:2rem">
          <div style="font-size:0.75rem;font-weight:600;color:#0284c7;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:0.5rem">
            <?php the_category( ' · ' ); ?>
          </div>
          <h1 style="font-size:clamp(1.75rem,4vw,2.5rem);font-weight:800;color:#0f172a;margin-bottom:0.75rem">
            <?php the_title(); ?>
          </h1>
          <p style="font-size:0.8125rem;color:#94a3b8">
            <?php echo esc_html( get_the_date( 'd F Y' ) ); ?>
            &nbsp;·&nbsp;
            <?php echo esc_html( get_the_author() ); ?>
          </p>
        </header>

        <div class="entry-content">
          <?php the_content(); ?>
        </div>

      <?php endwhile; ?>

    </div>
  </article>
</main>

<?php get_footer(); ?>

<?php
/**
 * SAI Solution Theme — page.php
 * Default page template (no sidebar).
 *
 * @package SAI_Solution
 */

get_header();
?>

<main id="main" role="main">
  <div class="sai-section">
    <div class="sai-container" style="max-width:900px;margin:0 auto">

      <?php while ( have_posts() ): the_post(); ?>

        <article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
          <header style="margin-bottom:2rem;padding-bottom:1.5rem;border-bottom:1px solid #e2e8f0">
            <h1 style="font-size:clamp(1.75rem,4vw,2.5rem);font-weight:800;color:#0f172a;margin-bottom:0.5rem">
              <?php the_title(); ?>
            </h1>
            <?php if ( get_the_date() ): ?>
            <time style="font-size:0.8125rem;color:#94a3b8">
              <?php echo get_the_date( 'd F Y' ); ?>
            </time>
            <?php endif; ?>
          </header>

          <div class="entry-content" style="font-size:1rem;line-height:1.8;color:#334155">
            <?php the_content(); ?>
          </div>

        </article>

      <?php endwhile; ?>

    </div>
  </div>

  <!-- CTA -->
  <section style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:3rem 0;text-align:center">
    <div class="sai-container" style="max-width:560px;margin:0 auto">
      <p style="font-size:0.9375rem;color:#64748b;margin-bottom:1.25rem">Butuh informasi lebih lanjut?</p>
      <a href="https://solusiaplikasi.id/request-demo" class="sai-btn sai-btn--primary">
        Hubungi Tim Kami
      </a>
    </div>
  </section>

</main>

<?php get_footer(); ?>

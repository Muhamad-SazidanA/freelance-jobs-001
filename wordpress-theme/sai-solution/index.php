<?php
/**
 * SAI Solution Theme — index.php
 * Fallback template — shows landing page listing or redirects to home.
 *
 * @package SAI_Solution
 */

// Redirect /solution/ root to home (as per PRD)
if ( is_home() || is_front_page() ) {
    wp_redirect( 'https://solusiaplikasi.id', 301 );
    exit;
}

get_header();
?>

<main id="main" role="main">
  <section class="sai-section">
    <div class="sai-container" style="max-width:700px;margin:0 auto;text-align:center">
      <?php if ( have_posts() ): ?>
        <h1 style="font-size:2rem;font-weight:700;margin-bottom:1.5rem">Solution Pages</h1>
        <ul style="list-style:none;padding:0;margin:0;display:grid;gap:1rem">
          <?php while ( have_posts() ): the_post(); ?>
          <li>
            <a href="<?php the_permalink(); ?>" class="sai-card" style="display:flex;align-items:center;gap:1rem;text-decoration:none">
              <?php if ( has_post_thumbnail() ): ?>
                <?php the_post_thumbnail( 'sai-thumb', [ 'style' => 'width:80px;height:56px;object-fit:cover;border-radius:8px;flex-shrink:0' ] ); ?>
              <?php endif; ?>
              <div style="text-align:left">
                <h2 style="font-size:1rem;font-weight:600;color:#0f172a;margin-bottom:0.25rem"><?php the_title(); ?></h2>
                <p style="font-size:0.8125rem;color:#64748b;margin:0"><?php echo wp_trim_words( get_the_excerpt(), 15 ); ?></p>
              </div>
            </a>
          </li>
          <?php endwhile; ?>
        </ul>
      <?php else: ?>
        <p style="color:#64748b">Tidak ada halaman yang ditemukan.</p>
      <?php endif; ?>
    </div>
  </section>
</main>

<?php get_footer(); ?>

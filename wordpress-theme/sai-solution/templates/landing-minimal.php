<?php
/**
 * Template Name: Landing Page - Minimal
 * Template Post Type: page, sai_landing
 *
 * Clean, whitespace-heavy landing page. Text-first, no gradient hero.
 * Good for: blog-style landing, comparison pages, documentation-adjacent.
 *
 * @package SAI_Solution
 */

get_header();

$badge_text    = get_post_meta( get_the_ID(), 'sai_badge_text', true );
$hero_title    = get_post_meta( get_the_ID(), 'sai_hero_title', true ) ?: get_the_title();
$hero_subtitle = get_post_meta( get_the_ID(), 'sai_hero_subtitle', true );
$cta_label     = get_post_meta( get_the_ID(), 'sai_cta_label', true ) ?: 'Request Demo';
$cta_url       = get_post_meta( get_the_ID(), 'sai_cta_url', true ) ?: 'https://solusiaplikasi.id/request-demo';
$cta_2_label   = get_post_meta( get_the_ID(), 'sai_cta_secondary_label', true );
$cta_2_url     = get_post_meta( get_the_ID(), 'sai_cta_secondary_url', true );
?>

<main id="main" role="main">

  <!-- Minimal Hero — white background, accent border -->
  <section style="border-bottom:1px solid #e2e8f0;padding:clamp(3rem,8vw,6rem) 0;background:#fff">
    <div class="sai-container" style="max-width:760px;margin:0 auto;text-align:center">

      <?php if ( $badge_text ): ?>
      <span style="display:inline-block;padding:0.25rem 0.875rem;background:#eff6ff;border:1px solid #bfdbfe;color:#1d4ed8;border-radius:9999px;font-size:0.75rem;font-weight:600;letter-spacing:0.04em;text-transform:uppercase;margin-bottom:1.25rem">
        <?php echo esc_html( $badge_text ); ?>
      </span>
      <?php endif; ?>

      <h1 style="font-size:clamp(2rem,5vw,3.25rem);font-weight:800;color:#0f172a;letter-spacing:-0.035em;margin-bottom:1rem;line-height:1.1">
        <?php echo wp_kses_post( $hero_title ); ?>
      </h1>

      <?php if ( $hero_subtitle ): ?>
      <p style="font-size:1.0625rem;color:#475569;line-height:1.7;max-width:580px;margin:0 auto 2rem">
        <?php echo esc_html( $hero_subtitle ); ?>
      </p>
      <?php endif; ?>

      <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:0.75rem">
        <a href="<?php echo esc_url( $cta_url ); ?>" class="sai-btn sai-btn--primary sai-btn--lg">
          <?php echo esc_html( $cta_label ); ?>
        </a>
        <?php if ( $cta_2_label && $cta_2_url ): ?>
        <a href="<?php echo esc_url( $cta_2_url ); ?>" class="sai-btn sai-btn--outline sai-btn--lg">
          <?php echo esc_html( $cta_2_label ); ?>
        </a>
        <?php endif; ?>
      </div>

    </div>
  </section>

  <!-- Main Content -->
  <?php if ( have_posts() ): while ( have_posts() ): the_post(); ?>
  <article id="post-<?php the_ID(); ?>" <?php post_class( 'sai-section' ); ?>>
    <div class="sai-container">
      <div class="entry-content" style="max-width:760px;margin:0 auto;font-size:1rem;line-height:1.8;color:#334155">
        <?php the_content(); ?>
      </div>
    </div>
  </article>
  <?php endwhile; endif; ?>

  <!-- Bottom Consultation CTA -->
  <?php get_template_part( 'template-parts/consultation-cta' ); ?>

</main>

<?php get_footer(); ?>

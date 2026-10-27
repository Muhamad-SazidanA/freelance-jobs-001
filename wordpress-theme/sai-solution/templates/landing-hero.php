<?php
/**
 * Template Name: Landing Page - Hero Style
 * Template Post Type: page, sai_landing
 *
 * Full-featured landing page with hero section, content, and optional CTA.
 * Content editors can customize all hero settings via the meta box in WP Admin.
 *
 * @package SAI_Solution
 */

get_header();

// Get custom meta fields
$badge_text    = get_post_meta( get_the_ID(), 'sai_badge_text', true );
$hero_title    = get_post_meta( get_the_ID(), 'sai_hero_title', true ) ?: get_the_title();
$hero_subtitle = get_post_meta( get_the_ID(), 'sai_hero_subtitle', true );
$cta_label     = get_post_meta( get_the_ID(), 'sai_cta_label', true ) ?: 'Request Demo';
$cta_url       = get_post_meta( get_the_ID(), 'sai_cta_url', true ) ?: 'https://solusiaplikasi.id/request-demo';
$cta_2_label   = get_post_meta( get_the_ID(), 'sai_cta_secondary_label', true );
$cta_2_url     = get_post_meta( get_the_ID(), 'sai_cta_secondary_url', true );
$show_trust    = get_post_meta( get_the_ID(), 'sai_show_trust_bar', true ) === '1';
$hero_image    = get_the_post_thumbnail_url( null, 'sai-hero' );
?>

<main id="main" role="main">

  <!-- ======================================================================
       HERO SECTION
       ====================================================================== -->
  <section class="sai-hero" style="<?php echo $hero_image ? 'background-image:url(' . esc_url( $hero_image ) . ');background-size:cover;background-position:center;background-blend-mode:overlay' : ''; ?>">
    <!-- Decorative radial glow -->
    <div style="position:absolute;inset:0;background:radial-gradient(ellipse at 30% 50%,rgba(2,132,199,0.25) 0%,transparent 65%);pointer-events:none" aria-hidden="true"></div>
    <!-- Subtle grid pattern -->
    <div style="position:absolute;inset:0;background-image:url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\");pointer-events:none" aria-hidden="true"></div>

    <div class="sai-container sai-hero__content">

      <?php if ( $badge_text ): ?>
      <span class="sai-hero__tag sai-animate-in sai-animate-in--delay-1" aria-label="<?php echo esc_attr( $badge_text ); ?>">
        <?php echo esc_html( $badge_text ); ?>
      </span>
      <?php endif; ?>

      <h1 class="sai-hero__title sai-animate-in sai-animate-in--delay-2">
        <?php echo wp_kses_post( $hero_title ); ?>
      </h1>

      <?php if ( $hero_subtitle ): ?>
      <p class="sai-hero__subtitle sai-animate-in sai-animate-in--delay-3">
        <?php echo esc_html( $hero_subtitle ); ?>
      </p>
      <?php endif; ?>

      <div class="sai-hero__ctas sai-animate-in sai-animate-in--delay-3">
        <a href="<?php echo esc_url( $cta_url ); ?>" class="sai-btn sai-btn--white sai-btn--lg">
          <?php echo esc_html( $cta_label ); ?>
        </a>
        <?php if ( $cta_2_label && $cta_2_url ): ?>
        <a href="<?php echo esc_url( $cta_2_url ); ?>" class="sai-btn sai-btn--outline sai-btn--lg" style="border-color:rgba(255,255,255,0.5);color:#fff">
          <?php echo esc_html( $cta_2_label ); ?>
        </a>
        <?php endif; ?>
      </div>

    </div>
  </section>

  <?php if ( $show_trust ): ?>
  <!-- ======================================================================
       TRUST BAR — client logos
       ====================================================================== -->
  <section class="sai-section--sm" style="background:#f8fafc;border-bottom:1px solid #e2e8f0">
    <div class="sai-container">
      <p style="text-align:center;font-size:0.75rem;font-weight:600;color:#94a3b8;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:1.5rem">
        Dipercaya oleh Perusahaan Terkemuka
      </p>
      <div class="sai-trust-bar">
        <?php
        // Trust bar logos — can be managed via ACF repeater in the future
        $trust_logos = [
            [ 'alt' => 'Pertamina',   'placeholder' => 'Pertamina' ],
            [ 'alt' => 'Indomaret',   'placeholder' => 'Indomaret' ],
            [ 'alt' => 'BNI',         'placeholder' => 'BNI' ],
            [ 'alt' => 'Telkom',      'placeholder' => 'Telkom' ],
            [ 'alt' => 'Bank Mandiri','placeholder' => 'Bank Mandiri' ],
        ];
        foreach ( $trust_logos as $logo ):
        ?>
        <span style="padding:0.5rem 1.25rem;background:#fff;border:1px solid #e2e8f0;border-radius:8px;font-size:0.8125rem;font-weight:700;color:#64748b;letter-spacing:-0.01em">
          <?php echo esc_html( $logo['placeholder'] ); ?>
        </span>
        <?php endforeach; ?>
      </div>
    </div>
  </section>
  <?php endif; ?>

  <!-- ======================================================================
       MAIN CONTENT AREA (WordPress Block Editor / Gutenberg)
       ====================================================================== -->
  <?php if ( have_posts() ): while ( have_posts() ): the_post(); ?>
  <article id="post-<?php the_ID(); ?>" <?php post_class( 'sai-section' ); ?>>
    <div class="sai-container">
      <div class="entry-content" style="max-width:860px;margin:0 auto">
        <?php the_content(); ?>
      </div>
    </div>
  </article>
  <?php endwhile; endif; ?>

  <!-- ======================================================================
       BOTTOM CONSULTATION CTA SECTION (Unified Template)
       ====================================================================== -->
  <?php get_template_part( 'template-parts/consultation-cta' ); ?>

</main>

<?php get_footer(); ?>

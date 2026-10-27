<?php
/**
 * SAI Solution Theme — header.php
 * Site header with logo, navigation, and CTA button.
 *
 * @package SAI_Solution
 */
?>
<!doctype html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo( 'charset' ); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="profile" href="https://gmpg.org/xfn/11">
    <?php wp_head(); ?>
</head>

<body <?php body_class(); ?>>
<?php wp_body_open(); ?>

<header class="sai-header" role="banner">
    <div class="sai-container sai-header__inner">

        <!-- Logo -->
        <a href="https://solusiaplikasi.id" class="sai-header__logo" aria-label="SolusiAplikasi.id - Home">
            <?php if ( has_custom_logo() ): ?>
                <?php the_custom_logo(); ?>
            <?php else: ?>
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                    <rect width="32" height="32" rx="8" fill="#0284c7"/>
                    <path d="M8 16l6 6L24 10" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span class="sai-header__logo-text">
                    <strong>PT. SOLUSI APLIKASI INTEGRASI</strong><br>
                    <small style="font-weight:400;font-size:0.6875rem;color:#64748b">Digital Intelligent Automation</small>
                </span>
            <?php endif; ?>
        </a>

        <!-- Primary Navigation -->
        <nav role="navigation" aria-label="<?php esc_attr_e( 'Menu Utama', 'sai-solution' ); ?>">
            <?php
            wp_nav_menu( [
                'theme_location' => 'primary',
                'menu_class'     => 'sai-nav',
                'container'      => false,
                'fallback_cb'    => function () {
                    echo '<ul class="sai-nav">';
                    echo '<li><a href="https://solusiaplikasi.id">Home</a></li>';
                    echo '<li><a href="https://solusiaplikasi.id/about-us">About Us</a></li>';
                    echo '<li><a href="https://solusiaplikasi.id/articles">Articles</a></li>';
                    echo '</ul>';
                },
            ] );
            ?>
        </nav>

        <!-- CTA Button -->
        <a href="https://solusiaplikasi.id/request-demo"
           class="sai-btn sai-btn--primary"
           style="white-space:nowrap"
           rel="noopener">
            Request Demo
        </a>

        <!-- Mobile toggle (JS controlled) -->
        <button class="sai-header__mobile-toggle" aria-label="<?php esc_attr_e( 'Buka menu', 'sai-solution' ); ?>" aria-expanded="false" aria-controls="sai-mobile-nav">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
        </button>

    </div>

    <!-- Mobile Nav (hidden by default) -->
    <div id="sai-mobile-nav" class="sai-mobile-nav" hidden>
        <nav role="navigation" aria-label="<?php esc_attr_e( 'Menu Mobile', 'sai-solution' ); ?>">
            <?php
            wp_nav_menu( [
                'theme_location' => 'primary',
                'menu_class'     => 'sai-mobile-nav__list',
                'container'      => false,
            ] );
            ?>
            <a href="https://solusiaplikasi.id/request-demo" class="sai-btn sai-btn--primary" style="width:100%;justify-content:center;margin-top:1rem;">Request Demo</a>
        </nav>
    </div>
</header>

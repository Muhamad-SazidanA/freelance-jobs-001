<?php
/**
 * SAI Solution Theme — functions.php
 *
 * Registers Google Fonts, theme support, navigation menus, page templates,
 * custom post type (sai_landing), ACF & WPGraphQL field registration.
 *
 * @package SAI_Solution
 * @version 1.0.0
 */

defined( 'ABSPATH' ) || exit;

/* ==========================================================================
   1. ENQUEUE STYLES & SCRIPTS
   ========================================================================== */
add_action( 'wp_enqueue_scripts', function () {
    // Google Fonts — Plus Jakarta Sans (same as Astro site)
    wp_enqueue_style(
        'sai-google-fonts',
        'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap',
        [],
        null
    );

    // Main theme stylesheet
    wp_enqueue_style(
        'sai-solution-theme',
        get_stylesheet_uri(),
        [ 'sai-google-fonts' ],
        '1.0.0'
    );

    // Inline critical CSS for above-the-fold performance
    $inline_css = ':root{--font-sans:"Plus Jakarta Sans",system-ui,sans-serif}';
    wp_add_inline_style( 'sai-solution-theme', $inline_css );

    // Theme JavaScript
    wp_enqueue_script(
        'sai-solution-theme-js',
        get_template_directory_uri() . '/assets/js/sai-theme.js',
        [],
        '1.0.0',
        true  // load in footer
    );

    // Pass variables to JS
    wp_localize_script( 'sai-solution-theme-js', 'saiThemeData', [
        'ajaxUrl' => admin_url( 'admin-ajax.php' ),
        'siteUrl' => home_url( '/' ),
        'nonce'   => wp_create_nonce( 'sai_theme_nonce' ),
    ] );
} );

// Dequeue Gutenberg block styles (not needed for landing pages)
add_action( 'wp_enqueue_scripts', function () {
    wp_dequeue_style( 'wp-block-library' );
    wp_dequeue_style( 'wp-block-library-theme' );
    wp_dequeue_style( 'global-styles' );
}, 100 );

/* ==========================================================================
   2. THEME SUPPORT & SETUP
   ========================================================================== */
add_action( 'after_setup_theme', function () {
    // Basic theme support
    add_theme_support( 'title-tag' );
    add_theme_support( 'post-thumbnails' );
    add_theme_support( 'editor-styles' );
    add_theme_support( 'responsive-embeds' );
    add_theme_support( 'custom-logo', [
        'height'      => 60,
        'width'       => 200,
        'flex-height' => true,
        'flex-width'  => true,
    ] );
    add_theme_support( 'html5', [
        'search-form',
        'comment-form',
        'comment-list',
        'gallery',
        'caption',
        'style',
        'script',
    ] );

    // Set default thumbnail size
    set_post_thumbnail_size( 1200, 630, true );
    add_image_size( 'sai-hero',  1920, 800, true );
    add_image_size( 'sai-card',   600, 400, true );
    add_image_size( 'sai-thumb',  400, 267, true );

    // Navigation menus
    register_nav_menus( [
        'primary' => __( 'Menu Utama', 'sai-solution' ),
        'footer'  => __( 'Menu Footer', 'sai-solution' ),
        'cta'     => __( 'CTA Header', 'sai-solution' ),
    ] );
} );

/* ==========================================================================
   3. DOCUMENT TITLE
   ========================================================================== */
add_filter( 'document_title_separator', fn() => '|' );
add_filter( 'document_title_parts', function ( $parts ) {
    $parts['sitename'] = 'SolusiAplikasi.id';
    return $parts;
} );

/* ==========================================================================
   4. CUSTOM POST TYPE: sai_landing (Landing Pages)
   This CPT allows content editors to create landing pages at /solution/[slug]
   ========================================================================== */
add_action( 'init', function () {
    register_post_type( 'sai_landing', [
        'labels'       => [
            'name'                  => __( 'Landing Pages', 'sai-solution' ),
            'singular_name'         => __( 'Landing Page', 'sai-solution' ),
            'add_new_item'          => __( 'Tambah Landing Page', 'sai-solution' ),
            'edit_item'             => __( 'Edit Landing Page', 'sai-solution' ),
            'view_item'             => __( 'Lihat Landing Page', 'sai-solution' ),
            'search_items'          => __( 'Cari Landing Page', 'sai-solution' ),
            'not_found'             => __( 'Landing page tidak ditemukan.', 'sai-solution' ),
        ],
        'public'             => true,
        'has_archive'        => false,
        'publicly_queryable' => true,
        'show_ui'            => true,
        'show_in_menu'       => true,
        'show_in_nav_menus'  => false,
        'show_in_rest'       => true,          // Gutenberg editor support
        'hierarchical'       => false,
        'menu_icon'          => 'dashicons-layout',
        'menu_position'      => 5,
        'supports'           => [ 'title', 'editor', 'thumbnail', 'custom-fields', 'page-attributes', 'excerpt', 'revisions' ],
        'rewrite'            => [ 'slug' => '', 'with_front' => false ], // URL: /solution/[slug]
        // WPGraphQL support
        'show_in_graphql'      => true,
        'graphql_single_name'  => 'landing',
        'graphql_plural_name'  => 'landings',
    ] );

    // Add "Halaman" (Pages) also in GraphQL if needed
    register_post_type_graphql_fields();
} );

/* ==========================================================================
   5. PAGE TEMPLATES — auto-discovered by WordPress from /templates/ folder
   No extra registration needed if file has the correct header comment.
   Templates available:
     - templates/landing-hero.php       → Hero style with gradient bg
     - templates/landing-minimal.php    → Clean whitespace-heavy style
     - templates/landing-full-width.php → Full width, no sidebar
   ========================================================================== */

/* ==========================================================================
   6. CUSTOM META BOXES (for Landing Pages — fallback without ACF)
   ========================================================================== */
add_action( 'add_meta_boxes', function () {
    add_meta_box(
        'sai_landing_meta',
        __( '🎯 Landing Page Settings', 'sai-solution' ),
        'sai_render_landing_meta_box',
        [ 'sai_landing', 'page' ],
        'side',
        'high'
    );
} );

function sai_render_landing_meta_box( $post ) {
    wp_nonce_field( 'sai_landing_meta_nonce', 'sai_landing_meta_nonce_field' );
    $hero_title    = get_post_meta( $post->ID, 'sai_hero_title', true );
    $hero_subtitle = get_post_meta( $post->ID, 'sai_hero_subtitle', true );
    $cta_label     = get_post_meta( $post->ID, 'sai_cta_label', true );
    $cta_url       = get_post_meta( $post->ID, 'sai_cta_url', true );
    $cta_secondary_label = get_post_meta( $post->ID, 'sai_cta_secondary_label', true );
    $cta_secondary_url   = get_post_meta( $post->ID, 'sai_cta_secondary_url', true );
    $badge_text    = get_post_meta( $post->ID, 'sai_badge_text', true );
    $show_trust_bar = get_post_meta( $post->ID, 'sai_show_trust_bar', true );
    ?>
    <p>
        <label for="sai_badge_text"><strong>Badge Text</strong> <em>(opsional)</em></label>
        <input type="text" id="sai_badge_text" name="sai_badge_text" value="<?php echo esc_attr( $badge_text ); ?>" style="width:100%;margin-top:4px">
        <small style="color:#666">Contoh: "Gratis 30 Hari"</small>
    </p>
    <p>
        <label for="sai_hero_title"><strong>Hero Title</strong></label>
        <input type="text" id="sai_hero_title" name="sai_hero_title" value="<?php echo esc_attr( $hero_title ); ?>" style="width:100%;margin-top:4px" placeholder="Otomatis pakai judul halaman jika kosong">
    </p>
    <p>
        <label for="sai_hero_subtitle"><strong>Hero Subtitle</strong></label>
        <textarea id="sai_hero_subtitle" name="sai_hero_subtitle" rows="3" style="width:100%;margin-top:4px"><?php echo esc_textarea( $hero_subtitle ); ?></textarea>
    </p>
    <hr>
    <p>
        <label for="sai_cta_label"><strong>Tombol CTA Utama (Label)</strong></label>
        <input type="text" id="sai_cta_label" name="sai_cta_label" value="<?php echo esc_attr( $cta_label ); ?>" style="width:100%;margin-top:4px" placeholder="Request Demo">
    </p>
    <p>
        <label for="sai_cta_url"><strong>Tombol CTA Utama (URL)</strong></label>
        <input type="url" id="sai_cta_url" name="sai_cta_url" value="<?php echo esc_attr( $cta_url ); ?>" style="width:100%;margin-top:4px" placeholder="https://solusiaplikasi.id/request-demo">
    </p>
    <p>
        <label for="sai_cta_secondary_label"><strong>Tombol CTA Kedua (Label)</strong></label>
        <input type="text" id="sai_cta_secondary_label" name="sai_cta_secondary_label" value="<?php echo esc_attr( $cta_secondary_label ); ?>" style="width:100%;margin-top:4px" placeholder="Pelajari Lebih Lanjut">
    </p>
    <p>
        <label for="sai_cta_secondary_url"><strong>Tombol CTA Kedua (URL)</strong></label>
        <input type="url" id="sai_cta_secondary_url" name="sai_cta_secondary_url" value="<?php echo esc_attr( $cta_secondary_url ); ?>" style="width:100%;margin-top:4px">
    </p>
    <p>
        <label>
            <input type="checkbox" name="sai_show_trust_bar" value="1" <?php checked( $show_trust_bar, '1' ); ?>>
            <strong>Tampilkan Trust Bar (logo klien)</strong>
        </label>
    </p>
    <?php
}

add_action( 'save_post', function ( $post_id ) {
    if ( ! isset( $_POST['sai_landing_meta_nonce_field'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['sai_landing_meta_nonce_field'] ) ), 'sai_landing_meta_nonce' ) ) {
        return;
    }
    if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) return;
    if ( ! current_user_can( 'edit_post', $post_id ) ) return;

    $fields = [ 'sai_hero_title', 'sai_hero_subtitle', 'sai_cta_label', 'sai_cta_url', 'sai_cta_secondary_label', 'sai_cta_secondary_url', 'sai_badge_text' ];
    foreach ( $fields as $field ) {
        if ( isset( $_POST[ $field ] ) ) {
            update_post_meta( $post_id, $field, sanitize_text_field( wp_unslash( $_POST[ $field ] ) ) );
        }
    }
    // Checkbox
    update_post_meta( $post_id, 'sai_show_trust_bar', isset( $_POST['sai_show_trust_bar'] ) ? '1' : '0' );
} );

/* ==========================================================================
   7. WPGRAPHQL CUSTOM FIELD REGISTRATION
   Exposes custom meta fields via GraphQL for Astro build-time fetch
   ========================================================================== */
function register_post_type_graphql_fields() {
    // Only register if WPGraphQL is active
    if ( ! function_exists( 'register_graphql_field' ) ) return;
}

add_action( 'graphql_register_types', function () {
    if ( ! function_exists( 'register_graphql_field' ) ) return;

    $meta_fields = [
        'heroTitle'          => 'sai_hero_title',
        'heroSubtitle'       => 'sai_hero_subtitle',
        'ctaLabel'           => 'sai_cta_label',
        'ctaUrl'             => 'sai_cta_url',
        'ctaSecondaryLabel'  => 'sai_cta_secondary_label',
        'ctaSecondaryUrl'    => 'sai_cta_secondary_url',
        'badgeText'          => 'sai_badge_text',
    ];

    foreach ( $meta_fields as $gql_field => $meta_key ) {
        register_graphql_field( 'Landing', $gql_field, [
            'type'    => 'String',
            'resolve' => fn( $post ) => get_post_meta( $post->ID, $meta_key, true ) ?: null,
        ] );
        register_graphql_field( 'Page', $gql_field, [
            'type'    => 'String',
            'resolve' => fn( $post ) => get_post_meta( $post->ID, $meta_key, true ) ?: null,
        ] );
    }

    register_graphql_field( 'Landing', 'showTrustBar', [
        'type'    => 'Boolean',
        'resolve' => fn( $post ) => get_post_meta( $post->ID, 'sai_show_trust_bar', true ) === '1',
    ] );
} );

/* ==========================================================================
   8. SECURITY HARDENING
   ========================================================================== */
// Remove WordPress version from head (security through obscurity)
remove_action( 'wp_head', 'wp_generator' );
add_filter( 'the_generator', '__return_empty_string' );

// Disable XML-RPC
add_filter( 'xmlrpc_enabled', '__return_false' );

// Remove pingback header
add_filter( 'wp_headers', function ( $headers ) {
    unset( $headers['X-Pingback'] );
    return $headers;
} );

// Disable REST API for logged-out users (except public endpoints)
add_filter( 'rest_authentication_errors', function ( $result ) {
    if ( ! empty( $result ) ) return $result;
    // Allow public endpoints (WPGraphQL, etc.)
    $request_uri = sanitize_text_field( wp_unslash( $_SERVER['REQUEST_URI'] ?? '' ) );
    if ( strpos( $request_uri, '/graphql' ) !== false ) return $result;
    if ( ! is_user_logged_in() ) {
        // Only block write endpoints, allow GET reads
        $method = sanitize_text_field( wp_unslash( $_SERVER['REQUEST_METHOD'] ?? 'GET' ) );
        if ( 'GET' !== $method ) {
            return new WP_Error( 'rest_not_logged_in', 'REST API write access requires authentication.', [ 'status' => 401 ] );
        }
    }
    return $result;
} );

// Disable file editing from WP Admin (also set in wp-config.php)
if ( ! defined( 'DISALLOW_FILE_EDIT' ) ) {
    define( 'DISALLOW_FILE_EDIT', true );
}

/* ==========================================================================
   9. SEO HELPERS
   ========================================================================== */
// Add Open Graph tags for landing pages
add_action( 'wp_head', function () {
    if ( ! is_singular( [ 'sai_landing', 'page' ] ) ) return;
    global $post;
    if ( ! $post ) return;

    $title       = get_post_meta( $post->ID, 'sai_hero_title', true ) ?: get_the_title();
    $description = get_post_meta( $post->ID, 'sai_hero_subtitle', true ) ?: get_the_excerpt();
    $image       = get_the_post_thumbnail_url( $post->ID, 'sai-hero' );
    $url         = get_permalink( $post->ID );

    echo '<meta property="og:type" content="website">' . "\n";
    echo '<meta property="og:site_name" content="SolusiAplikasi.id">' . "\n";
    echo '<meta property="og:url" content="' . esc_url( $url ) . '">' . "\n";
    echo '<meta property="og:title" content="' . esc_attr( $title ) . '">' . "\n";
    if ( $description ) echo '<meta property="og:description" content="' . esc_attr( $description ) . '">' . "\n";
    if ( $image )       echo '<meta property="og:image" content="' . esc_url( $image ) . '">' . "\n";
    echo '<meta name="twitter:card" content="summary_large_image">' . "\n";
} );

/* ==========================================================================
   10. PERFORMANCE OPTIMIZATIONS
   ========================================================================== */
// Preconnect to Google Fonts
add_action( 'wp_head', function () {
    echo '<link rel="preconnect" href="https://fonts.googleapis.com">' . "\n";
    echo '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' . "\n";
}, 1 );

// Remove Gutenberg block styles we don't use
add_action( 'init', function () {
    remove_action( 'wp_enqueue_scripts', 'wp_enqueue_global_styles' );
    remove_action( 'wp_body_open', 'wp_global_styles_render_svg_filters' );
}, 11 );

// Limit post revisions (also set in wp-config.php)
if ( ! defined( 'WP_POST_REVISIONS' ) ) {
    define( 'WP_POST_REVISIONS', 3 );
}

/* ==========================================================================
   11. CONSULTATION CTA SHORTCODE
   Usage: [sai_consultation_cta product="spensify"]
   ========================================================================== */
add_shortcode( 'sai_consultation_cta', function ( $atts ) {
    $atts = shortcode_atts( [
        'title'           => 'Jalankan Bisnis Anda dengan Performa Maksimal',
        'subtitle'        => 'Tim konsultan kami siap menganalisis alur kerja perusahaan Anda dan mendemonstrasikan implementasi solusi terbaik secara langsung.',
        'product'         => '',
        'badge'           => 'ENTERPRISE READY',
        'badge_subtitle'  => 'Solusi Teruji Skala Nasional',
        'primary_btn'     => 'Request Demo Gratis',
        'whatsapp_btn'    => 'Dapatkan Konsultasi Gratis',
        'whatsapp_number' => '6282110009519',
    ], $atts, 'sai_consultation_cta' );

    ob_start();
    get_template_part( 'template-parts/consultation-cta', null, $atts );
    return ob_get_clean();
} );

/* ==========================================================================
   12. REST API: LEAD & CONTACT SUBMISSION (/wp-json/solusi/v1/lead)
   Handles form submissions from Astro frontend, sends email to sales@solusiaplikasi.id,
   and persists lead in database.
   ========================================================================== */
add_action( 'rest_api_init', function () {
    register_rest_route( 'solusi/v1', '/lead', [
        'methods'             => [ 'POST', 'OPTIONS' ],
        'permission_callback' => '__return_true',
        'callback'            => 'sai_handle_lead_rest_submission',
    ] );
} );

function sai_handle_lead_rest_submission( WP_REST_Request $request ) {
    // Handle CORS preflight
    if ( $request->get_method() === 'OPTIONS' ) {
        $response = new WP_REST_Response( [ 'status' => 'ok' ], 200 );
        $response->header( 'Access-Control-Allow-Origin', '*' );
        $response->header( 'Access-Control-Allow-Methods', 'POST, OPTIONS' );
        $response->header( 'Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With' );
        return $response;
    }

    $params = $request->get_json_params();
    if ( empty( $params ) ) {
        $params = $request->get_body_params();
    }

    $name         = sanitize_text_field( $params['name'] ?? '' );
    $email        = sanitize_email( $params['email'] ?? '' );
    $phone        = sanitize_text_field( $params['phone'] ?? '' );
    $company      = sanitize_text_field( $params['company'] ?? '' );
    $position     = sanitize_text_field( $params['position'] ?? '' );
    $requirements = sanitize_textarea_field( $params['requirements'] ?? ( $params['message'] ?? '' ) );
    $source_url   = esc_url_raw( $params['sourceUrl'] ?? ( $params['source_url'] ?? '' ) );

    if ( empty( $name ) || empty( $email ) ) {
        $res = new WP_REST_Response( [
            'success' => false,
            'message' => 'Nama dan email wajib diisi.',
        ], 400 );
        $res->header( 'Access-Control-Allow-Origin', '*' );
        return $res;
    }

    // 1. Send Email to sales@solusiaplikasi.id
    $to      = 'sales@solusiaplikasi.id';
    $subject = '[Lead Baru Website] Permintaan Demo / Konsultasi: ' . $name;
    
    $body  = "Halo Tim Sales PT Solusi Aplikasi Integrasi,\n\n";
    $body .= "Ada calon klien yang mengajukan permintaan demo/konsultasi melalui website:\n\n";
    $body .= "--------------------------------------------------\n";
    $body .= "Nama           : " . $name . "\n";
    $body .= "Email          : " . $email . "\n";
    $body .= "No. WhatsApp   : " . $phone . "\n";
    $body .= "Perusahaan     : " . ( $company ?: '-' ) . "\n";
    $body .= "Jabatan        : " . ( $position ?: '-' ) . "\n";
    $body .= "Halaman Sumber : " . ( $source_url ?: '-' ) . "\n";
    $body .= "Kebutuhan      :\n" . ( $requirements ?: '-' ) . "\n";
    $body .= "--------------------------------------------------\n\n";
    $body .= "Waktu Masuk: " . current_time( 'mysql' ) . " WIB\n";

    $headers = [
        'From: Website SolusiAplikasi.id <no-reply@solusiaplikasi.id>',
        'Reply-To: ' . $name . ' <' . $email . '>',
    ];

    @wp_mail( $to, $subject, $body, $headers );

    // 2. Persist to database if sai_leads table exists
    global $wpdb;
    $table_check = $wpdb->get_col( "SHOW TABLES LIKE '%sai_leads%'" );
    if ( ! empty( $table_check ) ) {
        $table_name = $table_check[0];
        @$wpdb->insert( $table_name, [
            'first_name'   => $name,
            'email'        => $email,
            'phone'        => $phone,
            'company'      => $company,
            'position'     => $position,
            'requirements' => $requirements,
            'source_url'   => $source_url,
            'status'       => 'new',
            'created_at'   => current_time( 'mysql' ),
        ] );
    }

    $res = new WP_REST_Response( [
        'success' => true,
        'message' => 'Terima kasih, tim konsultan kami akan menghubungi Anda 1x24 jam',
    ], 200 );
    $res->header( 'Access-Control-Allow-Origin', '*' );
    return $res;
}

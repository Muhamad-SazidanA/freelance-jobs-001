<?php
/**
 * WordPress Config Template for SAI Solution
 * Salin file ini ke: public_html/solution/wp-config.php
 * !! JANGAN commit file ini dengan data asli ke Git !!
 */
# ==============================================================================
# Database Configuration
# Gunakan SATU database yang sama dengan project Astro, prefix berbeda!
# ==============================================================================
define( 'DB_NAME',     '{{CPANEL_USERNAME}}_sai' );       # Isi dengan nama DB cPanel Anda
define( 'DB_USER',     '{{CPANEL_USERNAME}}_saiuser' );   # Isi dengan user DB cPanel
define( 'DB_PASSWORD', '{{DB_PASSWORD_HERE}}' );          # Isi dengan password DB
define( 'DB_HOST',     'localhost' );                      # cPanel selalu localhost
define( 'DB_CHARSET',  'utf8mb4' );
define( 'DB_COLLATE',  'utf8mb4_unicode_ci' );

# Prefix tabel WordPress — BEDA dari sai_ agar tidak tabrakan!
# Jika ingin lebih aman, bisa pakai: 'saiwp_'
$table_prefix = 'wp_';

# ==============================================================================
# WordPress URLs (Subfolder di /solution/)
# ==============================================================================
define( 'WP_HOME',    'https://solusiaplikasi.id/solution' );
define( 'WP_SITEURL', 'https://solusiaplikasi.id/solution' );

# ==============================================================================
# Security Keys & Salts
# Generate di: https://api.wordpress.org/secret-key/1.1/salt/
# ==============================================================================
define( 'AUTH_KEY',         '{{PASTE_UNIQUE_PHRASE_1}}' );
define( 'SECURE_AUTH_KEY',  '{{PASTE_UNIQUE_PHRASE_2}}' );
define( 'LOGGED_IN_KEY',    '{{PASTE_UNIQUE_PHRASE_3}}' );
define( 'NONCE_KEY',        '{{PASTE_UNIQUE_PHRASE_4}}' );
define( 'AUTH_SALT',        '{{PASTE_UNIQUE_PHRASE_5}}' );
define( 'SECURE_AUTH_SALT', '{{PASTE_UNIQUE_PHRASE_6}}' );
define( 'LOGGED_IN_SALT',   '{{PASTE_UNIQUE_PHRASE_7}}' );
define( 'NONCE_SALT',       '{{PASTE_UNIQUE_PHRASE_8}}' );

# ==============================================================================
# Production Security Settings
# ==============================================================================
define( 'DISALLOW_FILE_EDIT', true );   # Matikan editor tema dari WP Admin
define( 'DISALLOW_FILE_MODS', false );  # Izinkan install plugin/tema (set true di produksi ketat)
define( 'FORCE_SSL_ADMIN',    true );   # Force HTTPS untuk admin
define( 'WP_DEBUG',           false );  # HARUS false di produksi
define( 'WP_DEBUG_LOG',       false );
define( 'WP_DEBUG_DISPLAY',   false );

# ==============================================================================
# Performance Settings
# ==============================================================================
define( 'WP_POST_REVISIONS', 3 );         # Batasi revisi post
define( 'AUTOSAVE_INTERVAL', 300 );        # Autosave tiap 5 menit (bukan 1 menit)
define( 'EMPTY_TRASH_DAYS', 14 );          # Hapus trash setelah 14 hari
define( 'WP_MEMORY_LIMIT', '256M' );       # Memory PHP untuk WordPress
define( 'WP_MAX_MEMORY_LIMIT', '512M' );   # Memory untuk admin/proses besar

# ==============================================================================
# WPGraphQL / Astro Build Settings
# ==============================================================================
# Build token untuk proteksi GraphQL endpoint (set juga di Astro .env)
# define( 'WPGRAPHQL_BUILD_TOKEN', '{{WP_BUILD_TOKEN}}' );

# ==============================================================================
# Upload Path
# ==============================================================================
define( 'UPLOADS', 'wp-content/uploads' );

# ==============================================================================
# Absolute path to the WordPress directory
# ==============================================================================
if ( ! defined( 'ABSPATH' ) ) {
    define( 'ABSPATH', __DIR__ . '/' );
}

/** Sets up WordPress vars and included files. */
require_once ABSPATH . 'wp-settings.php';

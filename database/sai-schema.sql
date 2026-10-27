-- =============================================================================
-- Schema SQL: SAI Project Tables (prefix: sai_)
-- Database: Bersama dengan WordPress (prefix: wp_)
-- Run via: phpMyAdmin → pilih database → tab SQL
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Authors / Penulis Artikel
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `sai_authors` (
  `id`          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `slug`        VARCHAR(255) NOT NULL,
  `name`        VARCHAR(255) NOT NULL,
  `role`        VARCHAR(255) DEFAULT '',
  `bio`         TEXT,
  `avatar_url`  VARCHAR(1024) DEFAULT '',
  `linkedin`    VARCHAR(512) DEFAULT '',
  `github`      VARCHAR(512) DEFAULT '',
  `twitter`     VARCHAR(512) DEFAULT '',
  `created_at`  DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed default author
INSERT IGNORE INTO `sai_authors` (`slug`, `name`, `role`, `bio`, `avatar_url`) VALUES
  ('tim-sai', 'Tim SolusiAplikasi.id', 'Editorial Team', 'Tim editorial PT Solusi Aplikasi Integrasi.', '');

-- -----------------------------------------------------------------------------
-- 2. Categories / Kategori Artikel
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `sai_categories` (
  `id`          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `slug`        VARCHAR(255) NOT NULL,
  `name`        VARCHAR(255) NOT NULL,
  `description` TEXT,
  `created_at`  DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed initial categories
INSERT IGNORE INTO `sai_categories` (`slug`, `name`) VALUES
  ('technology',     'Technology'),
  ('fintech-economy','Fintech and Economy'),
  ('enterprise-it',  'Enterprise IT'),
  ('ai-automation',  'AI & Automation'),
  ('document-mgmt',  'Document Management'),
  ('case-study',     'Case Study'),
  ('tips-tricks',    'Tips & Tricks');

-- -----------------------------------------------------------------------------
-- 3. Tags / Label Artikel
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `sai_tags` (
  `id`    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `slug`  VARCHAR(255) NOT NULL,
  `name`  VARCHAR(255) NOT NULL,
  UNIQUE KEY `uk_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 4. Articles / Artikel Blog
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `sai_articles` (
  `id`                   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `slug`                 VARCHAR(512) NOT NULL,
  `title`                VARCHAR(512) NOT NULL,
  `excerpt`              TEXT,
  `quick_answer_summary` TEXT,
  `content`              LONGTEXT,
  `featured_image_url`   VARCHAR(1024) DEFAULT '',
  `featured_image_alt`   VARCHAR(512) DEFAULT '',
  `featured_image_width` SMALLINT UNSIGNED DEFAULT 1200,
  `featured_image_height`SMALLINT UNSIGNED DEFAULT 630,
  `author_id`            INT UNSIGNED DEFAULT NULL,
  `category_id`          INT UNSIGNED DEFAULT NULL,
  `status`               ENUM('draft','published','archived') DEFAULT 'draft',
  `reading_time_minutes` TINYINT UNSIGNED DEFAULT 5,
  `published_at`         DATETIME DEFAULT NULL,
  `updated_at`           DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_at`           DATETIME DEFAULT CURRENT_TIMESTAMP,
  -- SEO fields
  `seo_title`            VARCHAR(512) DEFAULT '',
  `seo_description`      VARCHAR(512) DEFAULT '',
  `seo_og_image`         VARCHAR(1024) DEFAULT '',
  `seo_noindex`          TINYINT(1) DEFAULT 0,
  UNIQUE KEY  `uk_slug`       (`slug`(255)),
  INDEX       `idx_status`    (`status`),
  INDEX       `idx_published` (`published_at`),
  INDEX       `idx_category`  (`category_id`),
  INDEX       `idx_author`    (`author_id`),
  CONSTRAINT  `fk_article_author`   FOREIGN KEY (`author_id`)   REFERENCES `sai_authors`(`id`)    ON DELETE SET NULL,
  CONSTRAINT  `fk_article_category` FOREIGN KEY (`category_id`) REFERENCES `sai_categories`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 5. Article Tags (pivot / many-to-many)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `sai_article_tags` (
  `article_id` INT UNSIGNED NOT NULL,
  `tag_id`     INT UNSIGNED NOT NULL,
  PRIMARY KEY (`article_id`, `tag_id`),
  CONSTRAINT `fk_at_article` FOREIGN KEY (`article_id`) REFERENCES `sai_articles`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_at_tag`     FOREIGN KEY (`tag_id`)     REFERENCES `sai_tags`(`id`)     ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 6. Article FAQs (AEO / GEO Schema support)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `sai_article_faqs` (
  `id`          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `article_id`  INT UNSIGNED NOT NULL,
  `question`    TEXT NOT NULL,
  `answer`      TEXT NOT NULL,
  `sort_order`  TINYINT UNSIGNED DEFAULT 0,
  CONSTRAINT `fk_faq_article` FOREIGN KEY (`article_id`) REFERENCES `sai_articles`(`id`) ON DELETE CASCADE,
  INDEX `idx_faq_article` (`article_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 7. Leads / Form Submissions (Request Demo & Contact)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `sai_leads` (
  `id`           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `first_name`   VARCHAR(255) NOT NULL DEFAULT '',
  `last_name`    VARCHAR(255) NOT NULL DEFAULT '',
  `company`      VARCHAR(255) DEFAULT '',
  `position`     VARCHAR(255) DEFAULT '',
  `email`        VARCHAR(320) NOT NULL,
  `phone`        VARCHAR(50) DEFAULT '',
  `requirements` TEXT,
  `source_url`   VARCHAR(1024) DEFAULT '',
  `form_type`    VARCHAR(100) DEFAULT 'demo',
  `product_interest` VARCHAR(255) DEFAULT '',
  `status`       ENUM('new','contacted','in-progress','qualified','won','lost') DEFAULT 'new',
  `ip_address`   VARCHAR(45) DEFAULT '',   -- IPv6 max length
  `user_agent`   VARCHAR(512) DEFAULT '',
  `notes`        TEXT,
  `created_at`   DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at`   DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_email`       (`email`),
  INDEX `idx_status`      (`status`),
  INDEX `idx_created`     (`created_at`),
  INDEX `idx_form_type`   (`form_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 8. Admin Users (untuk login dashboard Astro)
-- Catatan: jika menggunakan external auth (JWT, Cloudflare etc), tabel ini bisa dihapus
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `sai_admin_sessions` (
  `id`         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `token_hash` VARCHAR(255) NOT NULL,
  `ip_address` VARCHAR(45) DEFAULT '',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `expires_at` DATETIME NOT NULL,
  UNIQUE KEY `uk_token` (`token_hash`),
  INDEX `idx_expires` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- Verify tables created
-- =============================================================================
SHOW TABLES LIKE 'sai_%';

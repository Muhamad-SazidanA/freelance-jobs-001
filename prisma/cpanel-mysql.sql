CREATE TABLE `posts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `content` LONGTEXT NOT NULL,
    `image_url` LONGTEXT NULL,
    `subheading` VARCHAR(255) NULL,
    `category` VARCHAR(100) NULL,
    `author` VARCHAR(100) NULL DEFAULT 'Admin SAI',
    `author_image` LONGTEXT NULL,
    `author_badge` VARCHAR(100) NULL,
    `author_bio` LONGTEXT NULL,
    `show_author` BOOLEAN NOT NULL DEFAULT true,
    `reviewer_name` VARCHAR(100) NULL,
    `reviewer_image` LONGTEXT NULL,
    `reviewer_badge` VARCHAR(100) NULL,
    `reviewer_bio` LONGTEXT NULL,
    `show_reviewer` BOOLEAN NOT NULL DEFAULT false,
    `meta_title` VARCHAR(255) NULL,
    `meta_description` LONGTEXT NULL,
    `meta_keywords` LONGTEXT NULL,
    `status` ENUM('draft', 'published') NOT NULL DEFAULT 'draft',
    `views` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `posts_slug_key`(`slug`),
    INDEX `posts_status_created_at_idx`(`status`, `created_at`),
    INDEX `posts_status_category_idx`(`status`, `category`),
    INDEX `posts_views_idx`(`views`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `landing_pages` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `template` VARCHAR(40) NOT NULL DEFAULT 'hero',
    `badge_text` VARCHAR(120) NULL,
    `hero_title` VARCHAR(255) NULL,
    `hero_subtitle` LONGTEXT NULL,
    `hero_image` LONGTEXT NULL,
    `cta_label` VARCHAR(100) NULL,
    `cta_url` VARCHAR(500) NULL,
    `cta_secondary_label` VARCHAR(100) NULL,
    `cta_secondary_url` VARCHAR(500) NULL,
    `show_trust_bar` BOOLEAN NOT NULL DEFAULT false,
    `features_json` LONGTEXT NOT NULL,
    `content` LONGTEXT NOT NULL,
    `show_header` BOOLEAN NOT NULL DEFAULT true,
    `show_footer` BOOLEAN NOT NULL DEFAULT true,
    `show_lead_form` BOOLEAN NOT NULL DEFAULT true,
    `lead_default_product` VARCHAR(80) NULL,
    `meta_title` VARCHAR(255) NULL,
    `meta_description` LONGTEXT NULL,
    `meta_keywords` LONGTEXT NULL,
    `status` ENUM('draft', 'published') NOT NULL DEFAULT 'draft',
    `views` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `landing_pages_slug_key`(`slug`),
    INDEX `landing_pages_status_created_at_idx`(`status`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `admin_users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `username` VARCHAR(120) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `admin_users_email_key`(`email`),
    UNIQUE INDEX `admin_users_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `media_assets` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `filename` VARCHAR(255) NOT NULL,
    `mime_type` VARCHAR(100) NOT NULL,
    `size` INTEGER NOT NULL,
    `data` LONGBLOB NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


<?php
/**
 * SAI Solution Theme — 404.php
 * @package SAI_Solution
 */

get_header();
?>

<main id="main" role="main">
  <section class="sai-section" style="text-align:center;min-height:60vh;display:flex;align-items:center;justify-content:center">
    <div class="sai-container" style="max-width:500px;margin:0 auto">
      <div style="font-size:6rem;font-weight:900;color:#e2e8f0;line-height:1;margin-bottom:0.5rem">404</div>
      <h1 style="font-size:1.5rem;font-weight:700;color:#0f172a;margin-bottom:0.75rem">Halaman Tidak Ditemukan</h1>
      <p style="color:#64748b;font-size:0.9375rem;margin-bottom:2rem;line-height:1.6">
        Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan.
      </p>
      <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:0.75rem">
        <a href="https://solusiaplikasi.id" class="sai-btn sai-btn--primary">Kembali ke Home</a>
        <a href="https://solusiaplikasi.id/request-demo" class="sai-btn sai-btn--outline">Request Demo</a>
      </div>
    </div>
  </section>
</main>

<?php get_footer(); ?>

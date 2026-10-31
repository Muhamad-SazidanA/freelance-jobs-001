<?php
/**
 * Template Part: Reusable Consultation CTA Form
 * Visual 100% Matching Reference Image: Enterprise Skyline Banner + Dual Action Form
 *
 * Usage in templates:
 *   get_template_part( 'template-parts/consultation-cta', null, [ 'product' => 'spensify' ] );
 *
 * Usage in content via shortcode:
 *   [sai_consultation_cta product="cyclone"]
 *
 * @package SAI_Solution
 */

$title          = ! empty( $args['title'] ) ? $args['title'] : 'Jalankan Bisnis Anda dengan Performa Maksimal';
$subtitle       = ! empty( $args['subtitle'] ) ? $args['subtitle'] : 'Tim konsultan kami siap menganalisis alur kerja perusahaan Anda dan mendemonstrasikan implementasi solusi terbaik secara langsung.';
$default_prod   = ! empty( $args['product'] ) ? strtolower( trim( $args['product'] ) ) : '';
$image_url      = ! empty( $args['image_url'] ) ? $args['image_url'] : 'https://solusiaplikasi.id/images/home/home-city-banner.jpg';
$badge          = ! empty( $args['badge'] ) ? $args['badge'] : 'ENTERPRISE READY';
$badge_subtitle = ! empty( $args['badge_subtitle'] ) ? $args['badge_subtitle'] : 'Solusi Teruji Skala Nasional';
$primary_btn    = ! empty( $args['primary_btn'] ) ? $args['primary_btn'] : 'Request Demo Gratis';
$whatsapp_btn   = ! empty( $args['whatsapp_btn'] ) ? $args['whatsapp_btn'] : 'Dapatkan Konsultasi Gratis';
$wa_number      = ! empty( $args['whatsapp_number'] ) ? $args['whatsapp_number'] : '6282110009519';
$instance_id    = 'wp-cta-' . wp_generate_password( 6, false, false );
?>

<section id="form-konsultasi" class="sai-consultation-section" style="padding:clamp(3.5rem,7vw,5.5rem) 1rem;background:#ffffff;border-top:1px solid #f1f5f9">
  <div style="max-width:1152px;margin:0 auto;padding:0 1rem">
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:2.5rem;align-items:center">

      <!-- Left Column: City Skyline Banner -->
      <div style="display:flex;align-items:center;justify-content:center">
        <div style="position:relative;width:100%;max-width:480px;border-radius:24px;overflow:hidden;box-shadow:0 4px 14px rgba(0,0,0,0.06);border:1px solid #e2e8f0;background:#0f172a;aspect-ratio:1/1">
          <img
            src="<?php echo esc_url( $image_url ); ?>"
            alt="<?php echo esc_attr( $title ); ?>"
            style="width:100%;height:100%;object-fit:cover;display:block"
            loading="lazy"
          />
          <div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(15,23,42,0.85) 0%,rgba(15,23,42,0.2) 50%,transparent 100%);display:flex;align-items:flex-end;padding:1.5rem">
            <div style="color:#ffffff">
              <div style="font-size:11px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:#38bdf8;margin-bottom:2px">
                <?php echo esc_html( $badge ); ?>
              </div>
              <div style="font-size:0.95rem;font-weight:700;line-height:1.3;color:#ffffff">
                <?php echo esc_html( $badge_subtitle ); ?>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Consultation Form -->
      <div>
        <h2 style="font-size:clamp(1.75rem,3.5vw,2.25rem);font-weight:800;color:#0f172a;letter-spacing:-0.025em;line-height:1.2;margin-bottom:0.5rem">
          <?php echo esc_html( $title ); ?>
        </h2>
        <p style="font-size:0.95rem;color:#475569;margin-bottom:1.5rem;line-height:1.6">
          <?php echo esc_html( $subtitle ); ?>
        </p>

        <form data-wp-cta-form="<?php echo esc_attr( $instance_id ); ?>" style="display:flex;flex-direction:column;gap:0.75rem">
          <!-- Honeypot -->
          <input type="text" name="website" style="display:none" tabindex="-1" autocomplete="off" />

          <!-- Full Name -->
          <div>
            <input
              type="text"
              name="name"
              required
              placeholder="Nama Lengkap Anda *"
              style="width:100%;padding:0.65rem 0.875rem;border-radius:8px;border:1px solid #cbd5e1;background:#ffffff;font-size:0.875rem;color:#0f172a;box-sizing:border-box;outline:none"
            />
          </div>

          <!-- Phone & Email -->
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:0.75rem">
            <div style="display:flex;border-radius:8px;border:1px solid #cbd5e1;overflow:hidden;background:#ffffff">
              <span style="padding:0.65rem 0.75rem;background:#f8fafc;color:#64748b;font-size:0.875rem;border-right:1px solid #cbd5e1;display:flex;align-items:center;font-weight:600;user-select:none;flex-shrink:0">
                ID +62
              </span>
              <input
                type="tel"
                name="phone"
                required
                placeholder="812-3456-7890 *"
                style="width:100%;padding:0.65rem 0.75rem;font-size:0.875rem;color:#0f172a;border:none;background:transparent;outline:none"
              />
            </div>

            <div>
              <input
                type="email"
                name="email"
                required
                placeholder="Email Perusahaan Anda *"
                style="width:100%;padding:0.65rem 0.875rem;border-radius:8px;border:1px solid #cbd5e1;background:#ffffff;font-size:0.875rem;color:#0f172a;box-sizing:border-box;outline:none"
              />
            </div>
          </div>

          <!-- Product & Industry Selects -->
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:0.75rem">
            <div>
              <select
                name="product"
                required
                style="width:100%;padding:0.65rem 0.875rem;border-radius:8px;border:1px solid #cbd5e1;background:#ffffff;font-size:0.875rem;color:#334155;box-sizing:border-box;outline:none"
              >
                <option value="" disabled <?php echo empty( $default_prod ) ? 'selected' : ''; ?>>Pilih Solusi Produk *</option>
                <option value="nanonets" <?php echo $default_prod === 'nanonets' ? 'selected' : ''; ?>>Nanonets - AI OCR &amp; IDP</option>
                <option value="cyclone" <?php echo $default_prod === 'cyclone' ? 'selected' : ''; ?>>Cyclone - Robotic Process Automation</option>
                <option value="docuflo" <?php echo $default_prod === 'docuflo' ? 'selected' : ''; ?>>Docuflo - Document Management System</option>
                <option value="syclus" <?php echo $default_prod === 'syclus' ? 'selected' : ''; ?>>Syclus - IT Service &amp; Asset Management</option>
                <option value="spensify" <?php echo $default_prod === 'spensify' ? 'selected' : ''; ?>>Spensify - Corporate Expense Management</option>
                <option value="multi" <?php echo $default_prod === 'multi' ? 'selected' : ''; ?>>Konsultasi Solusi Multi-Platform</option>
              </select>
            </div>

            <div>
              <select
                name="industry"
                required
                style="width:100%;padding:0.65rem 0.875rem;border-radius:8px;border:1px solid #cbd5e1;background:#ffffff;font-size:0.875rem;color:#334155;box-sizing:border-box;outline:none"
              >
                <option value="" disabled selected>Pilih Sektor Industri *</option>
                <option value="banking">Perbankan &amp; Lembaga Keuangan</option>
                <option value="insurance">Asuransi &amp; FinTech</option>
                <option value="logistics">Logistik &amp; Supply Chain</option>
                <option value="manufacturing">Manufaktur &amp; Distribusi</option>
                <option value="healthcare">Kesehatan &amp; Farmasi</option>
                <option value="retail">Ritel &amp; E-Commerce</option>
                <option value="government">Pemerintahan &amp; BUMN</option>
                <option value="other">Industri Lainnya</option>
              </select>
            </div>
          </div>

          <!-- Scale & Timeline Selects -->
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:0.75rem">
            <div>
              <select
                name="scale"
                style="width:100%;padding:0.65rem 0.875rem;border-radius:8px;border:1px solid #cbd5e1;background:#ffffff;font-size:0.875rem;color:#334155;box-sizing:border-box;outline:none"
              >
                <option value="" disabled selected>Skala Perusahaan / Pengguna</option>
                <option value="1-50">1 - 50 Karyawan</option>
                <option value="51-250">51 - 250 Karyawan</option>
                <option value="251-1000">251 - 1.000 Karyawan</option>
                <option value="1000+">&gt; 1.000 Karyawan (Enterprise)</option>
              </select>
            </div>

            <div>
              <select
                name="timeline"
                style="width:100%;padding:0.65rem 0.875rem;border-radius:8px;border:1px solid #cbd5e1;background:#ffffff;font-size:0.875rem;color:#334155;box-sizing:border-box;outline:none"
              >
                <option value="" disabled selected>Target Waktu Implementasi</option>
                <option value="urgent">Segera (&lt; 1 Bulan)</option>
                <option value="medium">1 - 3 Bulan</option>
                <option value="long">3 - 6 Bulan</option>
                <option value="explore">Riset / Eksplorasi Tahap Awal</option>
              </select>
            </div>
          </div>

          <!-- Needs Textarea -->
          <div>
            <textarea
              name="message"
              rows="3"
              placeholder="Ceritakan kebutuhan otomatisasi atau integrasi sistem yang ingin dicapai perusahaan Anda..."
              style="width:100%;padding:0.65rem 0.875rem;border-radius:8px;border:1px solid #cbd5e1;background:#ffffff;font-size:0.875rem;color:#0f172a;box-sizing:border-box;outline:none;resize:vertical;font-family:inherit"
            ></textarea>
          </div>

          <!-- Feedback Status -->
          <div data-cta-status style="display:none;padding:0.75rem;border-radius:8px;font-size:0.8125rem;line-height:1.5"></div>

          <!-- Dual Buttons -->
          <div style="display:flex;flex-wrap:wrap;gap:0.75rem;padding-top:0.25rem">
            <button
              type="submit"
              data-cta-submit
              style="flex:1;min-width:180px;padding:0.85rem 1.25rem;border-radius:8px;background:#0084d1;color:#ffffff;font-weight:700;font-size:0.875rem;border:none;cursor:pointer;box-shadow:0 1px 2px rgba(0,0,0,0.05);transition:all 0.2s"
              onmouseover="this.style.background='#0074b8'"
              onmouseout="this.style.background='#0084d1'"
            >
              <span><?php echo esc_html( $primary_btn ); ?></span>
            </button>

            <button
              type="button"
              data-cta-wa
              data-wa-number="<?php echo esc_attr( $wa_number ); ?>"
              style="flex:1;min-width:180px;padding:0.85rem 1.25rem;border-radius:8px;background:#f95700;color:#ffffff;font-weight:700;font-size:0.875rem;border:none;cursor:pointer;box-shadow:0 1px 2px rgba(0,0,0,0.05);transition:all 0.2s;text-align:center"
              onmouseover="this.style.background='#e04f00'"
              onmouseout="this.style.background='#f95700'"
            >
              <span><?php echo esc_html( $whatsapp_btn ); ?></span>
            </button>
          </div>
        </form>
      </div>

    </div>
  </div>
</section>

<script>
(function() {
  var form = document.querySelector('form[data-wp-cta-form="<?php echo esc_js( $instance_id ); ?>"]');
  if (!form) return;

  var waBtn = form.querySelector('[data-cta-wa]');
  var statusBox = form.querySelector('[data-cta-status]');
  var submitBtn = form.querySelector('[data-cta-submit]');

  if (waBtn) {
    waBtn.addEventListener('click', function() {
      var name = (form.querySelector('input[name="name"]') || {}).value || '';
      var prodSelect = form.querySelector('select[name="product"]');
      var prod = (prodSelect && prodSelect.selectedIndex >= 0) ? prodSelect.options[prodSelect.selectedIndex].text : '';
      var msg = (form.querySelector('textarea[name="message"]') || {}).value || '';

      var text = 'Halo PT Solusi Aplikasi Integrasi (SAI), saya tertarik dengan solusi IT dan layanan Anda. Mohon info lebih lanjut.';
      if (name.trim()) text += '\n\nNama: ' + name.trim();
      if (prod && prodSelect.value) text += '\nProduk: ' + prod;
      if (msg.trim()) text += '\nKebutuhan: ' + msg.trim();

      var num = waBtn.getAttribute('data-wa-number') || '6282110009519';
      window.open('https://wa.me/' + num + '?text=' + encodeURIComponent(text), '_blank', 'noopener,noreferrer');
    });
  }

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    var name = (form.querySelector('input[name="name"]') || {}).value || '';
    var email = (form.querySelector('input[name="email"]') || {}).value || '';
    var phone = (form.querySelector('input[name="phone"]') || {}).value || '';
    var prodSelect = form.querySelector('select[name="product"]');
    var prod = (prodSelect && prodSelect.selectedIndex >= 0) ? prodSelect.options[prodSelect.selectedIndex].text : '';
    var indSelect = form.querySelector('select[name="industry"]');
    var ind = (indSelect && indSelect.selectedIndex >= 0) ? indSelect.options[indSelect.selectedIndex].text : '';
    var msg = (form.querySelector('textarea[name="message"]') || {}).value || '';

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerText = 'Memproses Permintaan...';
    }

    // Post to WP REST API endpoint
    fetch('<?php echo esc_url( rest_url( "solusi/v1/lead" ) ); ?>', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name,
        email: email,
        phone: phone,
        company: ind,
        requirements: '[Produk: ' + prod + '] ' + msg,
        sourceUrl: window.location.href
      })
    }).catch(function(err) {
      console.warn('REST submit fallback:', err);
    });

    setTimeout(function() {
      if (statusBox) {
        statusBox.style.display = 'block';
        statusBox.style.background = '#ecfdf5';
        statusBox.style.color = '#065f46';
        statusBox.style.border = '1px solid #a7f3d0';
        statusBox.innerHTML = '<strong>Terima kasih, ' + (name || 'Bapak/Ibu') + '!</strong> Terima kasih, tim konsultan kami akan menghubungi Anda 1x24 jam.';
      }
      form.reset();
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerText = '<?php echo esc_js( $primary_btn ); ?>';
      }
    }, 700);
  });
})();
</script>

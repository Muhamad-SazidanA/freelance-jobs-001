<?php
/**
 * SAI Solution Theme — footer.php
 * @package SAI_Solution
 */
?>

<footer class="sai-footer" role="contentinfo">
    <div class="sai-container">
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:2rem;padding-bottom:1rem">

            <!-- Company Info -->
            <div>
                <h3 style="font-size:0.875rem;font-weight:700;color:#fff;margin-bottom:1rem;letter-spacing:0.05em;text-transform:uppercase">Company</h3>
                <address style="font-style:normal;font-size:0.8125rem;color:rgba(255,255,255,0.85);line-height:1.7">
                    Jl. Siantar No.18, Cideng, Gambir<br>
                    Jakarta Pusat, DKI Jakarta 10150<br><br>
                    <a href="tel:+62213506050" style="color:inherit;text-decoration:none">📞 +62 21 350-6050 (Hunting)</a><br>
                    <a href="https://wa.me/6287865000132" target="_blank" rel="noopener" style="color:inherit;text-decoration:none">💬 +62 878-6500-0132 (WhatsApp)</a><br>
                    <a href="mailto:sales@solusiaplikasi.id" style="color:inherit;text-decoration:none">✉️ sales@solusiaplikasi.id</a>
                </address>
            </div>

            <!-- Products -->
            <div>
                <h3 style="font-size:0.875rem;font-weight:700;color:#fff;margin-bottom:1rem;letter-spacing:0.05em;text-transform:uppercase">Produk</h3>
                <ul style="list-style:none;padding:0;margin:0;font-size:0.8125rem">
                    <?php
                    $products = [
                        [ 'Nanonets (AI OCR)',       '/products/nanonets' ],
                        [ 'Cyclone (RPA)',            '/products/cyclone' ],
                        [ 'Docuflo (DMS)',            '/products/docuflo' ],
                        [ 'Syclus (ITSM)',            '/products/syclus' ],
                        [ 'Spensify (Expense Mgmt)', '/products/spensify' ],
                    ];
                    foreach ( $products as $p ):
                    ?>
                    <li style="margin-bottom:0.5rem">
                        <a href="https://solusiaplikasi.id<?php echo esc_attr( $p[1] ); ?>" style="color:rgba(255,255,255,0.8);text-decoration:none;transition:color 0.2s" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='rgba(255,255,255,0.8)'">
                            <?php echo esc_html( $p[0] ); ?>
                        </a>
                    </li>
                    <?php endforeach; ?>
                </ul>
            </div>

            <!-- Navigation -->
            <div>
                <h3 style="font-size:0.875rem;font-weight:700;color:#fff;margin-bottom:1rem;letter-spacing:0.05em;text-transform:uppercase">Menu</h3>
                <ul style="list-style:none;padding:0;margin:0;font-size:0.8125rem">
                    <?php
                    $menu_items = [
                        [ 'Home',         '/' ],
                        [ 'About Us',     '/about-us' ],
                        [ 'Articles',     '/articles' ],
                        [ 'Request Demo', '/request-demo' ],
                    ];
                    foreach ( $menu_items as $item ):
                    ?>
                    <li style="margin-bottom:0.5rem">
                        <a href="https://solusiaplikasi.id<?php echo esc_attr( $item[1] ); ?>" style="color:rgba(255,255,255,0.8);text-decoration:none;transition:color 0.2s" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='rgba(255,255,255,0.8)'">
                            <?php echo esc_html( $item[0] ); ?>
                        </a>
                    </li>
                    <?php endforeach; ?>
                </ul>
            </div>

        </div>

        <!-- Copyright -->
        <div class="sai-footer__copy">
            <p>&copy; <?php echo esc_html( date( 'Y' ) ); ?> PT Solusi Aplikasi Integrasi. All Rights Reserved.</p>
        </div>
    </div>
</footer>

<!-- Mobile nav inline styles -->
<style>
.sai-mobile-nav {
    background: #fff;
    border-top: 1px solid #e2e8f0;
    padding: 1rem;
}
.sai-mobile-nav__list {
    list-style: none;
    padding: 0;
    margin: 0;
}
.sai-mobile-nav__list li { border-bottom: 1px solid #f1f5f9; }
.sai-mobile-nav__list a {
    display: block;
    padding: 0.75rem 0;
    font-size: 0.9375rem;
    color: #334155;
    text-decoration: none;
    font-weight: 500;
}
</style>

<?php wp_footer(); ?>
</body>
</html>

<?php
/**
 * The template for displaying product content in the single-product.php template
 *
 * This template can be overridden by copying it to yourtheme/woocommerce/content-single-product.php.
 *
 * HOWEVER, on occasion WooCommerce will need to update template files and you
 * (the theme developer) will need to copy the new files to your theme to
 * maintain compatibility. We try to do this as little as possible, but it does
 * happen. When this occurs the version of the template file will be bumped and
 * the readme will list any important changes.
 *
 * @seehttps://docs.woocommerce.com/document/template-structure/
 * @authorWooThemes
 * @package    WooCommerce/Templates
 * @version1.6.4
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

?>

<?php
/**
 * woocommerce_before_single_product hook.
 *
 * @hooked wc_print_notices - 10
 */
do_action('woocommerce_before_single_product');

if (post_password_required()) {
    echo get_the_password_form();
    return;
}
?>

    <div itemscope itemtype="<?php echo woocommerce_get_product_schema(); ?>"id="product-<?php the_ID(); ?>" <?php post_class(); ?>>

        <div class="wrapper_prod cf">
            <section class="home cf">

                <div id="intro" class="block funnel">
                    <?php do_action('viki_single_product_header','single_product_header');?>
                </div>

                <div class="funnel-wrapper">
                    <?php
                    //do_action('viki_single_product_cart_options');
                    ?>
                </div>

            </section>
        </div>

    <meta itemprop="url" content="<?php the_permalink(); ?>"/>

    </div><!-- #product-<?php the_ID(); ?> -->

<?php

do_action( 'woocommerce_single_product_summary' );


//do_action('woocommerce_after_single_product'); ?>
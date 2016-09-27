<?php
/**
 * Product quantity inputs
 *
 * This template can be overridden by copying it to yourtheme/woocommerce/global/quantity-input.php.
 *
 * HOWEVER, on occasion WooCommerce will need to update template files and you
 * (the theme developer) will need to copy the new files to your theme to
 * maintain compatibility. We try to do this as little as possible, but it does
 * happen. When this occurs the version of the template file will be bumped and
 * the readme will list any important changes.
 *
 * @see 	    https://docs.woocommerce.com/document/template-structure/
 * @author 		WooThemes
 * @package 	WooCommerce/Templates
 * @version     2.5.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}
?>
<div class="quantity">

    <?php if(is_product()):?>
    <div id="prices" class="block funnel">
        <div class="left content changeable">
            <h3 class="step"><span>Select quantity</span>
            </h3>

            <fieldset>
                <div class="radio grid grid-col qty">
                    <div class="col-2">
                        <div><span class="quant icon icon-radio active">250</span><span class="price">&euro; 29.95</span></div>
                        <div><span class="quant icon icon-radio">500</span><span class="price">&euro; 44.95</span></div>
                        <div><span class="quant icon icon-radio">1000</span><span class="price">&euro; 54.95</span></div>
                        <div><span class="quant icon icon-radio">1500</span><span class="price">&euro; 65.95</span></div>
                    </div>

                    <div class="col-2">
                        <div><span class="quant icon icon-radio">2000</span><span class="price">&euro; 79.95</span></div>
                        <div><span class="quant icon icon-radio">2500</span><span class="price">&euro; 88.95</span></div>
                        <div><span class="quant icon icon-radio">3000</span><span class="price">&euro; 99.95</span></div>
                        <div><span class="quant icon icon-radio">5000</span><span class="price">&euro; 119.95</span></div>

                    </div>
                </div>
            </fieldset>
        </div>
    </div>

<?php endif;?>



	<input type="<?php echo is_product() ? 'hidden':'number'?>" step="<?php echo esc_attr( $step ); ?>" min="<?php echo esc_attr( $min_value ); ?>" max="<?php echo esc_attr( $max_value ); ?>" name="<?php echo esc_attr( $input_name ); ?>" value="<?php echo esc_attr( $input_value ); ?>" title="<?php echo esc_attr_x( 'Qty', 'Product quantity input tooltip', 'woocommerce' ) ?>" class="input-text qty text" size="4" pattern="<?php echo esc_attr( $pattern ); ?>" inputmode="<?php echo esc_attr( $inputmode ); ?>" />



</div>




<script>
    jQuery(document).ready(function($){


        $(".quant").click(function() {
            var q;
            $(".quant").removeClass("active");
            $(this).toggleClass("active");
            q = $(this).text();

            $('#inner-editor').val(q);

            $('input[name=quantity').attr('value',q);
            console.log($('#inner-editor').text());
        });
    });


</script>

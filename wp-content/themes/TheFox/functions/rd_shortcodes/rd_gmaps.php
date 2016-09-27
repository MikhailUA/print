<?php 


/*-----------------------------------------------------------------------------------*/



/*  Google Maps shortcode



/*-----------------------------------------------------------------------------------*/




function rd_gmaps($atts, $content = null) {  






    extract(shortcode_atts(array(  
		'zoom'   => '12',

		'height' => '400px',

		'title' => 'our headquarters',
		
		'lat' => '40.843292',
		
		'lng' => '-73.864512',
		
		'image' => '',
				
    ), $atts));

	ob_start();
	

$wc_rp_rs = RandomString(5);

$protocol = is_ssl() ? 'https' : 'http';

wp_enqueue_script('gmaps_api', ''.$protocol.'://maps.google.com/maps/api/js?sensor=false', array(), false, false);			
?>


<script type="text/javascript">

"use strict";
function initialize<?php echo esc_js($wc_rp_rs); ?>() {

var latlng = new google.maps.LatLng(<?php echo esc_js($lat." , ".$lng) ?>);

var grayStyles = [
        {
          featureType: "all",
          stylers: [
            { saturation: -10 },
            { lightness: 10 }
          ]
        },
      ];

var options<?php echo esc_js($wc_rp_rs); ?> = {

center : latlng,

scrollwheel :  false,

<?php echo(isMobile()) ? 'draggable: false,' : ''; ?>

mapTypeId: google.maps.MapTypeId.ROADMAP,

zoomControl : true,

styles: grayStyles,

zoomControlOptions :

{

style: google.maps.ZoomControlStyle.SMALL,

position: google.maps.ControlPosition.TOP_LEFT

},

mapTypeControl : true,

mapTypeControlOptions :

{

style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,

position: google.maps.ControlPosition.TOP_RIGHT

},

scaleControl : true,

scaleControlOptions :

{

position: google.maps.ControlPosition.TOP_LEFT

},

streetViewControl : true,

streetViewControlOptions :

{

position: google.maps.ControlPosition.TOP_LEFT

},

panControl : false,  zoom : <?php echo esc_js($zoom); ?> 
 

};

var map<?php echo esc_js($wc_rp_rs); ?> = new google.maps.Map(document.getElementById("gm_<?php echo esc_js($wc_rp_rs); ?>"), options<?php echo esc_js($wc_rp_rs); ?>);

var marker = new google.maps.Marker({

position: latlng, 

<?php if($image !== ''){

$bg_id = preg_replace( '/[^\d]/', '', $image );
$bg_img = wp_get_attachment_image_src( $bg_id, 'full'  );

	
	 ?>

icon: '<?php echo $bg_img[0]; ?>',

<?php } ?>

map: map<?php echo esc_js($wc_rp_rs); ?>,

title:"<?php echo esc_js($title); ?>"

});   

}

jQuery(document).ready(function () {
   initialize<?php echo esc_js($wc_rp_rs); ?>();
	
})
</script>
<div class="map_canvas_body">
<div id="gm_<?php echo esc_attr($wc_rp_rs); ?>" class="map_canvas" style="height:<?php echo esc_attr($height);?>;"></div>
</div>

<?php

$output_string = ob_get_contents();
ob_end_clean();

	return $output_string;
}
add_shortcode( 'rd_gmaps', 'rd_gmaps' );

?>
<?php 



/*-----------------------------------------------------------------------------------*/



/*  Partners shortcode



/*-----------------------------------------------------------------------------------*/

function partners_carousel_sc($atts, $content = null) {  



    extract(shortcode_atts(array(  
		'margin_top'   => '0',

		'margin_bottom' => '0',

		'to_show' => '5',
		
		'per_line' => '5',
		'category' => '',
		'scroll' => '',
		'speed' => '800',
		
    ), $atts));

	ob_start();



$rand_pc = RandomString(20);
			
		echo '<script type="text/javascript" charset="utf-8">
				var j$ = jQuery;
		j$.noConflict();
		"use strict";
	//setup up Carousel
		j$(window).load(function() {
		j$("#rd_'.$rand_pc.' .partners").carouFredSel({
					responsive: true,
					width: "100%",';
					
					 if($scroll !== 'yes' ){ 
					echo 'scroll: 1,
					auto: false,';
					 }else{ 
					echo 'scroll:  { items:1,duration: '.$speed.'},
					auto: true,';
					 }
					echo '
					prev: "#rd_'.$rand_pc.' .partners_left",
					next: "#rd_'.$rand_pc.' .partners_right",
					swipe       : {
             		   onTouch     : true,
		               onMouse     : false
        		    },
					items: {
						width: "280",
						height: "variable",
						visible: {
							min: 1,
							max: '.$per_line.'
						}
					}
				});
				});
	</script>
		

	<div class="sponsors" id="rd_'.$rand_pc.'" >
<div class="partners_nav">
  <p class="partners_left"></p>
  <p class="partners_right"></p>
</div>
<ul class="partners">';

   global $post;
		$i = 0;
		if ($category!=="all" && $category!=="") {
		$args = array(
	'post_type'           => "partners",
    "posts_per_page" => $to_show,
	'tax_query' => array( 
            array(
                'taxonomy' => 'groups',
                'field' => 'slug',
        		'post_status' => 'publish',
                'terms' => $category
            ),
),
);
		}
		else{
			$args = array(
            "post_type" => "partners",
        	'post_status' => 'publish',
            "posts_per_page" => $to_show,
);
		}
       
	   
		$partners_query = new WP_Query($args);
	   
		
        if ($partners_query->have_posts()) : while ($partners_query->have_posts()) : $partners_query->the_post(); ?>
      
    <li>
    
<?php $link = get_post_meta($post->ID, 'rd_link', true); if($link !== '') { ?>
	  <a href="<?php echo esc_url($link); ?>" target="_blank">
      <?php } the_post_thumbnail('sponsor_tn', array('title' => "")); if($link !== '') { ?>
      </a>
      <?php } ?>
      </li>
      <?php endwhile; endif; ?>
      </ul>
      </div>
      
      <?php wp_reset_postdata(); 
	  
$output_string = ob_get_contents();
ob_end_clean();


	return '<div class="clearfix" style="padding-top:'.$margin_top.'px"></div>'.$output_string.'<div class="clearfix" style="padding-top:'.$margin_bottom.'px"></div>';
}
add_shortcode( 'partners_carousel_sc', 'partners_carousel_sc' );

?>
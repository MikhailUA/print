<?php 



/*-----------------------------------------------------------------------------------*/



/*	Share Shortcodes



/*-----------------------------------------------------------------------------------*/




function rd_fq_sc( $atts, $content = null ) {

	extract(shortcode_atts(array(


		'author_one'   => 'First Author',
		'info_one'   => 'First Quote Author Info',
		'quote_one'   => 'This is an Awesome quote text! Replace me with your own quote text!',
		'author_two'   => 'Second Author',
		'info_two'   => 'Second Programmer',
		'quote_two'   => 'This is an Awesome quote text! Replace me with your own quote text!',
		'author_three'   => 'Third Author',
		'info_three'   => 'Third Programmer',
		'quote_three'   => 'This is an Awesome quote text! Replace me with your own quote text!',
		'author_four'   => 'Fourth Author',
		'info_four'   => 'Fourth Programmer',
		'quote_four'   => 'This is an Awesome quote text! Replace me with your own quote text!',
		'animation'   => '',


    ), $atts));



   	ob_start();
	global $rd_data;
$id = RandomString(20);
if($hover_color == ''){
$hover_color = $rd_data['rd_content_text_color'];
}

$output = '<style>#rd_'.$id.' {margin-top:'.$mt.'px; margin-bottom:'.$mb.'px;}';

$output .= '</style>';

$output .= '<div class="sc-four-quote" id="rd_'.$id.'">';



$output .= '<div class="sc-four-quote-first"><p>'.$quote_one.'</p><div class="quote_meta"><h3>'.$author_one.'</h3><h4>/ '.$info_one.'</h4></div>';
$output .= '<div class="sc-four-quote-two"><p>'.$quote_two.'</p><div class="quote_meta"><h3>'.$author_two.'</h3><h4>/ '.$info_two.'</h4></div>';
$output .= '<div class="sc-four-quote-icon"></div>';
$output .= '<div class="sc-four-quote-three"><p>'.$quote_three.'</p><div class="quote_meta"><h3>'.$author_three.'</h3><h4>/ '.$info_three.'</h4></div>';
$output .= '<div class="sc-four-quote-four"><p>'.$quote_four.'</p><div class="quote_meta"><h3>'.$author_four.'</h3><h4>/ '.$info_four.'</h4></div>';


$output .= '</div>';


echo !empty( $output ) ? $output : '';

$output_string = ob_get_contents();
ob_end_clean();
return $output_string; 

}


add_shortcode('rd_fq_sc', 'rd_fq_sc');


?>
<?php 


/*-----------------------------------------------------------------------------------*/



/* Contact Form 7 shortcode



/*-----------------------------------------------------------------------------------*/




function rd_cf7($atts, $content = null) {
	extract( shortcode_atts( array(
        'id' => '',
        'b_color' => '',
        'text_color' => '',		
        'font_weight' => '',	
        'field_radius' => '0',		
        'type' => '',
        'bg_color' => '',
        'place_holder' => '',
        'button_color' => '',
        'button_text_color' => '',
        'button_hover_color' => '',
        'btn' => '',
        'height' => '',
		
        'f_space' => 'fs_normal',
        'animation' => '',
		
	), $atts ) );
	
	global $rd_data;
	if($bg_color == '' ){ $bg_color = $rd_data['rd_content_bg_color'];}
	if($b_color == '' ){ $b_color = $rd_data['rd_content_border_color'];}	
	if($button_hover_color == '' ){ $button_hover_color = $rd_data['rd_content_hover_color'];}	
	
	
	$cf_id = RandomString(20);	


	


	$output = '<style>';
	if($text_color !== ''){
	$output .='#rd_'.$cf_id.' .wpcf7,#rd_'.$cf_id.' input:not([type=submit]),#rd_'.$cf_id.' textarea,#rd_'.$cf_id.' .wpcf7 select{color:'.$text_color.';}';
	}
	if($place_holder !== ''){
	$output .='#rd_'.$cf_id.' ::-webkit-input-placeholder{color:'.$place_holder.';}#rd_'.$cf_id.' :-moz-placeholder{color:'.$place_holder.';}#rd_'.$cf_id.' ::-moz-placeholder{color:'.$place_holder.';}#rd_'.$cf_id.' :-ms-input-placeholder{color:'.$place_holder.';}#rd_'.$cf_id.' .wpcf7 select{color:'.$place_holder.';}';	
	}
	if($font_weight == 'trending_style'){
	$font_weight = 900;
	$output .='#rd_'.$cf_id.' .wpcf7 {font-family:"Raleway"; font-size:12px; letter-spacing:1.5px; text-transform:uppercase;}';
	}
	if($font_weight !== ''){
	$output .='#rd_'.$cf_id.' .wpcf7 {font-weight:'.$font_weight.';}';
	}
	if($type == 'vertical'){
	$output .='#rd_'.$cf_id.' .wpcf7 input[type=text]{float: left; width: 31.5%;}#rd_'.$cf_id.' .wpcf7  input[type=email]{float: left; width: 31.5%; margin-right: 2.625%; margin-left: 2.625%;}#rd_'.$cf_id.' .wpcf7 textarea{ height: 200px; margin-top:30px;}';
	}
	if($btn == ''){
	$output .='#rd_'.$cf_id.' .wpcf7 input[type=submit]{font-size:15px; font-weight:900; border-radius:2px; padding:11px 15px; letter-spacing: 0.5px; margin-top:3px;}#rd_'.$cf_id.' .wpcf7 input[type=submit]:hover {background:'.$button_hover_color.'; color:#ffffff !important;}';
	}
	if($btn == 'stroke'){
	$output .='#rd_'.$cf_id.' .wpcf7 input[type=submit]{font-size:14px; font-weight:700; border-radius:5px; padding:9px 20px 10px; letter-spacing: 1.5px; border:2px solid; min-width:230px;}#rd_'.$cf_id.' .wpcf7 input[type=submit]:hover {background:'.$button_hover_color.'; border-color:'.$button_hover_color.'; color:#ffffff !important;}';
	}
	if($btn == 'big'){
	$output .='#rd_'.$cf_id.' .wpcf7 input[type=submit]{font-size:15px; font-weight:900; border-radius:2px; padding:11px 15px; letter-spacing: 0.5px;}#rd_'.$cf_id.' .wpcf7 input[type=submit]:hover {background:'.$button_hover_color.'; color:#ffffff !important;}';
	}
	if($btn == 'full_width'){
	$output .='#rd_'.$cf_id.' .wpcf7 input[type=submit]{font-size:16px; font-weight:900; border-radius:3px; padding:15px 15px 16px; border-bottom:3px solid rgba(0,0,0,0.5); letter-spacing: 0.5px; margin-top:13px; width:100%;}#rd_'.$cf_id.' .wpcf7 input[type=submit]:hover {background:'.$button_hover_color.'; color:#ffffff !important;}';
	}
	if($btn == 'full_width_business'){
	$output .='#rd_'.$cf_id.' .wpcf7 input[type=submit]{font-size:14px; font-weight:bold; border-radius:3px; padding:15px 15px 15px; border-bottom:1px solid rgba(0,0,0,0.3);  margin-top:13px; width:100%;}#rd_'.$cf_id.' .wpcf7 input[type=submit]:hover {background:'.$button_hover_color.'; color:#ffffff !important;}';
	}
	if($btn == 'full_width_stroke'){
	$output .='#rd_'.$cf_id.' .wpcf7 input[type=submit]{font-size:14px; font-weight:800; font-family:"Raleway"; border-radius:0px; padding:17px 15px 18px; border:2px solid; letter-spacing: 1.5px; margin-top:13px; width:100%;}#rd_'.$cf_id.' .wpcf7 input[type=submit]:hover {background:'.$button_hover_color.'; border-color:'.$button_hover_color.'; color:#ffffff !important;}';
	}
	if($height !== ''){
	$output .='#rd_'.$cf_id.' .wpcf7 textarea{height:'.$height.'px;}';
	}
	if($field_radius !== '' || $field_radius !== '0'){
	$output .='#rd_'.$cf_id.' .wpcf7 input:not([type=submit]),#rd_'.$cf_id.' textarea,#rd_'.$cf_id.' .wpcf7 select{border-radius:'.$field_radius.'px;}';
	}
	if($f_space == 'fs_normal'){
	$output .='#rd_'.$cf_id.' .wpcf7 input:not([type=submit]),#rd_'.$cf_id.' textarea,#rd_'.$cf_id.' .wpcf7 input[type=submit],#rd_'.$cf_id.' .wpcf7 select{margin-top:3px;}#rd_'.$cf_id.' p{margin-bottom:23px;}';
	}
	if($f_space == 'fs_medium'){
	$output .='#rd_'.$cf_id.' .wpcf7 input:not([type=submit]),#rd_'.$cf_id.' textarea,#rd_'.$cf_id.' .wpcf7 input[type=submit],#rd_'.$cf_id.' .wpcf7 select{margin-top:3px;}#rd_'.$cf_id.' p{margin-bottom:13px;}';
	}
	if($f_space == 'fs_small'){
	$output .='#rd_'.$cf_id.' .wpcf7 input:not([type=submit]),#rd_'.$cf_id.' textarea,#rd_'.$cf_id.' .wpcf7 input[type=submit],#rd_'.$cf_id.' .wpcf7 select{margin-top:3px;}#rd_'.$cf_id.' p{margin-bottom:7px;}';
	}
	$output .='#rd_'.$cf_id.' .wpcf7 input:not([type=submit]),#rd_'.$cf_id.' .wpcf7  textarea,#rd_'.$cf_id.' .wpcf7 select{border:1px solid '.$b_color.'; background:'.$bg_color.';}#rd_'.$cf_id.' .wpcf7 input[type=submit]{background:'.$button_color.'; color:'.$button_text_color.' !important;}</style>';
	$output .='<div id="rd_'.$cf_id.'" class="'.$animation.'">';
	$output .= do_shortcode('[contact-form-7 id="'.$id.'" ]'); 
	$output .='</div>';
	
	return $output;

}


add_shortcode('rd_cf7', 'rd_cf7');

?>
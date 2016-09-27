(function() {

	//$( document ).ready(function() {
		var style = '<style>#search-overlay{display:none;background-color:white;height:100vh;left:0;position:fixed;right:0;width:100vw}#search-overlay.show{display:block}#nav-search input[type=text]{background:white;border-radius:23px;color:#333;height:46px;font-size:16px;padding:0 18px}#nav-search button{cursor:default;background:white;border-radius:0 23px 23px 0;height:46px;width:46px}#nav-search button:after{content:"\\e680";color:#064C76;font-family:"printocean-icons";font-size:18px;font-weight:600}html[lang=nl] #home_products .col-2:nth-of-type(1){width:100%}html[lang=nl] #home_products .col-2:nth-of-type(2) .home-choose{display:none}html[lang=nl] .topsearch{display:none}.clear-fix:after{content:"";display:table;clear:both}.algolia-autocomplete{width:100%}.algolia-autocomplete .aa-input,.algolia-autocomplete .aa-hint{width:100%}.algolia-autocomplete .aa-hint{color:#999}.algolia-autocomplete .aa-dropdown-menu{background-color:#fff;border:1px solid #999;border-top:none;left:-285px !important;top:56px !important;width:980px !important}.algolia-autocomplete .aa-dropdown-menu:after{content:"";display:table;clear:both}.algolia-autocomplete .aa-dropdown-menu .aa-suggestion.aa-cursor{background:none !important}.algolia-autocomplete .aa-dropdown-menu .aa-suggestion em{font-weight:bold;font-style:normal}.algolia-autocomplete .aa-dropdown-menu .search-main,.algolia-autocomplete .aa-dropdown-menu .search-extra{display:inline-block;position:absolute;top:0}.algolia-autocomplete .aa-dropdown-menu .search-main>div,.algolia-autocomplete .aa-dropdown-menu .search-extra>div{display:inline-block}.algolia-autocomplete .aa-dropdown-menu .aa-suggestions{box-sizing:border-box;padding:25px 25px 0}.algolia-autocomplete .aa-dropdown-menu .aa-suggestions:after{content:"";display:table;clear:both}.algolia-autocomplete .aa-dropdown-menu .aa-suggestion{cursor:pointer}.algolia-autocomplete .aa-dropdown-menu .search-main{background:white;border-radius:0 0 5px 5px;display:inline-block;left:0;width:100%;-webkit-box-shadow:0px 16px 30px 0px rgba(50,50,50,0.54);-moz-box-shadow:0px 16px 30px 0px rgba(50,50,50,0.54);box-shadow:0px 16px 30px 0px rgba(50,50,50,0.54)}.algolia-autocomplete .aa-dropdown-menu .search-extra{right:0;width:40%}.algolia-autocomplete .category{color:#333;border-bottom:1px solid #CCC;font-weight:bold;margin:0 10px;padding:10px 5px;text-align:left}.algolia-autocomplete .aa-dataset-d2 .aa-suggestions{padding:10px 10px 0}.algolia-autocomplete .aa-dataset-d2 .aa-suggestion{color:#0093c7;display:none}.algolia-autocomplete .aa-dataset-d2 .aa-suggestion.aa-cursor{text-decoration:underline}.algolia-autocomplete .aa-dataset-d2 .aa-suggestion:nth-of-type(1),.algolia-autocomplete .aa-dataset-d2 .aa-suggestion:nth-of-type(2),.algolia-autocomplete .aa-dataset-d2 .aa-suggestion:nth-of-type(3),.algolia-autocomplete .aa-dataset-d2 .aa-suggestion:nth-of-type(4),.algolia-autocomplete .aa-dataset-d2 .aa-suggestion:nth-of-type(5){display:block}::-webkit-input-placeholder{color:#666 !important;opacity:1}.aa-dataset-d1,.aa-dataset-d2,.aa-dataset-d3{display:inline-block}.aa-dataset-d1{float:left;width:66%}.aa-dataset-d2,.aa-dataset-d3{float:right;width:33%}.aa-dataset-d2 .aa-suggestions,.aa-dataset-d3 .aa-suggestions{line-height:21px}.aa-dataset-d2 .aa-suggestion,.aa-dataset-d3 .aa-suggestion{margin-bottom:10px}.aa-dataset-d1 .aa-suggestion{box-sizing:border-box;border:2px solid white;float:left;width:164px;margin-right:27px;margin-bottom:25px;padding:0 0 10px;transition-property:border;transition-duration:0.3s}.aa-dataset-d1 .aa-suggestion.aa-cursor{border:2px solid #407eaf}.aa-dataset-d1 .aa-suggestion:nth-of-type(5n+5){margin-right:0}.aa-dataset-d1 .aa-suggestion .thumb{background-position:center center;background-repeat:no-repeat;background-size:contain;height:140px;margin:10px auto;overflow:hidden;width:140px}.aa-dataset-d1 .aa-suggestion .thumb img{opacity:0}.aa-dataset-d1 .aa-suggestion .name,.aa-dataset-d1 .aa-suggestion .price{display:inline-block;margin-bottom:10px;text-align:center;width:100%}.aa-dataset-d1 .aa-suggestion .name{color:#004C74;font-weight:bold}.aa-dataset-d1 .aa-suggestion .price{color:#9B9B9B}.aa-dataset-d1 .aa-suggestion .price em{color:#F34F2C}</style>';
		var searchBoxTemplate = '<script type="text/html" id="dropdown-test"> <span class="search-main clear-fix"> <span class="aa-dataset-d1 clear-fix"></span> <span class="aa-dataset-d2 clear-fix"></span> <span class="aa-dataset-d3 clear-fix"></span> </span> </script>';
		
		$("head")
			.append(style)
			.append(searchBoxTemplate);

		$.getScript("//cdn.jsdelivr.net/algoliasearch/3/algoliasearch.min.js", function() {
			return $.getScript("//cdn.jsdelivr.net/hogan.js/3.0/hogan.min.js", function() {
				return $.getScript("//cdn.jsdelivr.net/autocomplete.js/0/autocomplete.min.js", function() {

					if (typeof algoliaIndex  == 'undefined') {
						return;
					}

					var client = algoliasearch('0W9RB66P6V', '220643a4bd07aa48c2aa4dac07ed3c95');

	      			var productIndex = client.initIndex(algoliaIndex.product);
	      			var faqIndex = client.initIndex(algoliaIndex.faq);

	      			var productTemplate = Hogan.compile('<div class="product"><figure style="background-image: url({{{ search_image }}});" class="thumb"><img src="{{{ search_image }}}"></figure><span class="name">{{{ name }}}</span><span class="price">' + text_from + ' {{{ price }}}</span></div>');
	      			var faqTemplate = Hogan.compile('<div class="blogpost"><span class="title">{{{ title }}}</span></div>');

	      			autocomplete(
	      				"#seach-top-input", 
	      				{
	      					hint: false,
	      					templates: {
	      						dropdownMenu: "#dropdown-test"
	      					}
	      				},
	      				[
	      					{
	      						source: autocomplete.sources.hits(productIndex),
	      						displayKey: "name",
	      						name: "d1",
								templates: {
									header: '<div class="category">' + text_products + '</div>',
									suggestion: function(a) {
										return productTemplate.render(a)
									}
								}
	      					},
	      					{
	      						source: autocomplete.sources.hits(faqIndex),
	      						displayKey: "name",
	      						name: "d2",
								templates: {
									header: '<div class="category">' + text_faq + '</div>',
									suggestion: function(a) {
										return faqTemplate.render(a)
									}
								}
	      					}
	      				]
					).on("autocomplete:selected", function(a, e) {
						var url = e.url;
						if( a._args[1] == 'd2'){
						    url = algoliaIndex.faqUrl + "/" + e.url;
						}

						return window.location.href = url;
					});

					// Disable searching
					$(document).ready(function(){

						$('#search-top').on('submit', function(e){
							e.preventDefault();
						});

					});

				})
			})
		});
	//});

}).call(this);
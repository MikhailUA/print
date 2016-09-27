/**
 * 
 * Library for the tweak API functions
 * 
 * @author Lubomir Popivanov
 * 
 */
function Tweak() {
	
	//tweak user data
	var user = false;
//	var tweakServer = 'http://printocean_en.printkwik.com';
	var controllerName = 'tweak'; 
	var self = this;
	var dev_mode = false;
	
	/* choosedesign data */
	//total products
	var totalProducts = 0;
	//visible pages in paginator
	var paginatorVisiblePages = 0;
	//products container
	var product_container = null;
	//design type id
	var design_type_id = null;
	//industry id
	var industry_id = null;
	//business id
	var business_id = null;
	//total products on page
	var page_size = null
	//selected page
	var selected_page = null;
	//redirect_path needed in the product builder
	var redirect_path = null;
	//shop product id need in the product builder
	var shop_product_id = null;
	//new cart id need in the product builder
	var nci = null;
	//passed keywords for searching products
	var keywords = null;
	//lang strings
	var language_strings = [];
	//archive item controller name
	var archiveItemController = null;
	
	this.getDesignTypes = function(el) {
		
		$.ajax({
			type: 'POST',
			headers: { "cache-control": "no-cache" },
			dataType : "json",
			url: baseUri + '?rand=' + new Date().getTime(),
			async: true,
			cache: false,
			data: {
					ajax: 'true',
					controller: controllerName,
					requestData: 'designTypes'
				},
			success: function(jsonData){
				
				element = $(el).next('div.results');
				element.html('');
				element.append('<p>Results:</p>');
				$.each(jsonData, function(index, val) {
					element.append('<hr><p>ID: <b>'+val.id+'</b> name: <b>'+val.name+'</b>');
				});
				
				element.show();
				
				return jsonData;
			}
		});
		
	}
	
	/*
	 * Function to get tweak products by given parameters
	 */
	this.getProductsFromDesignType = function(el, design_type_id, industry_id, business_id, page_size, selected_page, redirect_path, shop_product_id, nci, keywords) {
		
		//unbind the click on design types
		self.unbindDesignTypesClick();
		
		$("#products_loader").show();
		self.unbindBussinesTypesClick();
		self.unbindIndustriesClick();
		$('#total_products').parent().addClass('hide');
		
		
		$.ajax({
			type: 'POST',
			headers: { "cache-control": "no-cache" },
			dataType : "json",
			url: baseUri + '?rand=' + new Date().getTime(),
			async: true,
			cache: false,
			data: {
					ajax: 'true',
					controller: controllerName,
					requestData: 'getProductsFromDesignType',
					design_type: design_type_id,
					industry: industry_id,
					business: business_id,
					page_size: page_size,
					page_number: selected_page,
					reurl: redirect_path,
					product_id: shop_product_id,
					nci: nci, 
					keywords: keywords
			},
			success: function(jsonData){
				$("#products_loader").hide();
				
				//check for error
				if (jsonData.error)
				{
					// bind all interfaces clicks
					
					//bind the click on design types
					self.bindDesignTypesClick();
					//bind industries click
					self.bindIndustriesClick();
					//bind business click
					self.bindBussinesTypesClick();
					return false;
				}
				
				// hide/show link for second preview		
				if ( $('#link-back-preview').length)
				{
					if (jsonData.item_pages < 2)
					{
						// hide second link
						$('#link-back-preview').addClass('hide')
					}else
					{
						$('#link-back-preview').removeClass('hide')		
					}
				
				}

				// clear old products
				el.html('');
				
				// apply popup data
				if ($('span.popup-label').length)
				{
					$('span.popup-label').text(jsonData.popup_info_label);
				}

				if (jsonData.popup_info){
					$.each(jsonData.popup_info, function(index, val) {
						if ( $('span#popup-name-'+index).length > 0)
						{
							$('span#popup-name-'+index).text(val.name);
						}

						if ( $('span#popup-price-'+index).length > 0)
						{
							$('span#popup-price-'+index).text(val.price);	
						}
					});
				}	

				$.each(jsonData.products, function(index, val) {
					
					var fav ='';
					if (val.favorite){
						fav = 'fav';
					}  else {
					    fav = 'notfav';
					}

					html_prod = "<a data-gaevent=\"click\" data-galabel=\""+jsonData.presta_name+"\" data-gacategory=\"tweak\" data-product_id=\""+val.id+"\" class=\"fancybox pop box\" href=\"#choose-design\"><span class=\"favortes-btn "+fav+"\"></span>";

                    if(val.all_thumbs) {
                        html_prod += "<div class=\"relative\">";
                      $.each(val.all_thumbs, function(index, val) {
                        image_obj = JSON.parse(val);
                        //console.log(image_obj);
                        if(image_obj.largePageUrl4) {
                        html_prod += "<img class=\"tweak_thumb front\" src=\""+image_obj.largePageUrl+"\" /><img class=\"tweak_thumb back\" src=\""+image_obj.largePageUrl4+"\" />";
                        } else if (image_obj.frontLargeUrl) {
                           if(image_obj.frontLargeUrl && image_obj.backLargeUrl) {
                            html_prod += "<img class=\"tweak_thumb front\" src=\""+image_obj.frontLargeUrl+"\" /><img class=\"tweak_thumb back\" src=\""+image_obj.backLargeUrl+"\" />";
                           } else {
                            html_prod += "<img class=\"tweak_thumb single-img\" src=\""+image_obj.frontLargeUrl+"\" />";
                           }
                        } else if (image_obj.largePageUrl) {
                          if(image_obj.largePageUrl && image_obj.largePageUrl2) {
                            html_prod += "<img class=\"tweak_thumb front\" src=\""+image_obj.largePageUrl+"\" /><img class=\"tweak_thumb back\" src=\""+image_obj.largePageUrl2+"\" />";
                          } else {
                            html_prod += "<img class=\"tweak_thumb single-img\" src=\""+image_obj.largePageUrl+"\" />";
                          }
                        }
                      });
                      html_prod += "</div>";
                    } else {
                        html_prod += "<div class=\"relative\"><img class=\"tweak_thumb\" src=\""+val.thumbnail+"\" height=\"300\" /></div>";
                    }

//					html_prod += "<div class=\"relative\"><img class=\"tweak_thumb front\" src=\""+val.thumbnail+"\" /><img class=\"tweak_thumb back\" src=\""+val.thumbnail+"\" /></div>";
				    //html_prod += "<a data-gaevent=\"click\" data-gacategory=\"tweak\" data-galabel=\""+jsonData.presta_name+"\" href=\""+val.product_builder_url+"\" class=\"bttn bttn-selection-s product-builder\">"+self.language_strings.text_design+"</a>";
                    html_prod += "<div class=\"inner-filter-product\">";
                    html_prod += "<p class=\"title\">"+self.language_strings.text_view+"</p>";
                    html_prod += "<p class=\"neutral\">"+self.language_strings.text_design+"</p>   ";
					html_prod +="</div></a><a data-gaevent=\"click\" data-gacategory=\"tweak\" data-galabel=\""+jsonData.presta_name+"\" href=\""+val.product_builder_url+"\" class=\"product-builder\"></a>";

					el.append(html_prod);
				});
				
				el.show();
				
				if(jsonData.countTotal != 0) {
					self.totalProducts = jsonData.countTotal; 
				}

				if( jsonData.countTotal == 0 && jsonData.zeroCount == true)
				{
					self.totalProducts = 0; 
				}
				
				$('#total_products').html(self.totalProducts);
				$('#total_products').parent().removeClass('hide');
				
				/*BIND EVENTS*/
				
				//bind the click on design types
				self.bindDesignTypesClick();
				
				
				//bind industries click
				self.bindIndustriesClick();
				
				//bind business click
				self.bindBussinesTypesClick();
				
				//build pagginator for new values
				self.buildProductsPaginator(jsonData.pageSize, selected_page, el, design_type_id, industry_id, business_id, page_size, selected_page, redirect_path, shop_product_id, nci, keywords);
				
				
				//bind the products clicks
				tweakobj.bindBuilderClick();
				
				//bind the images click
				tweakobj.bindProductImageclick();
				
				return jsonData;
			}
		});
		
	}
	
	// Build Paginator HTML
	this.buildProductsPaginator = function(size, current_page, el, design_type_id, industry_id, business_id, page_size, selected_page, redirect_path, shop_product_id, nci, keywords) {
		
		clicked_page = current_page;

		//pass this from controller
		if(!self.paginatorVisiblePages) self.paginatorVisiblePages = 6; // no lower than 5
		
		//caclulate new number of pages
		var number_of_pages = Math.ceil(self.totalProducts / size);
		var pages = [];
		
		//if the total number of pages are more than the visible pages setting
		if(number_of_pages > self.paginatorVisiblePages) {
			//set the middle pages count 
			var count_middle_pages = (self.paginatorVisiblePages - 2);
			
			//if is megative set it to the default
			if(count_middle_pages < 0) count_middle_pages = self.paginatorVisiblePages;
			
			last_group = false;
			
			//if the current page is 0 1 2 or 3 don`t change anything in the design
			if(current_page <= 3) {
				
				start_middle_page = 1;
				var count_middle_pages = (self.paginatorVisiblePages - 2);
				
				if(count_middle_pages < 0) count_middle_pages = self.paginatorVisiblePages;
				
				for (var i = start_middle_page; i <= count_middle_pages; i++){
					pages.push(i);
				}
				
				//this will be used to generate the link of the next pages listing
				next_pages_listing = 5;
				
			} else { //else
				
				//get the middle of the all pages and set the start with less 2 positions
				start_middle_page = current_page;
				
				//set 1
				pages.push(1);
				
				//set the previous listing flag
				pages.push('prev_listing');
				
				//if the current page is not the last listing page
				if(current_page <=  (number_of_pages - (self.paginatorVisiblePages - 2)) ) {
					
					
					//this will be used to generate the link of the previous pages listing
					prev_pages_listing = current_page-1;
					
					//set the other pages depending on the visible pages setting
					//the paginator is decremented with 4 positions because of the 2 continues positions and the first and the last positions
					for (var i = 0; i <= self.paginatorVisiblePages - 4; i++){
						
						pages.push(current_page);
						current_page++;
					}
					
					//this will be used to generate the link of the next pages listing
					//current page is incremented but not added into pages
					next_pages_listing = current_page;
					
				//else if the current page is the last page
				} else {
					
					last_group = true;
					
					prev_pages_listing = number_of_pages - (self.paginatorVisiblePages-3);
					
					current_page_listing = number_of_pages - (self.paginatorVisiblePages-2);
					
					//set the other pages depending on the visible pages setting
					//the paginator is decremented with 4 positions because of the 2 continues positions and the first and the last positions
					for (var i = 0; i <= self.paginatorVisiblePages - 2; i++){
						pages.push(current_page_listing);
						
						if (current_page_listing == number_of_pages) break;
						current_page_listing++;
					}
					
				}
					
			}
			
			//if the page is in the last group pages don`t add next listing button
			if(!last_group) {
				
				//set the second continue
				pages.push('next_listing');
				
				//finally set the total number of pages
				pages.push(number_of_pages);
				
			} 
			
		} else {
			
			for ( var j = 1 ; j <= number_of_pages; j++ )
			{
				pages.push(j);
			}
			
		}
		
		next_page = clicked_page+1;
		if(next_page > number_of_pages) {
			next_page = number_of_pages;
		}
		
		prev_page = clicked_page-1;
		if(prev_page < 0) {
			prev_page = 0;
		}
		
					
		$('div .pagination.inline').each(function(){
			
			//delete old values
			$(this).html('');

			// set the left arrow anchor
			if (!pages.length == 0) { var html_pages = '<a href="#" class="prev page-select-icon" data-page="'+prev_page+'"></a>'; }
			
			for (var i = 0; i < pages.length; i++) {
				
				var html_anchor_page = '';
				var html_anchor_link = '';
				
				if(pages[i] == 'prev_listing') {
					html_anchor_page = prev_pages_listing; 
					html_anchor_link = '...'; 
				} else if (pages[i] == 'next_listing') {
					html_anchor_page = next_pages_listing;
					html_anchor_link = '...';
				} else {
					html_anchor_page = pages[i]-1;
					html_anchor_link = pages[i];
				}
				
				if(html_anchor_page == clicked_page) {
					active = 'active';
				} else {
					active = '';
				}
				
				html_pages += '<a href="#" class="page-select-icon '+active+'" data-page="'+html_anchor_page+'">' + html_anchor_link + '</a>';
			}
			
			if (!pages.length == 0) { html_pages += '<a href="#" class="next page-select-icon"data-page="'+next_page+'"></a>'; }
			
			//apply html
			$(this).append(html_pages);
			
//			$(this).bind('click');
		});
		
		$('div .pagination.inline').off( "click", "a");
		
		// change page number and reload products
		$('div .pagination.inline').on( "click", "a", function( event ) {
		
			var new_value = parseInt( $(this).data("page") );
			
			if (current_page != new_value){
				current_page = new_value;
				
				//reload products
				tweakobj.getProductsFromDesignType(el, design_type_id, industry_id, business_id, page_size, current_page, redirect_path, shop_product_id, nci, keywords);
			}

			return false;
		});
		 		
	}
	
	this.getProductsInSet = function(el, set_id) {
		
		$.ajax({
			type: 'POST',
			headers: { "cache-control": "no-cache" },
			dataType : "json",
			url: baseUri + '?rand=' + new Date().getTime(),
			async: true,
			cache: false,
			data: {
					ajax: 'true',
					controller: controllerName,
					requestData: 'getProductsInSet',
					set_id: set_id
				},
			success: function(jsonData){
				
				element = $(el).next('div.results');
				element.html('');
				element.append('<p>Results:</p>');
				$.each(jsonData, function(index, val) {
					
					html_prod = "<hr><p><b>ID</b>: "+val.id+"<br><b>Thumb:</b><img src='"+val.thumbnail+"' /><br><b>designTypeId</b>: "+val.designTypeId+"</p>";
					
					element.append(html_prod);
				});
				
				element.show();
				
				return jsonData;
			}
		});
		
	}
	
	this.getDesignGroups = function(el) {
		
		$.ajax({
			type: 'POST',
			headers: { "cache-control": "no-cache" },
			dataType : "json",
			url: baseUri + '?rand=' + new Date().getTime(),
			async: true,
			cache: false,
			data: {
					ajax: 'true',
					controller: controllerName,
					requestData: 'getDesignGroups'
				},
			success: function(jsonData){
				
				element = $(el).next('div.results');
				element.html('');
				element.append('<p>Results:</p>');
				$.each(jsonData, function(index, val) {
					
					html_prod = "<hr><p><b>ID</b>: "+val.id+"<br><b>Name:</b> "+val.name+"'<br><b>rank</b>: "+val.rank+"</p>";
					
					element.append(html_prod);
				});
				
				element.show();
				
				return jsonData;
			}
		});
		
	}
	
	this.getDesignTypesInGroup = function(el, group_id) {
		
		$.ajax({
			type: 'POST',
			headers: { "cache-control": "no-cache" },
			dataType : "json",
			url: baseUri + '?rand=' + new Date().getTime(),
			async: true,
			cache: false,
			data: {
					ajax: 'true',
					controller: controllerName,
					requestData: 'getDesignTypesInGroup',
					group_id: group_id
				},
			success: function(jsonData){
				
				element = $(el).next('div.results');
				element.html('');
				element.append('<p>Results:</p>');
				$.each(jsonData, function(index, val) {
					
					html_prod = "<hr><p><b>ID</b>: "+val.id+"<br><b>Name:</b> "+val.name+"'<br></p>";
					
					element.append(html_prod);
				});
				
				element.show();
				
				return jsonData;
			}
		});
		
	}
	
	this.getProductsCategories = function (el) {
		
		$.ajax({
			type: 'POST',
			headers: { "cache-control": "no-cache" },
			dataType : "json",
			url: baseUri + '?rand=' + new Date().getTime(),
			async: true,
			cache: false,
			data: {
					ajax: 'true',
					controller: controllerName,
					requestData: 'getProductCategories'
				},
			success: function(jsonData){
				
				element = $(el).next('div.results');
				element.html('');
				element.append('<p>Results:</p>');
				$.each(jsonData, function(index, val) {
					
					var html_prod = "<hr><p>";
					html_prod += "<b>Category: </b>"+val.name;
					//if there are childs
					if(val.children) {
						
						//get the size
						children_size = val.children.length;
						
						//loop the childs
						for (var i=0; i < children_size; i++) {
							
							var child = val.children[i];
							
							html_prod += "<br><br>&nbsp;&nbsp;<b>Name:</b> "+child.name+"<br>&nbsp;&nbsp;<b>urlName:</b> "+child.urlName;
						}
						
					}
					
					html_prod+="</p>";
					element.append(html_prod);
				});
				
				element.show();
				
				return jsonData;
			}
		});
		
	}
	
	this.getIndustries = function (el) {
		
		$.ajax({
			type: 'POST',
			headers: { "cache-control": "no-cache" },
			dataType : "json",
			url: baseUri + '?rand=' + new Date().getTime(),
			async: true,
			cache: false,
			data: {
					ajax: 'true',
					controller: controllerName,
					requestData: 'getIndustries'
				},
			success: function(jsonData){
				
				element = $(el).next('div.results');
				element.html('');
				element.append('<p>Results:</p>');
				$.each(jsonData, function(index, val) {
					
					var html_prod = "<hr><p>";
					html_prod += "<b>Id: </b>"+val.id;
					html_prod += "<br><b>Name: </b>"+val.name;
					//if there are childs
					if(val.businessTypes) {
						
						//get the size
						children_size = val.businessTypes.length;
						
						//loop the childs
						for (var i=0; i < children_size; i++) {
							
							var child = val.businessTypes[i];
							
							html_prod += "<br><br>&nbsp;&nbsp;<b>Id:</b> "+child.id+"<br>&nbsp;&nbsp;<b>Name:</b> "+child.name;
						}
						
					}
					
					html_prod+="</p>";
					element.append(html_prod);
				});
				
				element.show();
				
				return jsonData;
			}
		});
		
	}
	
	this.getBusinessTypes = function (el, industry) {
		
		$.ajax({
			type: 'POST',
			headers: { "cache-control": "no-cache" },
			dataType : "json",
			url: baseUri + '?rand=' + new Date().getTime(),
			async: true,
			cache: false,
			data: {
					ajax: 'true',
					controller: controllerName,
					requestData: 'getBusinessTypesOfIndustry',
					industry: industry
				},
			success: function(jsonData){
				
				element = $(el).next('div.results');
				element.html('');
				element.append('<p>Results:</p>');
				$.each(jsonData, function(index, val) {
					
					var html_prod = "<hr><p><b>Id: </b>"+val.id+"<br><b>Name: </b>"+val.name+"</p>";
					
					element.append(html_prod);
				});
				
				element.show();
				
				return jsonData;
			}
		});
		
	}

	/**
	 * Function to get tweak user data
	 */
	this.getTweakUserAndSetData = function(email, el) {
		
		if(!user && email) {
			$.ajax({
				type: 'POST',
				headers: { "cache-control": "no-cache" },
				dataType : "json",
				url: baseUri + '?rand=' + new Date().getTime(),
				async: true,
				cache: false,
				data: {
						ajax: 'true',
						controller: controllerName,
						requestData: 'checkuser',
						email: email
					},
				success: function(jsonData){
					user = jsonData;
				}
			});
			
		} else {
			
			element = $(el).next('div.results');
			element.html('');
			element.append('<p>Results:</p>');
			
			html_data = "<hr><p><b>ID: </b>"+user.id+"<br><b>Token: </b>"+user.token+"<br><b>Username: </b>"+user.username+"</p>";
			element.append(html_data);
			
			element.show();
			
		}
	}
	
	this.getTweakUserWorkspace = function(el, withlogos) {
		
		if(!self.user) return false;
		
		//request method
		requestData = 'getUserWorkspase';

		//request method if with logos
		if(withlogos) {
			requestData = 'getUserWorkspaseWithLogos';
		}
		
		$.ajax({
			type: 'POST',
			headers: { "cache-control": "no-cache" },
			dataType : "json",
			url: baseUri + '?rand=' + new Date().getTime(),
			async: true,
			cache: false,
			data: {
					ajax: 'true',
					controller: controllerName,
					requestData: requestData,
					token: self.user.token
				},
			success: function(jsonData){
				element = $(el).next('div.results');
				element.html('');
				element.append('<p>Results:</p>');
				
				$.each(jsonData, function(index, val) {
					
					var html_prod = "<hr><p><b>Id: </b>"+val.id+"<br><b>Name: </b>"+val.name+"<br><b>Thumb: </b> <img src='"+self.tweakServer+val.thumbnailPath+"' /><br><b>Created: </b>"+val.created+"<br><b>DesignTypeId: </b>"+val.designTypeId+"<br><b>Ordered: </b>"+val.ordered+"<br><b>Logo: </b>"+val.logo+"</p>";
					
					element.append(html_prod);
				});

				element.show();
			}
		});
		
		
		
	}
	
	/**
	 * 
	 * Function to get customized product and return html
	 * 
	 * available actions:
	 * 		'order' - get the product and proceed to order
	 * 		'edit' - get the product and open the product builder
	 * 
	 * In both cases the product builder will be opened , the main difference is the 
	 * redirect url after checkout in product builder
	 *  
	 * products_area, jsonData.id, action, clicked_element
	 */
	this.getCustomizedProduct = function(products_area, itemid, action, clicked_element, show_general_loader) {
		
		if(!itemid) return false;
		
		//request method
		requestData = 'getCustomizedProduct';
		
		if(show_general_loader) {
			ajax_block_loader_show();
		}
		
		$.ajax({
			type: 'POST',
			headers: { "cache-control": "no-cache" },
			dataType : "json",
			url: baseUri + '?rand=' + new Date().getTime(),
			async: true,
			cache: false,
			data: {
					ajax: 'true',
					controller: controllerName,
					requestData: requestData,
					itemid: itemid
				},
			success: function(jsonData){
				
				//clone the new area
				var new_area = $('div.box:first', products_area).clone(true);
				
				//get the image src
				image_src = clicked_element.closest('div.box').find('img').attr('src');
				
				//set the product tweak id
				new_area.attr('data-tweak_id', itemid);
				$('img', new_area).attr('src', image_src);
				
				//set the edit link
				$('li a.product-builder:first', new_area).attr('href', jsonData.edit_link);
				
				var new_li = $('li:first', new_area).clone(true);
				
				new_li.find('a').html(language_strings.text_editdesign);
				new_li.find('a').attr('href', jsonData.order_link);
				
				$('ul', new_area).prepend(new_li);
				
				products_area.prepend(new_area);
				
				/*

				@todo SHOULD BE REMOVED AFTER CONFIRMATION IF WORKING WELL
				
				//get the clicked element image src
				//this is because currently the api didn`t created the image and to not make delay got the current one
				image_src = clicked_element.closest('div.box').find('img').attr('src');
				
				html_prod = "<div class='box'><div class='left'>";
				html_prod += "<h4 class='title-mini nobold'></h4>";
				html_prod += "<div class='product-image'><img src='"+image_src+"' ></div>";							
				//html_prod += "<a href='"+jsonData.preview_link+"' class='left product-builder'>"+self.language_strings.text_view+"</a>";
				html_prod += "</div><div class='left'>";
				html_prod += "<p><strong>"+self.language_strings.text_product+":</strong>"+jsonData.productName+"</p>";
				html_prod += "<p><strong>"+self.language_strings.text_createdate+":</strong>"+Date.now()+"</p>";
				html_prod += "<p ><strong>"+self.language_strings.text_ordered+":</strong></p>";
				html_prod +="<ul><li><a id='e_"+itemid+"' href='"+jsonData.edit_link+"' class='product-builder'>"+self.language_strings.text_editdesign+"</a></li>";
				html_prod +="<li><a id='o_"+itemid+"' href='"+jsonData.order_link+"' class='product-builder'>"+self.language_strings.text_ordernow+"</a></li>";
				html_prod +="<li><a href='#' class='dublicate-product-id' data-tweak_id='"+itemid+"' >"+self.language_strings.text_copy+"</a></li>";
				html_prod +="</ul></div> </div>";
				
				products_area.prepend(html_prod);
				
				//bind the products clicks
				tweakobj.bindBuilderClick();
				
				// check for action
				if (action == 'order') {
					// make a order
					$('#o_'+itemid).click();
				} else if(action == 'edit') {
					//open for edit
					$('#e_'+itemid).click();
				}
				*/
				/*
				$("<img id='"+itemid+"' src='"+self.tweakServer+jsonData.thumbnail+"' >").load(function() {
					
					$(this).appendTo('.product-image:first');
				});
				
				// TODO Need Better soluton for refresh thumbs picture, it is not available at the moment of api responce
				setTimeout(function(){
					$("#"+itemid).attr("src", self.tweakServer+jsonData.thumbnail+"?"+new Date().getTime());
				},5000);
				
				setTimeout(function(){
					$("#"+itemid).attr("src", self.tweakServer+jsonData.thumbnail+"?"+new Date().getTime());
				},15000);
				*/
				
				if(show_general_loader) {
					ajax_block_loader_hide();
				}
			}
		});
		
	}
	
	this.getCustomizedLogo = function(products_area, logoid, action, clicked_element, show_general_loader) {
		
		if(!logoid) return false;
		
		//request method
		requestData = 'getCustomizedLogo';
		
		if(show_general_loader) {
			ajax_block_loader_show();
		}
		
		$.ajax({
			type: 'POST',
			headers: { "cache-control": "no-cache" },
			dataType : "json",
			url: baseUri + '?rand=' + new Date().getTime(),
			async: true,
			cache: false,
			data: {
					ajax: 'true',
					controller: controllerName,
					requestData: requestData,
					logoid: logoid
				},
			success: function(jsonData){
				
				var new_area = $('div.box:first', products_area).clone(true);
				
				image_src = clicked_element.closest('div.box').find('img').attr('src');
				
				//set the thumbnail
				$('img', new_area).attr('src', image_src);
				
				//set the product tweak id
				new_area.attr('data-tweak_id', logoid);
				
				var date_string = $('.date-created', new_area).find('strong').clone();
				
				$('.date-created', new_area).html(jsonData.date_created);
				$('.date-created', new_area).prepend(date_string);
				
				//add the logo to the lsiting
				products_area.prepend(new_area);
				
				//hide the loader
				if(show_general_loader) {
					ajax_block_loader_hide();
				}
				
			}
		});
		
	}
	
	/**
	 * Function to get order Data
	 */
	this.getOrder = function(el, orderNumber) {
		
		if(!orderNumber) return false;
		
		//request method
		requestData = 'getOrder';
		
		$.ajax({
			type: 'POST',
			headers: { "cache-control": "no-cache" },
			dataType : "json",
			url: baseUri + '?rand=' + new Date().getTime(),
			async: true,
			cache: false,
			data: {
					ajax: 'true',
					controller: controllerName,
					requestData: requestData,
					orderNumber: orderNumber
				},
			success: function(jsonData){
				element = $(el).next('div.results');
				element.html('');
				element.append('<p>Results:</p>');
				
				var html_prod = "<hr><p><b>partnerOrderNumber: </b>"+jsonData.partnerOrderNumber+"<br><b>renderStatus: </b>"+jsonData.renderStatus+"<br><b>tweakOrderNumber: </b>"+jsonData.tweakOrderNumber+"</p>";
				
				element.append(html_prod);

				element.show();
			}
		});
		
	}
	
	/**
	 * 
	 * Generate user product preview
	 * 
	 */
	this.generateProductPreview = function(productId) {
		var params = {};
		params.wmode = "window";
		params.allowscriptaccess = "always";
		params.quality = "high";
		params.bgcolor = "#515151";
		params.allowfullscreen = "true";
		var attributes = {};
		attributes.id = "tweakProductPreview";
		attributes.name = "tweakProductPreview";
		attributes.align = "middle";
		var xiSwfUrlStr = self.tweakServer+"/playerProductInstall.swf";
		var flashvars = {};
		flashvars["productId"] = productId;
		flashvars['externalEmbed'] = 'true';
		
		swfobject.embedSWF(self.tweakServer+"/TweakProductPreview.swf", "previewSwf", "100%", "100%", "10.2.0", xiSwfUrlStr, flashvars, params, attributes);
		swfobject.createCSS("#previewSwf", "display: block; padding: 25px; overflow: hidden;");
	}
	
	/**
	 * 
	 * Generate user product builder 
	 */
	this.generateProductBuilder = function(productId, nci) {
		//if there is no productId do nothing
		if(!productId) return false;

		var params = {};
		params.wmode = "window";
		params.allowscriptaccess = "always";
		params.quality = "high";
		params.bgcolor = "#515151";
		params.allowfullscreen = "true";
		var attributes = {};
		attributes.id = "ProductBuilder";
		attributes.name = "ProductBuilder";
		attributes.align = "middle";
		var xiSwfUrlStr = self.tweakServer+"/playerProductInstall.swf";
		var flashvars = {};
		//this
		flashvars["productId"] = productId;
		//or
		//flashvars["customizedProductId"] = customizedProductId;
		if(self.user) {
			flashvars["apiPartnerAuthUrl"] = self.user.token;
		} else {
			//to load the login/register user if not
			flashvars["apiCallback"] = "loginOrRegister";
		}
		
		if (nci){
			flashvars['disableProductSelection'] = 'true';
			flashvars['checkoutUrl'] = escape("/index.php?controller=choosedesign&p_checkout=1&nci="+nci+"&redirect=" + self.redirect_path +"&id_product=" + self.shop_product_id +"&");
		}else{
			flashvars['checkoutUrl'] = escape("/index.php?controller=choosedesign&p_checkout=1&redirect=" + self.redirect_path +"&id_product=" + self.shop_product_id +"&");
		}	
		flashvars["locale"] = ""+self.builderLanguage+"";
		flashvars['externalEmbed'] = 'true';
		flashvars['simpleBuilder'] = 'true';
		
		swfobject.embedSWF(self.tweakServer+"/main.swf", "customizeSwf", "100%", "100%", "10.2.0", xiSwfUrlStr, flashvars, params, attributes);
		swfobject.createCSS("#customizeSwf", "display: block; padding: 25px; overflow: hidden;");
	
	}
	
	/**
	 * 
	 * Generate user product editer 
	 */
	this.generateProductEditor = function(customizedProductId , edit) {
		
		//if there is no customizedProductId do nothing
		if(!customizedProductId) return false;

		var params = {};
		params.wmode = "window";
		params.allowscriptaccess = "always";
		params.quality = "high";
		params.bgcolor = "#515151";
		params.allowfullscreen = "true";
		var attributes = {};
		attributes.id = "ProductBuilder";
		attributes.name = "ProductBuilder";
		attributes.align = "middle";
		var xiSwfUrlStr = self.tweakServer+"/playerProductInstall.swf";
		
		var flashvars = {};
		
		flashvars["customizedProductId"] = customizedProductId;
		
		if(self.user) {
			flashvars["apiPartnerAuthUrl"] = self.user.token;
		} else {
			//to load the login/register user if not
			flashvars["apiCallback"] = "loginOrRegister";
		}
		
		if (edit){
			flashvars['checkoutUrl'] = escape("/index.php?controller=choosedesign&p_edit=1&redirect=" + self.redirect_path +"&id_product=" + self.shop_product_id +"&");
		}else{
			flashvars['checkoutUrl'] = escape("/index.php?controller=choosedesign&p_checkout=1&redirect=" + self.redirect_path +"&id_product=" + self.shop_product_id +"&");
		}
		flashvars['externalEmbed'] = 'true';
		flashvars["locale"] = ""+self.builderLanguage+"";
		swfobject.embedSWF(self.tweakServer+"/main.swf", "customizeSwf", "100%", "100%", "10.2.0", xiSwfUrlStr, flashvars, params, attributes);
		swfobject.createCSS("#customizeSwf", "display: block; padding: 25px; overflow: hidden;");
	
	}

	/**
	 * 
	 * Function to duplicate customized product
	 * 
	 * available actions:
	 * 		'order' - get the product and proceed to order
	 * 		'edit' - get the product and open the product builder
	 * 
	 * In both cases the product builder will be opened , the main difference is the 
	 * redirect url after checkout in product builder
	 * 
	 */
	this.duplicateCustomizedProduct = function(customizedProductId, products_area, clicked_element, action, show_general_loader) {
		
		//if there is no customizedProductId do nothing
		if(!customizedProductId) return false;
		
		//if there is no user set
		if(!self.user) return false;
		
		//this is called only to show the loader
		//it's not called to hide it because there is another ajax call in the response
		if(show_general_loader) {
			ajax_block_loader_show();
		}
		
		$.ajax({
			type: 'POST',
			headers: { "cache-control": "no-cache" },
			dataType : "json",
			url: baseUri + '?rand=' + new Date().getTime(),
			async: true,
			cache: false,
			data: {
					ajax: 'true',
					controller: controllerName,
					requestData: 'duplicateCustomizedProduct',
					productId: customizedProductId,
					token: self.user.token
				},
			success: function(jsonData){
				
				self.getCustomizedProduct(products_area, jsonData.id, action, clicked_element, show_general_loader);
			
			}
				
		});
		
	}
	
	this.duplicateCustomizedLogo = function(customizedLogoId, products_area, clicked_element, action, show_general_loader) {
		
		//if there is no customizedLogoId do nothing
		if(!customizedLogoId) return false;
		
		//if there is no user set
		if(!self.user) return false;
		
		//this is called only to show the loader
		//it's not called to hide it because there is another ajax call in the response
		if(show_general_loader) {
			ajax_block_loader_show();
		}
		
		$.ajax({
			type: 'POST',
			headers: { "cache-control": "no-cache" },
			dataType : "json",
			url: baseUri + '?rand=' + new Date().getTime(),
			async: true,
			cache: false,
			data: {
					ajax: 'true',
					controller: controllerName,
					requestData: 'duplicateCustomizedLogo',
					logoid: customizedLogoId,
					token: self.user.token
				},
			success: function(jsonData){
				
				self.getCustomizedLogo(products_area, jsonData.id, action, clicked_element, show_general_loader);
			}
				
		});
		
	}
	
	this.generateLogoBuilder = function(customizedlogo, redirect) {
		
		//if there is no user set
//		if(!self.user) return false;
		
		var params = {};
		params.wmode = "window";
		params.allowscriptaccess = "always";
		params.quality = "high";
		params.bgcolor = "#515151";
		params.allowfullscreen = "true";
		var attributes = {};
		attributes.id = "LogoBuilder";
		attributes.name = "LogoBuilder";
		attributes.align = "middle";
		var xiSwfUrlStr = self.tweakServer+"/playerProductInstall.swf";
		var flashvars = {};
		if (customizedlogo){
			flashvars['customizedLogoId'] = customizedlogo;
		}else{
			flashvars['customizedLogoId'] = "";
		}
		
		flashvars['industryId'] = "60";
		flashvars['businessTypeId'] = "843";
		
		if(!redirect) {
			flashvars['checkoutUrl'] = escape("/index.php?controller=tweak-account&logo=1");
		} else {
			flashvars['checkoutUrl'] = escape(redirect);
		}
		
		
		if(self.user) {
			flashvars['customerToken'] = self.user.token;
		} else {
			flashvars['apiCallback'] = 'loginOrRegister';
		}
		
		flashvars["locale"] = ""+self.builderLanguage+"";
		
		swfobject.embedSWF(self.tweakServer+"/logoBuilder.swf", "logoBuilderSwf", "100%","100%", "10.2.0", xiSwfUrlStr, flashvars, params, attributes);
		swfobject.createCSS("#customizeSwf", "display: block; padding: 25px; overflow:hidden;");
		
	}
	
	this.setUserTokenForBuilder = function() {
		userToken = this.user.token;
		var mv;
		if (navigator.appName.indexOf("Microsoft") != -1) {
			mv = window["ProductBuilder"];
		} else {
			mv = document["ProductBuilder"];
		}
		
		if(mv != null) {
			try{
				mv.setUserToken(userToken);
			} catch(e){
				console.log(e);
			}
		}
	}

	this.getProductPreviewImages = function(productId, mode) {
		if (!productId) return false;
		
		//request method
		requestData = 'getProductPreviewImages';
		
		$.ajax({
			type: 'POST',
			headers: { "cache-control": "no-cache" },
			dataType : "json",
			url: baseUri + '?rand=' + new Date().getTime(),
			async: true,
			cache: false,
			data: {
					ajax: 'true',
					controller: controllerName,
					requestData: requestData,
					product_id: productId
			},
			success: function(jsonData){

				// check for frontLargeUrl
				if(jsonData.largePageUrl4){
					// show center
					$('a[data-show="center-preview"]').removeClass('hide');
					$('div.center_preview').removeClass('hide');
					$('#product_preview_center2').removeClass('hide');

					$('#product_preview_front').attr('src', jsonData.largePageUrl).load(function() {$(this).show()});
					$('#product_preview_center').attr('src', jsonData.largePageUrl2);
					$('#product_preview_center2').attr('src', jsonData.largePageUrl3);
					$('#product_preview_back').attr('src', jsonData.largePageUrl4);

				// check for frontLargeUrl
				}else if(jsonData.frontLargeUrl){
					// show center
					$('a[data-show="center-preview"]').removeClass('hide');
					$('div.center_preview').removeClass('hide');
					// hide second center image
					$('#product_preview_center2').addClass('hide');

					$('#product_preview_front').attr('src', jsonData.frontLargeUrl).load(function() {$(this).show()});
					$('#product_preview_center').attr('src', jsonData.largePageUrl);
					$('#product_preview_back').attr('src', jsonData.backLargeUrl);

				}else{
					$('#product_preview_front').attr('src', jsonData.largePageUrl).load(function() {$(this).show()});
					$('#product_preview_back').attr('src', jsonData.largePageUrl2);

					//hide center
					$('a[data-show="center-preview"]').addClass('hide');
					$('div.center_preview').addClass('hide');
				}
								
				return jsonData;
			}
		});
		
	}


	this.bindBuilderClick = function() {

		$(".product-builder").fancybox({
		    wrapCSS         : "tweakfancybox",
		    openEffect      : "none",
            closeEffect     : "none",
            openSpeed       : 20,
            closeSpeed      : 20,
			"autoSize"      : false,
			"width"         : "1050px",
			"height"        : "620px",
			"type"          : "iframe",
            "scrolling"     : "no",
            helpers: {
                overlay: {
                  locked: true,
                  closeClick: false,
                  css: { "background": "rgba(0, 0, 0, 0.1)" },
                  speedIn: 20,
                  speedOut: 20
                }
            },
            beforeShow: function() {
                $("body").on({
                "mousewheel": function(e) {
                    if (e.target.id == 'el') return;
                    e.preventDefault();
                    e.stopPropagation();
                    }
                });
            },
            afterClose: function() {
                 $("body").unbind("mousewheel");
            }

		});


	}
	
	this.bindLogosClick = function() {
		//Fancybox
	    $(".logo-builder").fancybox({
//	      wrapCSS: 'pop design', 
	      openEffect      : "none",  
	      closeEffect     : "none",
	      openSpeed       : 20,
	      closeSpeed      : 20,
	      padding         : [50,50,50,50],
	       helpers : {
	         overlay: {
	          css: { 'background': 'rgba(0, 0, 0, 0.1)' },
	          speedIn: 20,
	          speedOut: 20
	         }
	       },
	       beforeShow: function() {
	    	   logo_id = $(this.element).closest('div.box').data('tweak_id');
	    	   redirect = $(this.element).data('redirect_path');
	    	   
	    	   $('#flashBuilder').removeClass('hide');
	    	   
	    	   self.generateLogoBuilder(logo_id, redirect);
	       },
	       afterClose: function() {
	    	   swfobject.removeSWF('LogoBuilder');
	    	   
	    	   $('#flashBuilder').html('<div class="swf" id="logo_builder"><div id="logoBuilderSwf"> </div></div>');
	       }
	    });
	    
	}
	
	this.bindProductImageclick = function() {
		$('.design-image a').unbind('click');
		
		$('.design-image a').bind('click', function() {
			var parent = $('.design-image');
			var div_class =  $(this).attr('data-show');
			var div_to_show = $('.'+div_class, parent);
	        
	        //hide the current
	    	$(this).closest('div:visible').hide();
	    	
	    	//show the next
	    	div_to_show.show();

	    	//image
	    	var images_block = parent.parent('div');
	    	
	    	image_to_show = $('img.'+div_class, images_block);
	    	image_to_hide = $('img:visible', images_block);

	    	image_to_show.show();
	    	image_to_hide.hide();
	    	return false;
		});
	}
	
	/**
	 * 
	 * Bind industries clicks in choose design page
	 * 
	 */
	this.bindIndustriesClick = function() {
		
		// select industry
		$('.industryName').on('click', function() {
			
			//get the parent
			var parent = $(this).closest('span.industry');
			
			//if the parent is not selected
			if(!parent.hasClass('active')) {
				
				//clear all checked elements in the left sided menu with childs
				self.clearCheckedCategoriesLeftSidedElements();

				//add class active to the parent
				parent.addClass("active");
                $(this).addClass("active");
				
				// show pagginator if hidden
				self.showPaginator();

				// show buisness filters
				$('#business-filter').show();

				if ( self.industry_id != 0 ){
					$('#industry_id_' + self.industry_id).hide();
				}

				self.industry_id = parent.attr('data-filter');
				self.business_id = null;
				$('#industry_id_' + self.industry_id).show();
				
			} else { //the parent is selected already
				
				//clear the selected childs of the parent
				self.clearCheckedCategoriesLeftSidedElements(parent);
				parent.removeClass("active");
                $(this).removeClass("active");
                self.business_id = null;
				
				self.industry_id = parent.attr('data-filter');
				$('#industry_id_' + self.industry_id).hide();
				
				self.industry_id = null;
			}
			
//			self.industry_id = active_industry;
			 
			//load products
			self.selected_page = 0;
			tweakobj.getProductsFromDesignType(self.product_container, self.design_type_id, self.industry_id, self.business_id, self.page_size, self.selected_page, self.redirect_path, self.shop_product_id, self.nci, self.keywords);
			
		});
	}
	
	/**
	 * 
	 * Unbind the Industries click in choose design page
	 * 
	 */
	this.unbindIndustriesClick = function () {
		$('.industryName').off('click');
	}
	
	/**
	 * 
	 * Function to bind bussines types click in choose desing page
	 * 
	 */
	this.bindBussinesTypesClick = function() {
		$('.businessName').on('click', function() {
			
			//get the paretn div
			var parent = $(this).closest('div');
			
			//if not selected
			if(!$(this).hasClass('active')) {
				
				//first remove all active elements
				$('.businessName', parent).removeClass('active');
				
				//add active class to the element
				$(this).addClass('active');
				
				// show pagginator if hidden
				self.showPaginator();
				
				selected_business = $(this).attr('data-filter');
				
			} else { //else if the element is selected
				
				//remove all active elements
				$('.businessName', parent).removeClass('active');
				
				selected_business = null;
			}
			
			self.business_id = selected_business;
			
			//unbind the industries click
			self.unbindBussinesTypesClick();
			
			//load products
			self.selected_page = 0;
			tweakobj.getProductsFromDesignType(self.product_container, self.design_type_id, self.industry_id, self.business_id, self.page_size, self.selected_page, self.redirect_path, self.shop_product_id, self.nci, self.keywords);
			
		})
	}
	
	/**
	 *  
	 * Function to unbind the bussines types click in choose design page
	 */
	this.unbindBussinesTypesClick = function() {
		$('.businessName').off('click');
	}
	
	/**
	 * 
	 * Function to bind design types click
	 * 
	 */
	this.bindDesignTypesClick = function() {
		
		$('.design-type').on('click', function() {
			
			//if not selected
			if(!$(this).hasClass('active')) {
				
				//clear all checked categories
				self.clearCheckedCategoriesLeftSidedElements();
				
				//clear all selected elements
				self.clearCheckedFormatsLeftSidedElements();
				
				//add active class to the element
				$(this).addClass('active');
				
				design_type = $(this).attr('data-filter');
				redirect_path =  $(this).attr('url-redirect');
				
				//load products
				selected_page = 0;
				self.business_id = null;
				self.industry_id = null;
				self.design_type_id = design_type;
				//make the call
				self.getProductsFromDesignType(self.product_container, self.design_type_id, self.industry_id, self.business_id, self.page_size, self.selected_page, self.redirect_path, self.shop_product_id, self.nci, self.keywords);
			}
			
		})
		
	}
	
	/**
	 *  
	 * Function to unbind the designt types click in choose design page
	 */
	this.unbindDesignTypesClick = function() {
		$('.design-type').off('click');
	}
	
	/**
	 * 
	 * Function to clear all left side menu cateogries in choose design page
	 */
	this.clearCheckedCategoriesLeftSidedElements = function (parent) {
		
		//if parent is passed clear only his active childs
		if(parent) {
			$('span.active', parent).removeClass('active');
		} else { //clear all left menu side
			$('.categories span.active').removeClass('active');	
		}
		
	}
	
	/**
	 * 
	 * Function to reset left side menu formats in choose design page
	 */
	this.clearCheckedFormatsLeftSidedElements = function () {
		$('.design-type').removeClass('active');
	}
	
	/**
	 * 
	 * Funtion to show the paginator in choose design page
	 * 
	 */
	this.showPaginator = function (){

		if ($('.pagination').hasClass('hide') ){
			$('.pagination').removeClass('hide');
			$('label[for=per-page]').removeClass('hide');
		}

	}
	
	
	/**
	 * 
	 * Function to archive elements
	 * 
	 */
	this.archiveTweakItem = function(productId, area_to_remove) {
		
		//if there is no productId do nothing
		if(!productId) return false;
		
		//if there is no user set
		if(!self.user) return false;
		
		//show loader
		ajax_block_loader_show();
		
		$.ajax({
			type: 'POST',
			headers: { "cache-control": "no-cache" },
			dataType : "json",
			url: baseUri + '?rand=' + new Date().getTime(),
			async: true,
			cache: false,
			data: {
					ajax: 'true',
					controller: self.archiveItemController,
					archiveItem: 1,
					productId: productId,
				},
			success: function(jsonData){
				
				//hide loader
				ajax_block_loader_hide();
				
				if(jsonData.success == 1) {
					area_to_remove.remove();
				} else if(jsonData.hasErrors == 1) {
					
				}
				
				
			}
				
		});
		
	}
	
	/*
	//constructor
	var __constructor = function(that) {
		if(self.dev_mode) {
			//that.getTweakUserAndSetData();
		}
	}(this)
	*/
}

function loginOrRegister() {
	
	$.fancybox({
		//'scrolling' : 'no',
		'type' : 'inline',
		'autoSize' : false,
		'width' : 'auto',
		'height' : 'auto',
		'href' : '#popupLogin',
        'padding' : [50, 70, 50, 70],
			afterClose : function() {
				//reset the div elements
				$('#popuplogincontainer').show();
				$('#recoverPasswordArea').hide();
				$('#registerUserArea').hide();
			},
            helpers: {
                overlay: {closeClick: false}
            }
	});
	
}
	
//requirement checks
var requirementsCheck = {
	MIN_FLASH: '10.2.0',
	needFlash: function() {
		return !swfobject.hasFlashPlayerVersion(this.MIN_FLASH);
	},
	doChecks: function() {
		var needFlash = !swfobject.hasFlashPlayerVersion(this.MIN_FLASH);
		var isChrome = /chrome/.test(navigator.userAgent.toLowerCase());
		
		if (needFlash) {
			var url = "/popups/error-flash?";
			var params = "";
			if (needFlash) { params += "&needFlash="+needFlash; }
			if (isChrome) { params += "&isChrome=true"; }
			this.launchWizard(url + params.substring(1));
		}
	},
	launchWizard: function(wizard) {
		$('body').append('<a href="' + wizard + '" class="wizard" style="display:none;">Hidden link</a>');
		$('a.wizard').fancybox({
			'autoScale' : false,
			'transitionIn' : 'none',
			'transitionOut' : 'none',
			'type' : 'ajax'
		}).trigger('click');
		$('#wizard a.next').live('click',function() {
			$('#wizard .content').css({width:$('#wizard .page').length*900})
			var currentPosition = $('#wizard .content').position();
			leftPosition = currentPosition.left;
			var nextSlide = leftPosition - 900;
			$('#wizard .content').animate({left:nextSlide});
		});
		$('a.done').live('click',function() {
			$.fancybox.close();
		});
	},
	needToInstallFlash: function() {
		return swfobject.getFlashPlayerVersion().major == 0;
	},
	popupsDisabled : function() {
		if (window.ActiveXObject) {
			if (this.getCookie()) {
				return false;
			}
			var popup = window.open("/popups/error-popup", "popupCheck", "width=1,height=1,left=9000,top=9000,location=no,menubar=no,resizable=no,scrollbars=no, status=no,titlebar=no,toolbar=no");
			window.focus();
			if(!popup || popup.closed || typeof popup == 'undefined' || typeof popup.closed=='undefined') {
				return true;
			}
			popup.close();
			this.setCookie();
			return false;
		}
		return false;
	},
	COOKIE_NAME: "IEcanPopup",
	getCookie : function() {
		var cookies = document.cookie;
		if (cookies.length == 0) {
			return false;
		}
		var start = cookies.indexOf(this.COOKIE_NAME + "=");
		if (start == -1) {
			return false;
		}
		start = start + this.COOKIE_NAME.length + 1;
		end = cookies.indexOf(";", start);
		if (end == -1) {
			end = cookies.length;
		}
		return 'Y' === unescape(cookies.substring(start, end));
	},
	setCookie : function() {
		var date = new Date();
		date.setDate(date.getDate() + 365);
		document.cookie = escape(this.COOKIE_NAME) + "=Y; expires=" + date.toUTCString();
	}
};
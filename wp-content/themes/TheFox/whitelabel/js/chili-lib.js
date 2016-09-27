function ChiliLib() {

	var self = this;
	var design_types_elements = null;
	var categories_elements = null;
	var loader = null;
	var controller_name = null;
	var templates_area = null;
	var shop_product_id = null;
	var selected_id_chili_template = null;
	var templates = null;
	var current_page = null;
	var pages_elements = null;
	var current_deisgn_type = null;
	var checked_categories = null;
	
	var chili_url = null;
	var $chili_builder_area = null;
	var chili_builder_button_area = null;
	var chili_builder_additional_variables = null;
	var approved_design_area = null;
	var templates_listing_area = null;
	
	/**
	 * 
	 * Private function to manage the url parameters
	 * 
	 */
	var updateUrl = function() {
		
		var url = window.location.toString();
		
		//first make sure that there are parameters in the url
		//and if there aren't add them
		
		//check page parameter
		var page_regex = /(page=[^\&!#])+/g;
		page_exists = page_regex.exec(url);
		if(page_exists === null) {
			window.history.pushState(null, null, url+"&page="+self.current_page);
			url = window.location.toString();
		}
		
		//check design type parameter
		var page_regex = /(dt=[^\&!#]+)/g;
		design_type_exists = page_regex.exec(url);
		if(design_type_exists === null) {
			window.history.pushState(null, null, url+"&dt="+self.current_deisgn_type);
			url = window.location.toString();
		}
		
		//check categories parameter
		if(self.checked_categories != '') {
			var page_regex = /(categories=[^\&!#]+)/g;
			categories_exists = page_regex.exec(url);
			if(categories_exists === null) {
				window.history.pushState(null, null, url+"&categories=");
				url = window.location.toString();
			}
		}
		
		var vars = window.location.search.substring(1).split("&");
	
		//loop the url parameters
		for (var i=0;i<vars.length;i++) {
			//get the key=value pair
			var pair = vars[i].split("=");
			
			//switch
			if(typeof pair[0] == "string") {
				old_value = vars[i];
				switch(pair[0]) {
					case 'dt':
						newUrl = url.replace(vars[i], "dt=" + self.current_deisgn_type);
						window.history.pushState(null, null, newUrl);
						url = window.location.toString();
					break;
					case 'page':
						newUrl = url.replace(vars[i], "page=" + self.current_page);
						window.history.pushState(null, null, newUrl);
						url = window.location.toString();
					break;
					case 'categories':
						if(self.checked_categories) {
							categories = self.checked_categories.join(); 
							newUrl = url.replace(vars[i], "categories=" + categories);
							window.history.pushState(null, null, newUrl);
							url = window.location.toString();
						}
					break;
				}
			}
		}
		
	}
	
	/**
	 *
	 * Function to clear all left side menu cateogries on choose design page
	 */
	this.clearCheckedCategoriesLeftMenuElements = function (parent) {

		$('.categories span.active').each(function() {
			//remove the active class
			$(this).removeClass('active');

			//if this element has opened childs hide them
			childs_area = $(this).parent('span').find('div');
			if(childs_area.is(':visible')) {
				childs_area.hide();
			}
		})

	}

	/**
	 *
	 * Function to reset left side menu design types on choose design page
	 */
	this.clearCheckedDesignTypesLeftMenuElements = function () {
		self.design_types_elements.removeClass('active');
	}

	/**
	 *
	 * Function to bind design types click
	 *
	 */
	this.bindDesignTypesClick = function() {

		self.design_types_elements.on('click', function() {

			//if not selected
			if(!$(this).hasClass('active')) {

				//clear all checked categories
				self.clearCheckedCategoriesLeftMenuElements();

				//clear all selected elements
				self.clearCheckedDesignTypesLeftMenuElements();

				//add active class to the element
				$(this).addClass('active');

				self.current_deisgn_type = $(this).attr('data-filter');

				self.checked_categories = '';

				self.current_page = 1;
				
				//make the call
				self.getTemplates(self.templates_area, self.current_deisgn_type, self.checked_categories, self.page_size, self.current_page, self.shop_product_id);
			}

		})
	}

	/**
	 *
	 * Funtion to unbind click on design types elements
	 *
	 *
	 */
	this.unbindDesignTypesClick = function() {
		self.design_types_elements.off('click');
	}

	/**
	 * Function to bind each category click
	 *
	 */
	this.bindCategoriesClick = function() {

		self.categories_elements.on('click', function() {
			
			//get the category id
			category_id = $(this).attr('data-category_id');
			
			//if not selected
			if(!$(this).hasClass('active')) {

				if(typeof $(this).attr('data-parent_id') == 'undefined') {
					//clear all checked categories
					self.clearCheckedCategoriesLeftMenuElements();
				}
				
				//show the childs
				child_div = $('#category_id_'+category_id).show();

				//add active class to the element
				$(this).addClass('active');
				
			} else { //unchecking
				
				if(typeof $(this).attr('data-parent_id') == 'undefined') {
					//clear all checked categories
					self.clearCheckedCategoriesLeftMenuElements();
				}
				
				//add active class to the element
				$(this).removeClass('active');
				
				//hide the childs
				child_div = $('#category_id_'+category_id).hide();
				
			}
			
			//get the checked categories
			self.checked_categories = self.getCheckedCategories();
			
			//set the design type
			design_type_id = self.design_types_elements.filter('.active').attr('data-filter');
			
			//set the page
			self.current_page = 1;
			
			//make the call
			self.getTemplates(self.templates_area, design_type_id, self.checked_categories, self.page_size, self.current_page, self.shop_product_id);
			
		});

	}
	
	/**
	 * 
	 * Function to get the checked categories
	 * 
	 */
	this.getCheckedCategories = function() {
		self.checked_categories = [];
		//set the categories ids
		self.categories_elements.filter('.active').each(function() {
			self.checked_categories.push($(this).attr('data-category_id'));
		})
		
		return self.checked_categories;
	}
	
	/**
	 * 
	 * Function to bind pages click
	 * 
	 */
	this.bindPaginatorClick = function() {
		
		$('a', self.pages_area).on('click', function() {
			
			//set the clicked page number
			page_number = parseInt($(this).attr('data-page'));
			
			if(!page_number) return false;
			//set the new page number
			self.current_page = page_number;
			
			//set the categories
			checked_categories = self.getCheckedCategories();
			
			//set the design type
			design_type_id = self.design_types_elements.filter('.active').attr('data-filter');
			
			//make the call
			self.getTemplates(self.templates_area, design_type_id, checked_categories, self.page_size, self.current_page, self.shop_product_id)
			
			return false;
		})
		
	}
	
	/**
	 * 
	 * Function to unbind pages click
	 * 
	 */
	this.unbindPaginatorClick = function() {
		$('a', self.pages_area).off('click');
	}
	
	/**
	 *
	 * Function to unbind the categories click
	 *
	 */
	this.unBindCategoriesClick = function() {
		self.categories_elements.off('click');
	}
	
	/**
	 *
	 * Function to get templates based on filters
	 * makes AJAX requests to get the needed data
	 *
	 */
	this.getTemplates = function(templates_area, design_type_id, categories, page_size, page_number, id_product) {

		//unbind the click on design types
		self.unbindDesignTypesClick();
		//unbind categories click
		self.unBindCategoriesClick();
		//unbind paginator click 
		self.unbindPaginatorClick();
		
		//show loader
		self.loader.show();

		//$('#total_products').parent().addClass('hide');

		$.ajax({
			type: 'POST',
			headers: { "cache-control": "no-cache" },
			dataType : "json",
			url: baseUri + '?rand=' + new Date().getTime(),
			async: true,
			cache: false,
			data: {
					ajax: 'true',
					controller: self.controller_name,
					requestData: 'getTemplates',
					design_type: design_type_id,
					categories: categories,
					page_size: page_size,
					page_number: page_number,
					id_product: id_product,
			},
			success: function(jsonData){
				self.loader.hide();
				//set the total results
				$('#total_templates').html(jsonData.templates.total_templates);
				
				//update the url
				updateUrl();
				
				//check for error
				if (jsonData.error || jsonData.templates.length <= 0)
				{
					//bind the click on design types
					self.bindDesignTypesClick();

					//bind business click
					self.bindCategoriesClick();
					
					//bind the paginator click
					self.bindPaginatorClick();
					
					templates_area.hide();
					jsonData.paginator_pages = false;
					
					return false;
				}
				
				
				single_template_html_block = $('a:first', templates_area);

				if(jsonData.templates.templates.length > 0) {
					// clear old products
					templates_area.html('');
				}
				
				//loop the result templates
				$.each(jsonData.templates.templates, function(index, template) {

					//clone the html block
					new_html_block = single_template_html_block.clone(true);

					//set the product id
					new_html_block.attr('data-template_id', template.chili_id);

					//get the images div
					images_section = $('div.template-thumbs', new_html_block);

					//clear the current images
					images_section.html('');

					//if there are any images
					if(template.images) {

						//set the create images and add them into the html
						images_section.html($('<img />').attr('src', template.images.thumbs).attr('class', 'front'));
						
						$.each(template.images.thumbs, function(index, val) {
							
							if(index > 0) {
								//set the create images and add them into the html
								images_section.append($('<img />').attr('src', val).attr('class', 'back'));
							} else {
								//set the create images and add them into the html
								images_section.append($('<img />').attr('src', val).attr('class', 'front'));
							}

						});
						
					}

					//append the new html block to the whole structure
					templates_area.append(new_html_block);
				});
				
				//clear the paginator area in all cases
				self.pages_area.html('');
				
				//show the templates area
				templates_area.show();
				if(jsonData.paginator_pages) {
					
					prev_btn = $('#pages_map').find('a').eq(0);
					page_listing_btn = $('#pages_map').find('a').eq(1);
					page_btn = $('#pages_map').find('a').eq(2);
					next_btn = $('#pages_map').find('a').eq(3);
					
					//add the prev button if exists
					if(jsonData.paginator_pages.prev) {
						self.pages_area.append(prev_btn.clone().attr('data-page', jsonData.paginator_pages.prev));
					}
					
					//add the first page button
					if (jsonData.paginator_pages.first_page) {
						self.pages_area.append(page_btn.clone().attr('data-page', jsonData.paginator_pages.first_page).html(jsonData.paginator_pages.first_page));
					}
					
					//add the prev listing button
					if (jsonData.paginator_pages.prev_list_page) {
						self.pages_area.append(page_listing_btn.clone().attr('data-page', jsonData.paginator_pages.page_listing_btn));
					}
					
					//set the middle pages
					$.each(jsonData.paginator_pages, function(index, page) {
						if(parseInt(index)) {
							button = page_btn.clone().attr('data-page', page).html(page);
							if(index == self.current_page) {
								button.addClass('active');
							}
							//append the button into the middle pages area
							self.pages_area.append(button);
						}
					})
					
					//add the next listing button
					if (jsonData.paginator_pages.next_list_page) {
						self.pages_area.append(page_listing_btn.clone().attr('data-page', jsonData.paginator_pages.next_list_page));
					}
					
					//add the last page button
					if (jsonData.paginator_pages.last_page) {
						self.pages_area.append(page_btn.clone().attr('data-page', jsonData.paginator_pages.last_page).html(jsonData.paginator_pages.last_page));
					}
					
					//add the next page button
					if (jsonData.paginator_pages.next) {
						self.pages_area.append(next_btn.clone().attr('data-page', jsonData.paginator_pages.next));
					}
					
				}
				
				/*BIND EVENTS*/

				//bind the click on design types
				self.bindDesignTypesClick();

				//bind business click
				self.bindCategoriesClick();
				
				//bind the paginator click
				self.bindPaginatorClick();
				
				//set the new templates
				self.templates = jsonData.templates;
				
				return jsonData;
			}
		});

	}

	/*
	 *
	 * Unbind the builder click button
	 *
	 */
	this.unBindChiliBuilderButtonClick = function() {
		self.chili_builder_button.off('click');
	}

	/*
	 *
	 * Bind the builder click button - bind open builder
	 *
	 */
	this.bindChiliBuilderButtonClick = function(builder_data) {

			//unbind the click
			self.unBindChiliBuilderButtonClick();

			//bind click button event
			self.chili_builder_button.on('click', function() {

				self.selected_id_chili_template = builder_data.id_chili_templates;

				self.generateChiliEditorFromTemplateData(builder_data);

				//unbind the click
				self.unBindChiliBuilderButtonClick();

				return false;
			});

	}

	/**
	 *
	 * Function to get the document preview images
	 *
	 */
	this.getDocumentPreviewImages = function(document_id) {

		$.ajax({
			type: 'POST',
			headers: { "cache-control": "no-cache" },
			dataType : "json",
			url: baseUri + '?rand=' + new Date().getTime(),
			async: true,
			cache: false,
			data: {
					ajax: 'true',
					controller: self.controller_name,
					requestData: 'getDocumentPreviewImages',
					document_id: document_id,
					id_product: self.shop_product_id
			},
			success: function(jsonData){
				if (typeof self.getPreviewCallback === 'function') {
				  return self.getPreviewCallback(jsonData);
				}

				if(self.approved_design_area) {
					//loop the data
					$.each(jsonData.data, function(index, item) {
						if(index > 1) return false;

						if(index == 0) {
							image_area = $('div.document-images', self.approved_design_area);
						} else {
							parent_div = image_area.parent();
							image_area = $('div.document-images:first', self.approved_design_area).clone();
						}

						image_area.find('a').attr('href', item.full);
						image_area.find('img').attr('src', item.medium);

						if(index > 0) {
							parent_div.append(image_area);
						}

						$('img', image_area).load(function() {
							$(this).removeClass('hide');
							$('.loader-products', image_area).hide();
						})

					});

					//set the id of the presta chili template
					$('input[name="images_data"]', chiliobj.approved_design_area).val(JSON.stringify(jsonData.data));
				}

			}
		});

	}

  /**
   * Generates the data to open an editor
   * @param {object}     builder_data
   * @param {int|string} builder_data.template_name        The id of the template
   * @param {string}     builder_data.template_locale      The locale of the editor
   * @param {object}     builder_data.additional_variables Optional. Values will be merged
   *                                                       into the object that is used to
   *                                                       call HPLE_showEditorForDocument
   *                                                       with.
   * @param {boolean}    prefix_urls                       If true, the urls inside the
   *                                                       builder data will be prefixed
   *                                                       with the current domain
   *
   * @return {void}
   */
	this.generateChiliEditorFromTemplateData = function(builder_data, prefix_urls) {
    var current_domain = window.location.hostname;

    $('#builder_area').html('');
    // Unset any previously received document variables

		this.chiladditional_variables = {};
		if (builder_data.additional_variables !== undefined) {
		  this.additional_variables = builder_data.additional_variables;

      if (prefix_urls) {
        url_prefix = 'https://' + current_domain;

        if (this.additional_variables.documentImages.length > 0) {
          for (var i = 0; i < this.additional_variables.documentImages.length; i++) {
            this.additional_variables.documentImages[i].highResPdfURL = url_prefix + this.additional_variables.documentImages[i].highResPdfURL;
            this.additional_variables.documentImages[i].remoteURL = url_prefix + this.additional_variables.documentImages[i].remoteURL;
            if(this.additional_variables.documentImages[i].name === "" ||
              this.additional_variables.documentImages[i].name === undefined ||
              this.additional_variables.documentImages[i].name === null
            ) {
              this.additional_variables.documentImages[i].name = "file" + i;
            }

            this.additional_variables.documentImages[i].tagName = "placeholder_" + (i + 1);
          }
        }

        // Iterate all properties of the documentVariables and check for empty
        // ones. Empty variables are to be deleted because they might cause
        // issues in chili.
        for (var k in this.additional_variables.documentVariables) {
          if (!this.additional_variables.documentVariables.hasOwnProperty(k)) {
            continue;
          }

          $variable_is_empty = (
            this.additional_variables.documentVariables[k] === null ||
            this.additional_variables.documentVariables[k] === undefined ||
            this.additional_variables.documentVariables[k] === ''
          );

          $size_variable_is_array = (
            k === 'size' &&
            typeof this.additional_variables.documentVariables[k] === 'object'
          );

          if ($variable_is_empty || $size_variable_is_array) {
            delete this.additional_variables.documentVariables[k];
          }
        }
      }
		}

	    _data = {
	      ajax: 'true',
	      controller: self.controller_name,
	      requestData: 'generateBuilderDataFromTemplateData',
	      template_name: builder_data.name,
	      template_locale: builder_data.locale,
	      id_product: self.shop_product_id
	    }

		$.ajax({
			type: 'POST',
			headers: { "cache-control": "no-cache" },
			dataType : "json",
			url: baseUri + '?rand=' + new Date().getTime(),
			async: true,
			cache: false,
			data: _data,
			success: function(jsonData){

				if(jsonData.data) {
					self.initiateBuilder(jsonData.data);
				}

				// If a callback is defined, run it
				if (typeof self.generateEditorCallback === 'function') {
				  return self.generateEditorCallback(jsonData);
				}

				return jsonData.data;
			}
		});
	}


  this.generateDocumentExportId = function(document_id, sku) {
    _data = {
      ajax: 'true',
      controller: self.controller_name,
      requestData: 'generateDocumentExportId',
      document_id: document_id
    };

    if (sku !== undefined) {
      _data.sku = sku;
    }

    $.ajax({
      type: 'POST',
      headers: { "cache-control": "no-cache" },
      dataType : "json",
      url: baseUri + '?rand=' + new Date().getTime(),
      async: true,
      cache: false,
      data: _data,
      success: function(jsonData) {
        if(typeof self.generateDocumentExportIdCallback === 'function') {
          return self.generateDocumentExportIdCallback(jsonData.data);
        }
      }
    });
  }


  /**
   * @todo this is repetetive, make it more generic
   *
   * @param {obj} options Object looking similar to this:
   *                      {
   *                        document_id: 123,
   *                        export_id: 123,
   *                        identifier: 123|nci-123,
   *                        product_id: 123,
   *                        supplier_id: 123,
   *                        sku: abc-def-12-aa
   *                      }
   *
   * @return {object} Ajax request object
   */
  this.storeExport = function(options) {
    _data = {
      ajax: 'true',
      controller: self.controller_name,
      requestData: 'storeExport',
      document_id: options.document_id,
      export_id: options.export_id,
      new_cart_id: options.identifier,
      product_id: options.product_id,
      supplier_id: options.supplier_id,
      sku: options.sku,
      product_name: options.product_name
    };

    return $.ajax({
      type: 'POST',
      headers: { "cache-control": "no-cache" },
      dataType : "json",
      url: baseUri + '?rand=' + new Date().getTime(),
      async: true,
      cache: false,
      data: _data,
      success: function(jsonData) {
        if(typeof self.storeExportCallback === 'function') {
          return self.storeExportCallback(jsonData.data);
        }
      }
    });
  }


	this.initiateBuilder = function(builder_data) {
		_data = {
			 apiPath: location.origin + '/CHILI-ARRAY-API/v1',
			// apiPath: 'https://www.drukzo.nl/CHILI-ARRAY-API/v1',
			//  apiPath: '/api/v1',
			proofingMode: true,
			container: document.getElementById('builder_area'),
			documentId: builder_data.documentId,
			token: builder_data.token,
			editorURL: builder_data.url,
			documentVariables: this.document_variables,
			onCancel: function() {
				// If a callback is defined, run it
				if (typeof self.cancelCallback === 'function') {
				  return self.cancelCallback();
				}

				//on cancel clear the popup
				$.fancybox.close();

			},
			onFinished: function() {

				// If a callback is defined, run it
				if (typeof self.finishedCallback === 'function') {
				  return self.finishedCallback();
				}

				//if approve design area is set
				if(chiliobj.approved_design_area) {

					//set the product id
					$('input[name="id_product"]', chiliobj.approved_design_area).val(self.shop_product_id);

					//set the chili document id
					$('input[name="chili_document_id"]', chiliobj.approved_design_area).val(builder_data.documentId);

					//set the id of the presta chili template
					$('input[name="id_chili_template"]', chiliobj.approved_design_area).val(chiliobj.selected_id_chili_template);

					//hide the templates listing area
					chiliobj.templates_listing_area.addClass('hide');

					//show the area
					chiliobj.approved_design_area.removeClass('hide');

					//get the preview images of the document
					chiliobj.getDocumentPreviewImages(builder_data.documentId);

				}

				$.fancybox.close();

			},
			onApproved: function() {
				// If a callback is defined, run it
				if (typeof self.approvedCallback === 'function') {
				  return self.approvedCallback();
				}

				if(chiliobj.approved_design_area) {
					chiliobj.approved_design_area.show();
					chiliobj.templates_listing_area.hide();
				}
			}
		};

    _data = $.extend({}, _data, self.additional_variables);
    HPLE_showEditorForDocument(_data);

    // If the class not-fancybox has been set, do not render a fancybox.
    if ($('#builder_area, #pageContainer').hasClass('not-fancybox')) {
      return $('#builder_area, #pageContainer').show();
    }

		 $.fancybox({
			 	'href' : '#builder_area',
				wrapCSS: 'pop design',
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
					$(this.content).removeClass('hide');
					$(this.content).find('iframe').width('100%').height($('#builder_area').height());
					$(this.content).find('iframe').width('100%').height(chiliobj.chili_builder_area.height());
				},
				afterClose : function() {
					chiliobj.chili_builder_area.html('');
					$(this.content).addClass('hide');
				}
		 });

	}

}

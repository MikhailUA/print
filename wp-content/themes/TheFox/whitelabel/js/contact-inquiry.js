function ContactInquiry() {
	var user = null;
	var self = this;

	//check paazlAPI
	this.paazlCheck = function(type) {
		if(type == 'inv' && $('#country').val() == 13) //13 = Netherlands
		{
			var housenumber = $("#houseaddr").val();
			var postcode = $("#postcode").val();

			if(housenumber!='' && postcode!='') {

				$.ajax({
					type: "POST",
					url: "/modules/paazl/addressRequest.php",
					data: {
						address2 :housenumber,
						postcode :postcode,
						method   :'frontAddComplete'
					},
					success: function(data, textStatus, jqXHR){

						if(data!='' && data!='false' ){
							var str=data;
							var values=str.split('+++');

							$("#postcode").removeClass('highlight');
							$("#houseaddr").removeClass('highlight');
							
//							document.getElementById("postcode").value=values[0];
//							document.getElementById("city").value=values[1];
//							document.getElementById("houseaddr").value=values[2];
							
						} else if (data!='' && data=='false' ){

							$("#postcode").addClass('highlight');
							$("#houseaddr").addClass('highlight');

						}
					},
					error: function(jqXHR, textStatus, errorThrown) {
						console.log(textStatus, errorThrown);
					}
				});
			}
		}
	}
	  
	//Function to initalize the not logged customer forms
	this.initNotLoggedCustomerForms = function() {
		
		$("#postcode").focusout(function(){
			postcode = $('#postcode').val().toUpperCase();
			self.paazlCheck('inv');
		});
		
		//check zipcode format
		$('#postcode').focusout( function(){
			zipCodeValidation($(this).val(), $('#country').val() , this );
		});
		
		$("#houseaddr").focusout(function(){
			self.paazlCheck('inv');
		});
		
		//init the registration form
		self.initRegisterFormValidation();
		
		//init the login form
		self.initLoginFormValidation();
		
	}
	
	this.initLoginFormValidation = function() {
		$("#loginForm").validate({
			errorClass: 'highlight',
			submitHandler: function(form) {
	        	// do other things for a valid form
				self.ajaxLogin(form)
			},
			rules: {
				email: {
					required: true,
					email: true
				},
				password: {
					required: true,
					minlength: 5
				}
	    	},
	        errorPlacement: function(error, element) {
	        	
	        	if($(element).attr('id') == 'password' && $(element).val() != '') {
	        		$(element).closest('div').append(error);
	        	}
	        	
	            return '';
	        }
		});
	}
	
	this.initRegisterFormValidation = function () {
		
		$("#registration").validate({
			errorClass: 'highlight',
			submitHandler: function(form) {
	        	// do other things for a valid form
				self.ajaxRegister(form)
			},
			rules: {
				email: {
					required: true,
					email: true
				},
				country: {
					isSelected: true
				},
				postcode: {
					required: true
				},
				customer_firstname: {
					required: true
				},
				customer_lastname: {
					required: true
				},
				houseaddr: {
					required: true
				},
				housenum: {
					required: false
				},
				passwd: {
					required: true,
					minlength: 5
				}
	    	},
	    	highlight: function(element) {
	        	var el_name = $(element).attr('name');
	        	if(el_name == 'country') {
	            	$(element).closest('.dropdown').addClass('highlight');
	        	} else {
	        		$(element).addClass('highlight');	
	        	}
	            
	        },
	        unhighlight: function(element) {
	        	var el_name = $(element).attr('name'); 
	        	if(el_name == 'country') {
	            	$(element).closest('.dropdown').removeClass('highlight');
	        	} else {
	        		$(element).removeClass('highlight');	
	        	}
	        },
	        errorPlacement: function(error, element) {

	        	if($(element).attr('id') == 'passwd' && $(element).val() != '') {
	        		$(element).closest('div').append(error);
	        	}
	            return '';
	        }
		});
		
	}
	
	this.ajaxRegister = function(form) {

		data = $(form).serialize();
		
		self.disableFormSubmit(form);
		
		$.ajax({
			type: 'POST',
			headers: { "cache-control":"no-cache" },
			dataType : "json",
			url: baseUri + '?rand=' + new Date().getTime(),
			async: true,
			cache: false,
			data: data,
			success: function(jsonData){
				
				if(!jsonData.isSaved) {
					
					$.each(jsonData.errors, function(index, val) {
						$('input[name="'+index+'"]', form).closest('div.form-row').append('<span class="form-error" style="display: inline;">'+val+'</span')
					});
					
					self.enableFormSubmit(form);
					
				} else {
					location.reload(true);
				}
				
			}
		});
	}
	
	this.ajaxLogin = function(form) {
		
		self.disableFormSubmit(form);
	
		email = $('#email_login').val();
		password = $('#password').val();
		
		$.ajax({
			type: 'POST',
			headers: { "cache-control": "no-cache" },
			dataType : "json",
			url: baseUri + '?rand=' + new Date().getTime(),
			async: true,
			cache: false,
			data: {
					ajax : true,
					controller: 'authentication',
					SubmitLogin: 1,
					email: email,
					passwd: password
				},
			success: function(jsonData){

				if(jsonData.hasError) {
					
					$.each(jsonData.errors, function(index, val) {
						$('.login', form).append('<span class="form-error">'+val+'</span');
					});
					
					self.enableFormSubmit(form);
					
				} else {
					location.reload(true);
				}
				
			}
		});
	}
	
	this.disableFormSubmit = function(form) {
		$(form).find(':submit').attr("disabled", "disabled");
		$(form).find(':submit').addClass("disabled");
	}
	
	this.enableFormSubmit = function(form) {
		$(form).find(':submit').removeAttr("disabled", "disabled");
		$(form).find(':submit').removeClass("disabled");
	}
	
	this.initInquiryProductForm = function() {

		$("#addProduct").validate({
			errorClass: 'highlight',
			submitHandler: function(form) {
	        	// do other things for a valid form
                ajax_full_loader_show();
				form.submit();
			},
			rules: {
				references: {
					required: true
				},
				product: {
					required: true
				},
                notes: {
                    required: true
                },
				format: {
					required: true
				},
				finalformat: {
					required: true
				},
				numpages: {
					required: true
				},
				papier: {
					required: true
				},
				printing: {
					required: true
				},
				circulation: {
					required: true
				},
				finish: {
					required: true
				},
				breeding: {
					required: true
				},
				extra: {
					required: true
				},
				date: {
					required: true
				}
	    	},
            errorElement: "span",
  	        errorPlacement: function(error, element) {
                  if($(element).closest('div.form-row').children(".form-nested").length) {
                    error.insertBefore( $(element).closest('div.form-row').children(".form-nested") );
                  }
                  else if($(element).closest('div.form-row').hasClass("fullwidth") || $(element).closest('div.form-row').children("textarea").length) {
                  }
                  else {
                    $(element).closest('div.form-row').append(error).children("input, textarea").nextAll(".form-after-text").addClass("hide");
                  }
	        },
            unhighlight: function(element) {
               $(element).closest('div.form-row').children("input, textarea").removeClass("highlight").nextAll(".form-after-text").removeClass("hide")
            }
		});
		
	}
	
	//page initializaton
	this.initPage = function() {
		
		if(!self.user) {
			//init forms validation
			self.initNotLoggedCustomerForms();
			
			//bind country selection 
			$('#country').easyDropDown({
				wrapperClass: 'dropdown',
				onChange: function(select) {
					self.paazlCheck('inv');
				}
			});
		}
		
		//add custom validator
		 $.validator.addMethod("isSelected", function (value, element) {
	            var selectedValue = parseInt(value);

	    		if (!isNaN(selectedValue)) {
	    			return true;
	    		} else {
	    			return false;
	    		}

	    }, $.validator.messages.required);
		 
		 //Datepicker
		 var picker = new Pikaday({
			 	field: document.getElementById('date'),
			 	format: 'DD-MM-YY'
		 });
		 
		 self.initInquiryProductForm();
		 
		 $('#add_another_product').on('click', function() {
			 parent = $(this).closest('div');
			 $(this).addClass('hide');
			 $('.generalSubmit:first', parent).removeClass('hide');
			 $('.generalSubmit:last', parent).addClass('hide');
			 $('#addProduct').removeClass('hide');
			 return false;
		 });

		 $('.generalSubmit').on('click', function() {

			 $(this).addClass('disabled');
             ajax_full_loader_show();

			 $.ajax({
					type: 'POST',
					headers: { "cache-control": "no-cache" },
					url: baseUri + '?rand=' + new Date().getTime(),
					async: true,
					dataType : "json",
					cache: false,
					data: {
						ajax : true,
						controller: 'contact',
						submitInquiry: 1
					},
					success: function(jsonData){
						
						if(jsonData.errors) {
							location.reload(true);
						} else {
							$('.pageContentBody div').addClass('hide');
							$('.pageContentBody .response').removeClass('hide');
                            ajax_full_loader_hide();
						}
						
					}
				});
			 
			 return false;
		 });
		 
		 $('#addFileArea').click(function () {
		        area = $('div.fileupload', $(this).closest('div'));
				
		        $('input:first', area).clone().appendTo(area);
		        
		        return false;
			})
	}
	
}
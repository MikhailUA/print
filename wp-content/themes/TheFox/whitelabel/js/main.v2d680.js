// HOVER INTENT //
(function(e){e.fn.hoverIntent=function(t,n,r){var i={interval:100,sensitivity:7,timeout:0};if(typeof t==="object"){i=e.extend(i,t)}else if(e.isFunction(n)){i=e.extend(i,{over:t,out:n,selector:r})}else{i=e.extend(i,{over:t,out:t,selector:n})}var s,o,u,a;var f=function(e){s=e.pageX;o=e.pageY};var l=function(t,n){n.hoverIntent_t=clearTimeout(n.hoverIntent_t);if(Math.abs(u-s)+Math.abs(a-o)<i.sensitivity){e(n).off("mousemove.hoverIntent",f);n.hoverIntent_s=1;return i.over.apply(n,[t])}else{u=s;a=o;n.hoverIntent_t=setTimeout(function(){l(t,n)},i.interval)}};var c=function(e,t){t.hoverIntent_t=clearTimeout(t.hoverIntent_t);t.hoverIntent_s=0;return i.out.apply(t,[e])};var h=function(t){var n=jQuery.extend({},t);var r=this;if(r.hoverIntent_t){r.hoverIntent_t=clearTimeout(r.hoverIntent_t)}if(t.type=="mouseenter"){u=n.pageX;a=n.pageY;e(r).on("mousemove.hoverIntent",f);if(r.hoverIntent_s!=1){r.hoverIntent_t=setTimeout(function(){l(n,r)},i.interval)}}else{e(r).off("mousemove.hoverIntent",f);if(r.hoverIntent_s==1){r.hoverIntent_t=setTimeout(function(){c(n,r)},i.timeout)}}};return this.on({"mouseenter.hoverIntent":h,"mouseleave.hoverIntent":h},i.selector)}})(jQuery);

// PLACEHOLDER //
(function(d){d.fn.placeholder=function(e){return this.each(function(){var a=d(this),f=a.attr("placeholder"),g=e&&e.clearOnFocus||!1;if(f){a.removeAttr("placeholder");var h=a.wrap(d(document.createElement("span")).addClass("input-holder")).parent(),b=d(document.createElement("span")).text(f).addClass("input-default");h.append(b);b.click(function(){a.focus()});var c=function(){0===a.val().length?b.show():b.hide()};c();g?(a.focus(function(a){b.hide()}),a.blur(c)):(a.keydown(function(a){"8"!==a.keyCode&&
("9"!==a.keyCode&&"16"!==a.keyCode)&&c()}),a.keyup(c));a.change(c)}})}})(jQuery);

// GET HEIGHT BASED ON HIDDEN ELEMENT
(function(a){a.fn.addBack=a.fn.addBack||a.fn.andSelf;
a.fn.extend({actual:function(b,l){if(!this[b]){throw'$.actual => The jQuery method "'+b+'" you called does not exist';}var f={absolute:false,clone:false,includeMargin:false};
var i=a.extend(f,l);var e=this.eq(0);var h,j;if(i.clone===true){h=function(){var m="position: absolute !important; top: -1000 !important; ";e=e.clone().attr("style",m).appendTo("body");
};j=function(){e.remove();};}else{var g=[];var d="";var c;h=function(){c=e.parents().addBack().filter(":hidden");d+="visibility: hidden !important; display: block !important; ";
if(i.absolute===true){d+="position: absolute !important; ";}c.each(function(){var m=a(this);var n=m.attr("style");g.push(n);m.attr("style",n?n+";"+d:d);
});};j=function(){c.each(function(m){var o=a(this);var n=g[m];if(n===undefined){o.removeAttr("style");}else{o.attr("style",n);}});};}h();var k=/(outer)/.test(b)?e[b](i.includeMargin):e[b]();
j();return k;}});})(jQuery);

// EMAIL VALIDATION //

function validateEmail(email){

   var a = document.getElementById(email).value;
   var filter = /^[a-z\p{L}0-9!#$%&\'*+\/=?^`{}|~_-]+[.a-z\p{L}0-9!#$%&\'*+\/=?^`{}|~_-]*@[a-z\p{L}0-9]+[._a-z\p{L}0-9-]*\.[a-z0-9]+$/;
    if(filter.test(a)){
        return true;
    }
    else{
        return false;
    }
}

// JUMP FUNCTION

var jump=function(e)
{
   if (e){
       e.preventDefault();
       var target = $(this).attr("href");
   }else{
       var target = location.hash;
   }
   $('html,body').animate(
   {
       scrollTop: $(target).offset().top - 50
   },1600,function()
   {
       location.hash = target;
   });

}

// GET URL VARS

function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}

// JQUERY EXTEND //

    //Accept only numbers
    jQuery.fn.ForceNumericOnly = function() {
    return this.each(function()
    {
    $(this).keydown(function(e)
    {
      var key = e.charCode || e.keyCode || 0;
      return (key == 8 || key == 9 || key == 46 || (key >= 37 && key <= 40) || (key >= 48 && key <= 57) || (key >= 96 && key <= 105));
    });
  });
};

// FULLPAGE LOADER

function ajax_full_loader_show() {
  if(!$(".full.loader").length) {
    $("body").prepend("<div class='full loader'></div>");
  }
}

function ajax_full_loader_hide() {
  $(".full.loader").remove();
}

// BLOCK LOADER

function ajax_block_loader_show() {
  if(!$(".loader-block").length) {
    $(".addloader").prepend("<span class='loader-block'></span>");
  }
}

function ajax_block_loader_hide() {
  $(".loader-block").remove();
}

// POPUP ON ANCHOR CLICK

function popupUnload(){

  $.fancybox({
          'type': 'inline',
          'href': '#popupUnload',
  	      padding: [42, 55, 42, 55],
  });

  return false;
}

// JQUERY EXTEND END //

$(document).ready(function() {

	//Set cookies for resellers

	if($("body.resellers").length) {

		if (typeof Cookies.get('showNoteHead') === 'undefined') $('.note-reseller.head.hide').removeClass("hide");
		if (typeof Cookies.get('showNoteAccount') === 'undefined') $('.note-reseller.myaccount-content.hide').removeClass("hide");

		$(".note-reseller .close").click(function() {
			$(this).closest(".note-reseller").fadeOut(300);

			if($(this).closest(".note-reseller").hasClass("head")) {
				Cookies.set('showNoteHead', true);
			} else if ($(this).closest(".note-reseller").hasClass("myaccount-content")) {
            	Cookies.set('showNoteAccount', true);
			}
		});

	}

  // Listeners for the main menu
  if($('.main-menu-toggle').length > 0 ) {
    $('.main-menu-toggle').each(function (i, e) {
      $(e).on('click', function (f) {
        f.preventDefault();
        $('#navhead').toggleClass('open');
      });
    });
  }

  if($('.toggle-cart-summary').length > 0) {
    $('.toggle-cart-summary').each(function (i, e) {
      $(e).on('click', function (f) {
        f.preventDefault();
        $('.cart-price-summary').toggleClass('open');
      });
    });
  }

  if($('.deeper-trigger').length > 0) {
    $('.deeper-trigger').each(function (i, e) {
      $(e).on('click', function (f) {
        f.preventDefault();
        f.stopPropagation();
        $($(f.currentTarget).data('for')).show();
      });
    });
  }

  if($('.undeeper-trigger').length > 0) {
    $('.undeeper-trigger').each(function (i, e) {
      $(e).on('click', function (f) {
        f.preventDefault();
        $(f.currentTarget).parent('.submenu').hide();
        $('#navhead .active').removeClass('active');
        $('#navhead').removeClass('nodelay');
      });
    });
  }


$(window).scroll(function() {

	// Sticky header

	var scrollPos = $(window).scrollTop();

	if($("#sticky").length) {
	            if(scrollPos > $("header").outerHeight() - 50){
					$("#sticky").slideDown(100).addClass(active);
	            } else {
					$("#sticky").slideUp(100).removeClass(active);
	            }
	};

	// Sticky main header

	if($(".submenu").is(":visible") && $(".submenu").hasClass("hover-start")) {
	       if(scrollPos > 400) {
	          $(".submenu.hover-start, .menu-overlay").fadeOut(100);
	       }
	}

	// Page advertising

	if($(".fullads").length) {
	    var scrollTillFooter =  $(window).height() - ($("#foot").offset().top - $(window).scrollTop());

	    if(scrollTillFooter > 0) {
	        $(".fullads").css("bottom", scrollTillFooter);
	    }
	    else {
	        $(".fullads").css("bottom", "0");
	    }
	};

});

    // Variables

    var tooltipsContent = $(".tooltips .tooltips-content");
    var hovered = "hovered-active";
    var active = "active";
    var hide = "hide";
    var header = $("header");
    var noResult = $("#no-result");
    var scrollPos = $(window).scrollTop();
    var highlightField = "highlight";

	//Remove searched text on anchor click
	$("body").on('click','.search-result-product-details a', function() {
		$("#search-product input").val("");
	});

    //Validate onlyNumber on input:tel
    //$("input[type=tel]").ForceNumericOnly();

	// SHOW INFORMATION TOOLTIP
	 $(".i-information").hover(function() {
       var tooltipHeight = $(this).children().actual("outerHeight") + 10;
	   $(this).children().css("top", "-"+tooltipHeight+"px").removeClass(hide).show();
      },function() {
       $(this).children().addClass(hide).hide();
	});

	// CUSTOM DROPDOWN
	$("body").on("click",".dropdown-customized .selected",function(e) {

		$(".dropdown-customized .option-list").hide();

		if($(this).hasClass(active)) {
			$(this).next(".option-list").hide().prev(".selected").removeClass(active);
		} else {
			$(".dropdown-customized .selected").removeClass(active);
			$(this).next(".option-list").show().prev(".selected").addClass(active);
		}
	});

	$("body").on("click",".dropdown-customized .option",function(e) {
		$(this).closest(".dropdown-customized").prev("p").children(".i-check-mini").removeClass(hide);
		$(this).parent().hide().prev(".selected").removeClass("active").addClass("added").html($(this).html());

	});

    // CLOSE POPUP TRIGGER CLASS
    $(".close-popup").click(function(e) {
        e.preventDefault();
        $.fancybox.close();

    });

    // PREVENT DEFAULT
    $(".noDefault").click(function(e) {
       e.preventDefault();
    });

    // SMOOTH SCROLL
    $("a.scroll").click(function(e){
      e.preventDefault();
        if( $(this).data("scrollpos") != undefined ) {
           if($(this).data("scrollspeed")) {
                $("html, body").animate({
                scrollTop: $( $.attr(this, "href") ).offset().top - $(this).data("scrollpos")
                }, $(this).data("scrollspeed"));
            } else {
                $("html, body").animate({
                scrollTop: $( $.attr(this, "href") ).offset().top - $(this).data("scrollpos")
                }, 500 );
            }
        }
        else {
          if($(this).data("scrollspeed")) {
                $("html, body").animate({
                scrollTop: $( $.attr(this, "href") ).offset().top
                }, $(this).data("scrollspeed") );
            } else {
                $("html, body").animate({
                scrollTop: $( $.attr(this, "href") ).offset().top
                }, 500 );
            }
        }
        return false;
    });

    //GO TOP
    $("body").on('click', '.gotoTop, .goToTop', function(e) {
         e.preventDefault();
         if($(window).scrollTop() != 0) {
         $("html, body").animate({scrollTop: 0}, 750);
         }
    });

    //Open Zopim chat on click in sidebar
    $("body").on('click', '.zopimchat, #chat-sticky', function(e) {
            e.preventDefault();
            $zopim.livechat.window.show();
    });

    //IE6/7 alert popup
    //$("body").iealert({support:"ie7"});

    //Input checkbox disabled state
    $("input:checkbox").change(function() {
         $("input:checkbox:not(.disabled)").prop("disabled", false);
         $("input:checkbox.disabled").prop("disabled", true);
    });

    //Input radio disabled state
    $("input:radio").change(function() {
         $("input:radio:not(.disabled)").prop("disabled", false);
         $("input:radio.disabled").prop("disabled", true);
    });

    //Custom scrollbar (jScrollPane)

    $('.addresses-inner').bind('mousewheel DOMMouseScroll', function(e) {
            var scrollTo = null;

            if (e.type == 'mousewheel') {
                scrollTo = (e.originalEvent.wheelDelta * -1);
            }
            else if (e.type == 'DOMMouseScroll') {
                scrollTo = 40 * e.originalEvent.detail;
            }
            if (scrollTo) {
                e.preventDefault();
                $(this).scrollTop(scrollTo + $(this).scrollTop());
            }
    });

    //Disable scroll outside the block

      $('.scroll-block').bind('mousewheel DOMMouseScroll', function (e) {
          var e0 = e.originalEvent,
          delta = e0.wheelDelta || -e0.detail;

          this.scrollTop += ( delta < 0 ? 1 : -1 ) * 30;
          e.preventDefault();
      });

    // Accordion

    var allPanels = $(".accordion > dd").hide();

      $(".accordion > dt > a").click(function(e) {
        e.preventDefault();

        if($(this).hasClass(active)) {
          $(this).parent().next().slideUp(150);
          $(this).removeClass(active);
          $(this).prev().removeClass("i-arrow-orange-up");
        }
        else {
          $(".accordion > dt > a").removeClass(active);
          $(this).addClass(active);
          $(".accordion > dt > span").addClass("i-arrow-orange").removeClass("i-arrow-orange-up");
          allPanels.slideUp(150);
          $(this).parent().next().slideDown(150);
          if($(this).parent().next().is(":visible")) {
             $(this).prev().addClass("i-arrow-orange-up");
          }
          else {
             $(this).prev().removeClass("i-arrow-orange-up");
          }
        }
      });

    //Menus - submenus

    if($("header").hasClass("v3")) {

          function addMainSubmenu(row) {
            $('.submenu-navi > ul > li .submenu').css("min-height",$("#navhead nav >ul > li.active > .submenu").outerHeight());
    	      $('.open_menu').removeClass('open_menu');
            $(row).addClass('open_menu');

            if(!$('.submenu-navi > ul > li .submenu:visible').length) {
    		    $(row).children('.submenu').show().animate({ 'width':'680px' },{  queue: false, duration: 200 });
            } else {
                $(".submenu-navi > ul > li .submenu").hide();
                $(row).find(".submenu").css("width","680px").show();
                $(row).find(".submenu > div").show();

            }
          }

          function removeMainSubmenu(row) {
            if(!$(row).hasClass("hasSubmenu")) {
              $('.submenu-navi > ul > li .submenu').hide().css('width','0px');
            }
            $('.open_menu').removeClass("open_menu");
          }

		  //menuAim
          $(".submenu-navi > ul").menuAim({
              activateCallback: addMainSubmenu,
              deactivateCallback: removeMainSubmenu,
              activationDelay: 0
          });

          var timer;

          $('.submenu-navi > ul > li > .submenu').parent().addClass("hasSubmenu");
          //$('#navhead nav ul li .submenu').parent().addClass("hasMenus");

          function removeSubmenu() {
                $("#navhead nav li > a.active, #navhead nav li.active").removeClass(active);
                $(".menu-overlay").fadeOut(200,  function(){ $(this).remove();});
                $(".submenu:visible").hide();
                $(".industry > a").removeClass(active).next().children().addClass(hide);
          }

          //Mouseenter
          $("#navhead nav > ul > li:not(.industry)").on("mouseenter", function() {

              var $this = $(this);
              clearInterval(timer);

              function addSubmenu() {
                        $this.addClass(active).children("a").addClass(active);
                        if(!$this.hasClass("nosub")) {
                          $this.children(".submenu").show();
                          header.nextAll(".wrapper").children().prepend("<div class='menu-overlay menus' style='display: none'></div>");
                          $(".menu-overlay").fadeIn(200);
                        }
              }

              removeSubmenu();

            if(!$("#navhead").hasClass("nodelay")) {

                  timer = setTimeout(function(){
                      addSubmenu();
                      $this.find(".wrapper").css('opacity', 0).animate({ opacity: 1 },{ queue: false, duration: 250 });
                  }, 100);

                  $("#navhead").addClass("nodelay");

            } else { addSubmenu(); }
          });

          //Mouseleave
          $("#navhead nav > ul > li:not(.industry), #navhead .submenu .wrapper, #navhead .wrapper").on("mouseleave", function() {
              if(($(".submenu:hover").length && !$(".submenu > .wrapper > .safezone:hover").length && !$("#navhead nav li.industry > a.active").length) || (!$("#navhead nav > ul > li:not(.industry).active:hover").length && !$("#navhead .wrapper:hover").length && !$("#navhead nav li.industry > a.active").length)) { removeSubmenu(); clearInterval(timer); $("#navhead").removeClass("nodelay"); $('.submenu-navi > ul > li .submenu').hide().css('width','0px'); }
          });

          $(".closemenu").click(function() {
             $(this).closest(".submenu").hide();
             $(".menu-overlay").remove();
          });

          //Login - Help dropdown
          $("#account > div > a").mouseenter(function() {
              $(this).addClass(active).parent().addClass(active);
              $("#account > div > a").css("z-index","997");
              $(this).css("z-index","999");
          });

          $("#account > div > div").mouseleave(function() {
              $(this).parent().removeClass(active);
              $(this).prev().removeClass(active);
              $("#account > div > a").css("z-index","999");
          });

    } else if($("header").hasClass("v2")) {

          var timer;

          function removeSubmenu() {
                $("#navhead nav li > a.active, #navhead nav li.active").removeClass(active);
                $(".menu-overlay").remove();
                $(".submenu:visible").hide();
                $(".industry > a").removeClass(active).next().children().addClass(hide);
          }

          //Mouseenter
          $("#navhead nav > ul > li:not(.industry)").on("mouseenter", function() {

              var $this = $(this);
              clearInterval(timer);

              function addSubmenu() {
                  $this.addClass(active).children("a").addClass(active);
                  if(!$this.hasClass("nosub")) {
                    $this.children(".submenu").show();
                    header.nextAll(".wrapper").children().prepend("<div class='menu-overlay menus'></div>");
                  }
              }

              removeSubmenu();

            if(!$("#navhead").hasClass("nodelay")) {

                  timer = setTimeout(function(){
                      addSubmenu();
                      $this.find(".wrapper").css('opacity', 0).animate({ opacity: 1 },{ queue: false, duration: 250 });
                  }, 100);

                  $("#navhead").addClass("nodelay");

            } else { addSubmenu(); }
          });

        	jQuery('.submenu-navi > ul > li').click(function(e){
        		jQuery('.open_menu').each(function(){
        			jQuery(this).find('.submenu').hide();
        			jQuery(this).removeClass('open_menu');
        		});
        		jQuery(this).find('.submenu').show();
        		jQuery(this).addClass('open_menu');
        	});

            $('.submenu-navi > ul > li > .submenu').parent().addClass("hasSubmenu");

          //Hide other nav items if last is hovered
          $("#navhead nav > ul > li.industry").on("hover", function() {
              $(".menu-overlay.menus").remove();
              $("#navhead nav li:not(.industry) a.active,  #navhead nav li.active").removeClass(active);
              $(".submenu:visible").hide();
          });

          //Mouseleave
          $("#navhead nav > ul > li:not(.industry), #navhead .submenu .wrapper, #navhead .wrapper").on("mouseleave", function() {
              if(($(".submenu:hover").length && !$(".submenu > .wrapper > .safezone:hover").length && !$("#navhead nav li.industry > a.active").length) || (!$("#navhead nav > ul > li:not(.industry).active:hover").length && !$("#navhead .wrapper:hover").length && !$("#navhead nav li.industry > a.active").length)) { removeSubmenu(); clearInterval(timer); $("#navhead").removeClass("nodelay"); }
          });

          $("#navhead nav > ul > li.industry > a").click(function() {
             if(!$(this).hasClass(active)) {
                $(this).addClass(active).next().children().removeClass(hide);
                header.nextAll(".wrapper").children().prepend("<div class='menu-overlay industry'></div>");
             } else {
                $(this).removeClass(active);
                $(".menu-overlay.industry").remove();
                $(this).next().children().addClass(hide);
             }

          });

          $(".closemenu").click(function() {
             $(this).closest(".submenu").hide();
             $(".menu-overlay").remove();
          });

          //Login - Help dropdown
          $("#account > div > a").mouseenter(function() {
              $(this).addClass(active).parent().addClass(active);
              $("#account > div > a").css("z-index","997");
              $(this).css("z-index","999");
          });

          $("#account > div > div").mouseleave(function() {
              $(this).parent().removeClass(active);
              $(this).prev().removeClass(active);
              $("#account > div > a").css("z-index","999");
          });

          $("body").on('click','.menu-overlay.industry', function() {
            $("#navhead nav > ul > li.industry > a").removeClass(active);
            $(".submenu-industry").children().addClass(hide);
            $(this).remove();
          });

    }

	//Close notes

/*	$(".close").click(function() {
		$(this).closest(".note").fadeOut(300);
	});*/

    //Tooltips

    $(".tooltips .tooltips-content").hide();
    $(".tooltips a").mouseenter(function() {
       $(this).next().addClass("active-tooltip").show();
    });
    $(".tooltips").mouseleave(function() {
       tooltipsContent.hide().removeClass("active-tooltip");
    });

    //Tooltip

    $("body").on('mouseover', '.i-question-mark', function() {
       $(this).next().show();
    });
    $("body").on('mouseleave', '.tooltip-outter', function() {
       $(this).children(".tooltip").hide();
    });
    $(".tooltip .close-tooltip").click(function() {
      $(this).parent().hide();
    });

    //Checkbox class:checked

    $("input:checkbox").on("change", function() {
       if($(this).is(':checked')) {
         $(this).addClass('checked');
       } else {
         $(this).removeClass('checked');
       }
    });

    //More less

    $(".more-less").click(function(e) {
       e.preventDefault();
       if($(this).hasClass(active)) {
          $(this).removeClass(active).next().addClass(hide);
       } else {
          $(this).addClass(active).next().removeClass(hide);
       }
    });

    //More less categories

    $("li.category-child").hide();
    $(".items").each(function(){
       $(this).find("li:lt(7)").show();
    });

    $(".sort").click(function(e) {
      e.preventDefault();

       if($(this).hasClass("more"))
       {
           $("li.category-child").show();
           $('#all').addClass("less").removeClass("more").children("#all-text").text($(this).data("showless"));
           $('#all').children(".i-arrow-orange").removeClass("i-arrow-orange").addClass("i-arrow-orange-up");
       }
       else if($(this).hasClass("less"))
       {
          $(".items").each(function() {
             $(this).find("li").eq(6).nextUntil('li:last').prev("li").hide();
          });
            $('#all').addClass("more").removeClass("less").children("#all-text").text($(this).data("showmore"));
            $('#all').children(".i-arrow-orange-up").removeClass("i-arrow-orange-up").addClass("i-arrow-orange");
       }
    });

    $(".all").click(function(e) {
       e.preventDefault();
       if($(this).hasClass("more"))
       {
          $("li.category-child").show();
          $(".all").addClass("less").removeClass("more").text($(this).data("showless"));
       }
       else if($(this).hasClass("less"))
       {
          $(".items").each(function() {
             $(this).find("li").eq(7).nextUntil('li:last').prev("li").hide();
          });
            $(".all").addClass("more").removeClass("less").text($(this).data("showmore"));
       }

    });

    // Custom google search

    $("#custom-search-product .close").click(function(e) {
      e.preventDefault();
         $("#custom-searchbar-product").val("");
         $(this).hide();
    });

    $("#custom-searchbar-product").keyup(function (e) {
        $("#custom-search-product .close").show();

        if($("#custom-searchbar-product").val().length == 0) {
          $("#custom-search-product .close").hide();
        }

    });

    $("#custom-searchbar-product").focusin(function() {
         $("#custom-search-product").removeClass("focusout").addClass("focusin");

    });
    $("#custom-searchbar-product").focusout(function() {
         $("#custom-search-product").removeClass("focusin").addClass("focusout");
    });

    // Placeholder plugin replacement

    //$("input#searchbar-product").placeholder();

    //Close search
    $("a#back-search, #search-product .close").click(function(e) {
      e.preventDefault();
         $("#searchbar-product").val("");
         $("#search-results, #search-product .close").hide();
         $("#search-product").css("border", "2px solid #104672");
         $("#search-product .new-search").show();
         noResult.hide();
    });

    //Search filter
    $("#searchbar-product").keyup(function (e) {
    var filter = $(this).val();

    $("#search-product").css("border", "2px solid #e64f2c");
    $("#search-product .new-search").hide();
    $("#search-product .close").show();

    if($("#searchbar-product").val().length == 0) {
      $("#search-product").css("border", "2px solid #104672");
      $("#search-product .close").hide();
      $("#search-product .new-search").show();
    }

    if($("#searchbar-product").val().length > 1) {

         /* Hidden egg */
        if($("#searchbar-product").val().match(/hollandsgeluk/i)) {
          $("#hidden-egg").show();
          $(".result-container").hide();
        }
        else {
          $("#hidden-egg").hide();
          $(".result-container").show();
        }

    $("#search-results").show();

    $(".search-result-product").each(function () {
        var productName = $(this).find("h2");
        var formatName = $(this).find(".search-result-funnel li.format-name");
        var parent = $(this);
        var produtNameLength = productName.text().length > 0;
        var formatNameLength = formatName.text().length > 0;

        if ( produtNameLength && productName.text().search(new RegExp(filter, "i")) < 0 && formatName.text().search(new RegExp(filter, "i")) < 0) {
    	parent.hide();
         } else {
    	parent.show();
        //Load image only when visible
        if(!$(this).find("img").attr('src')) {
            $(this).find("img").attr('src', $(this).find("img").data('src'));
            }
         }
    });
    }
    else {
        noResult.hide();
        $("#search-results, .search-result-product").hide();
    }

      if($("#searchbar-product").val().length > 1 && $(".search-result-product:visible").length == 0 && filter) {
        noResult.show();
      }
      else {
        noResult.hide();
      }

    });

    /* Table more less */
    if($("table.priceTable .table-title tbody tr").length > 5) {
      $("table.priceTable .table-title tbody tr").eq(4).nextUntil('table.priceTable .table-title tbody tr:last').hide();
      $("table.priceTable .table-content tbody tr").eq(4).nextUntil('table.priceTable .table-content tbody tr:last').hide();
      $("table.priceTable").append('<tfoot><tr><td colspan="100%"><a href="#" class="more"><span class="i-arrow-orange"></span><strong>'+$("table.priceTable").data("showmore")+'</strong></a></td></tr></tfoot>');
    }

    $("table.priceTable a.more").click(function(e) {
      e.preventDefault();

      if( $(this).hasClass("more") ) {
        $("table.priceTable tbody tr").show();
        $(this).addClass("less").removeClass("more");
        $(this).children("strong").text($("table.priceTable").data("showless"));
        $(this).find("span").removeClass("i-arrow-orange").addClass("i-arrow-orange-up");
      }
      else if( $(this).hasClass("less") ) {
        $("table.priceTable .table-title tbody tr").eq(4).nextUntil('table.priceTable .table-title tbody tr:last').hide();
        $("table.priceTable .table-content tbody tr").eq(4).nextUntil('table.priceTable .table-content tbody tr:last').hide();
        $(this).addClass("more").removeClass("less");
        $(this).children("strong").text($("table.priceTable").data("showmore"));
        $(this).find("span").removeClass("i-arrow-orange-up").addClass("i-arrow-orange");
      }
    });

    if($('#tab-container').length){
    $('#tab-container').easytabs({
      animate: false,
      defaultTab: "li:first-child"
    });
    }

    if($("#product_tabs").length) {
      $('#product_tabs').easytabs({
      animate: false,
      defaultTab: "li:first-child",
      updateHash: false
      });
    }

    if($('#tab-side-container').length){
    $('#tab-side-container').easytabs({
      animate: false,
      updateHash: false
    });
    }

      //Registration form - first step
	  $('#email-registration').focusout( function(){updateEmailRegistration($(this).val(), $(this).attr('id'), false);});

	  // check zipcode format
	  $('#postcode-user').focusout( function(){
		 zipCodeValidation($(this).val(), $('#postcode-user').parents('form:first').find('#id_country').val() , this );
	  });

      $(".registration-form button#submitEmail").click(function(e) {

         $(this).parent().find("input").removeClass("highlight");
        // $(this).parent().children(".form-error-small").hide();
		$("#first.form-error-small").addClass('hide');

         if(!validateEmail('email-registration')) {
            $(this).parent().find("input").addClass("highlight");
            //$(this).parent().children(".form-error-small").show();
			$("#first.form-error-small").removeClass('hide');
            return false;
         }

      });

      //Forgot password

      $("form#forgot-password input[type='submit']").click(function(e) {
        if(validateEmail('forgot-password-email')) {
            $(this).parent("form").submit();
        }
        else {
            e.preventDefault();
            $("#forgot-password-email").addClass("highlight").focus();
        }

      });

      //Send password

      $("#send-password input[type='submit']").click(function(e) {
      e.preventDefault();
	  $(this).parent("form").submit();
	  });

      //Contact form
      $("#contact-submit").click(function(e) {

        $(".error-contact-form").remove();

  		var contactEmail = $("input#contact-email");
        var contactMessage = $("textarea#contact-message");
        var contactError = $("#contact-form").find("#contact-email");
        var contactErrorText = "<span class='error-contact-form'>*"+$("#contact-form").data("error")+"</span>";

		if (contactEmail.val() == "") {
            contactError.after(contactErrorText);
            contactEmail.focus();
            return false;
        }

		if (contactMessage.val() == "") {
		    contactError.after(contactErrorText);
			contactMessage.focus();
            return false;
        }

        if(validateEmail('contact-email')) {
            return true;
        }

        else {
            contactError.after(contactErrorText);
            contactEmail.focus();
            return false;
        }

        return false;

      });

      //Payment step

    $("#payment label").on('click', function() {
      $("#payment label").removeClass(active);
      $(this).addClass(active);
    });

    $('.popup').click(function(event) {
       var width  = 575,
          height = 400,
          left   = ($(window).width()  - width)  / 2,
          top    = ($(window).height() - height) / 2,
          url    = this.href,
          opts   = 'status=1' +
                   ',width='  + width  +
                   ',height=' + height +
                   ',top='    + top    +
                   ',left='   + left;

      window.open(url, 'twitte', opts);

      return false;
    });

    $('label').click(function() {
      loopRadio($(this).find('input[name="actionto"]:radio').val());
    });

    $('#payment select').on('change', function() {
      loopRadio($(this).closest('.payblock2').find('input[name="actionto"]:radio').val());
    });

    $('input[name="actionto"]:radio').change(
    function(){
            var value = $( this ).val();
            loopRadio(value);
        }
    );

    function loopRadio(val1) {
        $('input[name="actionto"]:radio').each(function() {
            var thisVal = $( this ).val();
            if (val1 == thisVal) {
                $( this ).prop('checked', true);
                $(this).closest('label').addClass('active');
            } else {
                $( this ).prop('checked', false);
                 $(this).closest('label').removeClass('active');
            }
        });
    }


});

	function updateEmailRegistration(email, input)
	{
		$.ajax({
			type: 'POST',
			headers: { "cache-control": "no-cache" },
			dataType : "json",
			url: baseUri + '?rand=' + new Date().getTime(),
			async: true,
			cache: false,
			data: 'controller=auth&ajax=true'
				+'&updateEmailRegistration=true'
				+'&emailreg='+email
				+'&token='+static_token
				+'&allow_refresh=1',
			success: function(jsonData){
				if (jsonData['error'] == 'ok')
				{
					$('#'+input).parent().find("input").removeClass("highlight");
					$("#second.form-error-small").addClass('hide');
					$("#first.form-error-small").addClass('hide');
					$('#submitEmail').removeAttr("disabled", "disabled");
					$('#submitEmail').removeClass("disabled");
				}
				else if(jsonData['error'] == 'exist')
				{
					$('#'+input).parent().find("input").addClass("highlight");
					$("#second.form-error-small").removeClass('hide');
					$("#first.form-error-small").addClass('hide');
					$('#submitEmail').attr("disabled", "disabled");
					$('#submitEmail').addClass("disabled");
				}
				else
				{
					$('#'+input).parent().find("input").addClass("highlight");
					$("#first.form-error-small").removeClass('hide');
					$("#second.form-error-small").addClass('hide');
					$('#submitEmail').attr("disabled", "disabled");
					$('#submitEmail').addClass("disabled");
				}

			}
		});
	}

	function zipCodeValidation(postcode, country_id , input)
	{
		$.ajax({
			type: 'POST',
			headers: { "cache-control": "no-cache" },
			dataType : "json",
			url: baseUri + '?rand=' + new Date().getTime(),
			async: true,
			cache: false,
			data: 'controller=auth&ajax=true'
				+'&zipCodeValidation=true'
				+'&country_id='+country_id
				+'&postcode='+postcode
				+'&token='+static_token
				+'&allow_refresh=1',
			success: function(jsonData){
				if (jsonData['error'] == true)
				{
					$(input).addClass("highlight");
					$(input).parents('form:first').find(':submit').attr("disabled", "disabled");
					$(input).parents('form:first').find(':submit').addClass("disabled");
				}
				else
				{
					$(input).removeClass("highlight");
					$(input).parents('form:first').find(':submit').removeAttr("disabled", "disabled");
					$(input).parents('form:first').find(':submit').removeClass("disabled");
				}

			}
		});
	}

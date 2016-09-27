<div id="prices" class="block funnel">
    <div class="left content changeable">
        <h3 class="step"><span>Select quantity</span>
        </h3>
       <div class="radio grid grid-col">
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
                <span></span>
            </div>
        </div>
    </div>
</div>


<script>

    jQuery(function($) {
        $(".quant").click(function() {
            $(".quant").removeClass("active");
            $(this).toggleClass("active");
        });
    });


</script>
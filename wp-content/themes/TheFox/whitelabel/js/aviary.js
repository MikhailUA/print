//Setup the Ink file picker - to get an apikey, go to https://developers.inkfilepicker.com/register/
filepicker.setKey('AwrkAbPYsQJivQ2wgUsaHz');

//Setup Aviary
var featherEditor = new Aviary.Feather({
    //Get an api key for Aviary at http://www.aviary.com/web-key
    apiKey: 'fb99f1f78869b18a',
    apiVersion: 3,
    language: window.navigator.language,
    theme: 'minimum', // Check out our new 'light' and 'dark' themes!
    tools: ['effects', 'stickers', 'text', 'crop', 'orientation'],
    enableCORS: true,
    appendTo: '',
    onLoad: '',
    onReady: function(){
	$(".loader-big").fadeOut();
    },
    onSave: function(imageID, newURL) {
	//alert('onSave');
	//Export the photo to the cloud using the Ink file picker!
	//alert(imageID);
	//alert(newURL);
	//document.getElementById(imageID).src = newURL;
	//document.getElementById(imageID).style.height = '100px';
	//document.getElementById(imageID).style.visibility = 'visible';
	featherEditor.close();
    },
    onSaveButtonClicked: function() {
	//alert(featherEditor.getImageDimensions().width);
	updateSignature();
	featherEditor.saveHiRes();
	return false;
    },
    onError: function(code, msg) {
    //alert(code);
    //alert(msg);
    }
});

function UrlExists(url)
{
    var http = new XMLHttpRequest();
    http.open('HEAD', url, false);
    http.send();
    return http.status!=404;
}

function updateSignature() {
    $.ajax('/genSignature.php').done(function(data){
	featherEditor.updateConfig({
	    salt: data.salt,
	    timestamp: data.timestamp,
	    signature: data.signature
	});
    });
};

//Giving a placeholder image while Aviary loads
function launchFilepicker(new_cart_id, ratio, minHeight, minWidth, services, eServices, saveDB, successDiv, productId){
    if (services === '') services = ['COMPUTER','FACEBOOK','INSTAGRAM','DROPBOX','FLICKR','GOOGLE_DRIVE','PICASA'];
    if (eServices === '') eServices = ['COMPUTER','FACEBOOK','DROPBOX','FLICKR','GOOGLE_DRIVE','PICASA'];
    filepicker.pick({
	extensions: ['.jpg', '.jpeg', '.png', '.tiff', '.tif'],
	services: services
    }, function(InkBlob) {
	updateSignature();
	$(".loader-big").show();
	var tmpImg = new Image();
	tmpImg.src=InkBlob.url; //or  document.images[i].src;
	$(tmpImg).one('load',function(){
	    orgWidth = tmpImg.width;
	    orgHeight = tmpImg.height;
	    //alert(orgWidth+"x"+orgHeight); //1000px = 10" = 25.4cm
	    if ( (orgHeight < minHeight) || (orgWidth < minWidth) ) {
		alert('Afbeelding heeft een te lage kwaliteit, graag een hogere kwaliteit uploaden');
		$(".loader-big").fadeOut();
		return launchFilepicker(new_cart_id, ratio, minHeight, minWidth);
	    } else {
		while (!UrlExists(InkBlob.url)) sleep(100);
		//alert(InkBlob.url);
		//Launching the Aviary Editor
		var initTool = 'crop';
		var cropPresets = ratio;

		if (cropPresets === ''){
		    initTool = '';
		    cropPresets = ['Custom','Original',['Square', '1:1'],'3:2', '5:3', '4:3', '5:4', '6:4', '7:5', '10:8', '16:9'];
		}

		featherEditor.launch({
		    apiKey: 'fb99f1f78869b18a',
		    hiresUrl: InkBlob.url,
		    jpgQuality: 100,
		    image: tmpImg,
		    fileType:'jpg',
		    url: InkBlob.url,
		    initTool: initTool,
		    cropPresets: cropPresets,
		    onSaveHiRes: function(domId, url) {
			//alert('onSaveHiRes');
			//var hiresUrl = document.getElementById('aviary_hi_res_' + new_cart_id);
			//hiresUrl.value = url;
			success_element = document.getElementById(successDiv)
			if (success_element) success_element.style.visibility = 'visible';

			//featherEditor.save();
			if (saveDB === 1){
			    $.ajax({
				type: "POST",
				url: "/index.php?controller=upload&action=saveAviary",
				data: { file: url, newcartid: new_cart_id, id_product: productId}
			    });
			} else {
			    filepicker.export(url, {services: eServices, extension:'.jpg'});
			}
			featherEditor.close();
		    }
		});
	    }
	});
    });
}

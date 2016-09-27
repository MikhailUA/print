function getCookie(cname) {
	var name = cname + "=";
	var ca = document.cookie.split(';');
	for(var i=0; i<ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1);
		if (c.indexOf(name) == 0) return c.substring(name.length,c.length);
	}
	return "";
}

function setCookie(name, value) {
	document.cookie = name + "=" + value + ";";
}

function handleResult(data){
	console.log(data);
}

jQuery(document).ready(function(){
	if(document.cookie.indexOf("prooflink") >= 0){
		//Cookie is set.
		var cookieData = JSON.parse(decodeURIComponent(getCookie("prooflink")));
		if(cookieData.prooflink_logedin == false && cookieData.prooflink_needLogin == true){
			$.getJSON(cookieData.prooflink_loginUrl + '?callback=?', function(result){
				//response data are now in the result variable
				if(result.status == "ok") {
					cookieData.prooflink_needLogin = false;
					setCookie("prooflink", encodeURIComponent(JSON.stringify(cookieData)));
				} else {
					console.log('Something went wrong when logging in see object below');
					console.log(result);
				}
			});
		}
	}
});




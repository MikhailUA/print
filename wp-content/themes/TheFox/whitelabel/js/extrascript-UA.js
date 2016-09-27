// ***** Configuratie downloads, mailto's en uitgaande links *****

// Uitgaande links naar deze domeinen negeren: ("domein1.nl www.domein2.nl")
var ignore_urls      = "";

var prefix_download = "/download/";
var prefix_clickouts = "/extern/";
var prefix_mailto    = "/email_to/";

// ***** Configuratie *****

function xxaddEvent(element, type, handler)
{
  if (element.addEventListener)
  {
    element.addEventListener(type, handler, false);
  } else {
    if (!handler.$$guid) handler.$$guid = xxaddEvent.guid++;
    if (!element.events) element.events = {};
    var handlers = element.events[type];
    if (!handlers)
    {
      handlers = element.events[type] = {};
      if (element["on" + type])
      {
        handlers[0] = element["on" + type];
      }
    }
    handlers[handler.$$guid] = handler;
    element["on" + type] = xxhandleEvent;
  }
};
xxaddEvent.guid = 1;

function xxhandleEvent(event)
{
  var returnValue = true;
  event = event || xxfixEvent(((this.ownerDocument || this.document || this).parentWindow || window).event);
  var handlers = this.events[event.type];
  for (var i in handlers)
  {
    this.$$handleEvent = handlers[i];
    if (this.$$handleEvent(event) === false)
    {
      returnValue = false;
    }
  }
  return returnValue;
};

function xxfixEvent(event)
{
  event.preventDefault = xxfixEvent.preventDefault;
  event.stopPropagation = xxfixEvent.stopPropagation;
  return event;
};

xxfixEvent.preventDefault = function()
{
  this.returnValue = false;
};

xxfixEvent.stopPropagation = function()
{
  this.cancelBubble = true;
};

if (!window.addEventListener)
{
	document.onreadystatechange = function()
	{
		if (window.onload && window.onload != xxhandleEvent)
		{
			xxaddEvent(window, 'load', window.onload);
			window.onload = xxhandleEvent;
		}
	}
}

ignore_urls = document.domain + " " + ignore_urls;
ignore_urls = ignore_urls.replace(/^\s+/,'').replace(/\s+$/,'');
ignore_urls = ignore_urls.split(" ");

function checkLinkToOwnDomains(txt)
{
  if (txt.indexOf("?") > -1)
  {
    txt = txt.substr(0, txt.indexOf("?"));
  }
  if (txt.indexOf("#") > -1)
  {
    txt = txt.substr(0, txt.indexOf("#"));
  }

  for (var i = 0; i <= ignore_urls.length; i++)
  {
    if (txt.indexOf(ignore_urls[i]) > -1) { return false; }
  }
  return true;
};

function addextratracking()
{
  elm = document.getElementsByTagName('a');
  for (var i = 0; i < elm.length; i++)
  {
    var path = elm[i].href + "";
    // Downloads
    if (path.match(/\.(doc|eps|jpg|png|svg|xls|ppt|pps|pdf|xls|zip|txt|vsd|vxd|js|css|rar|exe|wma|mov|avi|wmv|mp3|dmg)/) != null)
    {
      if ((path.indexOf("http://" + location.host) > -1) || (checkLinkToOwnDomains(path) == false))
      {
        xxaddEvent(elm[i], "click", function()
        {
          var url = this.href;
          var dom = document.domain;
          var newurl = url.substr(url.indexOf(dom) + dom.length);
          ga('send','pageview', prefix_download + newurl);
        } );
      }
    }

    // Mailto's
    if (path.indexOf("mailto:") > -1)
    {
      xxaddEvent(elm[i], "click", function()
      {
        var url = this.href;
	 ga('send','pageview',prefix_mailto + (url).substr(7) );
      } );
    }
    
    // Uitgaande links
    if ((checkLinkToOwnDomains(path)) && (path.indexOf("mailto:") == -1) && (path.indexOf("javascript:") == -1) && (path != ""))
    {
      xxaddEvent(elm[i], "click", function()
      {
        if ((checkLinkToOwnDomains(this.href)) && (this.href.indexOf("mailto:") == -1) && (this.href.indexOf("javascript:") == -1) && (this.href != ""))
        {
          var url = this.href;
          if ((url).indexOf("https") > -1) { xxsecure = 8; } else { xxsecure = 7; }
           ga('send','pageview',prefix_clickouts + (url).substr(xxsecure) );
        }
      } );
    }
  }
};

window.onload = addextratracking;
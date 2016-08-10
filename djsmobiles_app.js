//djsmobiles-app-call
//var isiDevice            = /ipad|iphone|ipod/i.test(navigator.userAgent.toLowerCase());
var isAndroid            = /android/i.test(navigator.userAgent.toLowerCase());
//var isBlackBerry         = /blackberry/i.test(navigator.userAgent.toLowerCase());
//var isWebOS              = /webos/i.test(navigator.userAgent.toLowerCase());
var isWindowsPhone       = /windows phone/i.test(navigator.userAgent.toLowerCase());

if(isAndroid) 
{
    var url=confirm("Would you like to download our Android app?");
    if (url===true)
    {
        var url = window.location.href = 'http://play.google.com/store/apps/details?id=com.djsystems.djsmobiles';
        url.show(); 
    }
}   
else if (isWindowsPhone)
{
    var url=confirm("Would you like to download our Windows Phone app?");
    if (url===true)
    {
        var url = window.location.href = 'http://www.windowsphone.com/en-us/store/app/djs-mobiles/48f3dfe5-a286-41bc-909d-99c6c40003df';
        url.show();
    }    
}
else
{
    
}



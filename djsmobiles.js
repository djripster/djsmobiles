/*
Google Ad Manager
*/
<script async='async' src='https://www.googletagservices.com/tag/js/gpt.js'></script>
<script>
  var googletag = googletag || {};
  googletag.cmd = googletag.cmd || [];
</script>

<script>
  googletag.cmd.push(function() {
    googletag.defineSlot('/61636059/djsmobiles-01', [[300, 1050], [300, 100], [300, 250], [300, 600]], 'div-gpt-ad-1539470311184-0').addService(googletag.pubads());
    googletag.pubads().enableSingleRequest();
    googletag.enableServices();
  });
</script>

/*
Amazon Publisher Services
*/
<script>
//load the apstag.js library
!function(a9,a,p,s,t,A,g){if(a[a9])return;function q(c,r){a[a9]._Q.push([c,r])}a[a9]={init:function(){q("i",arguments)},fetchBids:function(){q("f",arguments)},setDisplayBids:function(){},targetingKeys:function(){return[]},_Q:[]};A=p.createElement(s);A.async=!0;A.src=t;g=p.getElementsByTagName(s)[0];g.parentNode.insertBefore(A,g)}("apstag",window,document,"script","//c.amazon-adsystem.com/aax2/apstag.js");

//initialize the apstag.js library on the page to allow bidding
apstag.init({
     pubID: 'e2971513-1dc9-40ca-9659-d188b27aba0c', //enter your pub ID here as shown above, it must within quotes
     adServer: 'googletag'
});
apstag.fetchBids({
     slots: [{
         slotID: 'div-gpt-ad-1539470311184-0', //example: 'div-gpt-ad-1475102693815-0'
         slotName: '/61636059/djsmobiles-01', //example: '12345/box-1'
         sizes: [[300,250], [300, 600]] //example: [[300,250], [300,600]]
     },
     {
         slotID: 'div-gpt-ad-1539470311184-0', //example: 'div-gpt-ad-1475185990716-0'
         slotName: '/61636059/djsmobiles-01', //example: '12345/leaderboard-1'
         sizes: [[300, 1050]] //example: [[728,90]]
     }],
     timeout: 2e3
}, function(bids) {
     // set apstag targeting on googletag, then trigger the first DFP request in googletag's disableInitialLoad integration
     googletag.cmd.push(function(){
         apstag.setDisplayBids();
         googletag.pubads().refresh();
     });
}); 
</script>

<!-- Quantcast Tag -->
<script type="text/javascript">
var _qevents = _qevents || [];

(function() {
var elem = document.createElement('script');
elem.src = (document.location.protocol == "https:" ? "https://secure" : "https://edge") + ".quantserve.com/quant.js";
elem.async = true;
elem.type = "text/javascript";
var scpt = document.getElementsByTagName('script')[0];
scpt.parentNode.insertBefore(elem, scpt);
})();

_qevents.push({
qacct:"p-gDf1-KQpvbd8z"
});
</script>

<noscript>
<div style="display:none;">
<img src="//pixel.quantserve.com/pixel/p-gDf1-KQpvbd8z.gif" border="0" height="1" width="1" alt="Quantcast"/>
</div>
</noscript>
<!-- End Quantcast tag -->
  
<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-5CCCX2L');</script>
<!-- End Google Tag Manager -->

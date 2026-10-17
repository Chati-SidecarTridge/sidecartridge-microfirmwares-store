// Google Analytics, the sidecartridge.com property (G-6VT9RXTJ2N, the main
// site's ID). Never loaded directly: each page includes this file as a
// type="text/plain" data-cookiecategory="analytics" script, which
// cookieconsent only runs after the analytics category is accepted. It only
// loads gtag on *.sidecartridge.com, so local and LAN tests send no hits.
// gtag's default cookie_domain 'auto' puts _ga on .sidecartridge.com, shared
// with the main site.
(function () {
    var GA_ID = 'G-6VT9RXTJ2N';
    if (!/(^|\.)sidecartridge\.com$/.test(location.hostname)) return;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { dataLayer.push(arguments); };
    gtag('js', new Date());
    gtag('config', GA_ID);
})();

// Cookie banner, as on sidecartridge.com and magic.sidecartridge.com.
// The cc.run() call is the main site's inline script from
// sidecartridge-website/_includes/framework/cookie-consent.html, and
// cookieconsent.{js,css} next to this file are verbatim copies of its
// orestbida/cookieconsent v2.9.2 (MIT). If the main site changes its banner,
// copy the change here. Changes from the original:
//  - cookie_domain: cookieconsent writes cc_cookie with Domain=<cookie_domain>,
//    which defaults to location.hostname. On the apex that already covers
//    every subdomain, so here it is set to sidecartridge.com to read and write
//    that same cookie: a choice made on either site holds on the other.
//    Elsewhere (localhost, LAN) it keeps the default.
//  - the privacy policy and contact links point at the main site instead of
//    the placeholders there.
// Analytics is consent/analytics.js, which each page includes as a
// type="text/plain" data-cookiecategory="analytics" script: cookieconsent
// (page_scripts) only runs it after the analytics category is accepted.

window.addEventListener('load', function () {

    // obtain plugin
    var cc = initCookieConsent();

    // run plugin with your configuration
    cc.run({
        cookie_domain: /(^|\.)sidecartridge\.com$/.test(location.hostname) ? 'sidecartridge.com' : location.hostname,
        current_lang: 'en',
        autoclear_cookies: true,                   // default: false
        page_scripts: true,                        // default: false

        // mode: 'opt-in'                          // default: 'opt-in'; value: 'opt-in' or 'opt-out'
        // delay: 0,                               // default: 0
        // auto_language: '',                      // default: null; could also be 'browser' or 'document'
        // autorun: true,                          // default: true
        // force_consent: false,                   // default: false
        // hide_from_bots: true,                   // default: true
        // remove_cookie_tables: false             // default: false
        // cookie_name: 'cc_cookie',               // default: 'cc_cookie'
        // cookie_expiration: 182,                 // default: 182 (days)
        // cookie_necessary_only_expiration: 182   // default: disabled
        // cookie_domain: location.hostname,       // default: current domain
        // cookie_path: '/',                       // default: root
        // cookie_same_site: 'Lax',                // default: 'Lax'
        // use_rfc_cookie: false,                  // default: false
        // revision: 0,                            // default: 0

        onFirstAction: function (user_preferences, cookie) {
            // callback triggered only once on the first accept/reject action
        },

        onAccept: function (cookie) {
            // callback triggered on the first accept/reject action, and after each page load
        },

        onChange: function (cookie, changed_preferences) {
            // If analytics category is disabled => disable google analytics
            if (!cc.allowedCategory('analytics')) {
                typeof gtag === 'function' && gtag('consent', 'update', {
                    'analytics_storage': 'denied'
                });
            }
        },

        languages: {
            'en': {
                consent_modal: {
                    title: 'We use cookies!',
                    description: 'Hi, this website uses essential cookies to ensure its proper operation and tracking cookies to understand how you interact with it. The latter will be set only after consent. <button type="button" data-cc="c-settings" class="cc-link">Let me choose</button>',
                    primary_btn: {
                        text: 'Accept all',
                        role: 'accept_all'              // 'accept_selected' or 'accept_all'
                    },
                    secondary_btn: {
                        text: 'Reject all',
                        role: 'accept_necessary'        // 'settings' or 'accept_necessary'
                    }
                },
                settings_modal: {
                    title: 'Cookie preferences',
                    save_settings_btn: 'Save settings',
                    accept_all_btn: 'Accept all',
                    reject_all_btn: 'Reject all',
                    close_btn_label: 'Close',
                    // cookie_table_caption: 'Cookie list',
                    cookie_table_headers: [
                        { col1: 'Name' },
                        { col2: 'Domain' },
                        { col3: 'Expiration' },
                        { col4: 'Description' }
                    ],
                    blocks: [
                        {
                            title: 'Cookie usage 📢',
                            description: 'I use cookies to ensure the basic functionalities of the website and to enhance your online experience. You can choose for each category to opt-in/out whenever you want. For more details relative to cookies and other sensitive data, please read the full <a href="https://sidecartridge.com/privacy-policy/" class="cc-link" target="_blank" rel="noopener">privacy policy</a>.'
                        }, {
                            title: 'Strictly necessary cookies',
                            description: 'These cookies are essential for the proper functioning of my website. Without these cookies, the website would not work properly',
                            toggle: {
                                value: 'necessary',
                                enabled: true,
                                readonly: true          // cookie categories with readonly=true are all treated as "necessary cookies"
                            },
                            cookie_table: [
                                {
                                    col1: 'cc_cookie',
                                    col2: '.sidecartridge.com',
                                    col3: '6 months',
                                    col4: 'Stores your cookie choice for sidecartridge.com and its subdomains.'
                                }
                            ]
                        }, {
                            title: 'Performance and Analytics cookies',
                            description: 'Google Analytics 4 cookies, used to understand how visitors use the site. Only set if you accept this category.',
                            toggle: {
                                value: 'analytics',     // your cookie category
                                enabled: false,
                                readonly: false
                            },
                            cookie_table: [             // list of all expected cookies
                                {
                                    col1: '_ga',
                                    col2: '.sidecartridge.com',
                                    col3: '2 years',
                                    col4: 'Google Analytics 4: distinguishes visitors.'
                                },
                                {
                                    col1: '_ga_6VT9RXTJ2N',
                                    col2: '.sidecartridge.com',
                                    col3: '2 years',
                                    col4: 'Google Analytics 4: keeps the session state.'
                                }
                            ]
                        },
                        {
                            title: 'More information',
                            description: 'For any queries in relation to our policy on cookies and your choices, please <a class="cc-link" href="https://sidecartridge.com/" target="_blank" rel="noopener">contact us</a>.',
                        }
                    ]
                }
            }
        }
    });
});

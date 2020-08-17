window.__trackdev = false; // is this for dev?
if (!window.__trackdev) {
    window.__paId = '90-5e5e14ffd003a'; // 0312 update
    window.__gaId = 'UA-111995344-17'; // 0312 update
    // https://flyad.events.pixnet.net/pei.gif?year=2020&group=flyad-petad&url=URL&t=TIME
    window.__imageSrc = 'flyad';
    window.__ckEvent = {
        'year': '2020',
        'group': 'flyad-petad'
    };
    // Global Site Tag (gtag.js) - Google Analytics
    (function(d, t, u, f, j) { f = d.getElementsByTagName(t)[0]; j = d.createElement(t); j.async = 1; j.src = u; f.parentNode.insertBefore(j, f);
    })(document, 'script', '//www.googletagmanager.com/gtag/js?id=' + window.__gaId);
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', window.__gaId);
    /** pa **/
    var _piq = _piq || [];
    _piq.push(
        ['setCustomVar', 'venue', window.__paId],
        ['setCustomVar', 'visitor_id', ''],
        ['setCustomVar', 'label', ''],
        ['trackPageView'],
        ['trackPageClick']
    );
    (function(d, t, u, f, j) {
        f = d.getElementsByTagName(t)[0];
        j = d.createElement(t);
        j.async = 1;
        j.src = u;
        f.parentNode.insertBefore(j, f);
    })(document, 'script', 'https://s.pixanalytics.com/js/pi.min.js');
}
//=================================================================================

/** click count **/
function ck_count(tag) {
    console.log('c: ' + tag);
    if (window.__trackdev) return;
    var _image = new Image();
    var _now = Math.floor(Date.now() / 1000);
    _image.src = 'https://' + window.__imageSrc + '.events.pixnet.net/pei.gif?year=' + window.__ckEvent.year + '&group=' + window.__ckEvent.group + '&url=' + encodeURIComponent('Mobile_' + tag) + '&t=' + _now;
}

/** ga pageview **/
function ga_pv(page_name) {
    console.log('g: ' + page_name);
    if (window.__trackdev) return;
    if (typeof(page_name) == 'undefined') { console.log('no page name'); return; }
    gtag('config', window.__gaId, {
        'page_title': page_name,
        'page_path': page_name
    });
}
window.__dev = false; // 是否為測試模式
if (!window.__dev) {
    window.__paId = '37-5cb68ba1ba520'; // 0315 更新
    window.__gaId = 'UA-80426435-18'; // 0226 更新

    /*
    // 0424 更新
    example
    https://{flyad}.events.pixnet.net/pei.gif?year={2019}&group={flyad-bruise}&url=URL&t=TIME
    https://flyad.events.pixnet.net/pei.gif?year=2019&group=flyad-tryit2019basketball&url=URL&t=TIME
    */
    window.__ckEvent = {
        "src": "flyad",
        "year": "2019",
        "group": "flyad-tryit2019basketball",
    };
    window.__ckUrl = 'https://' + window.__ckEvent.src + '.events.pixnet.net/pei.gif?year=' + window.__ckEvent.year + '&group=' + window.__ckEvent.group;

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
} else {
    console.log('TESTTESTTESTTESTTESTTESTTESTTESTTESTTESTTESTTESTTESTTEST');
}
//=================================================================================

/** 點擊數 **/
function ck_count(tag) {
    console.log('c: ' + tag);
    if (window.__dev) return;
    var _image = new Image();
    var _now = Math.floor(Date.now() / 1000);
    _image.src = window.__ckUrl + '&url=' + encodeURIComponent('Mobile_' + tag) + '&t=' + _now;
}

/** ga pageview **/
function ga_pv(page_name) {
    console.log('g: ' + page_name);
    if (window.__dev) return;
    if (typeof(page_name) == 'undefined') { console.log('no page name'); return; }
    gtag('config', window.__gaId, {
        'page_title': page_name,
        'page_path': page_name
    });
}








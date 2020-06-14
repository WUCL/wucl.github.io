(function() {
    "use strict";
    window.el = {
        $window: $(window),
        $doc: $(document),
        $body: $('body'),
        $header: $('#header'),
        $main: $('#main'),
        $footer: $('#footer'),

        $aboutExp: $('.about-exp'),

        $exps: $('#exps'),
    };
    window.exps = {
        "mamaclub": {
            "logo": "./public/img/exp/mamaclub.jpg"
            , "time": "201501 - 201706"
            , "url": "https://mamaclub.com/"
            , "name": "MamaClub 媽媽經"
            , "title": "B2E / F2E / UX Engineer"
            , "abouts": {
                "title": "關於公司"
                , "item": [
                    "媽媽的專屬網站"
                    , "解決媽媽生活中的大小識"
                    , "在職期間為 <a href='https://www.alexa.com/' target='_blank' rel='noreferrer noopener'>Alexa</a> 台灣前 50 大網站"
                ]
            }
            , "myposition": {
                "title": "負責職務"
                , "item": [
                    "前端 - PC/Mobile/APP Webview 的開發製作與優化、廣告版位配置優化、產品功能轉換追蹤與頁面好感度提升等"
                    , "產品企劃 - 企劃網站內容、功能開發主導、APP 內容等追蹤與檢討"
                    , "MIS - 內部網站與主機的維護和障礙排除"
                ]
            }
            , "whatidid": {
                "title": "做過的事"
                , "item": [
                    "從後端進而轉到前端，並擔任 前端主要負責人"
                    , "完成檔案的跨主機同步，建立異地備份更使檔案便於管控"
                    , "將 <a href='https://zh-tw.wordpress.com/' target='_blank' rel='noreferrer noopener'>Wordpress</a> 前端脫離，進而優化手機端 150% 效能成長"
                    , "追蹤與記錄網站成效，並長期持續優化"
                    , "建立使用者輪廓與客戶關係並與數據做自動化整合與分析"
                    , "將廣告配置最大化，提升 2 倍點擊成長"
                    , "電商平台系統建置，使達成轉換"
                ]
            }
        },
        "talkux": {
            "logo": "./public/img/exp/talkux.jpg"
            , "time": "2017"
            , "url": "https://www.talk-ux.com/"
            , "name": "Talk UX"
            , "title": "Web Team Volunteer"
            , "abouts": {
                "title": "動機"
                , "item": [
                    "由一個全球性女性社團 <a href='https://www.ladiesthatux.com/' target='_blank' rel='noreferrer noopener'>Ladies that UX（LTUX）</a> 所主辦"
                    , "每年世界各地關注 UX 的女孩們聚集起來，一起舉辦的一場 UX 盛會 ! "
                    , "主因是想參與這次活動，使更接近 UX 其工作及相關從業人員，而投稿成為志工"
                ]
            }
            , "myposition": {
                "title": "參與職務"
                , "item": [
                    "主要負責 2017 年 <a href='https://www.facebook.com/ltuxtaipei/' target='_blank' rel='noreferrer noopener'>Talk UX 台灣站</a>，主題為 “她說” 的網站建置與更新"
                ]
            }
            , "whatidid": {
                "title": "Volunteer Certificate"
                , "item": [
                    "<img src='./public/img/exp/talkux-VolunteerCertificate.jpg'>"
                ]
            }
        },
        "spaceadvisor": {
            "logo": "./public/img/exp/spaceadvisor.png"
            , "time": "201709 - 201803"
            , "url": "https://www.spaceadvisor.com/"
            , "name": "SpaceAdvisor 場地家"
            , "title": "Visual Engineer"
            , "abouts": {
                "title": "關於公司",
                "item": [
                    '全新電商平台，也是台灣首創，真正商業運作的專業空間出租平台'
                    , '集結最豐富、齊全的場地選擇，讓場地精準地被搜尋與預訂'
                ]
            }
            , "myposition": {
                "title": "負責職務",
                "item": [
                    "產品企劃 - 企劃網站內容、功能測試與主要窗口聯繫"
                    , "前端 - 主要協助產品於上線前的一置性，並整合與備份"
                ]
            }
            , "whatidid": {
                "title": "做過的事",
                "item": [
                    "主要從測試階段參與，規劃 User Flow  / Mind Map 以及功能單元測試"
                    , "協助產品上線前的整合階段，並將產品準時上線"
                ]
            }
        },
        "pixnet": {
            "logo": "./public/img/exp/pixnet.png"
            , "time": "201805 - "
            , "url": "https://www.pixnet.net/"
            , "name": "PIXNET"
            , "title": "F2E"
            , "abouts": {
                "title": "關於公司",
                "item": [
                    '痞客邦為台灣最大興趣社交媒體'
                    , '為台灣流量最高的原生網站'
                    , '截至目前擁有累積 8 億篇文章'
                    , "在職期間為 <a href='https://www.alexa.com/' target='_blank' rel='noreferrer noopener'>Alexa</a> 台灣前 5 大網站（全球前百大）"
                ]
            }
            , "myposition": {
                "title": "負責職務",
                "item": [
                ]
            }
            , "whatidid": {
                "title": "做過的事",
                "item": [
                ]
            }
        }
    };
    new Vue({
        el: "#about-exp",
        data: {
            exps: window.exps,
            // exps: ''
        },
        mounted: function() {
            console.log("%cHi This is Allen", "padding:0 5px;background:#ffcc00;color:#116934;font-weight:bolder;font-size:50px;")
            if ('scrollRestoration' in history) { history.scrollRestoration = 'manual'; }
            window.el.$body.addClass(deviceObj.name);
            // this.loadExps();
        },
        watch: {
            exps: function (val) {
                console.log(val);
            }
        },
        created: function () {
        },
        methods: {
            loadExps() {
                $.getJSON("public/js/exps.json", function(data) {
                    // console.log(data);
                    this.exps = data;
                })
                .done(function() {
                    // console.log("second success");
                })
                .fail(function(error) {
                    // console.log("error");
                    console.log(error);
                })
                .always(function() {
                    // console.log("complete");
                    console.log(this.exps);
                });
                return;
            },
            externalLink(url) {
                window.open(url, '_blank');
            },
            openExp(e) {
                let $target = e.currentTarget;
                let $exp = $target.getAttribute('data-exp');
                $target.classList.add("active");
                window.helper.updateUrlParams(location.href, 'exps', $exp, true);

                let $exps = this.exps[$exp];
                $('#exps').attr('data-exp', $exp);
                $('#exps').find('.logo img').attr('src', $exps.logo);
                $('#exps').find('.info time').html($exps.time);
                $('#exps').find('.info .name').attr('href', $exps.name);
                $('#exps').find('.info .name').html($exps.name);
                $('#exps').find('.info .title').html($exps.title);

                let $abouts = $exps.abouts;
                let $temp_abouts = '';
                $abouts.item.forEach(abouts => $temp_abouts += '<li>' + abouts + '</li>');
                $('#exps').find('.abouts').attr('data-title', $abouts.title).find('ul').html($temp_abouts);

                let $myposition = $exps.myposition;
                let $temp_myposition = '';
                $myposition.item.forEach(myposition => $temp_myposition += '<li>' + myposition + '</li>');
                $('#exps').find('.myposition').attr('data-title', $myposition.title).find('ul').html($temp_myposition);

                let $whatidid = $exps.whatidid;
                let $temp_whatidid = '';
                $whatidid.item.forEach(whatidid => $temp_whatidid += '<li>' + whatidid + '</li>');
                $('#exps').find('.whatidid').attr('data-title', $whatidid.title).find('ul').html($temp_whatidid);

                window.el.$body.addClass('disableScroll').addClass('open-exps');
            },
        }
    });

    new Vue({
        el: "#exps",
        data: {
        },
        mounted: function() {
        },
        methods: {
            closeExp() {
                let $target = document.querySelector("#about-exp ul li.active");
                $target.classList.remove("active");
                $('#exps').attr('data-exp', '');
                window.helper.updateUrlParams(location.href, 'exps', '', true);
                window.el.$body.removeClass('disableScroll').removeClass('open-exps');
            },
        }
    });
})();

/* =======================
helper
======================= */
window.helper = {
    magicNum: function(_target, _endNum, _duration) {
        $({Counter: _target.text()}).animate({
            Counter: _endNum
        }, {
            duration: _duration || 200,
            easing: 'swing',
            step: function() {
                _target.text(Math.floor(this.Counter));
            },
            complete: function () {
                _target.html(this.Counter);
                // alert('finished');
            }
        });
    },
    getRandom: function(min, max) {
        return Math.floor(Math.random()*(max-min+1))+min;
    },
    doCopy: (text, afterCopied) => {
        var inp = document.createElement('input');
        document.body.appendChild(inp);
        inp.value = text
        inp.select();
        document.execCommand('copy', false);
        inp.remove();
        // alert('已複製。\n' + text);

        if (typeof afterCopied !== 'function') return;
        return afterCopied();
    },
    getUrlParams: (_url, _key = '') => {
        let $url = new URL(location.href);
        let $params = $url.searchParams;
        let $returnJson = {};
        for (let pair of $params.entries()) {
            $returnJson[pair[0]] = pair[1];
        }
        if (_key == '') return $returnJson;
        else return $returnJson[_key] || '';
    },
    // ref: https://usefulangle.com/post/81/javascript-change-url-parameters
    updateUrlParams: (_url, _key, _value, _livechange = false) => {
        if (_key == '') return;
        let $url = new URL(_url);
        let $params = $url.searchParams;
        if (_value == '') $params.delete(_key);
        else $params.set(_key, _value);
        $url.search = $params.toString();
        let $newUrl = $url.toString();
        if (_livechange) if (history.pushState) window.history.pushState({ path: $newUrl }, '', $newUrl);
        else return $newUrl;
        return;
    },
};
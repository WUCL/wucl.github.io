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

    // 取得template
    getTemplate: (_template_type) => {
        return $('#template_' + _template_type).html();
    },

    // 取得隨機顏色 RGB/RGBA
    get_random_color: (_color_type) => {
         switch (_color_type) {
            case 'rgb':
                var o = Math.round, r = Math.random, s = 255;
                return 'rgb(' + o(r()*s) + ',' + o(r()*s) + ',' + o(r()*s) + ')';
            break;

            case 'rgba':
                var o = Math.round, r = Math.random, s = 255;
                return 'rgba(' + o(r()*s) + ',' + o(r()*s) + ',' + o(r()*s) + ',' + r().toFixed(1) + ')';
            break;

            default:
                console.log(`Sorry, we are out of ${$type}.`);
        }
    },
    set_rgb_to_rgba: (_rgb, _a) => {
        return _rgb.replace(')', ', ' + _a + ')').replace('rgb', 'rgba');
    },
    arrays_equal: (a1, a2) => {
        /* WARNING: arrays must not contain {objects} or behavior may be undefined */
        return JSON.stringify(a1) == JSON.stringify(a2);
    }
};


/** BEGIN openAlert **/
/**
REF: https://sweetalert2.github.io/#usage

USAGE:
window.openAlert({
    title: '標題是我', // title,text,html，三擇一輸入即可
    text: '內容是我', // title,text,html，三擇一輸入即可
    html: '', // title,text,html，三擇一輸入即可
    showConfirm: true, // 顯示確認鈕 | #非必填，預設 true
    showCancel: true, // 顯示取消鈕 | #非必填
    showClose: true, // 顯示關閉鈕 | #非必填

    confirmBtnText: '確認', // 確定鈕的名稱 | #非必填
    cancelBtnText: '取消', // 取消鈕的名稱 | #非必填
    confirmBtnLink: ["1", "https://google.com"], // 確定按鈕的連結 | #非必填 | ['0/1(另開)', link]

    confirmBtnColor: '#e7415e',
    cancelBtnColor: '',
});
**/
window.openAlert = (msg) => {
    let $msg = msg
    , $text = $msg.text || ''
    , $title = $msg.title || ''
    , $html = $msg.html || ''
    ;

    if (!($text != '' || $title != '' ||  $html != '' )) { return; }
    let $showCancel = $msg.showCancel || false
    , $showConfirm = (typeof $msg.showConfirm == 'undefined')?true:$msg.showConfirm
    , $showClose = $msg.showClose || false
    , $confirmBtn = $msg.confirmBtnText || ''
    , $cancelBtn = $msg.cancelBtnText || ''
    , $confirmBtnColor = $msg.confirmBtnColor || ''
    , $cancelBtnColor = $msg.cancelBtnColor || ''
    , $confirmBtnLink = $msg.confirmBtnLink || ''
    ;

    let $msgs = {
        title: $title,
        text: $text,
        html: $html,
        confirmButtonColor: $confirmBtnColor,
        cancelButtonColor: $cancelBtnColor,
    };
    if ($confirmBtn != '') $msgs.confirmButtonText = $confirmBtn;
    else $showConfirm = false;
    if ($cancelBtn != '') $msgs.cancelButtonText = $cancelBtn;
    else $showCancel = false;

    $msgs.showCloseButton = $showClose;
    $msgs.showCancelButton = $showCancel;
    $msgs.showConfirmButton = $showConfirm;
    // console.log($msgs);

    Swal.fire($msgs)
    .then((result) => {
        if (result.value) {
            if ($confirmBtnLink != '' && $confirmBtnLink[1] != '') {
                if ($confirmBtnLink[0] == '1') return window.open($confirmBtnLink[1]);
                else return window.location.assign($confirmBtnLink[1]);
            }
        }
    });
}
/** END openAlert **/


function preloadImg(imgs) {
    var index = 0,
    len = imgs.length;

    //图片预加载
    $.preload(imgs, {
        // 是否有序加载
        order: false,
        minTimer: 1300,
        //每加载完一张执行的方法
        each: function (count) {
            let percent = Math.round((count+1) / len * 100) + ' %';
            // console.log(percent);
            // $('#loading-cover > label').html(percent);
            $('#loading-cover > label').attr('data-loading', percent);
        },
        // 加载完所有的图片执行的方法
        end: function () {
            // console.log((index + 1) + '/' + len);
            if ($('body').hasClass("loading")) {
                $('#loading-cover > label').delay(1000).queue(function(next) {
                    $(this).fadeOut();
                    $('#loading-cover').delay(1000).queue(function(next) {
                        $(this).fadeOut('slow', function() {
                            $('body').removeClass("loading");
                            $('#loading-cover').remove();
                        });
                        // preloadImg(window.imgs2);
                        next();
                    });
                    next();
                });
            }
        }
    });
}
// preloadImg(window.imgs1);
window.imgs1 = [
    // 'dist/video/sample.mp4',
    // 'dist/img/bg-agenda.png',
    'dist/img/bg-agenda1.png',
    'dist/img/bg-introduce-1.png',
    'dist/img/bg-introduce-2.png',
    'dist/img/bg-introduce-3.png',
    'dist/img/bg-traffic-1.png',
    'dist/img/bg-traffic-2.png',
    'dist/img/bg-traffic-3.png',
    'dist/img/btn_go_gd.png',
    'dist/img/comingsoon.png',
    'dist/img/cursor.png',
    'dist/img/kv-pss-m.jpg',
    'dist/img/kv-pss.jpg',
    'dist/img/logo-pixnet_blog.png',
    'dist/img/logo-pixnet-blue.png',
    'dist/img/logo-pixnet.png',
    'dist/img/icon_arrow-down.png',
];
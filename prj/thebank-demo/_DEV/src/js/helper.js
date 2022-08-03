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
    getTemplate: (template_type) => {
        return $('#template_' + template_type).html();
    },

    numberWithCommas: (x) => {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },
};

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
        },
        // 加载完所有的图片执行的方法
        end: function () {
            // console.log((index + 1) + '/' + len);
        }
    });
}
window.imgs = [
    'public/img/step-1.jpg',
    'public/img/step-2.jpg',
    'public/img/step-3.jpg',
    'public/img/step-4.jpg',
    'public/img/step-5-bottom.jpg',
    'public/img/step-5.jpg',
    'public/img/step-6.jpg',
    'public/img/step-7.jpg',
];
preloadImg(window.imgs);
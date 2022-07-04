$(function() {
    var ANNUALDATAS = {
        el: {
            $window: $(window),
            $doc: $(document),
            $body: $('body'),
            $twimg: $('#twimg'),
        },
        init: function() {
            console.log('ANNUALDATAS');
            this.loadTWSvg();
        },
        bindEvent: function() {
            let $this = this;
        },
        loadTWSvg: function() {
            let $this = this;
            return $this.el.$twimg.load(window.assetsPath + '/img/tw.svg', function() {
                $this.el.$twimg.find('#svg-tw path.' + $this.var.$area).addClass('active');
            });
        },
    };
    ANNUALDATAS.init();
});

window.mappingTWName = {
    'ttt': '台東',
    'khh': '高雄',
    'pif': '屏東',
    'cyi': '嘉義',
    'yun': '雲林',
    'chw': '彰化',
    'txg': '台中',
    'ntc': '南投',
    'tyn': '桃園',
    'zmi': '苗栗',
    'hsz': '新竹',
    'tpe': '台北',
    'tnn': '台南',
    'ila': '宜蘭',
    'hun': '花蓮'
};
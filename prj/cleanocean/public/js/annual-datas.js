$(function() {
    var ANNUALDATAS = {
        el: {
            $window: $(window),
            $doc: $(document),
            $body: $('body'),
            $twimg: $('#twimg'),
            $annual: {
                freq: $('#annual-freq'),
                people: $('#annual-people'),
                meter: $('#annual-meter'),
                kg: $('#annual-kg'),
                top1: $('#annual-top1'),
                top2: $('#annual-top2'),
                top3: $('#annual-top3'),
                topScale: $('#annual-top-scale')
            },
            $area: {
                name: $('#goUpdateTWDatas-name'),
                freq: $('#goUpdateTWDatas-freq'),
                top1: $('#goUpdateTWDatas-top1'),
                top2: $('#goUpdateTWDatas-top2'),
                top3: $('#goUpdateTWDatas-top3'),
            }
        },
        var: {
            $area: '',
            $api: {

            },
        },
        init: function() {
            console.log('ANNUALDATAS');
            this.getAnnualDatas();
            this.bindEvent();
        },
        bindEvent: function() {
            let $this = this;
            $this.el.$twimg.on('click', '#svg-tw', function(e) {
                let _target = $(e.target);
                let _currentTarget = $(e.currentTarget);
                // console.log(_target.attr('data-area'));
                $this.var.$area = _target.attr('data-area');

                let $name = window.mappingTWName[$this.var.$area];
                let $mappingData = window.annualDatas.area[$name];
                if ($mappingData !== undefined) { // check if data exist
                    _currentTarget.find('path').removeClass('active');
                    _target.addClass('active');
                    $this.goUpdateTWDatas();
                } else {
                    console.log('no area');
                }
                return;
            })
        },
        getAnnualDatas: function() {
            console.log('getAnnualDatas');
            let $this = this;

            // // ajax url
            // let _url = $this.var.api + '&__r=' + (new Date()).getTime();
            // // ajax handle
            // $.ajax({
            //     url: _url,
            //     type: 'get',
            //     dataType: 'json',
            //     success: (response) => {
            //         console.log(response);
            //         if (response.error === 0) {
            //             doSuccess(response);
            //         }
            //         return;
            //     },
            //     error: function(response) {
            //         console.log('error');
            //         console.log(response);
            //     }
            // });
            doSuccess(window.annualDatas);
            function doSuccess(response) {
                let $response = response;
                window.annualDatas = $response;
                $this.loadTWSvg();
                $this.goUpdateAnnual();
            }
            return;
        },
        loadTWSvg: function() {
            return this.el.$twimg.load('./public/img/tw.svg');
        },
        goUpdateAnnual: function() {
            console.log("goUpdateAnnual");
            let $this = this;
            let $annualDatas = window.annualDatas.annual;
            console.log($annualDatas);
            $this.el.$annual.freq.html($annualDatas['freq']);
            $this.el.$annual.people.html($annualDatas['people']);
            $this.el.$annual.meter.html($annualDatas['meter']);
            $this.el.$annual.kg.html($annualDatas['kg']);
            $this.el.$annual.top1.html($annualDatas['top'][0]);
            $this.el.$annual.top2.html($annualDatas['top'][1]);
            $this.el.$annual.top3.html($annualDatas['top'][2]);

            let $topScaleLength = $annualDatas['topScale'].length;
            for (let i = 0; i < $topScaleLength; i++ ) {
                $this.el.$annual.topScale.append('<li style="width: ' + $annualDatas['topScale'][i] + '%;"></li>');
            }
        },
        goUpdateTWDatas: function() {
            console.log("goUpdateTWDatas");
            let $this = this;
            let $area = window.mappingTWName[$this.var.$area];
            let $mappingData = window.annualDatas.area[$area];
            console.log($this.var.$area);
            console.log($mappingData);
            $this.el.$area.name.html($area);
            $this.el.$area.freq.html($mappingData['freq']);
            $this.el.$area.top1.html($mappingData['top'][0]);
            $this.el.$area.top2.html($mappingData['top'][1]);
            $this.el.$area.top3.html($mappingData['top'][2]);
            return;
        },
    };
    ANNUALDATAS.init();
});

window.annualDatas = {
    annual: {
        freq: 99,
        people: 1111,
        meter: 2222,
        kg: 3333,
        top: ['寶特瓶A', '煙蒂B', '塑膠瓶蓋C'],
        topScale: ['30', '17', '15', '12', '9', '6', '4', '4', '3']
    },
    area: {
        '台南': {
            freq: 10,
            top: ['塑膠瓶蓋1', '寶特瓶2', '煙蒂3'],
        },
        '高雄': {
            freq: 11,
            top: ['寶特瓶1', '塑膠瓶蓋2', '煙蒂3'],
        },
        '台北': {
            freq: 12,
            top: ['煙蒂1', '寶特瓶2', '塑膠瓶蓋3'],
        },
        '新竹': {
            freq: 13,
            top: ['塑膠瓶蓋1', '煙蒂2', '寶特瓶3'],
        },
    }
};

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
$(function() {
    var RIVER = {
        env: 'html',
        api: {
            url: window._comm.$api.url,
            path: {
                oceanriver_bigdata: 'oceanriver_bigdata',
            },
            data: {},
        },
        el: {
            $window: $(window),
            $doc: $(document),
            $body: $('body'),

            $twimg: $('#twimg'),
            $topicsSwiper: $('#topics-swiper'),

            $area: {
                name: $('#goUpdateTWDatas-name'),
                // freq: $('#goUpdateTWDatas-freq'),
                top1: $('#goUpdateTWDatas-top1'),
                top2: $('#goUpdateTWDatas-top2'),
                top3: $('#goUpdateTWDatas-top3'),

                surveys: $('#goUpdateTWDatas-surveys'),
                trashs: $('#goUpdateTWDatas-trashs'),
                oceanside: {
                    survey: $('#oceanside-survey'),
                    trash: $('#oceanside-trash'),
                    top1: $('#oceanside-top1'),
                    top2: $('#oceanside-top2'),
                    top3: $('#oceanside-top3'),
                },
                riverside: {
                    survey: $('#riverside-survey'),
                    trash: $('#riverside-trash'),
                    top1: $('#riverside-top1'),
                    top2: $('#riverside-top2'),
                    top3: $('#riverside-top3'),
                }
            },

            $trashHotP: {
                img_1: $('#hotp-img-1'),
                btn_w_1: $('#hotp-btn-w-1'),
                btn_v_1: $('#hotp-btn-v-1'),
                img_2: $('#hotp-img-2'),
                btn_w_2: $('#hotp-btn-w-2'),
                btn_v_2: $('#hotp-btn-v-2'),
            }
        },
        var: {
            $area: 'tnn', // defaul setting
            oceanriver: {
            },
        },
        init: function() {
            console.log('RIVER');
            if ('scrollRestoration' in history) { history.scrollRestoration = 'manual'; }
            this.el.$body.addClass(deviceObj.name);
            this.settingDataJS();
            this.loadTopics();

            this.goInitial(); // 先 ajax 拿到資料先builder
            this.loadTWSvg();

            this.bindEvent();
        },
        settingDataJS: function() {
            console.log('settingDataJS');
            let $this = this
            , _source = window.riverTrashHotP;
            $this.el.$trashHotP.img_1.attr('src', _source[0][0]);
            $this.el.$trashHotP.btn_w_1.attr('href', _source[0][1]);
            $this.el.$trashHotP.btn_v_1.attr('href', _source[0][2]);

            $this.el.$trashHotP.img_2.attr('src', _source[1][0]);
            $this.el.$trashHotP.btn_w_2.attr('href', _source[1][1]);
            $this.el.$trashHotP.btn_v_2.attr('href', _source[1][2]);
            return;
        },
        bindEvent: function() {
            let $this = this;

            // svg tw click
            $this.el.$twimg.on('click', '#svg-tw', function(e) {
                let _target = $(e.target)
                , _currentTarget = $(e.currentTarget)
                , _targetArea = _target.attr('data-area');
                if (_targetArea == $this.var.$area) return;

                $this.var.$area = _target.attr('data-area');

                let _name = window.mappingTWName[$this.var.$area]
                , _mappingData = $this.var.oceanriver[_name];
                console.log(_mappingData);
                if (_mappingData !== undefined) { // check if data exist
                    _currentTarget.find('path').removeClass('active');
                    _target.addClass('active');
                    $this.goUpdateTWDatas();
                } else {
                    console.log('no area');
                    alert('此地區尚無資料');
                }
                return;
            });
        },
        loadTopics: function() { // slider
            console.log('loadTopics');
            let $this = this
            , _source = window.annualTopic
            , _target = $this.el.$topicsSwiper.find('.swiper-wrapper')
            , _templates = '';
            for (let i = 0; i < _source.length; i++) {
                let _template = '<div class="topic swiper-slide"><img src="' + _source[i] + '"></div>';
                _templates += _template;
            }
            _target.html(_templates);

            // build swiper
            var swiper = new Swiper("#topics-swiper", {
                loop: true,
                pagination: {
                    el: ".swiper-pagination",
                    dynamicBullets: true,
                },
            });
        },



        /* BEGIN data */
            goInitial: function() {
                let $this = this;
                console.log('goInitial');

                // call api // ajax url
                    let _url = $this.api.url
                    + $this.api.path.oceanriver_bigdata;
                    console.log(_url);

                    let _data = Object.assign({}, $this.api.data,{});
                    console.log(_data);

                    // ajax handle
                    $.ajax({
                        url: _url,
                        type: "post",
                        data: JSON.stringify(_data),
                        dataType: "json",
                        success: (response) => {
                            console.log(response);
                            if (response.is_success === 1) {
                                doSuccess(response.data);
                            }
                            return;
                        },
                        error: function(response) {
                            console.log("error");
                            console.log(response);
                        }
                    });
                    function doSuccess(_r) { // to get the TW area data includes ocean and river
                        console.log(_r);
                        $this.var.oceanriver = _r;
                        $this.goUpdateTWDatas();
                    }
            },
            loadTWSvg: function() {
                let $this = this;
                return $this.el.$twimg.load(window.assetsPath + '/img/tw.svg', function() {
                    $this.el.$twimg.find('#svg-tw path#' + $this.var.$area).addClass('active');
                });
            },
            goUpdateTWDatas: function() {
                console.log("goUpdateTWDatas");
                if (window.page == 'member') return;
                let $this = this
                , _area = window.mappingTWName[$this.var.$area]
                , _mappingData = $this.var.oceanriver[_area];
                console.log($this.var.$area);
                console.log(_mappingData);
                $this.el.$area.name.html(_area);

                // $this.el.$area.freq.html(_mappingData['freq']);
                // $this.el.$area.freq.attr('data-endnum', _mappingData['freq']);

                $this.el.$area.top1.html(_mappingData['top'][0]);
                $this.el.$area.top2.html(_mappingData['top'][1]);
                $this.el.$area.top3.html(_mappingData['top'][2]);

                $this.el.$area.oceanside.survey.html(_mappingData['oceanside']['survey']);
                $this.el.$area.oceanside.trash.html(_mappingData['oceanside']['trash']);
                $this.el.$area.oceanside.top1.html(_mappingData['oceanside']['top'][0]);
                $this.el.$area.oceanside.top2.html(_mappingData['oceanside']['top'][1]);
                $this.el.$area.oceanside.top3.html(_mappingData['oceanside']['top'][2]);

                $this.el.$area.riverside.survey.html(_mappingData['riverside']['survey']);
                $this.el.$area.riverside.trash.html(_mappingData['riverside']['trash']);
                $this.el.$area.riverside.top1.html(_mappingData['riverside']['top'][0]);
                $this.el.$area.riverside.top2.html(_mappingData['riverside']['top'][1]);
                $this.el.$area.riverside.top3.html(_mappingData['riverside']['top'][2]);

                $this.el.$area.surveys.html(_mappingData['oceanside']['survey'] + _mappingData['riverside']['survey']);
                $this.el.$area.trashs.html(_mappingData['oceanside']['trash'] + _mappingData['riverside']['trash']);
                return;
            },
        /* END data */
    };
    RIVER.init();
});
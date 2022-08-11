$(function() {
    var OCEAN = {
        env: 'html',
        api: {
            url: window._comm.$api.url,
            path: {
                annual_datas: 'annual_datas',
                annual_area: 'annual_area'
            },
            data: {}
        },
        el: {
            $window: $(window),
            $doc: $(document),
            $body: $('body'),

            $twimg: $('#twimg'),
            $topicsSwiper: $('#topics-swiper'),

            $annual: {
                freq: $('#annual-freq'),
                people: $('#annual-people'),
                meter: $('#annual-meter'),
                kg: $('#annual-kg'),
                top1: $('#annual-top1'),
                top2: $('#annual-top2'),
                top3: $('#annual-top3'),
                // topScale: $('#annual-rank-scale')
            },
            $area: {
                name: $('#goUpdateTWDatas-name'),
                freq: $('#goUpdateTWDatas-freq'),
                top1: $('#goUpdateTWDatas-top1'),
                top2: $('#goUpdateTWDatas-top2'),
                top3: $('#goUpdateTWDatas-top3'),
            },

            $chartRank: $('#chart-rank'),
        },
        var: {
            $area: 'khh', // defaul setting
        },
        init: function() {
            console.log('OCEAN');
            if ('scrollRestoration' in history) { history.scrollRestoration = 'manual'; }
            this.el.$body.addClass(deviceObj.name);
            this.loadTopics();

            this.goInitial(); // 先 ajax 拿到資料先builder
            this.loadTWSvg();

            this.showFlot();

            this.bindEvent();
            this.goUpdateTWDatas();
        },
        bindEvent: function() {

            // svg tw click
            $this.el.$twimg.on('click', '#svg-tw', function(e) {
                let _target = $(e.target)
                , _currentTarget = $(e.currentTarget)
                , _targetArea = _target.attr('id');
                if (_targetArea == $this.var.$area) return;

                $this.var.$area = _target.attr('id');

                let _name = window.mappingTWName[$this.var.$area]
                , _mappingData = window.annualAreaOcean[_name];
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

                getupAnnualDatas();
                getupTWDatas();

                function getupAnnualDatas() {
                    console.log('get and update AnnualDatas');

                    // call api // ajax url
                    let _url = $this.api.url
                    + $this.api.path.annual_datas;
                    // _url += '?__r=' + (new Date()).getTime();
                    console.log(_url);

                    let _data = Object.assign({}, $this.api.data,
                    {
                        "year": (new Date()).getFullYear(),
                    });

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
                    function doSuccess(_r) { // to get the annual data
                        console.log(_r);
                        $this.el.$annual.freq.attr('data-endnum', _r['freq']);
                        $this.el.$annual.people.attr('data-endnum', _r['people']);
                        $this.el.$annual.meter.attr('data-endnum', _r['meter']);
                        $this.el.$annual.kg.attr('data-endnum', _r['kg']);

                        if (window.page == 'member') return;

                        $this.el.$annual.top1.html(_r['top'][0]);
                        $this.el.$annual.top2.html(_r['top'][1]);
                        $this.el.$annual.top3.html(_r['top'][2]);

                        // let _topScaleLength = _annualDatas['scale'].length;
                        // for (let i = 0; i < _topScaleLength; i++ ) {
                        //     $this.el.$annual.topScale.append('<li style="width: ' + _annualDatas['scale'][i] + '%;"></li>');
                        // }
                    }
                }
                function getupTWDatas() {
                    console.log('get and update TWDatas');

                    // call api // ajax url
                    let _url = $this.api.url
                    + $this.api.path.annual_area;
                    // _url += '?__r=' + (new Date()).getTime();
                    console.log(_url);

                    let _data = Object.assign({}, $this.api.data, {});
                    console.log(_data);

                    // ajax handle
                    $.ajax({
                        url: _url,
                        type: "post",
                        data: JSON.stringify(_data),
                        dataType: "json",
                        success: (response) => {
                            // console.log(response);
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
                    function doSuccess(_r) { // to get the TW area data
                        console.log(_r);
                        return;
                        if (window.page == 'member') return;
                        let $this = this
                        , _area = window.mappingTWName[$this.var.$area]
                        , _mappingData = window.annualAreaOcean[_area];
                        // console.log($this.var.$area);
                        // console.log(_mappingData);
                        $this.el.$area.name.html(_area);

                        // $this.el.$area.freq.html(_mappingData['freq']);
                        $this.el.$area.freq.attr('data-endnum', _mappingData['freq']);

                        $this.el.$area.top1.html(_mappingData['top'][0]);
                        $this.el.$area.top2.html(_mappingData['top'][1]);
                        $this.el.$area.top3.html(_mappingData['top'][2]);
                        return;
                    }
                }
            },
            loadTWSvg: function() {
                let $this = this;
                return $this.el.$twimg.load(window.assetsPath + '/img/tw.svg', function() {
                    $this.el.$twimg.find('#svg-tw path#' + $this.var.$area).addClass('active');
                });
            },
            showFlot: function() { // 折線圖
                console.log('showFlot');
                const labels = [
                    'x1',
                    'x2',
                    'x3',
                    'x4',
                    'x5',
                    'x6',
                    'x7',
                    'x8',
                ];
                const data = {
                    labels: labels,
                    datasets: [
                    {
                        label: '#l1', // 標籤名稱
                        data: [65, 59, 80, 81, 56, 55, 40, 95],
                        fill: false, // 折現涵蓋的背景是否填滿
                        borderColor: 'rgb(75, 192, 192)', // 線條顏色
                        tension: .1, // 點到點的折線角度
                    },
                    {
                        label: '#l2',
                        data: [78, 23, 32, 67, 66, 41, 56, 78],
                        fill: false,
                        borderColor: 'rgb(0, 255, 192)',
                        tension: .1,
                    },
                    {
                        label: '#l3',
                        data: [33, 59, 71, 100, 56, 99, 30, 20],
                        fill: true,
                        borderColor: 'rgb(255, 0, 192)',
                        tension: .1,
                    },
                    ]
                };
                const config = {
                    type: 'line',
                    data: data,
                    options: {
                        // indexAxis: 'y',
                        scales: {
                            x: {
                                // beginAtZero: true
                            },
                            y: {
                                // min: '-10',
                                max: 200,
                                beginAtZero: true,
                            },
                        }
                    }
                };
                const myChart = new Chart(
                    document.getElementById('chart-rank'),
                    config
                );
            },
            goUpdateTWDatas: function() {
                console.log("goUpdateTWDatas");
                // if (window.page == 'member') return;
                // let $this = this
                // , _area = window.mappingTWName[$this.var.$area]
                // , _mappingData = window.annualAreaOcean[_area];
                // // console.log($this.var.$area);
                // // console.log(_mappingData);
                // $this.el.$area.name.html(_area);

                // // $this.el.$area.freq.html(_mappingData['freq']);
                // $this.el.$area.freq.attr('data-endnum', _mappingData['freq']);

                // $this.el.$area.top1.html(_mappingData['top'][0]);
                // $this.el.$area.top2.html(_mappingData['top'][1]);
                // $this.el.$area.top3.html(_mappingData['top'][2]);
                // return;
            },
        /* END data */
    };
    OCEAN.init();
});
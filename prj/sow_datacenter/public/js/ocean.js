$(function() {
    var OCEAN = {
        env: 'html',
        api: {
            url: window._comm.$api.url,
            path: {
                annual_search: 'annual_search',
                annual_columns: 'annual_columns',
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
                // top1: $('#annual-top1'),
                // top2: $('#annual-top2'),
                // top3: $('#annual-top3'),
                // topScale: $('#annual-rank-scale')
            },
            $area: {
                name: $('#goUpdateTWDatas-name'),
                freq: $('#goUpdateTWDatas-freq'),
                top1: $('#goUpdateTWDatas-top1'),
                top2: $('#goUpdateTWDatas-top2'),
                top3: $('#goUpdateTWDatas-top3'),
            },
            $chartRankBox: $('#chart-rank-box'),
            $chartFilter: $('#chart-filter'),
            $chartFilterYears: $('#chart-filter-years'),
            $chartFilterCols: $('#chart-filter-cols'),
            $btnChartFilter: $('#btn-chart-filter'),
            $chartRank: $('#chart-rank'),
        },
        var: {
            $area: 'khh', // defaul setting
            $annualAreaOcean: {},
            $mappingl10n: {},
            $currentFlotFilter: {
                years: [],
                cols: [],
            }
        },
        myChart: '',
        init: function() {
            console.info('<< OCEAN >>');
            if ('scrollRestoration' in history) { history.scrollRestoration = 'manual'; }
            this.el.$body.addClass(deviceObj.name);
            this.loadTopics();

            this.goInitial(); // 先 ajax 拿到資料先builder
            this.loadTWSvg();

            this.bindEvent();
        },
        bindEvent: function() {
            let $this = this;

            // svg tw click
            $this.el.$twimg.on('click', '#svg-tw', function(e) {
                let _target = $(e.target)
                , _currentTarget = $(e.currentTarget)
                , _targetArea = _target.attr('id');
                if (_targetArea == $this.var.$area) return;

                $this.var.$area = _target.attr('id');

                let _name = window.mappingTWName[$this.var.$area]
                , _mappingData = $this.var.$annualAreaOcean[_name];
                console.log(_mappingData);
                if (_mappingData !== undefined) { // check if data exist
                    _currentTarget.find('path').removeClass('active');
                    _target.addClass('active');
                    $this.goUpdateTWDatas();
                } else {
                    console.info('<< no area >>');
                    alert('此地區尚無資料');
                }
                return;
            });

            // filter flot
            $this.el.$btnChartFilter.on('click', function(e) {
                if ($this.el.$chartRankBox.hasClass('processing')) return alert('數據圖表處理中');
                $this.el.$chartRankBox.addClass('processing');
                let $years_ary = $this.el.$chartFilterYears.val()
                , $cols_ary = $this.el.$chartFilterCols.val();

                if ($years_ary === null) return alert('尚未選擇年份');
                else if ($cols_ary === null) return alert('尚未選擇廢棄物選項');

                if (
                    (window.helper.arrays_equal($this.var.$currentFlotFilter.years, $years_ary))
                    &&
                    (window.helper.arrays_equal($this.var.$currentFlotFilter.cols, $cols_ary))
                ) {
                    alert('尚未調整選項');
                    return $this.el.$chartRankBox.removeClass('processing');
                }

                {
                    // call api // ajax url
                    let _url = $this.api.url
                    + $this.api.path.annual_search;
                    _url += '/?nocache_x=1';
                    console.log(_url);

                    let _data = Object.assign({}, {
                        years: $years_ary
                        , cols: $cols_ary
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
                            $this.var.$currentFlotFilter.years = $years_ary;
                            $this.var.$currentFlotFilter.cols = $cols_ary;
                            if (response.is_success === 1) {
                                doSuccess(response.data);
                            }
                            return;
                        },
                        error: function(response) {
                            console.error("error");
                            console.log(response);
                        }
                    });
                    function doSuccess(_r) { // to get the data to mapping of column
                        console.info('<< to filter the data to refresh data of flot >>');
                        console.log(_r);
                        $this.renderFlot(_r);
                    }
                }
            })
        },
        loadTopics: function() { // slider
            console.info('<< loadTopics >>');
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
                console.info('<< goInitial >>');

                getMappingColumn();

                function getMappingColumn() {
                    console.info('<< get the Mapping of Column. >>');

                    // call api // ajax url
                    let _url = $this.api.url
                    + $this.api.path.annual_columns;
                    _url += '/?nocache_x=1';
                    console.log(_url);

                    let _data = Object.assign({}, $this.api.data);
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
                            console.error("error");
                            console.log(response);
                        }
                    });
                    function doSuccess(_r) { // to get the data to mapping of column
                        console.info('<< to get the data to mapping of column >>');
                        $this.var.$mappingl10n = _r;
                        console.log($this.var.$mappingl10n);

                        getupAnnualDatas();
                        getupTWDatas();
                    }
                }

                function getupAnnualDatas() {
                    console.info('<< get and update AnnualDatas. >>');

                    $this.el.$chartRankBox.addClass('processing');
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

                        // $this.el.$annual.top1.html(_r['top'][0]);
                        // $this.el.$annual.top2.html(_r['top'][1]);
                        // $this.el.$annual.top3.html(_r['top'][2]);

                        // let _topScaleLength = _annualDatas['scale'].length;
                        // for (let i = 0; i < _topScaleLength; i++ ) {
                        //     $this.el.$annual.topScale.append('<li style="width: ' + _annualDatas['scale'][i] + '%;"></li>');
                        // }

                        // build the chart Filter & Flot

                        // Filter
                        let $mapping_years = $this.var.$mappingl10n.years,
                        $mapping_cols = $this.var.$mappingl10n.cols,
                        $current_year = (new Date()).getFullYear(),
                        $scales = _r.scale,
                        $scales_ary = Object.keys($scales);

                        for ($index in $mapping_years) {
                            let $years = $mapping_years[$index];
                            $this.el.$chartFilterYears.append('<option value="'+ $years + '" ' + (($years == $current_year)?'selected':'') + '>'+ $years + '</option>');
                            if ($years == $current_year) $this.var.$currentFlotFilter.years.push($years);
                        }
                        for ($index in $mapping_cols) {
                            let $cols = $mapping_cols[$index];
                            $this.el.$chartFilterCols.append('<option value="'+  $index + '" ' + (($scales_ary.includes($index))?'selected':'') + '>'+  $cols + '</option>');
                            if ($scales_ary.includes($index)) $this.var.$currentFlotFilter.cols.push($index);
                        }

                        // if (!deviceObj.isMobile()) {
                            $("select#chart-filter-years[multiple]").select2({
                                placeholder: "選擇年份",
                                closeOnSelect: false
                            });
                            $("select#chart-filter-cols[multiple]").select2({
                                placeholder: "選擇廢棄物選項",
                                closeOnSelect: false
                            });
                        // }

                        // Flot
                        let $flotDataOBJ = {};
                        $flotDataOBJ[(new Date()).getFullYear()] = $scales;
                        $this.renderFlot($flotDataOBJ);
                    }
                }
                function getupTWDatas() {
                    console.info('<< get and update TWDatas >>');

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
                    function doSuccess(_r) { // to get the TW area data
                        console.log(_r);

                        if (window.page == 'member') return;
                        $this.var.$annualAreaOcean = _r;
                        let _area = window.mappingTWName[$this.var.$area]
                        , _mappingData = $this.var.$annualAreaOcean[_area];
                        // console.log($this.var.$area);
                        // console.log(_mappingData);
                        $this.el.$area.name.html(_area);

                        // $this.el.$area.freq.html(_mappingData['freq']);
                        $this.el.$area.freq.attr('data-endnum', _mappingData['freq']);

                        $this.el.$area.top1.html(_mappingData['top'][0]);
                        $this.el.$area.top2.html(_mappingData['top'][1]);
                        $this.el.$area.top3.html(_mappingData['top'][2]);

                        $this.goUpdateTWDatas();
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
            renderFlot: function(_flotdata) { // 折線圖
                console.info('<< showFlot >>');
                let $this = this;
                if ($this.myChart !== '') $this.myChart.destroy();
                $this.el.$chartRankBox.removeClass('processing');
                // if ($this.el.$chartRank.length !== 0) return;
                console.log(_flotdata);

                let $fd = _flotdata
                , _x = [] // X軸 / 年份
                , _y = [] // Y軸 / 廢棄物項目
                , _result = { // 最終組合 X/Y 軸
                    labels: [],
                    datasets: [],
                }
                , _temp_y = {}
                , _minmax = [0, 0]
                , _maxAdd = 5 // Y軸 最大值 再增加
                , _is_multiple = (Object.keys($fd).length > 1)?true:false
                ;

                console.log('_is_multiple :: ' + _is_multiple);

                {
                    // step1. 判斷multiple，如果是多年份多筆資料，先建obj
                    if (_is_multiple) {
                        for ($cols in $fd[Object.keys($fd)[0]]) {
                            _temp_y[$cols] = {
                                label: $this.var.$mappingl10n.cols[$cols], // 標籤名稱
                                data: [],
                                fill: false, // 折現涵蓋的背景是否填滿
                                tension: .1, // 點到點的折線角度
                                borderWidth: 1,
                            };
                        }
                    }

                    // step2. 開始建立內容
                    for ($year in $fd) {
                        let $items = $fd[$year];

                        if (_is_multiple) {
                            _x.push($year);
                        } else {
                            _temp_y[$year] = {
                                label: $year, // 標籤名稱
                                data: [],
                                borderColor: [], // 線條顏色
                                backgroundColor: [], // 背景顏色
                                fill: false, // 折現涵蓋的背景是否填滿
                                borderWidth: 1,
                            };
                        }
                        for ($prop in $items) {
                            let $color = window.helper.get_random_color('rgb');
                            _minmax[0] = ($items[$prop] < _minmax[0])?$items[$prop]:_minmax[0];
                            _minmax[1] = ($items[$prop] > _minmax[1])?$items[$prop]:_minmax[1];

                            if (_is_multiple) { // 多年多數據
                                _temp_y[$prop]['borderColor'] = $color;
                                _temp_y[$prop]['backgroundColor'] = $color;
                                _temp_y[$prop]['data'].push($items[$prop]);
                            } else { // 單年多數據
                                _x.push($this.var.$mappingl10n.cols[$prop]);
                                _temp_y[$year]['data'].push($items[$prop]);
                                _temp_y[$year]['borderColor'].push($color);
                                _temp_y[$year]['backgroundColor'].push(window.helper.set_rgb_to_rgba($color, .33));
                            }
                        }
                    }
                    for ($key in _temp_y) { _y.push(_temp_y[$key]); }
                    _result['labels'] = _x;
                    _result['datasets'] = _y;

                    // step3. 設定跑圖參數 // style 也是在這設定
                    const config = {
                        type: (_is_multiple)?'line':'bar',// line/bar
                        data: _result,
                        options: {
                            // indexAxis: 'y',
                            scales: {
                                x: {
                                    // beginAtZero: true
                                },
                                y: {
                                    // min: _minmax[0],
                                    max: (_minmax[1] + _maxAdd),
                                    beginAtZero: true,
                                },
                            },
                            plugins: {
                                legend: {
                                    labels: {
                                        // This more specific font property overrides the global property
                                        font: {
                                            size: 15,
                                            // weight: 500,
                                        }
                                    }
                                }
                            }
                        }
                    };

                    // step4. 用 chart.js 跑出數據圖
                    $this.myChart = new Chart(
                        document.getElementById('chart-rank'),
                        config
                    );
                }
            },
            goUpdateTWDatas: function() {
                console.info('<< goUpdateTWDatas >>');
                if (window.page == 'member') return;
                let $this = this
                , _area = window.mappingTWName[$this.var.$area]
                , _mappingData = $this.var.$annualAreaOcean[_area]
                , _areaTwDatas_el = $('.goUpdateTWDatas');
                // console.log($this.var.$area);
                console.log(_mappingData);
                $this.el.$area.name.html(_area);

                $this.el.$area.freq.html(_mappingData['freq']);
                $this.el.$area.freq.attr('data-endnum', _mappingData['freq']);

                _areaTwDatas_el.removeClass('magicing');
                _areaTwDatas_el.html('');
                window.setTimeout(( () => {
                    try {
                        for (let i = 0; i < 3; i++) {
                            $this.el.$area['top' + (i+1)].html($this.var.$mappingl10n.cols[_mappingData['top'][i]]);
                        }
                    } finally {
                        _areaTwDatas_el.addClass('magicing');
                    }
                }), 1100);
                return;
            },
        /* END data */
    };
    OCEAN.init();
});
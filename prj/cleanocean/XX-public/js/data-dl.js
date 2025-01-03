$(function() {
    var DATA = {
        el: {
            $window: $(window),
            $doc: $(document),
            $body: $('body'),
            $header: $('#header'),
            $main: $('#main'),
            $footer: $('#footer'),

            $filterTimeBegin: $('#filter-time-begin'),
            $filterTimeEnd: $('#filter-time-end'),
            $filterCampaign: $('#filter-campaign'),

            $selectAll: $('#select-all'),
            $filterResultList: $('#filter-result-list'),

            $btnFilterSearch: $('#btn-filter-search'),
            $btnFilterDownload: $('#btn-filter-download'),
        },
        var: {
            $api: {

            },
            $filter: {
                timeBegin: '',
                timeEnd: '',
                county: '',
                campaign: ''
            },
            $dl: [],
        },
        init: function() {
            console.log('data-dl');
            this.goInitial(); // 先 ajax 拿到資料先builder
            this.bindEvent();
            this.loadResult();
            this.listenFilter();
        },
        bindEvent: function() {
            let $this = this;
            let $filterVal = $this.var.$filter;
            let $dl = $this.var.$dl;
            $this.el.$btnFilterSearch.on('click', function() {
                if (($filterVal.timeBegin.length + $filterVal.timeEnd.length + $filterVal.county.length + $filterVal.campaign.length) > 0) {
                    $this.goFilter();
                } else {
                    return alert('請設定搜尋內容');
                }
            });
            $this.el.$btnFilterDownload.on('click', function() {
                console.log('download');
                if ($this.var.$dl.length > 0) {
                    $this.goDownload();
                } else {
                    return alert('請勾選欲下載數據');
                }
            });
        },
        goInitial: function() {
            let $this = this;
            console.log('goInitial');
        },
        loadResult: function() {
            let $this = this;
            let _source = window.campaigns;
            let _target = $this.el.$filterResultList;
            let _template_result = window.helper.getTemplate('data__result');
            let _templates = '';
            for ($prop in _source) {
                let _template = _template_result;
                _template = _template.replace(/\[ID\]/g,  _source[$prop]['id']);
                _template = _template.replace(/\[COUNTY\]/g,  _source[$prop]['area']);
                _template = _template.replace(/\[DATA_Y\]/g,  _source[$prop]['date'][0]);
                _template = _template.replace(/\[DATA_M\]/g,  _source[$prop]['date'][1]);
                _template = _template.replace(/\[DATA_D\]/g,  _source[$prop]['date'][2]);
                _template = _template.replace(/\[CAMPAIGN\]/g,  _source[$prop]['campaign']);
                _templates += _template;
            }
            _target.html(_templates);
            // this.builSlider();
        },
        buildResult: function(list) {
            let $list = list;
            console.log('buildResult');
            console.log($list);
        },
        listenFilter: function() {
            console.log("listenFilter");
            let $this = this;
            $('#twzipcode').twzipcode({
                onCountySelect: function(e) {
                    $this.var.$filter.county = $('#twzipcode').twzipcode('get', 'county')[0];
                    console.log($this.var.$filter);
                },
            });
            $this.el.$filterTimeBegin.on("change", function(e) {
                $this.var.$filter.timeBegin = e.target.value;
                $this.el.$filterTimeEnd.attr("min", $this.var.$filter.timeBegin);
                console.log($this.var.$filter);
            });
            $this.el.$filterTimeEnd.on("change", function(e) {
                $this.var.$filter.timeEnd = e.target.value;
                $this.el.$filterTimeBegin.attr("max", $this.var.$filter.timeEnd);
                console.log($this.var.$filter);
            });
            $this.el.$filterCampaign.on("blur", function(e) {
                $this.var.$filter.campaign = e.target.value;
                console.log($this.var.$filter);
            });
            $this.el.$filterResultList.on("change", "input[type=checkbox]", function(e) {
                console.log(e);
                $this.updateDLCheckedList();
            });
            $this.el.$selectAll.on("change", function(e) {
                $this.el.$filterResultList.find('input[type=checkbox]').prop('checked', e.target.checked);
                $this.updateDLCheckedList();
            });
        },
        updateDLCheckedList: function() {
            console.log('updateDLCheckedList');
            let $this = this;
            $this.var.$dl = [];
            $this.el.$filterResultList.find('input[type=checkbox]:checked').each(function () {
                $this.var.$dl.push(this.value);
            });
            console.log($this.var.$dl);
            return;
        },
        goFilter: function() {
            console.log("goFilter");
            let $this = this;
            console.log($this.var.$filter);

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
            //             doSuccess(response.counts);
            //         }
            //         return;
            //     },
            //     error: function(response) {
            //         console.log('error');
            //         console.log(response);
            //     }
            // });
            doSuccess(window.dataDl);
            function doSuccess(response) {
                let $response = response;
                console.log($response);

                return $this.buildResult($response);
            };
        },
        goDownload: function() {
            console.log("goDownload");
            console.log(this.var.$dl);
            return;
        },
    };
    DATA.init();
});
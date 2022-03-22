$(function() {
    var ALBUM = {
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

            $filterResultList: $('#filter-result-list'),
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
        },
        init: function() {
            console.log('album');
            this.bindEvent();
            this.goInitial(); // 先 ajax 拿到資料先builder
            this.listenFilter();
        },
        bindEvent: function() {
            let $this = this;
            let $filterVal = $this.var.$filter;
            $('#filter-search').on('click', function() {
                if (($filterVal.timeBegin.length + $filterVal.timeEnd.length + $filterVal.county.length + $filterVal.campaign.length) > 0) {
                    $this.goFilter();
                } else {
                    return alert('請設定搜尋內容');
                }
            });
        },
        goInitial: function() {
            let $this = this;
            console.log('goInitial');
            // $this.buildAlbum(window.album);
        },
        buildAlbum: function(list) {
            let $list = list;
            console.log('buildAlbum');
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

                return $this.buildAlbum($response);
            };
        },
    };
    ALBUM.init();
});
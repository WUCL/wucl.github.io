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
            // $filterResultItem: $('.filter-result-item'),

            $vaName: $('#va-name'),

            $viewAlbumList: $('#va-pic-list'),
            $selectAll: $('#select-all'),

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
            $popup: {
                album: '',
                pic: [],
            },
        },
        init: function() {
            console.log('album');
            this.goInitial(); // 先 ajax 拿到資料先builder
            this.loadAlbum();
            this.bindEvent();
            this.setPopup();
            this.listenFilter();
        },
        bindEvent: function() {
            let $this = this;
            let $filterVal = $this.var.$filter;
            $this.el.$btnFilterSearch.on('click', function() {
                if (($filterVal.timeBegin.length + $filterVal.timeEnd.length + $filterVal.county.length + $filterVal.campaign.length) > 0) {
                    $this.goFilter();
                } else {
                    return alert('請設定搜尋內容');
                }
            });
            $this.el.$btnFilterDownload.on('click', function() {
                console.log('download');
                if ($this.var.$popup.pic.length > 0) {
                    $this.goDownload();
                } else {
                    return alert('請勾選欲下載數據');
                }
            });
            $this.el.$filterResultList.on('click', '.filter-result-item', function(e) {
                let _id = $(e.currentTarget).data('id');
                $this.var.$popup.album = _id;
                let _album = window.campaigns[_id];
                let _name = _album['area'] + _album['date'][0] + _album['date'][1] + _album['date'][2] + _album['campaign'];
                $this.el.$vaName.html(_name);

                $this.loadAlbumPic();
                return;
            });
            $this.el.$viewAlbumList.on("change", "input[type=checkbox]", function(e) {
                console.log(e);
                $this.updateDLCheckedList();
            });
            $this.el.$selectAll.on("change", function(e) {
                $this.el.$viewAlbumList.find('input[type=checkbox]').prop('checked', e.target.checked);
                $this.updateDLCheckedList();
            });
        },
        goInitial: function() {
            let $this = this;
            console.log('goInitial');
            // $this.buildAlbum(window.album);
        },
        loadAlbum: function() {
            console.log('loadAlbum');
            let $this = this;
            let _source = window.campaigns;
            let _target = $this.el.$filterResultList;
            let _template_album = window.helper.getTemplate('album__result');
            let _templates = '';
            for ($prop in _source) {
                let _template = _template_album;
                _template = _template.replace(/\[ID\]/g,  _source[$prop]['id']);
                _template = _template.replace(/\[COUNTY\]/g,  _source[$prop]['area']);
                _template = _template.replace(/\[DATA_Y\]/g,  _source[$prop]['date'][0]);
                _template = _template.replace(/\[DATA_M\]/g,  _source[$prop]['date'][1]);
                _template = _template.replace(/\[DATA_D\]/g,  _source[$prop]['date'][2]);
                _template = _template.replace(/\[CAMPAIGN\]/g,  _source[$prop]['campaign']);
                _template = _template.replace(/\[FEATURED\]/g,  _source[$prop]['featured']);
                _template = _template.replace(/\[OWNER\]/g,  _source[$prop]['owner']);
                _template = _template.replace(/data-src/g,  'src');
                _templates += _template;
            }
            _target.html(_templates);
        },
        loadAlbumPic: function() { // window.albumPics
            let $this = this;
            let _source = window.albumPics;
            let _target = $this.el.$viewAlbumList;
            let _aid = $this.var.$popup.album;
            let _template_pics = window.helper.getTemplate('album__pics');
            let _templates = '';
            for ($prop in _source[_aid]) {
                let _template = _template_pics;
                _template = _template.replace(/\[ID\]/g,  _source[_aid][$prop]['id']);
                _template = _template.replace(/\[PIC\]/g,  _source[_aid][$prop]['src']);
                _template = _template.replace(/data-src/g,  'src');
                _templates += _template;
            }
            _target.html(_templates);
        },
        updateDLCheckedList: function() {
            console.log('updateDLCheckedList');
            let $this = this;
            $this.var.$popup.pic = [];
            $this.el.$viewAlbumList.find('input[type=checkbox]:checked').each(function () {
                $this.var.$popup.pic.push(this.value);
            });
            console.log($this.var.$popup.pic);
            return;
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
        setPopup: function() {
            let $this = this;
            $('#view-album').popup({
                escape: false,
                closebutton: true,
                scrolllock: true,
                // onopen: function() {
                //     onOpenAlbum()
                // }
            });
            // function onOpenAlbum() {
            //     console.log("onOpenAlbum");
            //     console.log($this.el.$selectAll);
            // }
        },
        goDownload: function() {
            console.log("goDownload");
            console.log(this.var.$popup);
            return;
        },
    };
    ALBUM.init();
});
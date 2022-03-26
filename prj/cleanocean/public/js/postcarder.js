$(function() {
    var POSTCARDER = {
        el: {
            $window: $(window),
            $doc: $(document),
            $body: $('body'),
            $header: $('#header'),
            $main: $('#main'),
            $footer: $('#footer'),

            $postcarder: $('#postcarder'),
            $postcardImgUpload: $('#postcard-img-upload'),
            $postcardImgAlbum: $('#postcard-img-album'),
            $postcardImgPreview: $('#postcard-img-preview'),

            $viewAlbum: $('#view-album'),

            $inputText: $('#postcard-text'),

            $btnFilePreview: $('#btn-file-preview'),
            $btnFileEdit: $('#btn-file-edit'),
            $btnFilePublic: $('#btn-file-public'),
            // $btnFilePreview: $('#btn-file-preview'),

            $previewImg: $('#preview-img'),
            $publicImg: $('#public-img'),
        },
        var: {
            $postcard: {
                img: '',
                title: 'a',
                content: 'b',
                writer: '123456789',
            },

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
                pic: '',
            },
        },
        init: function() {
            console.log('postcard-builder');
            this.bindEvent();
            this.postcardMaker();
            this.setPopup();

            // test
            this.el.$postcardImgPreview.attr('src', window.test);
        },
        postcardMaker: function() {
            let $this = this;
            let canvas = document.getElementById('canvas'),
                context = canvas.getContext('2d'),
                image_a = new Image(),
                image_b = new Image(),
                result_img = new Image(),
                base64 = '';

            result_img = document.getElementById('preview-img');
            result_img.setAttribute("crossOrigin", 'Anonymous');

            // image_b.src = document.getElementById('img-b').src;

            let btn_dl = document.getElementById('dl'),
                btn_merge = document.getElementById('btn-file-preview');
            // console.log(dl);
            btn_merge.onclick = function() {
                image_a.src = document.getElementById('postcard-img-bg').src;
                image_b.src = document.getElementById('postcard-img-preview').src;
                image_a.setAttribute("crossOrigin", 'Anonymous');
                image_b.setAttribute("crossOrigin", 'Anonymous');
                image_a.onload = function() {
                    console.log(image_a);
                    console.log(this);
                    var w = this.width, // 1129
                        h = this.height, // 608
                        w2 = image_b.width,
                        h2 = image_b.height,
                        _scale = 5,
                        _unit = 100;

                    canvas.width = w;
                    canvas.height = h;
                    context.drawImage(this, 0, 0, w, h);

                    // setting position
                    context.drawImage(image_b,
                        0, 0,
                        // 660, 462,
                        w2, h2,
                        // _scale * _unit, _scale * _unit * h2 / w2,

                        50, 40,
                        660, 462,
                    );

                    // title
                    context.font="30px 微軟正黑體";
                    context.fillText($this.var.$postcard.title, 70, 545);

                    // content
                    context.fillText($this.var.$postcard.content, 750, 180);

                    // writer
                    context.textAlign = "right";
                    context.fillText('by ' + $this.var.$postcard.writer, 1080, 545);

                    console.log(canvas);
                    base64 = canvas.toDataURL("image/png");
                    console.log(base64);
                    result_img.src = base64;
                }
            }
        },
        bindEvent: function() {
            let $this = this;
            $this.el.$postcardImgUpload.on('change', function() {
                console.log('postcardImgUpload');
                let _size_mb = Math.round(this.files[0].size / 1024 / 1024);
                if (_size_mb < 2) { // if bigger than 2 mb
                    let reader = new FileReader();
                    reader.onload = function() {
                        var output = document.getElementById('postcard-img-preview');
                        output.src = reader.result;
                        $this.var.$postcard['img'] = output.src;
                    }
                    reader.readAsDataURL(event.target.files[0]);
                } else {
                    $this.el.$postcardImgUpload.val('');
                    $this.el.$postcardImgPreview.attr('src', '');
                    return;
                }
            });

            $this.el.$postcardImgAlbum.on('click', function() {
                console.log('postcardImgAlbum');
                return;
            });

            $this.el.$inputText.on('keyup', 'input, textarea',function(e) {
                let _postcard = e.target.getAttribute('data-postcard');
                let _value = e.target.value;
                let _maxLength = parseInt(e.target.getAttribute('maxlength'));
                let _length = parseInt(_value.length);
                let _current = _maxLength - _length;
                $(e.target).closest('li').find('label > span').html(_current);
                $this.var.$postcard[_postcard] = _value;
                console.log($this.var.$postcard);
            });

            // step1 file preview
            $this.el.$btnFilePreview.on('click', function() {
                console.log('btnFilePreview');
                $this.el.$postcarder.attr('data-step', 2);
            });

            // step2 go back to edit
            $this.el.$btnFileEdit.on('click', function() {
                console.log('btnFileEdit');
                $this.el.$postcarder.attr('data-step', 1);
            })
            // step2 go to public
            $this.el.$btnFilePublic.on('click', function() {
                console.log('btnFilePublic');
                $this.el.$publicImg.attr('src', $this.el.$previewImg.attr('src'));

                $this.el.$postcarder.attr('data-step', 3);
            })
        },


        setPopup: function() {
            let $this = this;
            $this.el.$viewAlbum.popup({
                escape: false,
                closebutton: true,
                scrolllock: true,
                onopen: function() {
                    $this.goInitial();  // 先 ajax 拿到資料先builder
                }
            });
            // function onOpenAlbum() {
            //     console.log("onOpenAlbum");
            //     console.log($this.el.$selectAll);
            // }
        },
        goInitial: function() {
            let $this = this;
            console.log('goInitial');
            // $this.buildAlbum(window.album);
            $this.listenFilter();
            $this.listenAlbum();
        },
        buildResult: function(list) {
            let $list = list;
            console.log('buildResult');
            console.log($list);
        },
        listenFilter: function() {
            console.log("listenFilter");
            let $this = this;
            let $filterVal = $this.var.$filter;
            let _filterTimeBegin = $('#filter-time-begin');
            let _filterTimeEnd = $('#filter-time-end');
            let _filterCampaign = $('#filter-campaign');
            let _filterSearch = $('#filter-search');

            $('#twzipcode').twzipcode({
                onCountySelect: function(e) {
                    $filterVal.county = $('#twzipcode').twzipcode('get', 'county')[0];
                    console.log($filterVal);
                },
            });
            _filterTimeBegin.on("change", function(e) {
                $filterVal.timeBegin = e.target.value;
                _filterTimeEnd.attr("min", $filterVal.timeBegin);
                console.log($filterVal);
            });
            _filterTimeEnd.on("change", function(e) {
                $filterVal.timeEnd = e.target.value;
                _filterTimeBegin.attr("max", $filterVal.timeEnd);
                console.log($filterVal);
            });
            _filterCampaign.on("blur", function(e) {
                $filterVal.campaign = e.target.value;
                console.log($filterVal);
            });
            _filterSearch.on('click', function() {
                if (($filterVal.timeBegin.length + $filterVal.timeEnd.length + $filterVal.county.length + $filterVal.campaign.length) > 0) {
                    $this.goFilter();
                } else {
                    return alert('請設定搜尋內容');
                }
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
            doSuccess('test');
            function doSuccess(response) {
                let $response = response;
                console.log($response);

                return $this.buildResult($response);
            };
        },
        listenAlbum: function() {
            console.log("listenAlbum");
            let $this = this;
            // let _filterResultList: $('#filter-result-list');
            let _filterResultItem = $('.filter-result-item');
            let _backToAlbum = $('#btn-backToAlbum');

            _filterResultItem.on('click', function(e) {
                let _id = $(e.currentTarget).data('id');
                $this.var.$popup.album = _id;
                console.log($this.var.$popup.album);
                return $this.switchInAlbum();
            });

            _backToAlbum.on('click', function(e) {
                return $this.backToAlbum();
            });
        },
        switchInAlbum: function() {
            console.log('switchInAlbum');
            let $this = this;
            let _viewAlbumList = $('#va-pic-list');
            let _confirmPic = $('#btn-confirmPic');
            console.log($this.var.$popup.album);
            $this.el.$viewAlbum.attr('data-va', 2);

            _viewAlbumList.on("change", "input[type=radio]", function(e) {
                let _value = e.target.value;
                $this.var.$popup.pic = _value;
                console.log($this.var.$popup.pic);
            });
            _confirmPic.on("click", function(e) {
                console.log('doSetPriview');
                let _src = 'public/img/album-pic-b.png';
                $this.el.$postcardImgPreview.attr('src', 'public/img/album-pic-b.png');
                $this.var.$postcard['img'] = _src;
                return $this.el.$viewAlbum.popup('hide');
            });
        },
        backToAlbum: function() {
            console.log('backToAlbum');
            let $this = this;
            $this.el.$viewAlbum.attr('data-va', 1);
        },
    };
    POSTCARDER.init();
});
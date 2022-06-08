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
            $btnFileDl: $('#btn-file-dl'),
            // $btnFilePreview: $('#btn-file-preview'),

            $resizeImg: $('#resize-img'),
            $previewImg: $('#preview-img'),
            $publicImg: $('#public-img'),

            $filterResultList: $('#filter-result-list'),
            // $intoAlbum: $('#into-album'),
            $vaName: $('#va-name'),
            $vaPicList: $('#va-pic-list'),
        },
        var: {
            $postcard: {
                img: '',
                title: '',
                content: '',
                writer: '',
                result: '',
                checkisok: false
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
            console.log('postcarder');
            // this.goInitial(); // 先 ajax 拿到資料先builder
            this.loadAlbum();
            this.bindEvent();
            this.postcardMaker();
            this.setPopup();

            this.listenFilter();
            this.listenAlbumPic();
        },
        postcardMaker: function() {
            let $this = this;
            let canvas = document.getElementById('canvas'),
                ctx = canvas.getContext('2d'),
                image_a = new Image(),
                image_b = new Image(),
                _resize_img = new Image(),
                _resize = '',
                result_img = new Image(),
                base64 = '';

            _resize_img = document.getElementById('resize-img');
            _resize_img.setAttribute("crossOrigin", 'Anonymous');
            result_img = document.getElementById('preview-img');
            result_img.setAttribute("crossOrigin", 'Anonymous');

            // image_b.src = document.getElementById('img-b').src;

            let btn_dl = document.getElementById('dl'),
                btn_merge = document.getElementById('btn-file-preview');
            // console.log(dl);
            btn_merge.onclick = function() {
                if (!$this.var.$postcard.checkisok) return;
                image_a.src = document.getElementById('postcard-img-bg').src;
                image_b.src = document.getElementById('postcard-img-preview').src;

                image_a.setAttribute("crossOrigin", 'Anonymous');
                image_b.setAttribute("crossOrigin", 'Anonymous');

                image_a.onload = function() {
                    var w = this.width, // 1129
                        h = this.height, // 608

                        target_w = 658, // 658
                        target_h = 464, // 464
                        w2 = image_b.width,
                        h2 = image_b.height,
                        resize_w = target_w,
                        resize_h = target_h
                        ;

                    // Step1. resize te selected image
                    canvas.width = target_w;
                    canvas.height = target_h;
                    if (w2 > h2) { resize_w = target_h*w2/h2; }
                    else { resize_h = target_w*h2/w2; }

                    ctx.drawImage(image_b, 0, 0, resize_w, resize_h);
                    _resize = canvas.toDataURL("image/png");
                    _resize_img.src = _resize;

                    // Step2. merge step1 to background
                    _resize_img.onload = function() {
                        // background
                        canvas.width = w;
                        canvas.height = h;
                        ctx.drawImage(image_a, 0, 0, w, h);
                        ctx.drawImage(this, 50, 40, target_w, target_h);

                        // title
                        ctx.font="30px 微軟正黑體";
                        ctx.fillStyle = "white";
                        ctx.fillText($this.var.$postcard.title, 70, 545);

                        // content
                        ctx.fillStyle = "#484848";
                        let _substr = ($this.var.$postcard.content.match(/.{1,10}/g));
                        for (let i = 0; i < _substr.length; i++) {
                            ctx.fillText(_substr[i], 750, 183 + (i*52));
                        }

                        // writer
                        ctx.textAlign = "right";
                        ctx.fillText('by ' + $this.var.$postcard.writer, 1080, 545);

                        // result
                        base64 = canvas.toDataURL("image/png");
                        result_img.src = base64;
                        $this.var.$postcard.result = base64;
                    }
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
                    return alert('請上傳小於 2 MB圖片');
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
                // console.log($this.var.$postcard);
            });

            // step1 file preview
            $this.el.$btnFilePreview.on('click', function(e) {
                console.log('btnFilePreview');
                // check content
                let _postcard = $this.var.$postcard;
                let _notify = '';
                // console.log(_postcard);
                if (_postcard.img == '') {
                    _notify = '請上傳圖片';
                } else if (_postcard.title == '') {
                    _notify = '請輸入明信片標題';
                } else if (_postcard.content == '') {
                    _notify = '請輸入明信片內容';
                } else if (_postcard.writer == '') {
                    _notify = '請輸入明信片作者';
                } else {
                    $this.var.$postcard.checkisok = true;
                    return $this.el.$postcarder.attr('data-step', 2);
                }
                e.preventDefault();
                return alert(_notify);
            });

            // step2 go back to edit
            $this.el.$btnFileEdit.on('click', function() {
                console.log('btnFileEdit');
                $this.el.$postcarder.attr('data-step', 1);
            })
            // step2 go to public
            $this.el.$btnFilePublic.on('click', function() {
                console.log('btnFilePublic');
                $this.el.$publicImg.attr('src', $this.var.$postcard.result);
                $this.el.$btnFileDl.attr('download',  $this.var.$postcard.title.replace(/ /g, "") + '.png');
                $this.el.$btnFileDl.attr('href', $this.var.$postcard.result);
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
                    $this.loadAlbum();
                },
                onclose: function() {
                    $this.el.$filterResultList.empty();
                    $this.el.$vaPicList.empty();
                    $this.el.$viewAlbum.attr('data-va-steps', 1);
                },
            });
            // function onOpenAlbum() {
            //     console.log("onOpenAlbum");
            //     console.log($this.el.$selectAll);
            // }
        },
        goInitial: function() {
            let $this = this;
            console.log('goInitial');
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
            let _filterSearch = $('#btn-filter-search');

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
            let _filterResultItem = $('.filter-result-item');
            let _backToAlbum = $('#btn-back-to-album');

            _filterResultItem.on('click', function(e) {
                let _id = $(e.currentTarget).data('id');
                $this.var.$popup.album = _id;
                $this.el.$viewAlbum.attr('data-va-steps', 2);
                // console.log($this.var.$popup.album);
                return $this.loadAlbumPic();
            });

            _backToAlbum.on('click', function(e) {
                return $this.backToAlbum();
            });
        },
        listenAlbumPic: function() {
            console.log('listenAlbumPic');
            let $this = this;
            let _confirmPic = $('#btn-confirm-pic');

            $this.el.$vaPicList.on("change", "input[type=radio]", function(e) {
                let _value = e.target.value;
                $this.var.$popup.pic = _value;
                console.log($this.var.$popup.pic);
            });
            _confirmPic.on("click", function(e) {
                console.log('doSetPriview');
                let _popup = $this.var.$popup;
                let _src = window.albumPics[_popup.album][_popup.pic]['src'];
                $this.el.$postcardImgPreview.attr('src', _src);
                $this.var.$postcard['img'] = _src;
                return $this.el.$viewAlbum.popup('hide');
            });
        },
        loadAlbumPic: function() {
            console.log('loadAlbumPic');
            let $this = this;
            let _source = window.albumPics;
            let _target = $this.el.$vaPicList;
            let _aid = $this.var.$popup.album;
            let _template_pics = window.helper.getTemplate('album__pics-radio');
            let _templates = '';

            let _album = window.campaigns[$this.var.$popup.album];
            let _name = _album['area'] + _album['date'][0] + _album['date'][1] + _album['date'][2] + _album['campaign'];
            $this.el.$vaName.html(_name);

            for ($prop in _source[_aid]) {
                let _template = _template_pics;
                _template = _template.replace(/\[ID\]/g,  _source[_aid][$prop]['id']);
                _template = _template.replace(/\[PIC\]/g,  _source[_aid][$prop]['src']);
                _template = _template.replace(/data-src/g,  'src');
                _templates += _template;
            }
            _target.html(_templates);
        },
        backToAlbum: function() {
            console.log('backToAlbum');
            let $this = this;
            $this.el.$viewAlbum.attr('data-va-steps', 1);
        },
    };
    POSTCARDER.init();
});
$(function() {
    var FORM = {
        env: 'html',
        api: {
            url: 'https://datasow.69939.uk/api/',
            param: {
                key: 'e8701ad48ba05a91604e480dd60899a3' // ?key=e8701ad48ba05a91604e480dd60899a3
            },
            path: {
                init_cleanocean_form: 'init_cleanocean_form',
                save_cleanocean_data: 'save_cleanocean_data'
            },
            data: {
                "user_id": 1,
                "code": "", // 11231fb66f363866f621b08ab3194d80
            }
        },
        el: {
            $page_title: $('head title'),
            $window: $(window),
            $doc: $(document),
            $body: $('body'),

            $thetitle: $('#thetitle h1'),
            $theform: $('#theform'),
            $loading: $('.theform-loading'),

            $form_btns: $('#form-btns'),

            // $btn_draft: $('#btn-form-draft'),
            $btn_save: $('#btn-form-save'), // 非新增才有
            $btn_confirm_submit: $('#btn-confirm-submit'), // 最後確認送出
            $btn_confirm_newone_ocean: $('#btn-confirm-newone_ocean'),
            $btn_confirm_newone_river: $('#btn-confirm-newone_river'),
            $btn_confirm_sameone: $('#btn-confirm-sameone'), // river // popup screate ame one
            $btn_select_submit: $('#btn-select-submit'),

            $popup_form_select: $('#form-select'),
            $popup_form_confirm: $('#form-confirm'),

            $theform_is_new: $('#theform_is_new'),
            $theform_is_edit: $('#theform_is_edit'),

            $pics: {
                // $btn_pic_upload: $('input.pic-upload[type="file"]'),
                // $btn_pic_delete: $('.btn-pic-delete'),
                $r_pic: $('#r_pic'),
                $h_pic: $('#h_pic'),
                $d_pic: $('#d_pic'),
                $album_pics_1: $('#album_pic_1'),
                $album_pics_2: $('#album_pic_2'),
            },

            // river
            $formriver_ul: $('#form-data-ul'), // template for api call dynamic field
            $formriver_select: $('#formriver_select'), // popup

            // ocean
            // $formocean_ul: $('#filed-album_pics'),
            $formocean: {
                album_ul: $('#filed-album_pics'),
                filed_location: $('#filed-location'),
                filed_city: $('#filed-city'),
                filed_customs: $('#filed-customs'),
            },
        },
        var: {
            page_status: '', // form/view
            page_position: '', // cleanocean/cleanriver
            form_status: '', // add/edit

            form_select_value: '',
            img_file: {
                status: '',
                counter: 0,
                datas: { // lat: '', // lng: '', // file_create_time: ''

                },
            },
            form_data: {
                extra_data: {}
            },

            //ocean
            $temp_formocean_li: window.helper.getTemplate('form_ocean__album_pic'),
        },
        init: function() {
            console.log('FORM');
            this.var.page_status = this.el.$body.attr('data-status');
            this.var.page_position = this.el.$body.attr('data-position');
            if ('scrollRestoration' in history) { history.scrollRestoration = 'manual'; }
            this.el.$body.addClass(deviceObj.name);

            this.bindEvent();
            this.checkStatus();
            this.setPopup();
        },
        bindEvent: function() {
            let $this = this;
            console.log($this.var.page_status);
            console.log($this.var.page_position);

            $this.el.$btn_select_submit.on('click', function() {
                if ($this.var.page_position !== 'cleanriver') return;

                $this.var.form_select_value = $this.el.$formriver_select.val();
                // show up the form
                if ($this.var.form_select_value !== 0 || $this.var.form_select_value !== "") {
                    // api call 動態欄位
                    if ($this.var.form_select_value == "1") { dynamic_field = window.formriver_dynamic_field_1;
                    } else { dynamic_field = window.formriver_dynamic_field_2; }

                        let _source = dynamic_field
                        , _target = $this.el.$formriver_ul
                        , _template_extra = window.helper.getTemplate('form_river__extra')
                        , _templates = '';
                        for ($prop in _source) {
                            let _template = _template_extra;
                            _template = _template.replace(/\[ID\]/g, $prop);
                            _template = _template.replace(/\[QUESTION\]/g, _source[$prop]);
                            _templates += _template;
                        }
                        _target.append(_templates);

                    $('#form-select').popup('hide');
                    console.log($this.var.form_select_value);
                    $this.formShowup();
                }
            });

            $this.el.$theform.on('click', '.btn-pic-delete', function(e) {
                console.log("do pic 'delete'");

                let $current = e.currentTarget
                , $whichone = $current.closest('li')
                , $pid = $($whichone).attr('data-pid')
                , $id = $($whichone).attr('data-pid')
                , $preview_el = $('#preview_' + $pid);

                //
                $preview_el.attr('src', '');

                // if ocean remove li
                if ($this.var.page_position === 'cleanocean') {
                    let $tempid = $preview_el.attr('data-tempid');
                    $preview_el.attr('data-tempid', '');
                    $whichone.remove();
                    delete $this.var.img_file.datas[$tempid];
                    console.log($this.var.img_file);
                }

                // call api to delete
                console.log($id);
            });
            $this.el.$theform.on('change', 'input.pic-upload[type="file"]', function(e) {
                console.log("do pic 'update'");
                if ($this.var.img_file.status != '') return alert('圖片處理中');

                let $current = e.currentTarget
                , $whichone = $current.getAttribute('id')
                , $preview_el = 'preview_' + $whichone
                , $tempid = $this.var.img_file.counter
                , $newone = true
                , $multiple_way = ($($current).hasClass('multiple_way'))?true:false;

                if ($('#' + $preview_el).attr('data-tempid') !== undefined) {
                    $tempid = $('#' + $preview_el).attr('data-tempid');
                    $newone = false;
                }
                // console.log($tempid);
                // let $b64 = '';

                // step1, get EXIF
                let file = e.target.files[0];
                $this.var.img_file.datas[$tempid] = '';
                $this.var.img_file.datas[$tempid] = {'b64':'', 'file_create_time':'','lat':'','lng':''};

                if (file && file.name) {
                    EXIF.getData(file, function() {
                        console.log(this);

                        let exifData = EXIF.pretty(this);
                        if (exifData) {
                            let file_create_time = lat = lng = '';
                            if (this.exifdata.DateTime !== undefined) {
                                file_create_time = this.exifdata.DateTime
                                , lat = calGPS(this.exifdata)['latitude'] // 經度
                                , lng = calGPS(this.exifdata)['longitude'] // 緯度
                            }
                            $this.var.img_file.datas[$tempid]['file_create_time'] = file_create_time;
                            $this.var.img_file.datas[$tempid]['lat'] = lat;
                            $this.var.img_file.datas[$tempid]['lng'] = lng;
                        } else {
                            console.log("No EXIF data found in image '" + file.name + "'.");
                        }

                        // =-=-=-=-=-=-=-=-=-=-=
                        function calGPS(exif) {
                            let latitude, longitude;
                            let exifLong = exif.GPSLongitude
                            , exifLongRef = exif.GPSLongitudeRef
                            , exifLat = exif.GPSLatitude
                            , exifLatRef = exif.GPSLatitudeRef;
                            // console.log('exifLong : ' + exifLong);
                            // console.log('exifLongRef : ' + exifLongRef);
                            // console.log('exifLat : ' + exifLat);
                            // console.log('exifLatRef : ' + exifLatRef);

                            if (exifLatRef == "S") {
                                latitude = (exifLat[0]*-1) + (( (exifLat[1]*-60) + (exifLat[2]*-1) ) / 3600);
                            } else {
                                latitude = exifLat[0] + (( (exifLat[1]*60) + exifLat[2] ) / 3600);
                            }

                            if (exifLongRef == "W") {
                                longitude = (exifLong[0]*-1) + (( (exifLong[1]*-60) + (exifLong[2]*-1) ) / 3600);
                            } else {
                                longitude = exifLong[0] + (( (exifLong[1]*60) + exifLong[2] ) / 3600);
                            }
                            return {'latitude': latitude, 'longitude': longitude};
                        }
                        // =-=-=-=-=-=-=-=-=-=-=
                    });
                }

                // do compress
                handleImageUpload(file);
                async function handleImageUpload(file) {
                    $this.var.img_file.status = 'uploading';
                    // const imageFile = event.target.files[0];
                    const imageFile = file;
                    // console.log('originalFile instanceof Blob', imageFile instanceof Blob); // true
                    // console.log(`originalFile size ${imageFile.size / 1024 / 1024} MB`);

                    const options = {
                        maxSizeMB: 1.9,
                        maxWidthOrHeight: 400,
                        useWebWorker: true
                    }
                    try {
                        const compressedFile = await imageCompression(imageFile, options);
                        // console.log('compressedFile instanceof Blob', compressedFile instanceof Blob); // true
                        // console.log(`compressedFile size ${compressedFile.size / 1024 / 1024} MB`); // smaller than maxSizeMB
                        // console.log(compressedFile);
                        //
                        var reader = new FileReader();
                        reader.readAsDataURL(compressedFile);
                        reader.onloadend = function() {
                            let base64data = reader.result,
                            $b64 = $this.var.img_file.datas[$tempid].b64 = base64data;

                            // console.log($newone);
                            // if ($this.var.page_position === 'cleanriver' || !$newone) {
                            if (!$multiple_way || !$newone) {
                                let output = document.getElementById($preview_el);
                                output.src = $b64;
                                output.setAttribute("data-tempid", $tempid);
                            } else { // clean ocean
                                let _target = $this.el.$formocean.album_ul
                                , _template = $this.var.$temp_formocean_li;

                                _template = _template.replace(/\[ID\]/g, $tempid);
                                _target.append(_template);

                                $preview_el = 'preview_album_pic_' + $tempid;
                                let output = document.getElementById($preview_el);
                                output.src = $b64;
                                output.setAttribute("data-tempid", $tempid);
                            }
                            doImgSync();
                        }
                    // await uploadToServer(compressedFile); // write your own logic
                    } catch (error) {
                        $this.var.img_file.status = '';
                        console.log(error);
                    }
                }

                // step2, do preview
                // var reader = new FileReader();
                // reader.onload = function() {
                //     let output = document.getElementById($preview_el);
                //     output.src = reader.result;
                //     $b64 = output.src;
                //     $this.var.img_file.b64 = $b64;
                //     doImgSync();
                // }
                // reader.readAsDataURL(event.target.files[0]);

                // step3, do api call
                function doImgSync() {
                    $this.var.img_file.status = '';
                    $this.var.img_file.counter += 1;
                    console.log($this.var.img_file);
                    return;
                }
            });

            // $this.el.$btn_draft.on('click', function() {
            //     console.log('save to draft');
            //     // send the data to api // API
            //     alert('已儲存草稿');
            // });

            $this.el.$btn_confirm_submit.on('click', function() {
                console.log('open confirm popup');
                if ($this.var.img_file.status != '') return alert('圖片處理中');
                $this.el.$popup_form_confirm.attr('data-confirmed', 'loading');

                // send the data to api // API
                // call api // ajax url
                let _url = $this.api.url
                + $this.api.path.save_cleanocean_data
                + "/?key=" + $this.api.param.key;
                // _url += '&__r=' + (new Date()).getTime();
                console.log(_url);

                let _data = Object.assign({}, $this.api.data, $this.var.form_data);

                // ajax handle
                $.ajax({
                    url: _url,
                    type: "post",
                    data: JSON.stringify(_data),
                    dataType: "json",
                    success: (response) => {
                        console.log(response);
                        if (response.is_success === 1) {
                            return $this.el.$popup_form_confirm.attr('data-confirmed', 1);
                        } else {
                            $this.el.$popup_form_confirm.attr('data-confirmed', 0);
                        }
                        return;
                    },
                    error: function(response) {
                        console.log("error");
                        console.log(response);
                        $this.el.$popup_form_confirm.attr('data-confirmed', 0);
                    }
                });

                // console.log($this.var.form_data)
            });

            $this.el.$btn_save.on('click', function() {
                console.log('the data be save');

                // call api to save the data

                alert('資料已儲存');
            });

            // ocean
            $this.el.$btn_confirm_newone_ocean.on('click', function() {
                console.log('ocean, set clean before the "new" one');
                location.href = location.protocol + '//' + location.host + location.pathname;
            });

            // river
            $this.el.$btn_confirm_newone_river.on('click', function() {
                console.log('river, set clean before the "new" one');
                location.href = location.protocol + '//' + location.host + location.pathname;
            });
            $this.el.$btn_confirm_sameone.on('click', function() {
                console.log('river, set clean before the "same" one');
                // location.href = location.protocol + '//' + location.host + location.pathname;
            });
        },


        // 確認 form 表狀態
        checkStatus: function() {
            let $this = this;
            // checking
            let url_code = window.helper.getUrlParams(window.location.href, 'code');
            console.log(url_code);

            // checking status, than set up status
            let $page_title = '';
            if (url_code) {
                if ($this.var.page_status == 'view') {
                    $this.var.form_status = 'view';
                    $page_title = $this.el.$page_title.html();
                    $this.ifIsView();
                } else if ($this.var.page_status == 'form') {
                    $this.var.form_status = 'edit';
                    $page_title = $this.el.$page_title.html() + ' - 修改';
                    $this.el.$theform_is_new.remove();
                    $this.formShowup();
                }
            } else {
                if ($this.var.page_status == 'view') {
                    console.log(this.var.page_position);
                    return alert('導回首頁');
                }
                $this.var.form_status = 'add';
                $page_title = $this.el.$page_title.html() + ' - 新增';
                $this.el.$theform_is_edit.remove();

                if ($this.var.page_position == 'cleanriver') {
                    $this.openFirstPopup();
                } else {
                    $this.formShowup();
                }
            }
            $this.el.$body.attr('data-form', $this.var.form_status);

            $this.el.$page_title.html($page_title);
            $this.el.$thetitle.html($page_title);
            $this.el.$thetitle.attr('data-storke', $page_title);

            return;
        },

        // 前置作業處理好，執行 call api，再完畢，即可顯示表單
        formShowup: function() {
            let $this = this;
            console.log("showup");

            // call api // ajax url
            let _url = $this.api.url
            + $this.api.path.init_cleanocean_form
            + "/?key=" + $this.api.param.key;

            // _url += '&__r=' + (new Date()).getTime();
            // console.log(_url);

            let _data = Object.assign({}, $this.api.data, {
                'featured_id': "0",
            });

            // ajax handle
            $.ajax({
                url: _url,
                type: "post",
                data: JSON.stringify(_data),
                dataType: "json",
                success: (response) => {
                    console.log(response);
                    if (response.is_success === 1) {
                        doSuccess(response.setting, response.data);
                    }
                    return;
                },
                error: function(response) {
                    console.log("error");
                    console.log(response);
                }
            });

            function doSuccess(_setting, _data) {
                $this.var.form_data['id'] = _data.id;
                $this.var.form_data['code'] = _data.code;
                $this.var.form_data['upload_num'] = _setting.upload_num;
                console.log($this.var.form_data);
                processSetting();

                async function processSetting() {
                    console.log('processSetting');
                    console.log('=-=-=-=-=-=\r\n_setting');
                    console.log(_setting);
                    doOptions('location', _setting['location']);
                    doOptions('city', _setting['cities']);
                    doExtra(_setting['extra_data']);

                    function doOptions(_field, _d){
                        let _source = _d
                        , _target = ((_field == 'city')?$this.el.$formocean.filed_city:$this.el.$formocean.filed_location)
                        , _template_option = window.helper.getTemplate('select_option')
                        , _templates = '';

                        for ($prop in _source) {
                            let _template = _template_option;
                            _template = _template.replace(/\[VALUE\]/g, _source[$prop]);
                            _template = _template.replace(/\[OPTION\]/g, _source[$prop]);
                            _templates += _template;
                        }
                        _target.html(_templates);
                    }
                    function doExtra(_d){
                        let _source = _d
                        , _target = $this.el.$formocean.filed_customs
                        , _template_li = window.helper.getTemplate('form_field__custom')
                        , _templates = '';
                        // console.log(_source);

                        // (1) build li
                        for ($prop in _source) {
                            let _template = _template_li
                            , $li = _source[$prop]
                            , $id = $li['id']
                            , $type = $li['field_type']
                            , $content = ''
                            ;

                            _template = _template.replace(/\[ID\]/g, $id);

                            // (2) build the input type
                            switch ($type) {
                                case 'text':
                                    var _template_text = window.helper.getTemplate('input_text')
                                    , _temp = _template_text;

                                    _temp = _temp.replace(/\[ID\]/g, 'filed-' + $li['field_data']['field_id']);
                                    _temp = _temp.replace(/\[NAME\]/g, $li['field_data']['field_id']);
                                    _temp = _temp.replace(/\[TITLE\]/g, $li['field_title']);
                                    _temp = _temp.replace(/\[VALUE\]/g, '');
                                    _temp = _temp.replace(/\[HINT\]/g, $li['field_hint']);
                                    _temp = _temp.replace(/\[required\]/g, ($li['is_required'] === 1)?'required':'');

                                    _temp = _temp.replace(/\[MAXLENGTH\]/g, $li['field_data']['text_maxlength']);

                                    $content += _temp;
                                    break;
                                case 'number':
                                    var _template_number = window.helper.getTemplate('input_number')
                                    , _temp = _template_number;

                                    _temp = _temp.replace(/\[ID\]/g, 'filed-' + $li['field_data']['field_id']);
                                    _temp = _temp.replace(/\[NAME\]/g, $li['field_data']['field_id']);
                                    _temp = _temp.replace(/\[TITLE\]/g, $li['field_title']);
                                    _temp = _temp.replace(/\[VALUE\]/g, '');
                                    _temp = _temp.replace(/\[HINT\]/g, $li['field_hint']);
                                    _temp = _temp.replace(/\[required\]/g, ($li['is_required'] === 1)?'required':'');

                                    _temp = _temp.replace(/\[MAX\]/g, $li['field_data']['number_max']);
                                    _temp = _temp.replace(/\[MIN\]/g, $li['field_data']['number_min']);

                                    $content += _temp;
                                    break;
                                case 'select':
                                    // console.log($id);
                                    // console.log($type);
                                    // console.log($li);
                                    var _template_select = window.helper.getTemplate('select')
                                    , _temp = _template_select
                                    , _template_select_opt = window.helper.getTemplate('select_option')
                                    , _temp_opts = ''
                                    , $options = $li['field_data']['select_options'];

                                    _temp = _temp.replace(/\[ID\]/g, 'filed-' + $li['field_data']['field_id']);
                                    _temp = _temp.replace(/\[NAME\]/g, $li['field_data']['field_id']);
                                    _temp = _temp.replace(/\[TITLE\]/g, $li['field_title']);
                                    _temp = _temp.replace(/\[VALUE\]/g, '');
                                    _temp = _temp.replace(/\[HINT\]/g, $li['field_hint']);
                                    _temp = _temp.replace(/\[required\]/g, ($li['is_required'] === 1)?'required':'');

                                    for ($opt in $options) {
                                        let _temp_opt = _template_select_opt;
                                        _temp_opt = _temp_opt.replace(/\[VALUE\]/g, $options[$opt]);
                                        _temp_opt = _temp_opt.replace(/\[OPTION\]/g, $options[$opt]);
                                        _temp_opts += _temp_opt;
                                    }
                                    _temp = _temp.replace(/\[OPTIONS\]/g, _temp_opts);

                                    $content += _temp;
                                    break;

                                default:
                                    console.log(`Sorry, we are out of ${$type}.`);
                            }

                            _template = _template.replace(/\[CONTENT\]/g, $content);
                            _templates += _template;
                        }
                        _target.html(_templates);
                    }
                    processData();
                }
                function processData() {
                    console.log('processData');
                    console.log('=-=-=-=-=-=\r\n_data');
                    console.log(_data);
                    // album_pics // extra_data // status // is_public
                    for ($prop in _data) {
                        // console.log($prop);
                        // console.log(_data[$prop]);
                        var $name = $prop
                        , $val = _data[$name];
                        if ($name == "album_pics" || $name == "featured_id") {
                            continue;
                        } else if ($name == "extra_data") {
                            for ($prop_extra in $val) {
                                $name = $prop_extra;
                                $val = $val[$name];
                                var $el = $this.el.$theform.find('[name="' + $name + '"]');
                                $el.val($val);
                            }
                            continue;
                        } else {
                            var $el = $this.el.$theform.find('[name="' + $name + '"]');
                            $el.val($val);
                        }
                    }
                }

                yesShowUp();
                async function yesShowUp() {
                    return window.setTimeout(( () => {
                        console.log('data checked');
                        $this.el.$theform.removeClass('display-none');
                        $this.el.$loading.removeClass('active');
                    }), 500);
                }
            }
        },

        // 確認表單是否為view的狀態
        ifIsView: function() {
            let $this = this;
            console.log('ifIsView');
            $this.el.$form_btns.remove();

            // build swiper
            var swiper = new Swiper("#filed-album_pics", {
                slidesPerView: 3,
                spaceBetween: 30,
                loop: true,
                pagination: {
                    el: ".swiper-pagination",
                    clickable: true,
                    dynamicBullets: true,
                },
            });
            $this.formShowup();
        },

        // 處理 form 表第一次按送出，整理成清單列表的處理
        formConfirm: function() {
            console.log('formConfirm');
            let $this = this;
            let $temp = '';
            let $data_serialize = {};
            $.each($this.el.$theform.serializeArray(), function() {
                $data_serialize[this.name] = this.value;
            });
            $this.var.form_data = Object.assign({}, $this.var.form_data, $data_serialize);

            $.each($this.var.form_data, function(k, v) {
                if (k.includes("custom-")) {
                    $this.var.form_data["extra_data"][k] = v;
                    delete $this.var.form_data[k];
                }
            });

            // check imgs
            // console.log($this.var.img_file.datas);
            $.each($this.var.img_file.datas, function(i){
                let $temp = $("[data-tempid=" + i + "]");
                console.log( $temp.attr('id') );
            });

            $temp += '<ul>';
            if (this.var.page_position == 'cleanocean') {
                for ($i in $data_serialize) {
                    let $key = $i
                    , $label = $('label[for="filed-' + $key + '"]').text().trim()
                    , $value = $data_serialize[$key];
                    if ($key == 'bottle') { $temp += '</ul><hr><ul>'; }
                    $temp += '<li data-label="' + $key + '"><label>' + $label + '</label><label>' + $value + '</label></li>';
                };
                $temp += '</ul>';

                // pics
                // $temp += '<hr><ul class="pics">';
                // $temp += '<li><img src="' + $('#preview_album_pics').attr('src') + '"></li>'

            } else if (this.var.page_position == 'cleanriver') {
                $.each($data, function(i, field){
                    // console.log(i);
                    // console.log(field.name + ":" + field.value + " ");
                    let $key = field.name
                    , $label = $('label[for="filed-' + $key + '"]').text().trim()
                    , $value = field.value;
                    $this.var.form_data[$key] = $value;
                    if (field.name == 'occlusion_scope') {
                        $temp += '</ul><hr><ul>';
                    }
                    $temp += '<li data-label="' + field.name + '"><label>' + $label + '</label><label>' + $value + '</label></li>';
                });
                $temp += '</ul>';

                // pics
                // $temp += '<hr><ul class="pics">';
                // $temp += '<li><img src="' + $('#preview_album_pics').attr('src') + '"></li>'
            }
            $temp += '</ul>';

            console.log($this.var.form_data);
            $this.el.$popup_form_confirm.find('.popup_list').html($temp);
        },

        // 設定 popup
        setPopup: function() {
            let $this = this;
            $this.el.$popup_form_confirm.popup({
                escape: false,
                closebutton: false,
                scrolllock: true,
                blur: false,
                onopen: function() {
                    $this.formConfirm();
                }
            });
        },

        // 如果是 cleanriver，做popup選哪一個表單填寫
        openFirstPopup: function() {
            let $this = this;
            console.log("setPopup, openfirst");
            $this.el.$popup_form_select.popup({
                autoopen: true,
                escape: false,
                closebutton: false,
                scrolllock: true,
                blur: false,
                onopen: function() { // call api to show form select
                    let _source = window.formriver_select
                    , _target = $this.el.$formriver_select
                    , _template_select = window.helper.getTemplate('form_river__select')
                    , _templates = '';
                    for ($prop in _source) {
                        let _template = _template_select;
                        _template = _template.replace(/\[ID\]/g, _source[$prop]['id']);
                        _template = _template.replace(/\[VALUE\]/g, _source[$prop]['value']);
                        _templates += _template;
                    }
                    _target.html(_templates);
                }
            });
        }

    };
    FORM.init();
});

$(function() {
    var FORM = {
        env: 'html',
        api: {
            url: window._comm.$api.url,
            param: {
                key: window._comm.$api.param.key,
            },
            path: {
                //common
                init_form: '',
                save_form: '',
                upload_pic: '',
                delete_pic: '',

                // ocean
                init_cleanocean_form: 'init_cleanocean_form',
                save_cleanocean_data: 'save_cleanocean_data',
                cleanocean_upload_pic: 'cleanocean_upload_pic',
                cleanocean_delete_pic: 'cleanocean_delete_pic',

                // river
                get_cleanriver_forms: 'get_cleanriver_forms',

                init_cleanriver_form: 'init_cleanriver_form',
                save_cleanriver_data: 'save_cleanriver_data',
                cleanriver_upload_pic: 'cleanriver_upload_pic',
                cleanriver_delete_pic: 'cleanriver_delete_pic',

            },
            data: {
                "user_id": window._comm.$user.id,
                "code": "",
            },
            data_others: { // others data
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
            $btn_confirm_newone: $('.btn-confirm-newone'),
            // $btn_confirm_sameone: $('#btn-confirm-sameone'), // river // popup screate same one
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
            $form_filed: {
                album_ul: $('#filed-album_pics'), // ocean
                // filed_location: $('#filed-location'),
                // filed_city: $('#filed-city'),
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
                featured_id: 0, // ocean

                r_pic_id: 0, // river
                h_pic_id: 0, // river
                d_pic_id: 0, // river

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

            // BEGIN detect ocean & river process
            this.api.path.init_form = this.api.path['init_' + this.var.page_position + '_form'];
            this.api.path.save_form = this.api.path['save_' + this.var.page_position + '_data'];
            this.api.path.upload_pic = this.api.path[this.var.page_position + '_upload_pic'];
            this.api.path.delete_pic = this.api.path[this.var.page_position + '_delete_pic'];
            // END detect ocean & river process

            this.bindEvent();
            this.checkStatus();
            this.setPopup();
        },
        bindEvent: function() {
            let $this = this;
            console.log($this.var.page_status);
            console.log($this.var.page_position);

            // river select first
            $this.el.$btn_select_submit.on('click', function() {
                if ($this.var.page_position !== 'cleanriver') return;

                $this.var.form_select_value = $this.el.$formriver_select.val();
                // show up the form
                if ($this.var.form_select_value !== 0 || $this.var.form_select_value !== "") {
                    // api call 動態欄位
                    // if ($this.var.form_select_value == "1") { dynamic_field = window.formriver_dynamic_field_1;
                    // } else { dynamic_field = window.formriver_dynamic_field_2; }

                    //     let _source = dynamic_field
                    //     , _target = $this.el.$formriver_ul
                    //     , _template_extra = window.helper.getTemplate('form_river__extra')
                    //     , _templates = '';
                    //     for ($prop in _source) {
                    //         let _template = _template_extra;
                    //         _template = _template.replace(/\[ID\]/g, $prop);
                    //         _template = _template.replace(/\[QUESTION\]/g, _source[$prop]);
                    //         _templates += _template;
                    //     }
                    //     _target.append(_templates);

                    $('#form-select').popup('hide');
                    $this.api.data_others['setting_id'] = $this.var.form_select_value;
                    console.log($this.api.data_others['setting_id']);
                    $this.formShowup();
                }
            });

            // common pic
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
                // let $b64 = '';

                // step1, get EXIF
                let file = e.target.files[0];
                $this.var.img_file.datas[$tempid] = '';
                $this.var.img_file.datas[$tempid] = {
                    'image': ''
                    , 'file_create_time': ''
                    , 'lat': ''
                    , 'lng': ''
                    , 'file_title': ''
                    , 'is_public': 1
                    , 'delete_id': 0
                    , 'pid': $whichone
                    , 'response': {}
                };
                console.log($this.var.img_file);

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
                            $b64 = $this.var.img_file.datas[$tempid].image = base64data;

                            // console.log($newone);
                            // if ($this.var.page_position === 'cleanriver' || !$newone) {
                            if (!$multiple_way || !$newone) {
                                let output = document.getElementById($preview_el);
                                output.src = $b64;
                                output.setAttribute("data-tempid", $tempid);
                            } else { // clean ocean
                                let _target = $this.el.$form_filed.album_ul
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

                // step3, 前置完成，處理上傳 do api call
                function doImgSync() {
                    $this.var.img_file.status = '';

                    // call api // ajax url
                    var _url = $this.api.url + $this.api.path.upload_pic
                    + "/?key=" + $this.api.param.key; // 測試用，上線刪掉
                    console.log(_url);

                    let _data = Object.assign({}, $this.api.data,
                        $this.var.img_file['datas'][$this.var.img_file.counter]);
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

                    function doSuccess(_r) { // to get upload img id
                        $this.var.img_file['datas'][$this.var.img_file.counter]['response'] = _r;
                        return $this.var.img_file.counter += 1;
                    }
                }
            });
            $this.el.$theform.on('click', '.btn-pic-delete', function(e) {
                console.log("do pic 'delete'");

                let $current = e.currentTarget
                , $whichone = $current.closest('li')
                , $pid = $($whichone).attr('data-pid')
                , $preview_el = $('#preview_' + $pid)
                , $tempid = $preview_el.attr('data-tempid')
                , $delete_id = $this.var.img_file.datas[$tempid]['response']['id']

                // clean data
                $preview_el.attr('src', '').attr('data-tempid', '');
                delete $this.var.img_file.datas[$tempid];
                // if ocean remove li
                if ($this.var.page_position === 'cleanocean') $whichone.remove();

                // call api // ajax url
                var _url = $this.api.url + $this.api.path.delete_pic
                + "/?key=" + $this.api.param.key; // 測試用，上線刪掉
                console.log(_url);

                let _data = Object.assign({}, $this.api.data, {
                    delete_id: $delete_id,
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
                            doSuccess(response);
                        }
                        return;
                    },
                    error: function(response) {
                        console.log("error");
                        console.log(response);
                    }
                });
                function doSuccess(_r) { // to get the delete img
                    console.log(_r);
                }
                // console.log($id);
            });

            // common select limit 3 selected
             $this.el.$theform.on('change', 'select', function (e) {
                let $limit = 3
                , $target = $(e.target)
                , $options = $target.find('option:selected')
                , $selectLength = $options.length;
                if ($selectLength > $limit) {
                    alert('最多選3個');
                    $options[$limit].selected = false ;
                    return false;
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
                var _url = $this.api.url + $this.api.path.save_form
                + "/?key=" + $this.api.param.key; // 測試用，上線刪掉
                console.log(_url);

                let _data = Object.assign({}, $this.api.data, $this.var.form_data, {
                    // 'featured_id': "0", // 測試待刪除
                });
                console.log(_data);
                // console.log(JSON.stringify(_data));

                // ajax handle
                $.ajax({
                    url: _url,
                    type: "post",
                    data: JSON.stringify(_data),
                    dataType: "json",
                    success: (response) => {
                        console.log(response);
                        // console.log(JSON.stringify(response));
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

            // river // ocean
            $this.el.$btn_confirm_newone.on('click', function() {
                console.log('ocean, set clean before the "new" one');
                location.href = location.protocol + '//' + location.host + location.pathname;
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
                $this.api.data.code = url_code;
                // 確認表單是否為view的狀態
                if ($this.var.page_status == 'view') {
                    $this.var.form_status = 'view';
                    $page_title = $this.el.$page_title.html();
                } else if ($this.var.page_status == 'form') {
                    $this.var.form_status = 'edit';
                    $page_title = $this.el.$page_title.html() + ' - 修改';
                    $this.el.$theform_is_new.remove();
                }
                $this.formShowup();
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
            var _url = $this.api.url + $this.api.path.init_form
            + "/?key=" + $this.api.param.key; // 測試用，上線刪掉

            // _url += '&__r=' + (new Date()).getTime();
            // console.log(_url);

            let _data = Object.assign({}, $this.api.data, $this.api.data_others);

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

            function doSuccess(_r_set, _r_data) { // to get the setting file and data file
                $this.var.form_data['id'] = _r_data.id;
                $this.var.form_data['code'] = $this.api.data['code'] = _r_data.code;
                $this.var.form_data['upload_num'] = _r_set.upload_num || 0;
                // if ($this.var.page_position == 'cleanocean') {
                //     $this.var.form_data['upload_num'] = _r_set.upload_num;
                // }
                processSetting();

                async function processSetting() {
                    console.log('processSetting\r\n=-=-=-=-=-=');
                    console.log(_r_set);
                    if ($this.var.page_position == 'cleanocean') {
                        doOptions('location');
                        doOptions('city');
                        // doOptions('city', _r_set['cities']);
                    } else {
                        doOptions('river_part');
                        doOptions('occlusion_scope');
                        doOptions('garbage_bags');
                        doOptions('survey_scope');
                        doOptions('l_garbages');
                        doOptions('v_garbages');
                        doOptions('m500_garbages');
                        doOptions('m500_h_garbages');
                    }
                    doExtra();

                    function doOptions(_field){
                        _d = _r_set[_field];
                        // if (_field == 'city') _r_set['cities'];

                        // console.log(_field);
                        // console.log(_d);
                        if ($this.var.page_position == 'cleanriver') {
                            var _is_multiple = _d['is_multiple'];
                            _d = _d['value'];
                        }
                        let _source = _d
                        , _target = $('#filed-' + _field)
                        , _template_option = window.helper.getTemplate('select_option')
                        , _templates = '';

                        if (_is_multiple == 1) _target.attr('multiple', 'multiple');

                        for ($prop in _source) {
                            let _template = _template_option;
                            _template = _template.replace(/\[VALUE\]/g, _source[$prop]);
                            _template = _template.replace(/\[OPTION\]/g, _source[$prop]);
                            _templates += _template;
                        }
                        _target.html(_templates);
                    }
                    function doExtra() {
                        if (_r_set['extra_data'].length === 0) return;
                        let _source = _r_set['extra_data']
                        , _target = $this.el.$form_filed.filed_customs
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
                    console.log('processData\r\n=-=-=-=-=-=');
                    console.log(_r_data);

                    // album_pics // extra_data // status // is_public
                    for ($prop in _r_data) {
                        var $name = $prop
                        , $val = _r_data[$name];
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
                    if ($this.var.form_status === 'view') {
                        if ($this.var.page_position === 'cleanocean') {
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
                        }
                        $this.el.$theform.find('input, select').attr("disabled", true).attr("readonly", "readonly");
                    }

                    return window.setTimeout(( () => {
                        console.log('data checked');
                        $this.el.$theform.removeClass('display-none');
                        $this.el.$loading.removeClass('active');
                    }), 500);
                }
            }
        },

        // first to confirm in the popup, 處理 form 表第一次按送出，整理成清單列表的處理
        formConfirm: function() {
            console.log('formConfirm');
            let $this = this;
            let $temp = '';
            let $data_serialize = {};
            $.each($this.el.$theform.serializeArray(), function() {
                let $el = $('[name="' + this.name + '"]');
                if ($el.is('select') && $el[0].hasAttribute('multiple')) {
                    if (!Array.isArray($data_serialize[this.name])) $data_serialize[this.name] = []
                    $data_serialize[this.name].push(this.value);
                } else {
                    $data_serialize[this.name] = this.value;
                }
            });
            // console.log($data_serialize);
            $this.var.form_data = Object.assign({}, $this.var.form_data, $data_serialize);

            $.each($this.var.form_data, function(k, v) {
                if (k.includes("custom-")) {
                    $this.var.form_data["extra_data"][k] = v;
                    delete $this.var.form_data[k];
                }
            });

            // check imgs
            // console.log($this.var.img_file.datas);
            $.each($this.var.img_file.datas, function(i) {
                console.log($this.var.img_file.datas[i]);
                let $id = $this.var.img_file.datas[i]['response'].id
                , $pid = $this.var.img_file.datas[i].pid;
                $this.var.form_data[$pid] = $id;
                // let $temp = $("[data-tempid=" + i + "]");
                // console.log($temp.attr('id')); // get preview img
            });

            $temp += '<ul>';
            for ($i in $data_serialize) {
                let $key = $i
                , $label = $('label[for="filed-' + $key + '"]').text().trim()
                , $value = $data_serialize[$key];

                if (/_pic_id|album_pics|shooter_name/.test($key)) continue; // _pic_id / album_pics / shooter_name 跳過先不處理

                if (/status/.test($key)) $value = (($value == 0)?"草稿":"正式發佈");
                if (/is_public/.test($key)) $value = (($value == 0)?"不公開":"公開");

                if ($key == 'bottle' || $key == 'occlusion_scope') { $temp += '</ul><hr><ul>'; }

                $temp += '<li data-label="' + $key + '"><label>' + $label + '</label><label>' + $value + '</label></li>';
            };
            $temp += '</ul>';

            // pics
            // $temp += '<hr><ul class="pics">';
            // $temp += '<li><img src="' + $('#preview_album_pics').attr('src') + '"></li>'

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

        // 如果是 cleanriver，做first popup選哪一個表單填寫
        openFirstPopup: function() {
            let $this = this;
            console.log("setPopup, openfirst");

            // call api // ajax url
            let _url = $this.api.url
            + $this.api.path.get_cleanriver_forms
            + "/?key=" + $this.api.param.key;
            console.log(_url);

            let _data = Object.assign({}, $this.api.data, {});

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

            function doSuccess(_r) { // to get the form selection list
                $this.el.$popup_form_select.popup({
                    autoopen: true,
                    escape: false,
                    closebutton: false,
                    scrolllock: true,
                    blur: false,
                    onopen: function() { // call api to show form select
                        let _source = _r
                        , _target = $this.el.$formriver_select
                        , _template_select = window.helper.getTemplate('form_river__select')
                        , _templates = '';
                        for ($prop in _source) {
                            let _template = _template_select;
                            _template = _template.replace(/\[ID\]/g, _source[$prop]['id']);
                            _template = _template.replace(/\[VALUE\]/g, _source[$prop]['city'] + '-' + _source[$prop]['river_name']);
                            _template = _template.replace(/\[disabled\]/g, (_source[$prop]['status'] == 0)?'disabled':'');
                            _templates += _template;
                        }
                        _target.html(_templates);
                    }
                });
            }
        }

    };
    FORM.init();
});
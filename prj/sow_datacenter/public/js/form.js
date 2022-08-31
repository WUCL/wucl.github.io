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
                cleanriver_update_pic: 'cleanriver_update_pic',
                cleanriver_delete_pic: 'cleanriver_delete_pic',

            },
            data: {
                "user_id": window._comm.$user.id,
                "code": "",
                // "code": "df8144031980fe488b00d24f0125aebf",
                "setting_id": "",
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
            $btn_confirm_finish: $('#btn-confirm-finish'),
            // $btn_confirm_sameone: $('#btn-confirm-sameone'), // river // popup screate same one
            $btn_select_submit: $('#btn-select-submit'),

            $popup_form_select: $('#form-select'),
            $popup_form_confirm: $('#form-confirm'),
            $popup_form_themap: $('#form-themap'),
            $popup_form_error_box: $('#error_box'),

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

                // ocean
                $filed_album_pic: $('#filed-album_pic'),
                $album_pic: $('[data-pid="album_pic"]')
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
            $btn_themap_close: $('#btn-themap-close'),
        },
        var: {
            page_title: '', // page title
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
                pics: {
                    current: 0,
                    max: 0, // upload_num
                    temp_id: '',
                },
                featured_id: '', // ocean

                r_pic_id: '', // river
                h_pic_id: '', // river
                d_pic_id: '', // river

                // ocean/river
                album_used: [], // temp the image is used
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

            $this = this;

            checkUserId();
            function checkUserId() {
                console.log('window._comm.$user.id :: ' + window._comm.$user.id);
                if (window._comm.$user.id === '') {
                    return window.setTimeout(( () => { checkUserId(); }), 500);
                } else {
                    $this.bindEvent();
                    $this.checkStatus(); // start
                    $this.setPopup();
                }
            }
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
            $this.el.$theform.on('click', '.btn-form-confirm', function(e) {
                let $pic_preview = $('li.pic[data-img-status="preview"]').length;
                console.log($pic_preview)
                if ($pic_preview > 0) {
                    e.preventDefault();
                    e.stopPropagation();
                    return alert('上有照片，尚未上傳');
                }
            });

            $this.el.$theform.on('click', '.btn-pic-update', function(e) {
                console.log(".pic-update ON click'");
                let $current = e.currentTarget
                , $li_pic_el = $current.closest('li.pic')
                , $whichone = $li_pic_el.getAttribute('data-pid')
                , $picsid = $('#preview_' + $whichone).attr('data-pics-id')
                , $dt_val = $('#' + $whichone + '-datetime').val();

                if ($dt_val == "") {
                    e.preventDefault();
                    e.stopPropagation();
                    return alert('請選擇拍攝時間');
                }

                // call api // ajax url
                var _url = $this.api.url + $this.api.path.cleanriver_update_pic;
                if (window._comm.$testMode) _url += "/?key=" + $this.api.param.key; // 測試用，上線刪掉 for test
                console.log(_url);

                let _data = Object.assign({}, $this.api.data, {
                    file_title: ''
                    , is_public: ''
                    , lat: ''
                    , lng: ''
                    , id: $picsid
                    , file_create_time: moment($dt_val).format('YYYY-MM-DD HH:mm:ss')
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
                        } else {
                            return alert(response.messages[0]);
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
                    return alert('照片時間已更新');
                }
            });
            $this.el.$theform.on('click', '.btn-pic-upload', function(e) {
                console.log(".pic-upload ON click'");
                // if ($this.var.page_position !== 'cleanriver') return;
                let $current = e.currentTarget
                , $li_pic_el = $current.closest('li.pic')
                , $whichone = $li_pic_el.getAttribute('data-pid')
                , $preview_el = 'preview_' + $whichone
                , $preview_element = $('#' + $preview_el)
                , $preview_src = $preview_element.attr('src')
                , $tempid = $preview_element.attr('data-tempid')
                , $picsid = $preview_element.attr('data-pics-id');

                console.log('$picsid :: ' + $picsid);
                if ($picsid !== undefined) return;

                console.log('$preview_src :: ' + $preview_src);
                if ($preview_src == "") {
                    console.log('AAA');
                    return;
                } else {
                    console.log('BBB');
                    if ($this.var.page_position === 'cleanriver') {

                        let $dt_el = $('#' + $whichone + '-datetime')
                        , $dt_val = $dt_el[0].value
                        , $dt_format = '';
                        if ($dt_val == "") {
                            e.preventDefault();
                            e.stopPropagation();
                            return alert('請選擇拍攝時間');
                        }

                        $dt_format = moment($dt_val).format('YYYY-MM-DD HH:mm:ss');
                        console.log($dt_format);
                        $preview_element.attr('data-dt', $dt_format);
                    }
                    if ($li_pic_el.getAttribute('data-img-status') === "preview") {
                        e.preventDefault();
                        e.stopPropagation();
                        // $this.var.img_file.datas[$tempid]['file_create_time'] = $dt_format;
                        return $this.doImgSync($preview_el);
                    }
                }
            });

            // common pic
            $this.el.$theform.on('change', 'input.pic-upload[type="file"]', function(e) {
                console.log("input.pic-upload ON change'");
                if ($this.var.img_file.status != '') return alert('照片處理中');

                let $current = e.currentTarget
                , $whichone = $current.getAttribute('id')
                , $li_pic_el = $current.closest('li.pic')
                , $preview_el = 'preview_' + $whichone
                , $tempid = $this.var.img_file.counter
                , $newone = true
                , $multiple_way = ($($current).hasClass('multiple_way'))?true:false;

                $this.var.form_data.pics.temp_id = $whichone;

                console.log($('#' + $preview_el).attr('data-tempid'));
                if ($('#' + $preview_el).attr('data-tempid') !== undefined) {
                    $tempid = $('#' + $preview_el).attr('data-tempid');
                    console.log($tempid);
                    $newone = false;
                }
                console.log($tempid);
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
                                , latlng = calGPS(this.exifdata)
                                , lat = latlng['latitude'] // 經度
                                , lng = latlng['longitude'] // 緯度
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
                            // console.log(exif);
                            // console.log('exifLong : ' + exifLong);
                            // console.log('exifLongRef : ' + exifLongRef);
                            // console.log('exifLat : ' + exifLat);
                            // console.log('exifLatRef : ' + exifLatRef);

                            if (exifLong !== undefined) {
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
                            } else {
                                latitude = longitude = "";
                            }
                            return {'latitude': latitude, 'longitude': longitude};
                        }
                        // =-=-=-=-=-=-=-=-=-=-=
                    });
                }

                // do compress
                handleImageUpload(file);
                async function handleImageUpload(file) {
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
                            // console.log(reader.result);
                            let base64data = reader.result,
                            $b64 = $this.var.img_file.datas[$tempid].image = base64data;
                            console.log('reader.onloadend reader.onloadend reader.onloadend');

                            console.log('$newone :: ' + $newone)
                            console.log('$multiple_way :: ' + $multiple_way)
                            // if ($this.var.page_position === 'cleanriver' || !$newone) {
                            if (!$multiple_way || !$newone) { // do CleanRiver
                                console.log('inhere inhere inhere inhere inhere inhere');
                                let output = document.getElementById($preview_el);
                                output.src = $b64;
                                output.setAttribute("data-tempid", $tempid);
                                $li_pic_el.setAttribute('data-img-status', 'preview'); // set the li is have a preview
                            } else { // do cleanOcean
                                // let _target = $this.el.$form_filed.album_ul
                                let _target = $this.el.$pics.$filed_album_pic
                                , _template = $this.var.$temp_formocean_li;

                                _template = _template
                                .replace(/\[ID\]/g, $tempid)
                                .replace(/\[SRC\]/g, '')
                                .replace(/\[STATUS\]/g, 'preview')
                                .replace(/data-src/g, 'src');
                                _target.after(_template);

                                $preview_el = 'preview_album_pic_' + $tempid;
                                let output = document.getElementById($preview_el);
                                output.src = $b64;
                                output.setAttribute("data-tempid", $tempid);
                            }
                            // if ($this.var.page_position === 'cleanriver') $li_pic_el.setAttribute('data-img-status', 'preview'); // set the li is have a preview

                            // step3, 前置完成，處理上傳 do api call
                            // if ($this.var.page_position === 'cleanriver' && ($('#' + $preview_el).attr('data-pics-id') == '' || $('#' + $preview_el).attr('data-pics-id') === undefined)) {
                            console.log('beforebefore doImgSync');
                            if ($('#' + $preview_el).attr('data-pics-id') == '' || $('#' + $preview_el).attr('data-pics-id') === undefined) {
                                console.log($('#' + $preview_el).attr('data-pics-id'));
                                return;
                            }
                            console.log('before doImgSync');
                            // return; // 斷開這裡的doImgSync，則改為全部要按在上傳步驟
                            $this.doImgSync($preview_el);
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
            });
            $this.el.$theform.on('click', '.btn-pic-delete', function(e) {
                console.log("do pic 'delete'");

                let $current = e.currentTarget
                , $whichone = $current.closest('li')
                , $li_pic_el = $whichone
                , $pid = $whichone.getAttribute('data-pid')
                , $preview_el = $('#preview_' + $pid)
                , $tempid = $preview_el.attr('data-tempid')
                // , $delete_id = $this.var.img_file.datas[$tempid]['response']['id']
                , $delete_id = $preview_el.attr('data-pics-id');

                $this.var.form_data.pics.temp_id = $pid;

                console.log($delete_id);
                console.log($this.var.img_file.datas);
                console.log($tempid);
                $this.checkPicsIsFull('-1');

                // clean data
                $preview_el.attr(
                    {
                        'src': '',
                        'data-tempid': '',
                        'data-dt': ''
                    }
                );
                delete $this.var.img_file.datas[$tempid];
                $li_pic_el.removeAttribute("data-img-status"); // set the li is have a preview or not than remove

                // if ocean remove li
                if (($this.var.page_position === 'cleanocean') && ($pid !== 'featured_id')) $whichone.remove();

                // call api // ajax url
                var _url = $this.api.url + $this.api.path.delete_pic;
                if (window._comm.$testMode) _url += "/?key=" + $this.api.param.key; // 測試用，上線刪掉 for test
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
                    // console.log(_r);
                }
                // console.log($id);
            });

            // common select limit 3 selected
            $this.el.$theform.on('change', 'select[max]', function (e) {
                let $target = $(e.target)
                , $limit = $target.attr('max')
                , $options = $target.find('option:selected')
                , $selectLength = $options.length;
                if ($selectLength > $limit) {
                    alert('最多選' + $limit + '個');
                    $options[$limit].selected = false ;
                    return false;
                }
            });

            // common input number only input interge
            $this.el.$theform.on('input', 'input[type="number"]', function () {
                return this.value = Math.round(this.value);
            });

            // $this.el.$btn_draft.on('click', function() {
            //     console.log('save to draft');
            //     // send the data to api // API
            //     alert('已儲存草稿');
            // });

            $this.el.$btn_confirm_submit.on('click', function() {
                console.log('open confirm popup');
                if ($this.var.img_file.status != '') return alert('照片處理中');
                $this.el.$popup_form_confirm.attr('data-confirmed', 'loading');

                // send the data to api // API
                // call api // ajax url
                var _url = $this.api.url + $this.api.path.save_form;
                if (window._comm.$testMode) _url += "/?key=" + $this.api.param.key; // 測試用，上線刪掉 for test
                console.log(_url);

                console.log($this.api.data);
                console.log($this.var.form_data);
                let _data = Object.assign({}, $this.api.data, $this.var.form_data, {});
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
                            let $err = response.messages;
                            console.log($err);
                            for ($prop in $err) {
                                console.log($err[$prop]);
                                if ($err[$prop][0] === undefined) break;
                                let $title = $('label[for="filed-' + $err[$prop][1] + '"]').html()
                                , $err_msg = '<li><label>' + (($title === undefined)?"":$title.trim()) + '</label>：<label>' + $err[$prop][0] + '</label></li>';
                                $this.el.$popup_form_error_box.append($err_msg);
                            }
                            $('.popup_inner[data-status="confirm"]').scrollTop(0);
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
                $this.formConfirm();
                // alert('資料已儲存');
            });

            // river // ocean
            $this.el.$btn_confirm_newone.on('click', function() {
                console.log('ocean, refresh the page. (set clean before the "new" one)');
                location.href = location.protocol + '//' + location.host + location.pathname;
            });

            // ocean
            $this.el.$btn_confirm_finish.on('click', function() {
                console.log('ocean, refresh the page.');
                location.href = location.protocol + '//' + location.host + location.pathname;
            });
        },
        doImgSync: function(preview_el) {
            console.log('doImgSync');
            let $this = this
            , $preview_el = preview_el
            , $preview_element = $('#' + $preview_el)
            , $tempid = $preview_element.attr('data-tempid')
            , $li_pic_el = $preview_element.closest('li.pic');
            console.log($tempid);
            console.log($this.var.img_file['datas']);

            if ($this.var.page_position == 'cleanriver') {
                let $dt = $preview_element.attr('data-dt');
                console.log($dt);
                if ($dt != "" || $dt !== undefined) {
                    console.log($dt);
                    $this.var.img_file.datas[$tempid]['file_create_time'] = $dt;
                }
            }

            $this.var.img_file.status = 'uploading';
            $this.checkPicsIsFull('+1');

            // call api // ajax url
            var _url = $this.api.url + $this.api.path.upload_pic;
            if (window._comm.$testMode) _url += "/?key=" + $this.api.param.key; // 測試用，上線刪掉 for test
            console.log(_url);

            let _data = {
                ...($this.api.data),
                ...($this.var.img_file.datas[$tempid])
            };
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
                    } else {
                        alert(response.messages[0]);
                    }
                    return;
                },
                error: function(response) {
                    console.log("error");
                    console.log(response);
                }
            });

            function doSuccess(_r) { // to get upload img id
                console.log(_r);
                $this.var.img_file.status = '';

                console.log($preview_el);
                $preview_element.attr('data-pics-id', _r.id);
                $li_pic_el.attr('data-img-status', 'uploaded');

                $this.var.img_file['datas'][$tempid]['response'] = _r;
                $this.var.img_file.counter += 1;

                return alert('照片上傳更新完成');
            }
        },

        // 確認 form 表狀態
        checkStatus: function() {
            let $this = this;
            // checking
            let url_code = window.helper.getUrlParams(window.location.href, 'code') || ''
            , url_settingId = window.helper.getUrlParams(window.location.href, 'setting_id') || '';
            console.log(url_code);
            console.log(url_settingId);

            $this.api.data.code = url_code;
            $this.api.data.setting_id = url_settingId;
            console.log($this.api.data);

            // checking status, than set up status
            // 確認表單是否為view的狀態
            if ($this.var.page_status == 'view') {
                $this.var.form_status = 'view';
                window._comm.$user.id = 0;
                console.log(window._comm.$user.id);
                $this.var.page_title = $this.el.$page_title.html();
            } else if ($this.var.page_status == 'form') {
                if ($this.api.data.code == '') {
                    $this.var.form_status = 'add';
                    $this.var.page_title = $this.el.$page_title.html() + ' - 新增';
                    $this.el.$theform_is_edit.remove();
                } else {
                    $this.var.form_status = 'edit';
                    $this.var.page_title = $this.el.$page_title.html() + ' - 修改';
                    $this.el.$theform_is_new.remove();
                }
            }

            $this.api.data.user_id = window._comm.$user.id;
            if ($this.var.page_position == 'cleanriver') {
                $this.openFirstPopup();
            } else {
                console.log($this.var.page_position);
                $this.formShowup();
            }


            /*{
                if ((this.var.page_position === "cleanocean" && url_code)
                    ||
                    (this.var.page_position === "cleanriver" && url_code && url_settingId)) {
                    $this.api.data.code = url_code;
                    $this.api.data.setting_id = url_settingId || "";
                    console.log($this.api.data)
                    // 確認表單是否為view的狀態
                    if ($this.var.page_status == 'view') {
                        $this.var.form_status = 'view';
                        window._comm.$user.id = 0;
                        $this.var.page_title = $this.el.$page_title.html();
                    } else if ($this.var.page_status == 'form') {
                        $this.var.form_status = 'edit';
                        $this.var.page_title = $this.el.$page_title.html() + ' - 修改';
                        $this.el.$theform_is_new.remove();
                    }
                    $this.formShowup();
                } else {
                    if ($this.var.page_status == 'view') {
                        console.log(this.var.page_position);
                        return alert('導回首頁');
                    }
                    $this.var.form_status = 'add';
                    $this.var.page_title = $this.el.$page_title.html() + ' - 新增';
                    $this.el.$theform_is_edit.remove();

                    if ($this.var.page_position == 'cleanriver') {
                        $this.openFirstPopup();
                    } else {
                        $this.formShowup();
                    }
                }
            }*/


            $this.el.$body.attr('data-form', $this.var.form_status);

            $this.el.$page_title.html($this.var.page_title);
            $this.el.$thetitle.html($this.var.page_title);
            $this.el.$thetitle.attr('data-storke', $this.var.page_title);

            return;
        },

        // 前置作業處理好，執行 call api，再完畢，即可顯示表單
        formShowup: function() {
            let $this = this;
            console.log("showup");

            // call api // ajax url
            var _url = $this.api.url + $this.api.path.init_form;
            if (window._comm.$testMode) _url += "/?key=" + $this.api.param.key; // 測試用，上線刪掉 for test
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
                    } else {
                        // alert(response.messages[0]);
                        console.log(window._comm.$user.id);
                        // alert((window._comm.$user.id === '-1')?'請先登入':response.messages[0]);
                        alert(response.messages[0]);
                        return location.href = location.protocol + '//' + location.host + '/' + $this.var.page_position + '/' + $this.var.page_position.substring(5) + '.html';
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
                $this.var.form_data['pics']['max'] = _r_set.upload_num || 0;
                // if ($this.var.page_position == 'cleanocean') {
                //     $this.var.form_data['upload_num'] = _r_set.upload_num;
                // }

                // console.log('upload_num :: ' + $this.var.form_data['pics']['max']);
                // $this.var.form_data['pics']['max'] = 2; // for test
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
                        , _size = _source.length // option 數量
                        , _template_option = window.helper.getTemplate('select_option')
                        , _templates = '';

                        if (_is_multiple == 1) _target.attr({ 'multiple': 'multiple', 'size': _size });

                        for ($prop in _source) {
                            let _template = _template_option;
                            _template = _template
                            .replace(/\[VALUE\]/g, _source[$prop])
                            .replace(/\[OPTION\]/g, _source[$prop]);
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

                                    _temp = _temp
                                    .replace(/\[ID\]/g, 'filed-' + $li['field_data']['field_id'])
                                    .replace(/\[NAME\]/g, $li['field_data']['field_id'])
                                    .replace(/\[TITLE\]/g, $li['field_title'])
                                    .replace(/\[VALUE\]/g, '')
                                    .replace(/\[HINT\]/g, $li['field_hint'])
                                    .replace(/\[required\]/g, ($li['is_required'] === 1)?'required':'')

                                    .replace(/\[MAXLENGTH\]/g, $li['field_data']['text_maxlength']);

                                    $content += _temp;
                                    break;
                                case 'number':
                                    var _template_number = window.helper.getTemplate('input_number')
                                    , _temp = _template_number;

                                    _temp = _temp.replace(/\[ID\]/g, 'filed-' + $li['field_data']['field_id'])
                                    .replace(/\[NAME\]/g, $li['field_data']['field_id'])
                                    .replace(/\[TITLE\]/g, $li['field_title'])
                                    .replace(/\[VALUE\]/g, '')
                                    .replace(/\[HINT\]/g, $li['field_hint'])
                                    .replace(/\[required\]/g, ($li['is_required'] === 1)?'required':'')

                                    .replace(/\[MAX\]/g, $li['field_data']['number_max'])
                                    .replace(/\[MIN\]/g, $li['field_data']['number_min']);

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

                                    _temp = _temp
                                    .replace(/\[ID\]/g, 'filed-' + $li['field_data']['field_id'])
                                    .replace(/\[NAME\]/g, $li['field_data']['field_id'])
                                    .replace(/\[TITLE\]/g, $li['field_title'])
                                    .replace(/\[VALUE\]/g, '')
                                    .replace(/\[HINT\]/g, $li['field_hint'])
                                    .replace(/\[required\]/g, ($li['is_required'] === 1)?'required':'');

                                    for ($opt in $options) {
                                        let _temp_opt = _template_select_opt;
                                        _temp_opt = _temp_opt
                                        .replace(/\[VALUE\]/g, $options[$opt])
                                        .replace(/\[OPTION\]/g, $options[$opt]);
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
                    $album = _r_data['album_pics'];

                    if (_r_data['featured_id'] !== undefined) $this.var.form_data.album_used.push(_r_data['featured_id']);
                    if (_r_data['r_pic_id'] !== undefined) $this.var.form_data.album_used.push(_r_data['r_pic_id']);
                    if (_r_data['h_pic_id'] !== undefined) $this.var.form_data.album_used.push(_r_data['h_pic_id']);
                    if (_r_data['d_pic_id'] !== undefined) $this.var.form_data.album_used.push(_r_data['d_pic_id']);

                    // album_pics // extra_data // status // is_public
                    for ($prop in _r_data) {
                        var $name = $prop
                        , $value = _r_data[$name];

                        // console.log("@@@@@@@@@@");
                        // console.log($name);
                        // console.log($value);
                        // console.log("@@@@@@@@@@");

                        // if ($name === "user_name" && $value === "0") $value = window._comm.$user.name;

                        var $el = $this.el.$theform.find('[name="' + $name + '"]');
                        if ($name == "album_pics") {
                            // continue; // for test
                            if ($album.length == 0) continue;
                            let _target = $this.el.$pics.$filed_album_pic;

                            for ($pic in $album) {
                                if ($this.var.form_data.album_used.includes($pic)) continue;
                                $this.checkPicsIsFull('+1');
                                if ($this.var.form_data['pics']['current'] > $this.var.form_data['pics']['max']) break;

                                let _template = $this.var.$temp_formocean_li;
                                if ($this.var.page_position === 'cleanocean' && $this.var.form_status === 'view') {
                                    _target = $this.el.$form_filed.album_ul.find('.filed-album_pics-wrapper');
                                    _template = window.helper.getTemplate('form_ocean__album_pic_view');
                                }
                                _template = _template
                                .replace(/\[ID\]/g, $pic)
                                .replace(/\[SRC\]/g, $album[$pic].url)
                                .replace(/\[data-pics-id\]/g, 'data-pics-id="' + $pic + '"')
                                .replace(/\[STATUS\]/g, 'uploaded')
                                .replace(/data-src/g, 'src');
                                _target.after(_template);
                            }
                            console.log($this.var.form_data['pics'])
                        } else if ($name == "featured_id" || $name == "r_pic_id" || $name == "h_pic_id" || $name == "d_pic_id") {
                            // continue; // for test
                            // console.log('pic :: $name :: ' + $name);
                            // console.log('pic :: $value :: ' + $value);
                            if ($album.length == 0) continue;
                            if ($album[$value] === undefined) continue;
                            let $src = $album[$value].url;
                            $this.var.form_data[$name] = $album[$value].id;
                            // if ($this.var.form_status === 'view') $el.attr('value', $src);
                            // else $el.val($src);
                            $el.attr('value', $src);
                            $this.el.$theform.find('#preview_' + $name).attr({'src': $src, 'data-pics-id': $album[$value].id});
                        } else if ($name == "extra_data") {
                            // console.log('extra_data :: $name :: ' + $name);
                            // console.log('extra_data :: $value :: ' + $value);
                            for ($prop_extra in $value) {
                                $name = $prop_extra;
                                $val = $value[$name];
                                $el = $this.el.$theform.find('[name="' + $name + '"]');
                                if ($this.var.form_status === 'view') $el.attr('value', $val);
                                else $el.val($val);
                            }
                            continue;
                        } else {
                            // console.log('common :: $name :: ' + $name);
                            // console.log('common :: $value :: ' + $value);
                            $el = $this.el.$theform.find('[name="' + $name + '"]');
                            // console.log($value);
                            if ($this.var.form_status === 'view') $el.val($value);
                            else $el.val($value);
                        }
                    }
                    if (($this.el.$theform.find('[name="user_name"]').html() === "") || ($this.el.$theform.find('[name="user_name"]').html() === "0")) $this.el.$theform.find('[name="user_name"]').val(window._comm.$user.name);
                    if (($this.el.$theform.find('[name="user_email"]').html() === "") || ($this.el.$theform.find('[name="user_email"]').html() === "0")) $this.el.$theform.find('[name="user_email"]').val(window._comm.$user.email);
                }

                yesShowUp();
                async function yesShowUp() {
                    if ($this.var.form_status === 'view') {
                        if ($this.var.page_position === 'cleanocean') {
                            console.log('yesShowUp');
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
                        $this.el.$theform.find('input').attr("readonly", "readonly");
                        $this.el.$theform.find('select').attr("disabled", true)
                    }

                    return window.setTimeout(( () => {
                        console.log('data checked');
                        $this.el.$theform.removeClass('display-none');
                        $this.el.$loading.removeClass('active');
                    }), 500);
                }
            }
        },
        checkPicsIsFull: function(_count) {
            // console.log('checkPicsIsFull');
            let $this = this;

            if (/featured_id|r_pic_id|h_pic_id|d_pic_id/.test($this.var.form_data.pics.temp_id)) return;

            switch (_count) {
                case '+1':
                    $this.var.form_data['pics']['current'] += 1;
                break;
                case '-1':
                    $this.var.form_data['pics']['current'] -= 1;
                break;
            }

            let $current = $this.var.form_data['pics']['current']
            , $max = $this.var.form_data['pics']['max'];

            // console.log('current :: ' + $this.var.form_data['pics']['current']);
            // console.log('max :: ' + $this.var.form_data['pics']['max']);
            // console.log('current / max :: ' + $current + '/' + $max);
            if ($current >= $max) $this.el.$pics.$album_pic.addClass('display-none-i');
            else $this.el.$pics.$album_pic.removeClass('display-none-i');
            return;
        },

        // first to confirm in the popup, 處理 form 表第一次按送出，整理成清單列表的處理
        formConfirm: function() {
            console.log('formConfirm');
            let $this = this;
            let $temp = '';
            let $data_serialize = {};
            console.log($this.el.$theform.serializeArray());
            $.each($this.el.$theform.serializeArray(), function() {
                // console.log(this.name);
                // console.log(this.value);
                let $el = $('[name="' + this.name + '"]');
                if ($el.is('select') && $el[0].hasAttribute('multiple')) {
                    if (!Array.isArray($data_serialize[this.name])) $data_serialize[this.name] = []
                    $data_serialize[this.name].push(this.value);

                    $max = $el.attr('max');
                    if ($max !== undefined && $data_serialize[this.name].length === $max) return false; // same as 'break'
                } else {
                    // console.log(this.name);
                    // console.log(this.value);
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
                // console.log($this.var.img_file.datas[i]);
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

                if (/_pic_id|album_pics/.test($key)) continue; // (/_pic_id|album_pics/.test($key)) 跳過先不處理

                if (/status/.test($key)) $value = (($value === '0')?"草稿":"正式發佈");
                if (/is_public/.test($key)) $value = (($value === '0')?"不公開":"公開");

                if ($key == 'bottle' || $key == 'occlusion_scope') { $temp += '</ul><hr><ul>'; }

                $temp += '<li data-label="' + $key + '"><label>' + $label + '</label><label>' + $value + '</label></li>';
            };
            $temp += '</ul>';

            // pics
            // $temp += '<hr><ul class="pics">';
            // $temp += '<li><img src="' + $('#preview_album_pics').attr('src') + '"></li>'

            $temp += '</ul>';

            // console.log($this.var.form_data);
            $this.el.$popup_form_confirm.find('.popup_list').html($temp);
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
                            _template = _template
                            .replace(/\[ID\]/g, _source[$prop]['id'])
                            .replace(/\[VALUE\]/g, _source[$prop]['city'] + '-' + _source[$prop]['river_name'])
                            .replace(/\[disabled\]/g, (_source[$prop]['status'] == 0)?'disabled':'');
                            _templates += _template;
                        }
                        _target.html(_templates);
                    }
                });
            }
        },

        // the map，經緯度地圖
        setTheMap: function() {
            // if ($('#themap').length == 0) return;
            /* map */
            var default_latlng = [25.042385, 121.533012];
            var _map = L.map('themap').setView(default_latlng, 18);
            // initialize the map on the "map" div with a given center and zoom

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(_map);
            var _layer = L.marker(default_latlng).addTo(_map).bindPopup('預設位置 <br> <b>內政部資訊中心</b>').openPopup();
            var _ajaxLock = false;
            $this.el.$btn_themap_close.on('click', function() {
                console.log('$btn_themap_close');
                $('#form-themap').popup('hide');
            });
            _map.on('click', function(ev) {
                if(!_ajaxLock){
                    _ajaxLock = true;
                    console.log(ev.latlng);
                    setLatLng(ev.latlng.lat,ev.latlng.lng);
                }
                function setLatLng(latitude,longitude) {

                    // document.getElementById("filed-lat").value = latitude;
                    // document.getElementById("filed-lng").value = longitude;
                    // document.getElementById("themap-lat").html = latitude;
                    // document.getElementById("themap-lng").html = longitude;

                    $("#filed-lat").val(latitude);
                    $("#filed-lng").val(longitude);
                    $("#themap-lat").html(latitude);
                    $("#themap-lng").html(longitude);

                    var latlng = {lat: latitude, lng: longitude};
                    // map pan to

                    _layer.remove();
                    var url = "https://nominatim.openstreetmap.org/reverse?format=geocodejson&lat="+latitude+"&lon="+longitude+"";

                    $.ajax({
                        url: url,//地址
                        dataType: 'json',//返回数据类型
                        contentType: 'application/json',//提交数据类型
                        type: 'GET',//请求方式
                        timeout: 30000,//超时
                        //请求成功
                        success: function (res) {
                            console.log(res);
                            var geocoding = res.features[0].properties.geocoding;
                            console.log(geocoding);

                            // map add marker
                            // _showJSON = JSON.stringify(geocoding);
                            _showAry = geocoding.label.split(',').reverse();
                            _showName = _showAry.pop();
                            _showAddr = _showAry.toString().replace(/\,/g, "").replace(/\s/g, '');

                            _layer = L.marker(latlng).addTo(_map).bindPopup("<span style='font-weight:bold;'>" + _showName + "</span><br/>" + _showAddr).openPopup();
                            _map.panTo(latlng);
                            _ajaxLock = false;
                        },
                        error: function (res) {
                            console.log(res);
                            console.log(res.msessage);
                            console.log(res.error_code);
                            alert('取地址 API 錯誤，請稍後再試');
                            _ajaxLock = false;
                        }
                    });
                }
            });
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
            $this.el.$popup_form_themap.popup({
                escape: true,
                closebutton: true,
                scrolllock: true,
                blur: true,
                onopen: function() {
                    $this.setTheMap();
                }
            });
        },
    };
    FORM.init();
});
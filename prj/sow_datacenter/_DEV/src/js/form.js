$(function() {
    var FORM = {
        env: 'html',
        el: {
            $page_title: $('head title'),
            $window: $(window),
            $doc: $(document),
            $body: $('body'),

            $thetitle: $('#thetitle h1'),
            $theform: $('#theform'),
            $loading: $('#loading'),

            $form_btns: $('#form-btns'),

            $pics: {
                $pic_upload: $('input.pic-upload[type="file"]'),
                $r_pic: $('#r_pic'),
                $h_pic: $('#h_pic'),
                $d_pic: $('#d_pic'),
                $album_pics_1: $('#album_pics_1'),
                $album_pics_2: $('#album_pics_2'),
            },

            $btn_draft: $('#btn-form-draft'),
            $btn_save: $('#btn-form-save'),
            $btn_confirm_submit: $('#btn-confirm-submit'),
            $btn_confirm_newone: $('#btn-confirm-newone'),
            $btn_select_submit: $('#btn-select-submit'),

            $popup_form_select: $('#form-select'),
            $popup_form_confirm: $('#form-confirm'),

            $theform_is_new: $('#theform_is_new'),
            $theform_is_edit: $('#theform_is_edit'),

            // popup
            $formriver_select: $('#formriver_select'),
        },
        var: {
            page_status: '', // form/view
            page_position: '', // cleanocean/cleanriver
            form_status: '', // add/edit

            form_select_value: '',
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
                $this.var.form_select_value = $this.el.$formriver_select.val();

                // show up the form
                if ($this.var.form_select_value !== 0 || $this.var.form_select_value !== "") {
                    $('#form-select').popup('hide');
                    console.log($this.var.form_select_value);
                    $this.formShowup();
                }
            });

            $this.el.$pics.$pic_upload.on('change', function() {
                let $current = event.currentTarget;
                let $whichone = $current.getAttribute('id');
                let $preview_el = 'preview_' + $whichone;
                let $base64 = '';

                var reader = new FileReader();
                reader.onload = function() {
                    var output = document.getElementById($preview_el);
                    output.src = reader.result;
                    $base64 = output.src;
                }
                reader.readAsDataURL(event.target.files[0]);

                // do pic sync api
                // console.log($base64);
            });

            $this.el.$btn_draft.on('click', function() {
                console.log('save to draft');
                // send the data to api // API
                alert('已儲存草稿');
            });

            $this.el.$btn_confirm_submit.on('click', function() {
                console.log('open confirm popup');
                $this.el.$popup_form_confirm.attr('data-confirmed', 1);
                // send the data to api // API
            });

            $this.el.$btn_confirm_newone.on('click', function() {
                console.log('set clean before the new one');
                location.href = location.protocol + '//' + location.host + location.pathname;
            });

            $this.el.$btn_save.on('click', function() {
                console.log('the data be save');
                // send the data to api // API
                alert('資料已儲存');
            });
        },
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

                if ($this.var.page_position == 'river') {
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
        //
        formShowup: function() {
            let $this = this;
            console.log('showup');

            // call api

            window.setTimeout(( () => {
                console.log('data checked');
                $this.el.$theform.removeClass('display-none');
                $this.el.$loading.removeClass('active');
            }), 500);
        },
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

        formConfirm: function() {
            let $this = this;
            let $temp = '';
            $data = $this.el.$theform.serializeArray();

            $temp += '<ul>';
            if (this.var.page_position == 'cleanocean') {
                $.each($data, function(i, field){
                    // console.log(i);
                    // console.log(field.name + ":" + field.value + " ");
                    let $label = $('label[for="filed-' + field.name + '"]').text().trim();
                    let $value = field.value;
                    if (field.name == 'bottle') {
                        $temp += '</ul><hr><ul>';
                    }
                    $temp += '<li data-label="' + field.name + '"><label>' + $label + '</label><label>' + $value + '</label></li>';
                });
                $temp += '</ul>';

                // pics
                // $temp += '<hr><ul class="pics">';
                // $temp += '<li><img src="' + $('#preview_album_pics').attr('src') + '"></li>'

            } else if (this.var.page_position == 'cleanriver') {
                $.each($data, function(i, field){
                    console.log(i);
                    console.log(field.name + ":" + field.value + " ");
                    let $label = $('label[for="filed-' + field.name + '"]').text().trim();
                    let $value = field.value;
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

            $this.el.$popup_form_confirm.find('.popup_list').html($temp);
        },
        setPopup: function() {
            let $this = this;
            $this.el.$popup_form_confirm.popup({
                escape: false,
                closebutton: true,
                scrolllock: true,
                onopen: function() {
                    $this.formConfirm();
                }
            });
        },

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
                        _template = _template.replace(/\[ID\]/g,  _source[$prop]['id']);
                        _template = _template.replace(/\[VALUE\]/g,  _source[$prop]['value']);
                        _templates += _template;
                    }
                    _target.html(_templates);
                }
            });
        }

    };
    FORM.init();
});
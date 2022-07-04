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

            $btn_draft: $('#btn-draft'),
            $btn_submit: $('#btn-submit'),
            $btn_newone: $('#btn-newone'),
            $btn_save: $('#btn-save'),

            $popup_form_confirm: $('#form-confirm'),

            $theform_is_new: $('#theform_is_new'),
            $theform_is_edit: $('#theform_is_edit'),
        },
        var: {
            page_status: '',
            page_position: '',
            form_status: '',
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

            $this.el.$btn_submit.on('click', function() {
                console.log('open confirm popup');
                $this.el.$popup_form_confirm.attr('data-confirmed', 1);
                // send the data to api // API
            });

            $this.el.$btn_newone.on('click', function() {
                console.log('set clean before the new one');
                location.href = location.protocol + '//' + location.host + location.pathname;
            });

            $this.el.$btn_save.on('click', function() {
                console.log('the data be save');
                // send the data to api // API
                alert('資料已儲存');
            })
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
                    ifisview();
                } else if ($this.var.page_status == 'form') {
                    $this.var.form_status = 'edit';
                    $page_title = $this.el.$page_title.html() + ' - 修改';
                    $this.el.$theform_is_new.remove();
                }
            } else {
                if ($this.var.page_status == 'view') {
                    console.log(this.var.page_position);
                    return alert('導回首頁');
                }
                $this.var.form_status = 'add';
                $page_title = $this.el.$page_title.html() + ' - 新增';
                $this.el.$theform_is_edit.remove();
            }
            $this.el.$body.attr('data-form', $this.var.form_status);

            $this.el.$page_title.html($page_title);
            $this.el.$thetitle.html($page_title);
            $this.el.$thetitle.attr('data-storke', $page_title);
            showup();

            //
            function showup() {
                console.log('showup');
                window.setTimeout(( () => {
                    console.log('data checked');
                    $this.el.$theform.removeClass('display-none');
                    $this.el.$loading.removeClass('active');
                }), 500);
            }
            function ifisview() {
                console.log('ifisview');
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
            }
            return;
        },
        formConfirm: function() {
            let $this = this;
            let $temp = '';
            $data = $this.el.$theform.serializeArray();

            $temp += '<ul>';
            if (this.var.page_position == 'cleanocean') {
                $.each($data, function(i, field){
                    console.log(i);
                    console.log(field.name + ":" + field.value + " ");
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
            // function onOpenAlbum() {
            //     console.log("onOpenAlbum");
            //     console.log($this.el.$selectAll);
            // }
        },
    };
    FORM.init();
});
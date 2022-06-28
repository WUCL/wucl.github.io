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
            }
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
                }
            } else {
                if ($this.var.page_status == 'view') {
                    console.log(this.var.page_position);
                    return alert('導回首頁');
                }
                $this.var.form_status = 'add';
                $page_title = $this.el.$page_title.html() + ' - 新增';
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
        }
    };
    FORM.init();
});
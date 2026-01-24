$(function() {
    var MAIN = {
        env: 'html',
        el: {
            $window: $(window),
            $doc: $(document),
            $body: $('body'),
            $header: $('#header'),
            $main: $('#main'),
            $footer: $('#footer'),

            $btn_more: $('#btn-more'),

            $ytimg: $('.ytimg'),
        },
        var: {
        },
        init: function() {
            if ('scrollRestoration' in history) { history.scrollRestoration = 'manual'; }
            this.el.$body.addClass(deviceObj.name);
            this.bindEvent();
        },
        bindEvent: function() {
            let $this = this;

            // btn-more
            $this.el.$btn_more.on('click', function(e) {
                e.preventDefault();

                // 往上尋找最近的 section._jp_info
                var $section = $(this).closest('section._jp_info');

                // 切換 _more class
                $section.toggleClass('_more');

                // 專業細節：如果是縮回去(現在不含 _more)，自動捲動回 section 頂部
                // if (!$section.hasClass('_more')) {
                //     $('html, body').animate({
                //         scrollTop: $section.offset().top - 100 // 減 100 是預留上方空間
                //     }, 500);
                // }
            });
            // ytimg
            $this.el.$ytimg.on('click', function() {
                let ytid = $(this).attr('data-youtube-id');
                console.log(ytid);

// <iframe width="560" height="315" src="https://www.youtube.com/embed/1mNctcAyEEc?si=AwgGHlNBsQrDZ7aC" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

                let video =
                  ''
                  + '<iframe width="100%" class="ytimg_video ' + ytid + '"'
                  + 'src="'+ $(this).attr('data-video') +'"'
                  + 'allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin"'
                  + ' webkitAllowFullScreen mozallowfullscreen allowFullScreen'
                  + ' frameBorder="0" data-ytid="' + ytid + '"></iframe>';

                // $(this).replaceWith(video);
                $(this).addClass('_with_iframe').append(video);
            });
        },
    };
    MAIN.init();
});
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
            $this.el.$btn_more.on('click', function() {
                if ($this.el.$box_more.attr('data-more') == 0) $this.el.$box_more.attr('data-more', 1);
                else $this.el.$box_more.attr('data-more', 0);
                return;
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
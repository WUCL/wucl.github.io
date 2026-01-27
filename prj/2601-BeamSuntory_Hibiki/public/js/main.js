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
                // if (!$section.hasClass('_more')) {
                //     window.scrollTo({
                //         top:  $('.content._jp_artisan').offset().top - 180,
                //         behavior: 'smooth' // 這就是滑動感的關鍵
                //     });
                // }

                // 專業細節：如果是縮回去(現在不含 _more)，自動捲動回 section 頂部
                // if (!$section.hasClass('_more')) {
                //     $('html, body').animate({
                //         scrollTop: $section.offset().top - 100 // 減 100 是預留上方空間
                //     }, 500);
                // }
            });
            // // ytimg
            // $this.el.$ytimg.on('click', function() {
            //     let ytid = $(this).attr('data-youtube-id'); // 目前點擊的那部 ID
            //     let playlistIds = ['Bl0wCc87ZSE', '7z0i-BJSTCY'];

            //     let video =
            //       ''
            //       + '<iframe width="100%" class="ytimg_video ' + ytid + '"'
            //       + 'src="'+ $(this).attr('data-video') +'"'
            //       + 'allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin"'
            //       + ' webkitAllowFullScreen mozallowfullscreen allowFullScreen'
            //       + ' frameBorder="0" data-ytid="' + ytid + '"></iframe>';

            //     // $(this).replaceWith(video);
            //     $(this).addClass('_with_iframe').append(video);
            // });

            $this.el.$ytimg.on('click', function() {
                if ($(this).hasClass('_with_iframe')) return;

                // 1. 取得清單
                let playlistAttr = $(this).attr('data-playlist') || '';
                let ids = playlistAttr.split(',').filter(id => id.trim() !== '');
                if (ids.length === 0) return;

                let firstId = ids[0];

                // 2. 基礎參數設定
                let params = [
                    'autoplay=1',
                    'rel=0',
                    'modestbranding=1',
                    'loop=1' // 開啟循環播放
                ];

                // 3. 循環邏輯處理
                // YouTube 規定：要循環播放，必須在 playlist 參數中填入要循環的 IDs
                if (ids.length > 1) { // 多部影片輪播循環
                    params.push('playlist=' + ids.join(','));
                } else { // 單部影片無限循環，也要把自己的 ID 傳給 playlist 參數，loop 才會生效
                    params.push('playlist=' + firstId);
                }

                // <iframe width="560" height="315" src="https://www.youtube.com/embed/1mNctcAyEEc?si=AwgGHlNBsQrDZ7aC" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
                let videoSrc = 'https://www.youtube.com/embed/' + firstId + '?' + params.join('&');

                let video = `
                    <iframe
                        width="100%"
                        class="ytimg_video"
                        src="${videoSrc}"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerpolicy="strict-origin-when-cross-origin"
                        webkitAllowFullScreen mozallowfullscreen allowFullScreen
                        frameBorder="0">
                    </iframe>`;

                $(this).addClass('_with_iframe').append(video);
            });
        },
    };
    MAIN.init();
});
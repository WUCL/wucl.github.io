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
            this.autoLoadYoutube();
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
            });

            // $this.el.$ytimg.on('click', function() {
            //     if ($(this).hasClass('_with_iframe')) return;

            //     // 1. 取得清單
            //     let playlistAttr = $(this).attr('data-playlist') || '';
            //     let ids = playlistAttr.split(',').filter(id => id.trim() !== '');
            //     if (ids.length === 0) return;

            //     let firstId = ids[0];

            //     // 2. 基礎參數設定
            //     let params = [
            //         'hd=1',
            //         'autoplay=1',
            //         'rel=0',
            //         'modestbranding=1',
            //         'loop=1' // 開啟循環播放
            //     ];

            //     // 3. 循環邏輯處理
            //     // YouTube 規定：要循環播放，必須在 playlist 參數中填入要循環的 IDs
            //     if (ids.length > 1) { // 多部影片輪播循環
            //         params.push('playlist=' + ids.join(','));
            //     } else { // 單部影片無限循環，也要把自己的 ID 傳給 playlist 參數，loop 才會生效
            //         params.push('playlist=' + firstId);
            //     }

            //     // <iframe width="560" height="315" src="https://www.youtube.com/embed/1mNctcAyEEc?si=AwgGHlNBsQrDZ7aC" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
            //     let videoSrc = 'https://www.youtube.com/embed/' + firstId + '?' + params.join('&');

            //     let video = `
            //         <iframe
            //             width="100%"
            //             class="ytimg_video"
            //             src="${videoSrc}"
            //             allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            //             referrerpolicy="strict-origin-when-cross-origin"
            //             webkitAllowFullScreen mozallowfullscreen allowFullScreen
            //             frameBorder="0">
            //         </iframe>`;

            //     $(this).addClass('_with_iframe').append(video);
            // });
        },
        autoLoadYoutube: function() {
            let $this = this;
            let $container = $this.el.$ytimg; // 指向你的 .ytimg

            // 如果已經有 iframe 就跳出
            if ($container.hasClass('_with_iframe')) return;

            // 1. 取得清單 IDs
            let playlistAttr = $container.attr('data-playlist') || '';
            let ids = playlistAttr.split(',').filter(id => id.trim() !== '');
            if (ids.length === 0) return;

            let firstId = ids[0];

            // 2. 基礎參數設定 (關鍵：加入 mute=1)
            let params = [
                'hd=1',
                'autoplay=1',
                'mute=1',           // 行動端自動播放必備
                'rel=0',
                'modestbranding=1',
                'loop=1',
                'controls=1'        // 顯示控制列，方便使用者看完想點開聲音
            ];

            // 3. 循環邏輯處理
            if (ids.length > 1) {
                params.push('playlist=' + ids.join(','));
            } else {
                params.push('playlist=' + firstId);
            }

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

            // 4. 直接渲染並加上 class
            $container.addClass('_with_iframe').html(video);
        }
    };
    MAIN.init();
});
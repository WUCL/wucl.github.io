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
            $suntorytime: $('#suntorytime'),
        },
        init: function() {
            if ('scrollRestoration' in history) { history.scrollRestoration = 'manual'; }
            this.el.$body.addClass(deviceObj.name);
            this.bindEvent();
            this.doAos();
        },
        bindEvent: function() {
            let $this = this;

            // switch menu
            $this.el.$suntorytime.on('click', '.box-folder .folder-ctrl', (e) => {
                let $folder = $(e.target).parent('.box-folder');
                let $folder_switch = $folder.attr('data-folder');
                if ($folder_switch == 1) $folder.attr('data-folder', 0);
                else $folder.attr('data-folder', 1);
            });
        },
        doAos: function() {
            return AOS.init({
                duration: 650,
                offset: 300,
                delay: 0,
                once: true,
                easing: 'ease-in-out'
            });
        },
    };
    MAIN.init();
});
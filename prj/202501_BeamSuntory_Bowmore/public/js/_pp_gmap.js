$(function() {
    var _PP_GMAP = {
        env: 'html',
        el: {
            $_pp_gmap: $('#_pp_gmap'),
            $_pp: $('#_pp'),
            $_pp_iframe: $('#_pp_iframe'),
        },
        init: function() {
            if ('scrollRestoration' in history) { history.scrollRestoration = 'manual'; }
            this.bindEvent();
        },
        bindEvent: function() {
            let $this = this;

            $this.el.$_pp_gmap.on('click', (e) => {
                console.log('hello _pp');

                $this.el.$_pp.attr('data-show', 1);
                $this.el.$_pp_iframe.attr('src', $this.el.$_pp_iframe.attr('data-src'));
                return;
            });
            $this.el.$_pp.on('click', '._pp_c', (e) => {
                console.log('close _pp');

                $this.el.$_pp.attr('data-show', '');
                $this.el.$_pp_iframe.attr('src', 'about:blank').removeAttr('src');
                return;
            });
        },
    };
    _PP_GMAP.init();
});
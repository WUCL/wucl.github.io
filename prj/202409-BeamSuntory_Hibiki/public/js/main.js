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

            $_searcher: $('#_searcher'),

            $s_it: $('#s_it'),
            $btn_submit: $('#btn-submit'),
            $btn_research: $('#btn-research'),
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

            $this.el.$s_it.on('keyup', (e) => {
                console.log(e.target.value);
                console.log('$s_it');
                if (!/^\d*$/.test(e.target.value || '')) return;
            });
            $this.el.$btn_submit.on('click', (e) => {
                console.log('$s_submit');

                $this.el.$_searcher.attr('data-layer', 2);
                return;
            });

            // research
            $this.el.$btn_research.on('click', (e) => {
                console.log('research');

                $this.el.$_searcher.attr('data-layer', 1);
                return;
            });
        },
    };
    MAIN.init();
});
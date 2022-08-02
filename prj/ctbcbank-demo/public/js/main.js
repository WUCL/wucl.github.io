$(function() {
    var MAIN = {
        test_mode: true,
        env: 'html',
        el: {
            $window: $(window),
            $doc: $(document),
            $body: $('body'),
            $main: $('#main'),

            $select: $('#select-index'),
        },
        var: {
            _step1: {
                timeout: 1000,
            },

        },
        init: function() {
            if ('scrollRestoration' in history) { history.scrollRestoration = 'manual'; }
            this.el.$body.addClass(deviceObj.name);
            if (this.test_mode) this.testMode();
            this.bindEvent();
            this.step1();
            this.step2();
            this.step3();
            this.step4();
            this.step5();
            this.step6();
            this.step7();
        },
        testMode: function() {
            let $this = this;
            $this.el.$select.on('change', function(e) {
                let $index = e.target.value;
                $this.tranIndex($index);
            });
        },
        bindEvent: function() {
            let $this = this;
        },
        tranIndex: function(index) {
            return this.el.$main.attr('data-index', index);
        },
        step1: function() {
            console.log('step1');
            let $this = this;
            setTimeout(( () => $this.tranIndex(2) ), $this.var._step1.timeout);
        },
        step2: function() {
            console.log('step2');
            let $this = this;
        },
        step3: function() {
            console.log('step3');
            let $this = this;
        },
        step4: function() {
            console.log('step4');
            let $this = this;
        },
        step5: function() {
            console.log('step5');
            let $this = this;
        },
        step6: function() {
            console.log('step6');
            let $this = this;
        },
        step7: function() {
            console.log('step7');
            let $this = this;
        },
    };
    MAIN.init();
});
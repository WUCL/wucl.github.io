(function() {
    "use strict";
    var $header = new Vue({
        el: "#header",
        data: {
            openheader: false,
        },
        beforeCreate() {
            // console.info('== beforeCreate ==');
            if ('scrollRestoration' in history) { history.scrollRestoration = 'manual'; }
        },
        created() {
            // console.info('== created ==');
            document.body.classList.add(deviceObj.name);
        },
        mounted: function() {
            // console.info('== mounted ==');
        },
        watch: {
        },
        computed: {
        },
        methods: {
            toggleHeader(_switch) {
                if (!_switch) this.openheader = false;
                else this.openheader = !this.openheader;
                return;
            },
        }
    });
    var $main = new Vue({
        el: "#main",
        data: {
            modal: {
                open: false,
                type: '',
            },
        },
        beforeCreate() {
            // console.log($header.$el);
        },
        created() {
            // window.addEventListener("resize", this.resizeListen);
        },
        mounted: function() {
        },
        watch: {
        },
        computed: {
        },
        methods: {
            hideModal() {
                this.modal.open = false
            },
        },
    });
    VueScrollTo.setDefaults({
        container: "body",
        duration: 700,
        easing: "ease",
        offset: -80,
        force: true,
        cancelable: true,
        onStart: function() { $header.toggleHeader(false); },
        onDone: false,
        onCancel: false,
        x: false,
        y: true
    });
})();
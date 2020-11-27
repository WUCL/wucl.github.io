(function() {
    "use strict";
    var $app = new Vue({
        el: "#app",
        data: {
            el: {
                $body: document.body,
            },
            exps: '',
            skills: '',
            status: {
                loading: {
                    skill: true,
                    exp: true,
                }
            }
        },
        mounted: function() {
            console.log("%cHi This is Allen", "padding:0 5px;background:#ffcc00;color:#116934;font-weight:bolder;font-size:50px;")
            if ('scrollRestoration' in history) { history.scrollRestoration = 'manual'; }
            this.el.$body.classList.add(deviceObj.name);
        },
        watch: {
            exps: function (val) {
                // this.$nextTick(() => {
                Vue.nextTick(() => {
                    this.status.loading.exp = false;
                });
            },
            skills: function (val) {
                // this.$nextTick(() => {
                Vue.nextTick(() => {
                    this.status.loading.skill = false;
                });
            },
        },
        created: function () {
        },
        methods: {
            externalLink(url) {
                window.open(url, '_blank');
            },
        }
    });

    var getJSON = function(url, callback) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'json';
        xhr.onload = function() {
            var status = xhr.status;
            if (status == 200) { callback(null, xhr.response);
            } else { callback(status); }
        };
        xhr.send();
    };
    getJSON('public/js/datas.json', (err, data) => {
        if (err != null) {
            console.error(err);
        } else {
            // console.log(data);
            $app.exps = data.exps;
            $app.skills = data.skills;
        }
    });
})();
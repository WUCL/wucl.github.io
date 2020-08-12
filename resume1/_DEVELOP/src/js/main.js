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
        },
        mounted: function() {
            console.log("%cHi This is Allen", "padding:0 5px;background:#ffcc00;color:#116934;font-weight:bolder;font-size:50px;")
            if ('scrollRestoration' in history) { history.scrollRestoration = 'manual'; }
            this.el.$body.classList.add(deviceObj.name);
        },
        watch: {
            exps: function (val) {
                // console.log(val);
            }
        },
        created: function () {
        },
        methods: {
            externalLink(url) {
                window.open(url, '_blank');
            },
            openExp(e) {
                let $target = e.currentTarget;
                let $exp = $target.getAttribute('data-exp');
                $target.classList.add("active");
                window.helper.updateUrlParams(location.href, 'exps', $exp, true);

                let $exps = this.exps[$exp];

                let $exps_el = document.getElementById("exps");
                let $bottom_el = $exps_el.querySelector(".container .bottom");
                $exps_el.querySelector('.logo img').src = $exps.logo;
                $exps_el.querySelector('.info time').innerHTML = $exps.time;
                $exps_el.querySelector('.info .name').href = $exps.url;
                $exps_el.querySelector('.info .name').innerHTML = $exps.name;
                $exps_el.querySelector('.info .title').innerHTML = $exps.title;
                $exps_el.setAttribute("data-exp", $exp);

                let $lists = $exps.lists;
                $lists.forEach(lists => {
                    let $title = lists.title;
                    let $item = lists.item;
                    let $temp_items = '';
                    let $list_el = document.createElement("div");
                    let $ul_el = document.createElement("ul");
                    $list_el.setAttribute("data-title", lists.title);
                    $item.forEach(item => $temp_items += '<li>' + item + '</li>');
                    $ul_el.innerHTML = $temp_items;
                    $list_el.append($ul_el);
                    $bottom_el.append($list_el);
                });

                // this.el.$body.addClass('disableScroll').addClass('open-exps');
                this.el.$body.classList.add('disableScroll');
                this.el.$body.classList.add('open-exps');
            },
            closeExp() {
                let $target = document.querySelector("#about-exp ul li.active");
                $target.classList.remove("active");
                let $exps_el = document.getElementById("exps");
                let $bottom_el = $exps_el.querySelector(".container .bottom");
                $exps_el.setAttribute('data-exp', '');
                $bottom_el.innerHTML = "";
                window.helper.updateUrlParams(location.href, 'exps', '', true);
                // this.el.$body.removeClass('disableScroll').removeClass('open-exps');
                this.el.$body.classList.remove('disableScroll');
                this.el.$body.classList.remove('open-exps');
            },
        }
    });

    function loadData() {
        $.getJSON("public/js/data.json", function(data) {
            $app.exps = data.exps;
            $app.skills = data.skills1;
        })
        .done(function() {
            console.log("second success");
        })
        .fail(function(error) {
            console.log("error");
            console.log(error);
        })
        .always(function() {
            console.log("complete");
            // console.log(this.exps);
        });
        return;
    }
    loadData();
})();
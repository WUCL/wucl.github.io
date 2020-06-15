(function() {
    "use strict";
    new Vue({
        el: "#about-exp",
        data: {
            exps: window.exps,
            // exps: ''
        },
        mounted: function() {
            console.log("%cHi This is Allen", "padding:0 5px;background:#ffcc00;color:#116934;font-weight:bolder;font-size:50px;")
            if ('scrollRestoration' in history) { history.scrollRestoration = 'manual'; }
            window.el.$body.addClass(deviceObj.name);
            // this.loadExps();
        },
        watch: {
            exps: function (val) {
                console.log(val);
            }
        },
        created: function () {
        },
        methods: {
            loadExps() {
                $.getJSON("public/js/exps.json", function(data) {
                    // console.log(data);
                    this.exps = data;
                })
                .done(function() {
                    // console.log("second success");
                })
                .fail(function(error) {
                    // console.log("error");
                    console.log(error);
                })
                .always(function() {
                    // console.log("complete");
                    console.log(this.exps);
                });
                return;
            },
            externalLink(url) {
                window.open(url, '_blank');
            },
            openExp(e) {
                let $target = e.currentTarget;
                let $exp = $target.getAttribute('data-exp');
                $target.classList.add("active");
                window.helper.updateUrlParams(location.href, 'exps', $exp, true);

                let $exps = this.exps[$exp];
                $('#exps').attr('data-exp', $exp);
                $('#exps').find('.logo img').attr('src', $exps.logo);
                $('#exps').find('.info time').html($exps.time);
                $('#exps').find('.info .name').attr('href', $exps.url);
                $('#exps').find('.info .name').html($exps.name);
                $('#exps').find('.info .title').html($exps.title);

                let $abouts = $exps.abouts;
                let $temp_abouts = '';
                $abouts.item.forEach(abouts => $temp_abouts += '<li>' + abouts + '</li>');
                $('#exps').find('.abouts').attr('data-title', $abouts.title).find('ul').html($temp_abouts);

                let $myposition = $exps.myposition;
                let $temp_myposition = '';
                $myposition.item.forEach(myposition => $temp_myposition += '<li>' + myposition + '</li>');
                $('#exps').find('.myposition').attr('data-title', $myposition.title).find('ul').html($temp_myposition);

                let $whatidid = $exps.whatidid;
                let $temp_whatidid = '';
                $whatidid.item.forEach(whatidid => $temp_whatidid += '<li>' + whatidid + '</li>');
                $('#exps').find('.whatidid').attr('data-title', $whatidid.title).find('ul').html($temp_whatidid);

                window.el.$body.addClass('disableScroll').addClass('open-exps');
            },
        }
    });

    new Vue({
        el: "#exps",
        data: {
        },
        mounted: function() {
        },
        methods: {
            closeExp() {
                let $target = document.querySelector("#about-exp ul li.active");
                $target.classList.remove("active");
                $('#exps').attr('data-exp', '');
                window.helper.updateUrlParams(location.href, 'exps', '', true);
                window.el.$body.removeClass('disableScroll').removeClass('open-exps');
            },
        }
    });
})();
(function() {
    "use strict";
    var $timer = new Vue({
        el: "#timer",
        data: {
            modal: {
                open: false,
                type: '',
            },
            // d: (new Date()), // datetime
            interval: 1000,
            d: moment()._d,
            project: {
                count: 0,
                countdown: '00:00',
                timer: '',
                start: moment.duration(),
                progress: ''
            },

        },
        beforeCreate() {
        },
        created() {
            // window.addEventListener("resize", this.resizeListen);
            // this.hiitstart();
        },
        mounted: function() {
            this.project.progress = document.getElementById('progress');
        },
        watch: {
        },
        computed: {
            datetime() {
                // this.h = this.d.getHours();
                let $d = this.d.toLocaleString().split(' ');
                return $d[0] + ' ' + $d[1];
            },
            // 'project.countdown'() {
            //     return;
            // }
        },
        methods: {
            hiitstart() {
                clearInterval(this.project.timer);
                // clearInterval(this.project.timer.runner);

                let $s = 240;
                let $phase1 = 30; // 幾秒+1
                let $phase1s = 0;

                // let $s = 24;

                let $start = this.project.start;
                let $end = moment.duration({'seconds': $s});
                let $duration = moment.duration(($end - $start), 'milliseconds');
                $duration = $duration.add(this.interval, 'milliseconds');

                this.project.timer = setInterval(() => {
                    $duration = moment.duration($duration.asMilliseconds() - this.interval, 'milliseconds');
                    let $ms = $duration.as('milliseconds');
                    this.project.countdown = moment($ms).format('mm:ss');

                    this.project.progress.setAttribute('max', $phase1);
                    this.project.progress.setAttribute('value', $phase1s++);

                    if ($phase1s == $phase1) $phase1s = 0;

                    if ($duration.as('milliseconds') == 0) return clearInterval(this.project.timer);
                    if (Number.isInteger(($ms/this.interval)/$phase1)) this.project.count++;
                }, this.interval);
            },
        },
    });
    var dTimer = setInterval(() => {
        $timer.d = moment()._d;
    }, $timer.interval);
})();
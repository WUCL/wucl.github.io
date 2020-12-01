// (function() {
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
                status: {
                    attr: [],
                    running: false,
                    isPause: false
                },
                count: 0,
                countdown: '00:00',
                timer: '',
                progress: [],

                $tempo: {
                    start: moment.duration(), // 開始時間
                    end: '', // 結束時間
                    total: 0, // 全部時間 秒數
                    counting: [0, 0], // [run, break] 時間到會 +1 count
                    duration: '' //
                }
            },
            parts: 1,
            part: [ // 組合
                {
                    sets: 8, // 次數
                    rb: [20, 10], // run and break, time
                },
                {
                    sets: 2, // 次數
                    rb: [10, 5], // run and break, time
                }
            ]
        },
        beforeCreate() {
        },
        created() {
            // window.addEventListener("resize", this.resizeListen);
            // this.hiitstart();
        },
        mounted: function() {
            // this.project.progress = document.getElementById('progress');
        },
        watch: {
        },
        computed: {
            datetime() {
                let $d = this.d.toLocaleString().split(' ');
                return $d[0] + ' ' + $d[1];
            }
        },
        methods: {
            start() {
                let $part = this.part[this.parts];
                let $p = this.project;
                clearInterval($p.timer);

                if ($p.status.running)  {
                    if (!$p.status.isPause) this.updateStatus('pause');
                    else this.updateStatus('running');
                } else {
                    this.updateStatus('running');
                    $p.status.running = true;
                    $p.$tempo.total = Math.floor($part.sets * ($part.rb[0] + $part.rb[1]));
                    $p.$tempo.end = moment.duration({'seconds': $p.$tempo.total});

                    $p.$tempo.duration = moment.duration(($p.$tempo.end - $p.$tempo.start), 'milliseconds');
                    $p.$tempo.duration = $p.$tempo.duration.add(this.interval, 'milliseconds');
                }

                var processProject = () => {
                    if (!$p.status.isPause) {
                        $p.$tempo.duration = moment.duration($p.$tempo.duration.asMilliseconds() - this.interval, 'milliseconds');
                        let $ms = $p.$tempo.duration.as('milliseconds');
                        $p.countdown = moment($ms).format('mm:ss');

                        if ($p.$tempo.counting[0] == ($part.rb[0] + 1)) {
                            this.updateRB('break');
                            $p.progress = [$part.rb[1], $p.$tempo.counting[1]++]
                            if ($p.$tempo.counting[1] == ($part.rb[1] + 1)) $p.$tempo.counting[0] = 1;
                        } else {
                            this.updateRB('run');
                            $p.$tempo.counting[1] = 1;
                            $p.progress = [$part.rb[0], $p.$tempo.counting[0]++]
                        }

                        if ($p.$tempo.duration.as('milliseconds') == 0) {
                            this.updateStatus('stop');
                            clearInterval($p.timer);
                            $p.status.running = false;
                            return;
                        }
                        if (Number.isInteger((($ms / this.interval) + 1) /($part.rb[0] + $part.rb[1]))) $p.count++;
                    }
                }

                $p.timer = setInterval(() => {
                    processProject();
                }, this.interval);
                processProject();
            },
            updateRB(rb) { // run and break
                this.project.status.attr[1] = rb;
            },
            updateStatus(status) {
                let $p = this.project;
                let $status = status || '';
                if ($status == '') return;
                $p.status.attr[0] = $status;
                switch (status) {
                    case 'running':
                        $p.status.isPause = false;
                        break;
                    case 'pause':
                        $p.status.isPause = true;
                        break;
                    case 'stop':
                        $p.status.isPause = false;
                        this.updateRB();
                        break;
                    default:
                        break;
                }
            }
        },
    });
    var dTimer = setInterval(() => {
        $timer.d = moment()._d;
    }, $timer.interval);
// })();
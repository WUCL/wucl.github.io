(function() {
    "use strict";
    var $timer = new Vue({
        el: "#timer",
        data: {
            // d: (new Date()), // datetime
            title: '',
            interval: 1000,
            d: moment()._d,
            project: {
                status: {
                    attr: [],
                    running: false,
                    isPause: false,
                    first: true
                },
                count: 0,
                countdown: moment(moment.duration()).format('mm:ss'),
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
            part: { // 組合
                selected: 1,
                options: [
                    {
                        name: 'TEST',
                        description: 'JUST TEST',
                        sets: 2, // 次數
                        rb: [5, 4], // run and break, time
                    },
                    {
                        name: 'TABATA',
                        description: '4 Minutes',
                        sets: 8, // 8 次數
                        rb: [20, 10], // run and break, time
                    },
                    {
                        name: '20s:30',
                        description: '10 Minutes',
                        sets: 15, // 次數
                        rb: [20, 20], // run and break, time
                    }
                ]
            }
        },
        beforeCreate() {
            if ('scrollRestoration' in history) { history.scrollRestoration = 'manual'; }
        },
        created() {
        },
        mounted() {
            document.body.classList.add(deviceObj.name);
            this.title = document.title;
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
            optionSelected(e) {
                let $selected = e.target.value;
                return this.part.selected = $selected;
            },
            letsGo() {
                let $part = this.part.options[this.part.selected];
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
                    if (!$p.status.isPause || !$p.status.running) {
                        $p.$tempo.duration = moment.duration($p.$tempo.duration.asMilliseconds() - this.interval, 'milliseconds');
                        let $ms = $p.$tempo.duration.as('milliseconds');
                        $p.countdown = moment($ms).format('mm:ss');

                        if ($p.$tempo.counting[0] == ($part.rb[0] + 1)) {
                            this.updateRB('break');
                            $p.progress = [$part.rb[1], $p.$tempo.counting[1]++];
                            if ($p.$tempo.counting[1] == ($part.rb[1] + 1)) $p.$tempo.counting[0] = 1;
                        } else {
                            this.updateRB('run');
                            $p.$tempo.counting[1] = 1;
                            $p.progress = [$part.rb[0], $p.$tempo.counting[0]++];
                        }

                        if ($p.$tempo.duration.as('milliseconds') == 0) return this.updateStatus('stop');
                        if (Number.isInteger((($ms / this.interval) + 1) /($part.rb[0] + $part.rb[1]))) $p.count++;
                    }
                }

                $p.timer = setInterval(() => {
                    processProject();
                }, this.interval);
                processProject();
            },
            letsStop() {
                if (!this.project.status.running) return;
                return this.updateStatus('stop');
            },
            updateRB(rb) { // run and break
                let $p = this.project;
                let $rb = rb || '';
                let $title = $p.countdown + ' | ' + $p.count;
                window.helper.updateTitle($title);
                $p.status.attr[1] = $rb;
                let $judgment = $p.progress[0] - $p.progress[1];
                if ($judgment < 4) {
                    if ($judgment == 0) return playSounds('switch');
                    playSounds('countdown');
                }
            },
            updateStatus(status) {
                let $p = this.project;
                let $status = status || '';
                if ($status == '') return;
                $p.status.attr[0] = $status;
                document.body.setAttribute('data-status', status);
                switch (status) {
                    case 'running':
                        if ($p.status.first) {
                            playSounds('switch');
                            $p.status.first = !$p.status.first;
                        }
                        $p.status.isPause = false;
                        break;
                    case 'pause':
                        $p.status.isPause = true;
                        break;
                    case 'stop':
                        playSounds('timeup');
                        this.updateRB();
                        $p.status.isPause = false;
                        $p.status.running = false;
                        this.resetProject();
                        break;
                    default:
                        break;
                }
            },
            resetProject() {
                let $p = this.project;
                clearInterval($p.timer);
                $p.countdown = moment(moment.duration()).format('mm:ss');
                $p.count = 0;
                $p.progress =  [0, 0];
                $p.$tempo.counting = [0, 0];
                window.helper.updateTitle(this.title);
                return;
            }
        },
    });
    var dTimer = setInterval(() => {
        $timer.d = moment()._d;
    }, $timer.interval);
})();
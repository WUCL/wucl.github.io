(function() {
    "use strict";

    var $app = new Vue({
        el: "#main",
        data: {
            nowtime: new Date(),
            el: {
                $body: document.body,
            },
            form: {
                $summary: 'This is Summary.',
                $details: 'This is Details.',
                $location: 'This is Location.',
                $startTime: '',
                $endTime: '',
                $oTime: ['', ''],
            },
        },
        beforeCreate() {
            // console.info('== beforeCreate ==');
            if ('scrollRestoration' in history) { history.scrollRestoration = 'manual'; }
        },
        created() {
            // console.info('== created ==');
            this.el.$body.classList.add(deviceObj.name);

            this.form.$startTime = this.nowtime.Format("yyyy-MM-ddThh:mm")
            this.form.$endTime = (new Date(this.nowtime.setHours(this.nowtime.getHours() + 1))).Format("yyyy-MM-ddThh:mm")
        },
        mounted: function() {
            // console.info('== mounted ==');
        },
        watch: {
            form: {
                handler(e) {
                    return console.log(e);
                    Object.keys(e).map((objectKey, index) => {
                        console.log(objectKey + ' ::', e[objectKey]);
                    });
                },
                deep: true,
            },
            'form.$startTime'(e) {
                if (e > this.form.$endTime) {
                    alert('Can\'t setting the time over than End Time.');
                    this.form.$startTime = this.form.$oTime[0];
                }
            },
            'form.$endTime'(e) {
                if (e < this.form.$startTime) {
                    alert('Can\'t setting the time before than Start Time.');
                    this.form.$endTime = this.form.$oTime[1];
                }
            },
        },
        computed: {
            cal$google() {
                return encodeURI([
                'https://www.google.com/calendar/render',
                '?action=TEMPLATE',
                '&text=' + (this.form.$summary || ''),
                '&dates=' + (this.formatTime(new Date(this.form.$startTime)) || '') + '/' + (this.formatTime(new Date(this.form.$endTime)) || ''),
                '&details=' + (this.form.$details || ''),
                '&location=' + (this.form.$location || ''),
                '&sprop=&sprop=name:'
                ].join(''));
            },
            cal$apple() {
                return encodeURI(
                'data:text/calendar;charset=utf8,' + [
                'BEGIN:VCALENDAR',
                'VERSION:2.0',
                'BEGIN:VEVENT',
                'URL:' + document.URL,
                'DTSTART:' + (this.formatTime(new Date(this.form.$startTime)) || ''),
                'DTEND:' + (this.formatTime(new Date(this.form.$endTime)) || ''),
                'SUMMARY:' + (this.form.$summary || ''),
                'DESCRIPTION:' + (this.form.$details || ''),
                'LOCATION:' + (this.form.$location || ''),
                'END:VEVENT',
                'END:VCALENDAR'
                ].join('\n'));
            },
            cal$yahoo() {
                return encodeURI([
                'http://calendar.yahoo.com/?v=60&view=d&type=20',
                '&title=' + (this.form.$summary || ''),
                '&st=' + (this.formatTime(new Date(this.form.$startTime)) || ''),
                '&dur=' + (this.formatTime(new Date(this.form.$endTime)) || ''),
                '&desc=' + (this.form.$details || ''),
                '&in_loc=' + (this.form.$location || ''),
                ].join(''));
            },
            cal$outlook() {
                return this.cal$apple;
            },
        },
        methods: {
            formatTime(date) {
                return date.toISOString().replace(/-|:|\.\d+/g, '');
            },
            timeOnClick1(e) {
                this.form.$oTime[0] = e.target.value;
                return;
            },
            timeOnClick2(e) {
                this.form.$oTime[1] = e.target.value;
                return;
            },
        }
    });
})();
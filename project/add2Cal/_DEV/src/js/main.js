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
                $fileName: 'event', // event.ics
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
                    return;
                    // return console.log(e);
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
                // href="https://addtocalendar.com/atc/ical?utz=480&uln=zh-TW&vjs=1.5&e[0][date_start]=2016-12-09%2012%3A00%3A00&e[0][date_end]=2016-12-09%2014%3A00%3A00&e[0][timezone]=Europe%2FLondon&e[0][title]=Eurospin-viaggi%20Offerte%20neve&e[0][description]=Le%20offerte%20neve%20sono%20arrivate%20su%20http%3A%2F%2Fwww.eurospin-viaggi.it&e[0][location]=www.eurospin-viaggi.it&e[0][organizer]=Eurospin%20Viaggi&e[0][organizer_email]="
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
            icalDownload() { // where the magic happens // ref > https://gist.github.com/dudewheresmycode/ff1d364c1c6d787fe7ea
                // name of event in iCal
                this.eventName = (this.form.$summary || '');
                this.eventDetails = (this.form.$details || '');
                // name of file to download as
                this.fileName = this.form.$fileName;
                // start time of event in iCal
                this.dateStart = (this.formatTime(new Date(this.form.$startTime)) || '');
                // end time of event in iCal
                this.dateEnd = (this.formatTime(new Date(this.form.$endTime)) || '');
                this.location = (this.form.$location || '');

                //helper functions
                //iso date for ical formats
                this._isofix = function (d) {
                    var offset = ("0" + ((new Date()).getTimezoneOffset() / 60)).slice(-2);

                    if (typeof d == 'string') {
                        return d.replace(/\-/g, '') + 'T' + offset + '0000Z';
                    } else {
                        return d.getFullYear() + this._zp(d.getMonth() + 1) + this._zp(d.getDate()) + 'T' + this._zp(d.getHours()) + "0000Z";
                    }
                }
                //zero padding for data fixes
                this._zp = function (s) {
                    return ("0" + s).slice(-2);
                }

                this._save = function (fileURL) {
                    if (!window.ActiveXObject) {
                        var save = document.createElement('a');
                        save.href = fileURL;
                        save.target = '_blank';
                        save.download = this.fileName || 'unknown';

                        var evt = new MouseEvent('click', {
                            'view': window,
                            'bubbles': true,
                            'cancelable': false
                        });
                        save.dispatchEvent(evt);

                        (window.URL || window.webkitURL).revokeObjectURL(save.href);
                    }

                    // for IE < 11
                    else if (!!window.ActiveXObject && document.execCommand) {
                        var _window = window.open(fileURL, '_blank');
                        _window.document.close();
                        _window.document.execCommand('SaveAs', true, this.fileName || fileURL)
                        _window.close();
                    }
                }

                var ics_lines = [
                    "BEGIN:VCALENDAR",
                    "VERSION:2.0",
                    // "PRODID:-//Addroid Inc.//iCalAdUnit//EN",
                    "METHOD:REQUEST",
                    "BEGIN:VEVENT",
                    "UID:event-" + this.nowtime.getTime() + "@",
                    "DTSTAMP:" + this._isofix(this.nowtime),
                    "DTSTART:" + this.dateStart,
                    "DTEND:" + this.dateEnd,
                    "DESCRIPTION:" + this.eventDetails,
                    "SUMMARY:" + this.eventName,
                    'LOCATION:' + this.location,
                    "LAST-MODIFIED:" + this._isofix(this.nowtime),
                    "SEQUENCE:0",
                    "END:VEVENT",
                    "END:VCALENDAR"
                ];
                var dlurl = 'data:text/calendar;base64,' + btoa(ics_lines.join('\r\n'));

                try {
                    this._save(dlurl);
                } catch (e) {
                    console.log(e);
                }
                return;
            },
        }
    });
})();
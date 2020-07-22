(function() {
    "use strict";
    window.mapping = {
        day: {
        }
    };

    const __DEVELOP_MODE = true; // 測試模式
    const __API_GEOCODE_ID = 'AIzaSyDD_nIoN9l-UtRJWpuA776UmHAwuXFqh7E';
    const __API_OPENDATA_WEB_GOV_ID = 'CWB-88D7AA92-6D43-431B-9E43-10642FE8C162'

    var vm = new Vue({
        el: "#weatherbox",
        data: {
            a: 1,

            d: (new Date()), // datetime
            h: 0,
            geocode: {
                coords: [],
                address: {
                    full: '',
                    city: '',
                } // google api callback
            },
            weather: {
                update: '',
                location: {}
            },
            live: {
                address: {
                    city: '',
                    dist: ''
                },
                t: {
                    min: '',
                    max: '',
                    avg: ''
                },
                at: {
                    min: '',
                    max: ''
                },
                pop: '',
                rh: '',
                uvi: {
                    val: '',
                    level: ''
                },
                description: '',
                wx: '',
                wind: {
                    wd: ['', ''],
                    ws: ['', '']
                },
            },
            bgChangingActive: false,
        },
        beforeCreate() {
            if (!__DEVELOP_MODE) console.log("%cHi This is Allen", "padding:0 5px;background:#ffcc00;color:#116934;font-weight:bolder;font-size:50px;")
            if ('scrollRestoration' in history) { history.scrollRestoration = 'manual'; }
            console.log('== beforeCreate ==');
        },
        created() {
            if (__DEVELOP_MODE) {
                this.geocode.coords = ['25.0673297', '121.5274438'];
                this.geocode.address = [
                    '10491台灣台北市中山區新生北路三段82-5號',
                    [
                        {long_name: "82-5", short_name: "82-5", types: ["street_number"]}
                        , {long_name: "新生北路三段", short_name: "新生北路三段", types: ["route"]}
                        , {long_name: "中山區", short_name: "中山區", types: ["administrative_area_level_3", "political"]}
                        , {long_name: "台北市", short_name: "台北市", types: ["administrative_area_level_1", "political"]}
                        , {long_name: "台灣", short_name: "TW", types: ["country", "political"]}
                        , {long_name: "10491", short_name: "10491", types: ["postal_code"]}
                    ]
                ];
                this.live.address.city = this.geocode.address[1][3]['long_name'];
                this.live.address.dist = this.geocode.address[1][2]['long_name'];
                this.goGetWeather();
            } else {
                var $this = this;

                // to get address
                // https://developers.google.com/maps/documentation/javascript/examples/geocoding-reverse
                if ("geolocation" in navigator) {
                    console.log('geolocation is available');
                    navigator.geolocation.getCurrentPosition(onSuccess, onError);
                    function onSuccess(position) {
                        console.log('onSuccess');
                        var element = document.getElementById('geolocation');
                        $this.geocode.coords[0] = position.coords.latitude;
                        $this.geocode.coords[1] = position.coords.longitude;
                        // console.log('Latitude: ' + position.coords.latitude + '\n' + 'Longitude: ' + position.coords.longitude + '\n' + 'Altitude: ' + position.coords.altitude + '\n' + 'Accuracy: ' + position.coords.accuracy + '\n' + 'Altitude Accuracy: ' + position.coords.altitudeAccuracy + '\n' + 'Heading: ' + position.coords.heading + '\n' + 'Speed: ' + position.coords.speed + '\n' + 'Timestamp: ' + position.timestamp);
                        // console.log($this.geocode.coords[0], $this.geocode.coords[1]); // 25.0673297 121.5274438
                        $this.goGetGeocode($this.geocode.coords[0], $this.geocode.coords[1]);
                    }
                    // onError Callback receives a PositionError object
                    //
                    function onError(error) {
                        console.log('onError');
                        console.log('code: ' + error.code + '\n' + 'message: ' + error.message + '\n');
                    }
                } else {
                    console.log('geolocation IS NOT available');
                }
            }

            console.log('== created ==')
            // console.log('this.a: ' + this.a)
            // console.log('this.$el: ' + this.$el)
        },
        mounted() {
            console.log('== mounted ==')
            // console.log('this.a: ' + this.a)
            // console.log('this.$el: ' + this.$el)

            // window.el.$body.addClass(deviceObj.name);
            // this.loadExps();

            if (localStorage.weather) {
                console.log(localStorage);
                // this.weather = localStorage.weather;
            }
            // else {
            //     console.log(localStorage);
            // }
        },
        watch: {
            weather: {
                handler: function() {
                    console.log(localStorage);
                    // localStorage.weather = JSON.stringify(this.weather);
                    console.log(localStorage.weather);
                },
                deep: true
            },
            h() {
                console.log(this.h);
            },
        },
        computed: {
            daynight() {
                this.bgChangingActive = true;
                let $h = this.h
                , $daynight = '';
                if ($h < 12 && $h > 6 ) $daynight = 'day';
                else if ($h < 14) $daynight = 'noon';
                else if ($h < 17) $daynight = 'afternoon';
                else $daynight = 'night';
                this.bgChangingActive = false;
                return $daynight;
            },
            datetime() {
                this.h = this.d.getHours();
                let $d = this.d.toLocaleString().split(' ');
                return $d[0] + ' 今天' + $d[1];
            },
            wxid() {
                return this.live.wx;
            },
            details() {
                let $live = this.live;
                let $obj = {
                    '': ['description', $live.description], // 描述
                    '溫度': ['t', $live.t.min + '-' + $live.t.max],
                    '體感溫度': ['at', $live.at.min + '-' + $live.at.max],
                    '降雨機率': ['pop', $live.pop + '%'],
                    '濕度': ['rh', $live.rh + '%'],
                    '風': ['wind', $live.wind.wd[0] + $live.wind.ws[0] + $live.wind.ws[1]],
                    '紫外線指數/曝曬級數': ['uvi', $live.uvi.val + '/' + $live.uvi.level],
                };
                return $obj;
            }
        },
        methods: {
            goGetGeocode(lat, lng) {
                console.log('goGetGeocode');
                let $this = this;
                if (!__DEVELOP_MODE) { // TODO, to check local storage was exist than do not request
                    console.log('---------- axios get')
                    axios
                    .get('https://maps.googleapis.com/maps/api/geocode/json', {
                        params: {
                            latlng: lat + ',' + lng,
                            language: 'zh-TW',
                            key: __API_GEOCODE_ID
                        }
                    })
                    .then(function (response) {
                        console.log('---------- axios get onSuccess');
                        $this.geocode.address['full'] = response.data.results[0].formatted_address;
                        $this.live.address.city = $this.geocode.address['city'] = response.data.results[0].address_components.slice(-3)[0]['long_name'];
                        $this.live.address.dist = $this.geocode.address['dist'] = response.data.results[0].address_components.slice(-4)[0]['long_name']
                        $this.goGetWeather();
                    })
                    .catch(function (error) {
                        console.log(error);
                    });
                } else {
                    console.log('---------- NOT axios get')
                    $this.goGetWeather();
                }
            },
            goGetWeather() {
                // console.log('goGetWeather');
                let $this = this;
                if (this.geocode.coords.length !== 2) return;
                // console.log(this.geocode.coords);

                axios
                .get('https://opendata.cwb.gov.tw/fileapi/v1/opendataapi/F-D0047-091', {
                    params: {
                        Authorization: __API_OPENDATA_WEB_GOV_ID,
                        format: 'JSON',
                        // locationName: this.live.address.city.replace(/台/i, '臺'),
                    }
                })
                .then(function (response) {
                    console.log('===== get F-D0047-091 response =====');
                    // console.log(response);
                    let $data = response.data.cwbopendata;
                    let $loaction = $data.dataset.locations.location;
                    $this.weather.update = $data.dataset.datasetInfo.update

                    $loaction.forEach(function(e, index) {
                        let $name = e.locationName.replace(/臺/i, '台'); // filter 臺 to 台
                        $this.weather.location[$name] = {};
                        for (let i = 0; i < e.weatherElement.length; i++) {
                            $this.weather.location[$name][e.weatherElement[i]['elementName']] = e.weatherElement[i]['time'];
                        }
                    });
                    // console.log($this.weather.location);

                    axios
                    .get('https://opendata.cwb.gov.tw/fileapi/v1/opendataapi/F-D0047-089', {
                        params: {
                            Authorization: __API_OPENDATA_WEB_GOV_ID,
                            format: 'JSON',
                        }
                    })
                    .then(function (response) {
                        console.log('===== get F-D0047-089 response =====');
                        // console.log(response);
                        let $data = response.data.cwbopendata;
                        let $loaction = $data.dataset.locations.location;
                        $loaction.forEach(function(e, index) {
                            let $name = e.locationName.replace(/臺/i, '台'); // filter 臺 to 台
                            for (let i = 0; i < e.weatherElement.length; i++) {
                                $this.weather.location[$name][e.weatherElement[i]['elementName']] = e.weatherElement[i]['time'];
                            }
                        });
                        $this.updateLiveData();
                    })
                    .catch(function (error) {
                        console.log(error);
                    });
                })
                .catch(function (error) {
                    console.log(error);
                });
            },
            updateLiveData() {
                console.log(this.weather.location);
                let $weather = this.weather.location[this.live.address.city]
                , $live = this.live;
                $live.t.min = $weather['MinT'][0]['elementValue'].value;
                $live.t.max = $weather['MaxT'][0]['elementValue'].value;
                $live.t.avg = $weather['T'][0]['elementValue'].value;
                $live.at.min = $weather['MinAT'][0]['elementValue'].value;
                $live.at.max = $weather['MaxAT'][0]['elementValue'].value;
                $live.pop = $weather['PoP6h'][0]['elementValue'].value;
                $live.rh = $weather['RH'][0]['elementValue'].value;
                $live.uvi.val = $weather['UVI'][0]['elementValue'][0].value;
                $live.uvi.level = $weather['UVI'][0]['elementValue'][1].value;
                $live.wind.wd[0] = $weather['WD'][0]['elementValue'].value;
                $live.wind.wd[1] = $weather['WD'][0]['elementValue'].measures;
                $live.wind.ws[0] = $weather['WS'][0]['elementValue'][0].value;
                $live.wind.ws[1] = $weather['WS'][0]['elementValue'][0].measures;
                $live.description = $weather['WeatherDescription'][0]['elementValue'].value;
                $live.wx = $weather['Wx'][0]['elementValue'][1].value;
                // console.log(this.live);
            }
        }
    });
    var timer = setInterval(function(){
        vm.d = (new Date());
    }, 1000);
})();
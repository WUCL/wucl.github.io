(function() {
    "use strict";

    var vm = new Vue({
        el: "#weatherbox",
        data: {
            a: 1,

            d: (new Date()), // datetime
            h: 0,
            geocode: {
                coords: [],
                address: {}, // google api callback
                mapping: {} // from localstorage
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
            bgChangingActive: true,
        },
        beforeCreate() {
            if (!__DEVELOP_MODE) console.log("%cHi This is Allen", "padding:0 5px;background:#ffcc00;color:#116934;font-weight:bolder;font-size:50px;")
            if ('scrollRestoration' in history) { history.scrollRestoration = 'manual'; }
            console.log('== beforeCreate ==');
        },
        created() {
            var $this = this;

            // to get address
            // https://developers.google.com/maps/documentation/javascript/examples/geocoding-reverse
            if ("geolocation" in navigator) {
                console.log('geolocation IS available');
                navigator.geolocation.getCurrentPosition(onSuccess, onError);
                function onSuccess(position) {
                    console.log('onSuccess');
                    var element = document.getElementById('geolocation');
                    $this.geocode.coords[0] = position.coords.latitude;
                    $this.geocode.coords[1] = position.coords.longitude;
                    $this.goGetGeocode($this.geocode.coords[0], $this.geocode.coords[1]);
                }
                function onError(error) {
                    console.log('onError');
                    console.log('code: ' + error.code + '\n' + 'message: ' + error.message + '\n');
                }
            } else {
                console.log('geolocation IS NOT available');
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

            console.log(this.geocode.mapping);
            if (localStorage.geoMapping) this.geocode.mapping = JSON.parse(localStorage.geoMapping);
            if (localStorage.weather) this.weather = JSON.parse(localStorage.weather);
            console.log(this.geocode.mapping);
        },
        watch: {
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
            // arrayEquals(a, b) {
            //     return Array.isArray(a) &&
            //     Array.isArray(b) &&
            //     a.length === b.length &&
            //     a.every((val, index) => val === b[index]);
            // },
            // getKeyByValue(object, value) {
            //     return Object.keys(object).find(key => object[key] === value);
            // },
            getKeyByObjValue(object, value) {
                return Object.keys(object).find(key1 => Object.keys(object[key1]).find(key2 => object[key1][key2] === value));
            },
            goGetGeocode(lat, lng) {
                console.log('goGetGeocode');
                let $this = this;
                console.log($this.geocode.mapping);
                let exist_citydist = $this.getKeyByObjValue($this.geocode.mapping, lat.toFixed(4) + ',' + lng.toFixed(4));
                if (!(exist_citydist === undefined)) { // check lat lng mapping address
                    console.log('---------- has addressMapping');
                    let $citydist = exist_citydist.split(',');
                    $this.live.address.city = $citydist[0];
                    $this.live.address.dist = $citydist[1];
                    $this.goGetWeather(); // 確認是否需要再向 中央氣象局 要資料
                } else {
                    console.log('---------- has NOT addressMapping');
                    axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
                        params: {
                            latlng: lat + ',' + lng,
                            language: 'zh-TW',
                            key: __API_GEOCODE_ID
                        }
                    })
                    .then(function (response) {
                        console.log('---------- axios get onSuccess');

                        console.log('useGoogleApi + 1');
                        if (!localStorage.useGoogleApi) localStorage.useGoogleApi = 0;
                        localStorage.useGoogleApi = Number(localStorage.useGoogleApi) + 1;


                        // $this.geocode.address['full'] = response.data.results[0].formatted_address;
                        $this.live.address.city = $this.geocode.address['city'] = response.data.results[0].address_components.slice(-3)[0]['long_name'];
                        $this.live.address.dist = $this.geocode.address['dist'] = response.data.results[0].address_components.slice(-4)[0]['long_name']
                        let $citydist = $this.live.address.city + ',' + $this.live.address.dist;
                        console.log($this.geocode.mapping);
                        // console.log('_____確認 mapping code ?');
                        if ((!Object.keys($this.geocode.mapping).length > 0)
                        || (!$this.geocode.mapping.hasOwnProperty($citydist))) { // 確認是否有 citydist
                            // console.log('_____沒有 mapping code 或是沒有對應的 citydist');
                            $this.geocode.mapping[$citydist] = [];
                        }
                        // console.log('_____確認 座標是否已存在 ?');
                        if (!$this.geocode.mapping[$citydist].includes(lat.toFixed(4) + ',' + lng.toFixed(4))) {
                            // console.log('_____否 存在座標，為新座標');
                            $this.geocode.mapping[$citydist].push(lat.toFixed(4) + ',' + lng.toFixed(4));
                        }
                        localStorage.geoMapping = JSON.stringify($this.geocode.mapping);
                        $this.goGetWeather(); // 確認是否需要再向 中央氣象局 要資料
                    })
                    .catch(function (error) {
                        console.log(error);
                    });
                }
            },
            goGetWeather() {
                console.log('goGetWeather');
                let $this = this;
                if (this.weather.update !== '') return this.updateLiveData(); // 確認已有 中央氣象局 資料，即不再次抓取
                if (this.geocode.coords.length !== 2) return;

                axios.get('https://opendata.cwb.gov.tw/fileapi/v1/opendataapi/F-D0047-091', {
                    params: {
                        Authorization: __API_OPENDATA_WEB_GOV_ID,
                        format: 'JSON',
                        // locationName: this.live.address.city.replace(/台/i, '臺'),
                    }
                })
                .then(function (response) {
                    console.log('===== get F-D0047-091 response =====');
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

                    axios.get('https://opendata.cwb.gov.tw/fileapi/v1/opendataapi/F-D0047-089', {
                        params: {
                            Authorization: __API_OPENDATA_WEB_GOV_ID,
                            format: 'JSON',
                        }
                    })
                    .then(function (response) {
                        console.log('===== get F-D0047-089 response =====');

                        console.log('useCWB + 1');
                        if (!localStorage.useCWB) localStorage.useCWB = 0;
                        localStorage.useCWB = Number(localStorage.useCWB) + 1;

                        console.log(response);
                        let $data = response.data.cwbopendata;
                        let $loaction = $data.dataset.locations.location;
                        $loaction.forEach(function(e, index) {
                            let $name = e.locationName.replace(/臺/i, '台'); // filter 臺 to 台
                            for (let i = 0; i < e.weatherElement.length; i++) {
                                $this.weather.location[$name][e.weatherElement[i]['elementName']] = e.weatherElement[i]['time'];
                            }
                        });
                        localStorage.weather = JSON.stringify($this.weather);
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
                console.log('updateLiveData');
                // console.log(this.weather);
                // console.log(this.live.address.city);
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
            }
        }
    });
    var timer = setInterval(() => {
        vm.d = (new Date());
    }, 1000);
})();
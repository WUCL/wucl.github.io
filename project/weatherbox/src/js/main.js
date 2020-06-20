(function() {
    "use strict";

    window.mapping = {
        day: {

        }
    };

    var vm = new Vue({
        el: "#weatherbox",
        data: {
            a: 1,
            d: (new Date()),
            coords: [],
        },
        beforeCreate: function() {
            console.log("%cHi This is Allen", "padding:0 5px;background:#ffcc00;color:#116934;font-weight:bolder;font-size:50px;")
            if ('scrollRestoration' in history) { history.scrollRestoration = 'manual'; }

            console.log('== beforeCreate ==')
            // console.log('this.a: ' + this.a)
            // console.log('this.$el: ' + this.$el)
            // console.log()
        },
        created: function() {
            var $this = this;

            // to get address
            // https://developers.google.com/maps/documentation/javascript/examples/geocoding-reverse
            if ("geolocation" in navigator) {
                console.log('geolocation is available');
                navigator.geolocation.getCurrentPosition(onSuccess, onError);
                function onSuccess(position) {
                    var element = document.getElementById('geolocation');
                    $this.coords[0] = position.coords.latitude;
                    $this.coords[1] = position.coords.longitude;
                    // console.log('Latitude: ' + position.coords.latitude + '\n' + 'Longitude: ' + position.coords.longitude + '\n' + 'Altitude: ' + position.coords.altitude + '\n' + 'Accuracy: ' + position.coords.accuracy + '\n' + 'Altitude Accuracy: ' + position.coords.altitudeAccuracy + '\n' + 'Heading: ' + position.coords.heading + '\n' + 'Speed: ' + position.coords.speed + '\n' + 'Timestamp: ' + position.timestamp);
                    console.log($this.coords);
                }

                // onError Callback receives a PositionError object
                //
                function onError(error) {
                    console.log('code: ' + error.code + '\n' + 'message: ' + error.message + '\n');
                }
            } else {
                console.log('geolocation IS NOT available');
            }

            console.log('== created ==')
            // console.log('this.a: ' + this.a)
            // console.log('this.$el: ' + this.$el)
            // console.log()
        },
        mounted: function() {
            console.log('== mounted ==')
            // console.log('this.a: ' + this.a)
            // console.log('this.$el: ' + this.$el)

            // window.el.$body.addClass(deviceObj.name);
            // this.loadExps();
        },
        computed: {
            dateandtime: function () { return this.d.toLocaleString() },
        },
        watch: {
        },
        methods: {
        }
    });
    var timer = setInterval(function(){
        vm.d = (new Date());
    }, 1000);
})();
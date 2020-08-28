$(function() {
    var main = {
        env: 'html',
        el: {
            $window: $(window),
            $doc: $(document),
            $body: $('body'),
            $header: $('#header'),
            $main: $('#main'),
            $footer: $('#footer'),

            $btnTakeallow: $('.btn-takeallow'),
        },
        var: {
            $orientation: {
                alpha: '',
                beta: '',
                gamma: '',
            },
        },
        init: function() {
            if ('scrollRestoration' in history) { history.scrollRestoration = 'manual'; }
            this.el.$body.addClass(deviceObj.name);
            this.bindEvent();

            let $this = this;
            if (window.DeviceOrientationEvent) {
                window.addEventListener("deviceorientation", function(event) {
                    $this.var.$orientation.alpha = Math.round(event.alpha); // 行動裝置水平放置時，繞 Z 軸旋轉的角度，數值為 0 度到 360 度。
                    $this.var.$orientation.beta = Math.round(event.beta); // 上下, 行動裝置水平放置時，繞 X 軸旋轉的角度，數值為 -180 度到 180 度。
                    $this.var.$orientation.gamma = Math.round(event.gamma); // 左右, 行動裝置水平放置時，繞 Z 軸旋轉的角度，數值為 -90 度到 90 度。
                    console.log($this.var.$orientation);
                    let $all = 'X :: ' + $this.var.$orientation.gamma + '\n\r' + 'Y :: ' + $this.var.$orientation.beta + '\n\r' + 'Z :: ' + $this.var.$orientation.alpha;
                    $('.content').html($all);
                }, false);
            } else {
                alert("您的瀏覽器不支援陀螺儀偵測");
            }
        },
        bindEvent: function() {
            this.el.$btnTakeallow.on('click', async () => {
                if (!DeviceOrientationEvent) {
                    alert('不好意思\n你的手機似乎不支援陀螺儀')
                }
                if (DeviceOrientationEvent && !DeviceOrientationEvent.requestPermission) {
                    alert('不好意思\n你的手機版本是要自己手動開啟陀螺儀')
                }
                if (DeviceOrientationEvent && DeviceOrientationEvent.requestPermission) {
                    const status = await DeviceOrientationEvent.requestPermission()
                    if (status === 'denied') {
                        alert('如果要重新開啟手機搖動偵測\n請重新以新頁籤開啟本網頁\n並允許陀螺儀開啟');
                    }
                    if (status === 'granted') {
                        alert('盡情吧!');
                    }
                }
            });
        },
    };
    main.init();
});

$(function() {
    var MEMBER = {
        el: {
            $window: $(window),
            $doc: $(document),
            $body: $('body'),
            $header: $('#header'),
            $main: $('#main'),
            $footer: $('#footer'),
            $mycampaign: $('#mycampaign'),
            $btnCreatRecorder: $('#btn-creat-recorder'),
            $btnAddCampaignUpdate: $('#btn-add-campaign-update'),
            
            $recoderImg: $('#recorder-img'),
            $btnFileDl: $('#btn-recorder-dl'),
        },
        var: {
            $m: {
                name: '吳阿倫',
                avatar: '',
                kg: 0,
            },
        },
        init: function() {
            console.log('member');
            this.bindEvent();
            this.postcardMaker();
            this.setPopup();
        },
        postcardMaker: function() {
            let $this = this;
            let canvas = document.getElementById('canvas'),
                ctx = canvas.getContext('2d'),
                image_bg = new Image(),
                image_pin = new Image(),
                image_avatar = new Image(),
                base64 = '';

            let btn_merge = document.getElementById('btn-creat-recorder');

            function getRandomArbitrary(min, max) {
                return Math.round(Math.random() * (max - min) + min);
            }

            btn_merge.onclick = function() {
                $this.var.$m.kg = 0; // clean first

                // if (!$this.var.$postcard.checkisok) return;
                image_bg.src = 'public/img/recorder-bg.png';
                image_pin.src = 'public/img/recorder-pin.png';
                image_avatar.src = document.getElementById('m-avatar').src;

                image_bg.setAttribute("crossOrigin", 'Anonymous');
                image_pin.setAttribute("crossOrigin", 'Anonymous');
                image_avatar.setAttribute("crossOrigin", 'Anonymous');

                image_bg.onload = function() {
                    console.log('image_bg');
                    var w = this.width,
                        h = this.height,
                        pin_w = image_pin.width / 2.3,
                        pin_h = image_pin.height / 2.3,
                        avatar_w = 240,
                        avatar_h = 240
                        ;

                    // Step1. setting background
                    canvas.width = w;
                    canvas.height = h;

                    ctx.drawImage(this, 0, 0, w, h);

                    console.log('Step2');
                    // Step2. setting pin in tw map
                    // image_pin.onload = function() {
                        console.log('image_pin');
                        $.each(window.myCampaign, function(index, item) {
                            let _campaign = window.campaigns[item];
                            let _area = _campaign.area;
                            let _x = window.tw_xy[_area][0] + (getRandomArbitrary(-15, 15));
                            let _y = window.tw_xy[_area][1] + (getRandomArbitrary(-15, 15));
                            $this.var.$m.kg += _campaign.kg;
                            ctx.drawImage(image_pin, _x, _y, pin_w, pin_h);
                        })

                        // avatar
                        ctx.drawImage(image_avatar, 870, 710, avatar_w, avatar_h);

                        // name
                        ctx.fillStyle = "white";
                        ctx.font="75px 微軟正黑體";
                        ctx.fillText($this.var.$m.name, 870, 1050);

                        // kg
                        ctx.font="75px 微軟正黑體";
                        ctx.fillText('KG', 1410, 1315);

                        ctx.font="140px 微軟正黑體";
                        ctx.textAlign = "right";
                        ctx.fillText($this.var.$m.kg, 1400, 1315);

                        // result
                        base64 = canvas.toDataURL("image/png");
                        $this.el.$btnFileDl.attr('href', base64);
                        $this.el.$recoderImg.attr('src', base64);
                    // }
                }
            }
        },
        bindEvent: function() {
            let $this = this;
            $('#m-editor-avatar').on('change', function() {
                var reader = new FileReader();
                reader.onload = function() {
                    var output = document.getElementById('preview_avatar');
                    output.src = reader.result;
                }
                reader.readAsDataURL(event.target.files[0]);
            });
            $('#btn-m-editor-update').on('click', function() {
                $this.var.$m.avatar = $('#preview_avatar').attr('src');
                $this.var.$m.name = $('#m-editor-name').val();
                console.log($this.var.$m);
                if ($this.var.$m.avatar != '') {
                    $('#m-avatar').attr('src', $this.var.$m.avatar);
                }
                if ($this.var.$m.name != $('#m-name').val()) {
                    $('#m-name').val($this.var.$m.name);
                }
                $('#edit-member').popup('hide');
            });
            $('#btn-myrecord-edit').on('click', function() {
                return;
            });
            $this.el.$mycampaign.on('click', '.campaign .btn-del-campaign', function(e) {
                let _id = e.target.value;
                let text = "";

                if (confirm("確定刪除嗎？") == true) {
                    text = '確定刪除 ID: ' + _id;
                    $this.el.$mycampaign.find('.campaign[data-id="' + _id + '"]').remove();
                    // API send id to del
                } else {
                    text = "取消刪除";
                    return;
                }
                console.log(text);
            });
            $this.el.$mycampaign.on('click', '.campaign .btn-add-campaign', function(e) {
                console.log('add campaign')
            });
            $this.el.$btnAddCampaignUpdate.on('click', function() {
                console.log('add campaign, need to update');
                $('#add-campaign').popup('hide');
                return;
            });

            $this.el.$btnCreatRecorder.on('click', function () {
                // $this.el.$recorderImg.attr('src', 'public/img/result.png');
                return console.log("btn-creat-recorder");
            })
        },
        setPopup: function() {
            $('#edit-member').popup({
                escape: false,
                closebutton: true,
                scrolllock: true,
            });
            $('#add-campaign').popup({
                escape: false,
                closebutton: true,
                scrolllock: true,
            });
        },
    };
    MEMBER.init();
});
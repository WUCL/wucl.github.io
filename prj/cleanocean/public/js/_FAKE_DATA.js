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
        },
        var: {
            $m: {
                name: '',
                avatar: '',
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
                base64 = '';

            let btn_dl = document.getElementById('dl'),
                btn_merge = document.getElementById('btn-creat-recorder');

            btn_merge.onclick = function() {
                // if (!$this.var.$postcard.checkisok) return;
                image_bg.src = 'public/img/recorder-bg.png';
                image_pin.src = 'public/img/recorder-pin.png';
                // image_recorder = document.getElementById('recorder-img');

                image_bg.setAttribute("crossOrigin", 'Anonymous');
                image_pin.setAttribute("crossOrigin", 'Anonymous');
                // image_recorder.setAttribute("crossOrigin", 'Anonymous');

                image_bg.onload = function() {
                    var w = this.width,
                        h = this.height,
                        pin_w = image_pin.width,
                        pin_2 = image_pin.height
                        ;

                    // Step1. setting background
                    canvas.width = w;
                    canvas.height = h;

                    ctx.drawImage(this, 0, 0, w, h);

                    // Step2. setting pin in tw map
                    // ctx.drawImage(image_a, 0, 0, w, h);
                    // ctx.drawImage(this, 50, 40, target_w, target_h);

                    // result
                    base64 = canvas.toDataURL("image/png");
                    $this.el.$recoderImg.attr('src', base64);
                    // $this.var.$postcard.result = base64;
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
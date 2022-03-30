$(function() {
    var MEMBER = {
        el: {
            $window: $(window),
            $doc: $(document),
            $body: $('body'),
            $header: $('#header'),
            $main: $('#main'),
            $footer: $('#footer'),
            $btnMEditorUpdate: $('#btn-m-editor-update'),
            $myRecord: $('#my-record'),
            $mycampaign: $('#mycampaign'),
            $btnMyrecordEdit: $('#btn-myrecord-edit'),
            $btnCreatRecorder: $('#btn-creat-recorder'),
            $btnAddCampaignUpdate: $('#btn-add-campaign-update'),

            $recoderImg: $('#recorder-img'),
            $btnFileDl: $('#btn-recorder-dl'),

            $mName: $('#m-name'),
            $mAvatar: $('#m-avatar'),
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
            this.goInitial(); // 先 ajax 拿到資料先builder
            this.loadPostcard();
            this.bindEvent();
            this.goUpdateMember();
            this.postcardMaker();
            this.setPopup();
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
            $this.el.$btnMEditorUpdate.on('click', function() {
                $this.var.$m.avatar = $('#preview_avatar').attr('src');
                $this.var.$m.name = $('#m-editor-name').val();
                console.log($this.var.$m);
                if ($this.var.$m.avatar != '') {
                    $this.el.$mAvatar.attr('src', $this.var.$m.avatar);
                }
                if ($this.var.$m.name != $this.el.$mName.val()) {
                    $this.el.$mName.val($this.var.$m.name);
                }
                $('#edit-member').popup('hide');
            });
            $this.el.$btnMyrecordEdit.on('click', function() {
                let _mode = $this.el.$myRecord.attr('data-edit-mode');
                if (_mode == '0') _mode = '1';
                else _mode = '0';
                return $this.el.$myRecord.attr('data-edit-mode', _mode);
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
        goInitial: function() {
            let $this = this;
            console.log('goInitial');
            // $this.buildAlbum(window.album);
        },
        loadPostcard: function() { // window.member
            let $this = this;
            let _source = window.member.postcard;
            let _target = $('#postcard-list');
            let _template_postcards = window.helper.getTemplate('member__postcards');
            let _templates = '';
            for (let i = 0; i < _source.length; i++) {
                _template_postcards = _template_postcards.replace(/\[POSTCARD_IMG\]/g,  _source[i]);
                _template_postcards = _template_postcards.replace(/data-src/g,  'src');
                _templates += _template_postcards;
            }
            _target.html(_templates);
            this.builSlider();
        },
        builSlider: function() {
            let $myflipster = $('.my-flipster');
            if ($myflipster.length) {
                $myflipster.flipster({
                    itemContainer: 'ul',
                    // [string|object]
                    // Selector for the container of the flippin' items.

                    itemSelector: 'li',
                    // [string|object]
                    // Selector for children of `itemContainer` to flip

                    start: 'center',
                    // ['center'|number]
                    // Zero based index of the starting item, or use 'center' to start in the middle

                    fadeIn: 400,
                    // [milliseconds]
                    // Speed of the fade in animation after items have been setup

                    loop: true,
                    // [true|false]
                    // Loop around when the start or end is reached

                    autoplay: false,
                    // [false|milliseconds]
                    // If a positive number, Flipster will automatically advance to next item after that number of milliseconds

                    pauseOnHover: true,
                    // [true|false]
                    // If true, autoplay advancement will pause when Flipster is hovered

                    style: 'coverflow',
                    // [coverflow|carousel|flat|...]
                    // Adds a class (e.g. flipster--coverflow) to the flipster element to switch between display styles
                    // Create your own theme in CSS and use this setting to have Flipster add the custom class

                    spacing: -0.6,
                    // [number]
                    // Space between items relative to each item's width. 0 for no spacing, negative values to overlap

                    click: true,
                    // [true|false]
                    // Clicking an item switches to that item

                    keyboard: true,
                    // [true|false]
                    // Enable left/right arrow navigation

                    scrollwheel: false,
                    // [true|false]
                    // Enable mousewheel/trackpad navigation; up/left = previous, down/right = next

                    touch: true,
                    // [true|false]
                    // Enable swipe navigation for touch devices

                    nav: false,
                    // [true|false|'before'|'after']
                    // If not false, Flipster will build an unordered list of the items
                    // Values true or 'before' will insert the navigation before the items, 'after' will append the navigation after the items

                    buttons: true,
                    // [true|false|'custom']
                    // If true, Flipster will insert Previous / Next buttons with SVG arrows
                    // If 'custom', Flipster will not insert the arrows and will instead use the values of `buttonPrev` and `buttonNext`

                    buttonPrev: 'Previous',
                    // [text|html]
                    // Changes the text for the Previous button

                    buttonNext: 'Next',
                    // [text|html]
                    // Changes the text for the Next button

                    onItemSwitch: false
                    // [function]
                    // Callback function when items are switched
                    // Arguments received: [currentItem, previousItem]
                });
            }
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
        goUpdateMember: function() {
            if (window.page !== 'member') return;
            console.log('goUpdateMember');
            let $this = this;

            let _member = window.member;
            $this.el.$mName.val(_member['name']);
            $this.el.$mAvatar.attr('src', _member['avatar']);

            // my camaign
            let _source = _member['campaign'];
            let _source2 = window.campaigns;
            let _target = $this.el.$mycampaign.find('ul')
            let _template_campaigns = window.helper.getTemplate('member__campaigns');
            let _templates = '';
            for (let i = 0; i < _source.length; i++) {
                let _id = _source[i];
                _template_campaigns = _template_campaigns.replace(/\[ID\]/g,  _source2[_id]['id']);
                _template_campaigns = _template_campaigns.replace(/\[COUNTY\]/g,  _source2[_id]['area']);
                _template_campaigns = _template_campaigns.replace(/\[DATA_Y\]/g,  _source2[_id]['date'][0]);
                _template_campaigns = _template_campaigns.replace(/\[DATA_M\]/g,  _source2[_id]['date'][1]);
                _template_campaigns = _template_campaigns.replace(/\[DATA_D\]/g,  _source2[_id]['date'][2]);
                _template_campaigns = _template_campaigns.replace(/\[CAMPAIGN\]/g,  _source2[_id]['campaign']);
                _templates += _template_campaigns;
            }
            _target.html(_templates);
            return;
        },
    };
    MEMBER.init();
});
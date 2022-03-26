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
            $btnCreatMyrecord: $('#btn-creat-myrecord'),
            $btnAddCampaignUpdate: $('#btn-add-campaign-update'),
            
            $myrecordImg: $('#myrecord-img'),
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

            $this.el.$btnCreatMyrecord.on('click', function () {
                $this.el.$myrecordImg.attr('src', 'public/img/result.png');
                return console.log("btn-creat-myrecord");
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
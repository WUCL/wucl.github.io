$(function() {
    var MEMBER = {
        el: {
            $window: $(window),
            $doc: $(document),
            $body: $('body'),
            $header: $('#header'),
            $main: $('#main'),
            $footer: $('#footer'),
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
        },
        setPopup: function() {
            $('#edit-member').popup({
                escape: false,
                closebutton: true,
                scrolllock: true,
            });
        },
    };
    MEMBER.init();
});
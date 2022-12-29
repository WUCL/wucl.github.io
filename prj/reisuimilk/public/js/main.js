$(function() {
    var MAIN = {
        env: 'html',
        el: {
            $window: $(window),
            $doc: $(document),
            $body: $('body'),
            $header: $('#header'),
            $main: $('#main'),
            $footer: $('#footer'),
        },
        var: {
        },
        init: function() {
            if ('scrollRestoration' in history) { history.scrollRestoration = 'manual'; }
            this.el.$body.addClass(deviceObj.name);
            this.bindEvent();
            this.fileOverwite();
        },
        bindEvent: function() {
            let $this = this;
            console.log('123');
        },
        fileOverwite: function() {
            const fs = require('fs');
            let fInput = "You are reading the content from Tutorials Point"
            fs.writeFile('tp.txt', fInput, (err) => {
               if (err) throw err;
               else{
                  console.log("The file is updated with the given data")
               }
            })
        },
    };
    MAIN.init();
});
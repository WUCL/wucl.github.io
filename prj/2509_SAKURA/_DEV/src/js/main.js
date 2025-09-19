$(function() {
    var MAIN = {
        env: 'html',
        el: {
            $window: $(window),
            $doc: $(document),
            $body: $('body'),
            $header: $('#header'),
            $hamburger: $('#hamburger'),
            $main: $('#main'),
            $footer: $('#footer'),
            $nav: $('#nav'),
            $navSwitch: $('#switch'),

            $_models: $('#_models'),

            $reply_btn: $('.reply-btn'),
            $off_popup: $('.off_popup'),
        },
        var: {
        },
        init: function() {
            if ('scrollRestoration' in history) { history.scrollRestoration = 'manual'; }
            this.el.$body.addClass(deviceObj.name);
            this.renderModelList(MODEL_LIST);
            this.bindEvent();
        },
        bindEvent: function() {
            let $this = this;

            // switch menu
            $this.el.$hamburger.on('click', function() {
                $this.el.$header.toggleClass('open');
                // document.getElementById('header').classList.toggle('open');
            });

            $this.el.$reply_btn.add($this.el.$off_popup).on('click', function () {
                $this.el.$body.toggleClass('on-popup no-scroll');
            });

            // $this.el.$reply_btn.on('click', function() {
            //     $this.el.$body.toggleClass('on-popup');
            //     $this.el.$body.toggleClass('no-scroll');
            // });

            // $this.el.$popup_cover.on('click', function() {
            //     $this.el.$body.toggleClass('on-popup');
            //     $this.el.$body.toggleClass('no-scroll');
            // });

            $this.el.$_models.on('click', '.models .models-list-item > .models-list-item-title' ,function() {
                console.log(this);
                // this.classList.toggle('unfolder');
                this.closest('.models-list-item')?.classList.toggle('unfolder');
            });

        },
        renderModelList: function (data) {
            let html = '';
            data.forEach(group => {
                html += `
                <div class="models-list-item">
                    <div class="models-list-item-title">${group.category}</div>
                    <div class="models-list-item-folder">
                        <div class="models-list-item-header">
                            <ul>
                                <li>
                                    <div class="col-1">產品<span>型號</span></div>
                                    <div class="col-2">櫻花加<span>碼金額</span></div>
                                    <div class="col-3">商品<span>連結</span></div>
                                </li>
                            </ul>
                        </div>
                        <div class="models-list-item-content">
                            <ul>`;
                            group.items.forEach(item => {
                                html += `
                                    <li class="${item.model}">
                                        <div class="col-1">${item.model}</div>
                                        <div class="col-2">${item.bonus}</div>
                                        <div class="col-3">
                                            ${item.link.includes("請洽") ? "請洽店面" : `<a href="${item.link}" target="_blank"></a>`}
                                        </div>
                                    </li>`;
                                });
                                html += `
                            </ul>
                        </div>
                    </div>
                </div>`;
            });
            // this.el.$_models.html('<div class="models">' + html + '</div>');
            this.el.$_models.find('.models-list').html(html);
        }
        // doAos: function() {
        //     return AOS.init({
        //         duration: 300,
        //         offset: 150,
        //         delay: 0,
        //         once: true,
        //         easing: 'ease-in'
        //     });
        // },
        // doScrollIt: function() {
        //     let $this = this;
        //     $.scrollIt({
        //         upKey: 38,             // key code to navigate to the next section
        //         downKey: 40,           // key code to navigate to the previous section
        //         easing: 'easeInOutExpo',      // the easing function for animation
        //         scrollTime: 600,       // how long (in ms) the animation takes
        //         activeClass: 'active', // class given to the active nav element
        //         onPageChange: function(e) {},    // function(pageIndex) that is called when page is changed
        //         topOffset: -130           // offste (in px) for fixed top navigation
        //     });
        // },
    };
    MAIN.init();
});
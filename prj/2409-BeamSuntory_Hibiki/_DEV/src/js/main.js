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

            $_searcher: $('#_searcher'),
            $searchbar: $('#searchbar'),
            $ticket: $('#ticket'),

            $s_it: $('#s_it'),
            $btn_submit: $('#btn-submit'),
            $btn_research: $('#btn-research'),

            $carouselit: $('#carouselit'),
        },
        var: {
            _phone: '',
        },
        init: function() {
            if ('scrollRestoration' in history) { history.scrollRestoration = 'manual'; }
            this.el.$body.addClass(deviceObj.name);
            this.bindEvent();

            this.carouselit();
        },
        bindEvent: function() {
            let $this = this;

            $this.el.$s_it.on('keypress', (e) => {
                console.log('$s_it');

                // Only ASCII character in that range allowed
                let ASCIICode = (e.which) ? e.which : e.keyCode
                if (ASCIICode > 31 && (ASCIICode < 48 || ASCIICode > 57))
                    return false;
                return true;
            });
            $this.el.$btn_submit.on('click', (e) => {
                console.log('$s_submit');

                const regex = /^09[0-9]{8}$/;
                let _s_it = $this.el.$s_it;
                let _phone = _s_it.val();
                let _vaild = regex.test(_phone);
                // console.log(_phone);
                // console.log(_vaild);

                if (!_vaild) {
                    $this.el.$searchbar.addClass('_error');
                } else {
                    $this.el.$searchbar.removeClass('_error');
                    $this.var._phone = _phone; // if the number format correct

                    $this.doTicket(); // call ticket number
                }
                return;
            });

            // research
            $this.el.$btn_research.on('click', (e) => {
                console.log('research');

                // claer and empty
                $this.var._phone = '';
                $this.el.$s_it.val(''); // empty search bar

                $this.el.$_searcher.attr('data-layer', 1); // change layer back to 'search'
                return;
            });
        },

        doTicket: function() {
            let $this = this;

            console.log('doTicket');
            console.log($this.var._phone);

            let _ticket;
            //

            if ($this.var._phone == '0912345678') return alert('查無此號碼'); // just for test, need to change

            _ticket = '20398';
            //
            $this.el.$_searcher.attr('data-layer', 2); // change layer to 'ticket'
            return $this.el.$ticket.attr('data-num', _ticket);
        },

        carouselit: function() {
            this.el.$carouselit.slick({
                infinite: false,
                dots: false,
                slidesToShow: 3,
                slidesToScroll: 1,
                // centerMode: true,
                centerPadding: '30px',
                prevArrow: '<button type="button" class="slick-prev"></button>',
                nextArrow: '<button type="button" class="slick-next"></button>',
                responsive: [
                    {
                      breakpoint: 900,
                      settings: {
                        slidesToShow: 2
                      }
                    },
                    {
                      breakpoint: 560,
                      settings: {
                        slidesToShow: 1
                      }
                    }
                  ]
            });
        },
    };
    MAIN.init();
});
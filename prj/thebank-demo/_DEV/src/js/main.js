$(function() {
    var MAIN = {
        test_mode: false,
        api: {
            url: 'https://fakebank.69939.uk/api/v1',
            data: {}
        },
        env: 'html',
        el: {
            $window: $(window),
            $doc: $(document),
            $body: $('body'),
            $main: $('#main'),

            $dateTime: $('.date-time'), // set the opening datetime
            $totalAmount: $('.total-amount'), // set the assets total amount
            $idSpan: $('span.ntd-lives-account-id'),
            $idSelect: $('select.ntd-lives-account-id'),

            $btnBack: $('.btn-back'),

            $step1: $('#step-1'),
            $step2: $('#step-2'),
            $step3: $('#step-3'),
            $step4: $('#step-4'),
            $step5: $('#step-5'),
            $step6: $('#step-6'),
            $step7: $('#step-7'),

            // step2
            $loginForm: $('#login-form'),
            $loginEye: $('#login-eye'),
            $loginSubmit: $('#login-submit'),
            // step2

            // step3
            $ntdSavings: $('#ntd-savings'),
            // step3

            // step4
            $ntdLivesAccount: $('#ntd-lives-account'),
            // step4

            // step5
            $tradeList: $('#trade-list'),
            $btnTransfer: $('#btn-transfer'),
            // step5

            // step6
            $btnNext: $('#btn-next'),
            // step6

            $select: $('#select-index'), // test
        },
        var: {
            _step1: {
                timeout: 1500,
            },
        },
        init: function() {
            if ('scrollRestoration' in history) { history.scrollRestoration = 'manual'; }
            this.el.$body.addClass(deviceObj.name);
            if (this.test_mode) this.testMode();
            this.getDateTime();
            this.bindEvent();
            this.step1();
            this.step2();
            this.step3();
            this.step4();
            this.step5();
            this.step6();
            this.step7();
        },
        testMode: function() {
            console.log('testMode');
            let $this = this;
            $this.el.$body.attr('data-mode', 'test');
            $this.el.$body.prepend('<select id="select-index" style="position: fixed; right: 0; z-index: 999;"><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option><option value="6">6</option><option value="7">7</option></select>');
            $('#login-id').attr('value', 'N123456788');
            $('#login-account').attr('value', 'user003');
            $('#login-password').attr('value', '1qaz@WSX');
            $this.el.$select.val($this.el.$main.attr('data-index'));
            $this.el.$select.on('change', (e) => {
                let $index = e.target.value;
                $this.tranIndex($index);
            });
        },
        getDateTime: function() {
            let $this = this;
            let $dt = moment().format('YYYY/MM/DD hh:mm:ss'); // 2022/07/26 17:09:13
            // console.log($dt);
            return $this.el.$dateTime.html($dt);
        },
        bindEvent: function() {
            let $this = this;
            $this.el.$btnBack.on('click', () => {
                return $this.tranIndex('back');
            })
        },
        tranIndex: function(index) {
            let $currentIndex = parseInt(this.el.$main.attr('data-index'));
            // console.log($currentIndex);
            switch (index) {
                case 'next':
                    index = $currentIndex + 1;
                break;
                case 'back':
                    index = $currentIndex - 1;
                break;
            }
            this.el.$main.attr('data-index', index);
            window.scrollTo(0, 0);

            if (this.test_mode) this.testMode();
            return;
        },
        step1: function() {
            if (this.el.$main.attr('data-index') !== "1") return;
            // console.log('step1');
            let $this = this;
            setTimeout(( () => $this.tranIndex('next') ), $this.var._step1.timeout);
        },
        step2: function() {
            // if (this.el.$main.attr('data-index') !== "2") return;
            // console.log('step2');
            let $this = this;
            $this.el.$loginEye.on('click', () => {
                console.log('eye');
                let $switch = ($('#login-account').attr('type') === "password")?"text":"password";
                $('#login-account').attr('type', $switch);
                $this.el.$step2.attr('data-eye', $switch);
                return;
            });
            $this.el.$loginSubmit.on('click', () => {
                console.log('submit');
                console.log($this.el.$loginForm.serializeArray());

                $.each($this.el.$loginForm.serializeArray(), function() {
                    $this.api.data[this.name] = this.value;
                });

                // "id":"N123456788",
                // "account":"user003",
                // "password":"1qaz@WSX",

                // call api // ajax url
                    var _url = $this.api.url;
                    let _data = Object.assign({}, $this.api.data);
                    console.log(_data);

                    // ajax handle
                    $.ajax({
                        url: _url,
                        type: "post",
                        data: JSON.stringify(_data),
                        dataType: "json",
                        success: (response) => {
                            console.log(response);
                            if (response.is_success === 1) {
                                doSuccess(response);
                            }
                            return;
                        },
                        error: function(response) {
                            console.log("error");
                            console.log(response);
                        }
                    });

                    function doSuccess(_r) { // to get the account data
                        console.log(_r);

                        let $amount = _r.total
                        , $id = _r.id
                        , $detail = _r.detail;

                        $this.el.$totalAmount.html(window.helper.numberWithCommas($amount));
                        $this.el.$idSpan.html($id);
                        $this.el.$idSelect.html('<option value="' + $id + '">' + $id + '</option>')

                        let _source = $detail
                        , _target = $this.el.$tradeList
                        , _template_item = window.helper.getTemplate('trade-item')
                        , _templates = '';

                        for ($prop in _source) {
                            let _template = _template_item;
                            _template = _template.replace(/\[DATE\]/g, moment(parseInt(_source[$prop].date)).format('MM/DD'));
                            _template = _template.replace(/\[TITLE\]/g, _source[$prop].title);
                            _template = _template.replace(/\[SUBTITLE\]/g, _source[$prop].subtitle);
                            _template = _template.replace(/\[MONEY\]/g, window.helper.numberWithCommas(_source[$prop].money));
                            _templates += _template;
                        }
                        _target.html(_templates);

                        return $this.tranIndex('next');
                    }
                // call api // ajax url
            });
        },
        step3: function() {
            // if (this.el.$main.attr('data-index') !== "3") return;
            // console.log('step3');
            let $this = this;

            $this.el.$ntdSavings.on('click', () => {
                return $this.tranIndex('next');
            });
        },
        step4: function() {
            // if (this.el.$main.attr('data-index') !== "4") return;
            // console.log('step4');
            let $this = this;
            $this.el.$ntdLivesAccount.on('click', () => {
                return $this.tranIndex('next');
            });
        },
        step5: function() {
            // if (this.el.$main.attr('data-index') !== "5") return;
            // console.log('step5');
            let $this = this;
            $this.el.$btnTransfer.on('click', () => {
                return $this.tranIndex('next');
            });
        },
        step6: function() {
            // if (this.el.$main.attr('data-index') !== "6") return;
            // console.log('step6');
            let $this = this;
            $this.el.$btnNext.on('click', () => {
                return $this.tranIndex('next');
            });
        },
        step7: function() {
            // if (this.el.$main.attr('data-index') !== "7") return;
            // console.log('step7');
            let $this = this;
        },
    };
    MAIN.init();
});
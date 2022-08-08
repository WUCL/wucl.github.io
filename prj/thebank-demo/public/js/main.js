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
            $tradeListsOption: $('#trade-lists-option'),
            $tradeLists: $('#trade-lists'),
            // $tradeList: $('.trade-list'),
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
            _trads: [],
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

            if (this.test_mode) this.el.$loginSubmit.click();
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

            // if (this.test_mode) this.testMode();
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
                $this.el.$body.attr('data-loading', '1');

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
                            } else {
                                $this.el.$body.attr('data-loading', '');
                                alert('登入錯誤');
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
                        , $detail = _r.detail
                        , $account = $id.replaceAt($id.length-1, "*");
                        $account = $account.replaceAt($account.length-6, "*").replaceAt($account.length-7, "*");

                        $this.el.$totalAmount.html(window.helper.numberWithCommas($amount));
                        $this.el.$idSpan.html($id);
                        $this.el.$idSelect.html('<option value="' + $id + '">' + $id + '</option>')

                        // process trade item

                        let _source1 = $detail; // reOrder trade

                        for ($prop1 in _source1) {
                            let $date = parseInt(_source1[$prop1].date)
                            , $y = moment.unix($date).format('YYYY')
                            , $m = moment.unix($date).format('MM')
                            , $d =  moment.unix($date).format('DD');

                            // console.log(_source1[$prop1]);
                            // console.log("Year :: " + $y);
                            // console.log("Month :: " + $m);
                            // console.log("MonthDate :: " + $md);
                            if ($this.var._trads[$y] === undefined) $this.var._trads[$y] = {};
                            if ($this.var._trads[$y][$m] === undefined) $this.var._trads[$y][$m] = {};
                            $this.var._trads[$y][$m][$d] = _source1[$prop1];
                        }
                        console.log($this.var._trads);

                        let _source2 = $this.var._trads
                        , _target_option = $this.el.$tradeListsOption
                        , _template_option = window.helper.getTemplate('trade-option')
                        , _templates_option = ''

                        , _target_list = $this.el.$tradeLists
                        , _template_list = window.helper.getTemplate('trade-list')
                        , _template_item = window.helper.getTemplate('trade-item')
                        , _templates_list = '';

                        for ($prop2 in _source2) {
                            console.log(_source2);

                            let _source3 = _source2[$prop2]
                            , $y = $prop2
                            , $m = 0
                            , $d = '';

                            for ($prop3 in _source3) {
                                $m = $prop3;
                                console.log($m);
                                let _source4 = _source3[$prop3]
                                , $templateOption = _template_option
                                , $templateList = _template_list
                                , $items = '';
                                console.log(_source4);

                                // order by
                                _source4 = Object.keys(_source4).sort().reduce(
                                    (obj, key) => {
                                        obj[key] = _source4[key];
                                        return obj;
                                    },{}
                                );

                                for ($prop4 in _source4) {
                                    $d = $prop4;
                                    // console.log($d);
                                    // console.log(_source4[$prop4])
                                    let $templateItem = _template_item
                                    , $data = _source4[$prop4]
                                    , $date = $m + '/' + $d
                                    , $title = $data.title
                                    , $subtitle = $data.subtitle
                                    , $summary = $data.summary
                                    , $ramain = window.helper.numberWithCommas($data.remain)
                                    , $money = window.helper.numberWithCommas($data.money);

                                    $templateItem = $templateItem
                                    .replace(/\[DATE\]/g, $date)
                                    .replace(/\[TITLE\]/g, $title)
                                    .replace(/\[SUBTITLE\]/g, $subtitle)
                                    .replace(/\[SUMMARY\]/g, $summary)
                                    .replace(/\[ACCOUNT\]/g, $account)
                                    .replace(/\[REMAIN\]/g, $ramain)
                                    .replace(/\[MONEY\]/g, $money);

                                    $items += $templateItem;
                                }

                                // ## build the option
                                $templateOption = $templateOption
                                .replace(/\[Y\]/g, $y)
                                .replace(/\[M\]/g, $m)
                                .replace(/\[YM\]/g, $y + "/" + $m)
                                _templates_option += $templateOption;

                                // ## build the items
                                $templateList = $templateList
                                .replace(/\[Y\]/g, $y)
                                .replace(/\[M\]/g, $m)
                                .replace(/\[ITEMS\]/g, $items);
                                _templates_list += $templateList;
                            }
                        }
                        _target_option.append(_templates_option);
                        _target_list.html(_templates_list);

                        return setTimeout(( () => {
                            $this.el.$body.attr('data-loading', '');
                            $this.tranIndex(5);
                        } ), 200); // 900
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
            $this.el.$tradeLists.on('click', '.trade-list-item', (e) => {
                return $(e.currentTarget).toggleClass('open');
            });
            $this.el.$tradeListsOption.on('click', '.trade-option-item', (e) => {
                let $el = $(e.currentTarget);
                // if ($el.hasClass('active')) return;

                $this.el.$tradeListsOption.find('.trade-option-item').removeClass('active');

                let $y = $el.attr('data-y')
                , $m = $el.attr('data-m');

                $.each($this.el.$tradeLists.find('.trade-list'), function() {
                    let $el_list = $(this)
                    , $el_list_y = $el_list.attr('data-y')
                    , $el_list_m = $el_list.attr('data-m');
                    if (($y =='0' && $m == '0') || ($el_list_y == $y && $el_list_m == $m)) {
                        $el_list.removeClass('display-none');
                        return; // same as 'continue'
                    }
                    $el_list.addClass('display-none');
                });

                return $el.addClass('active');
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
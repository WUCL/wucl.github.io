$(function() {
    var MAIN = {
        test_mode: (window.test_account === undefined)?false:true,
        api: {
            url: '/api/v1',
            data: {}
        },
        env: 'html',
        el: {
            $window: $(window),
            $doc: $(document),
            $body: $('body'),
            $main: $('#main'),

            $dateTime: $('.date-time'), // set the opening datetime
            $date: $('.date-only'), // set the opening datetime
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

            // step-2
            $loginForm: $('#login-form'),
            $loginEye: $('#login-eye'),
            $loginSubmit: $('#login-submit'),
            // step-2

            // step-3
            $userName: $('#user-name'),
            $ntdSavings: $('#ntd-savings'),
            // step-3

            // step-4
            $ntdLivesAccount: $('#ntd-lives-account'),
            // step-4

            // step-5
            $tradeListsOption: $('#trade-lists-option'),
            $tradeLists: $('#trade-lists'),
            // $tradeList: $('.trade-list'),
            $btnTransfer: $('#btn-transfer'),
            // step-5

            // step-6
            $btnToTransfer: $('#btn-to-transfer'),
            $btnCommonAgreed: $('#btn-commonagreed'),
            $transferInputAccount: $('#transfer-input-account'),
            $transferInputAmount: $('#transfer-input-amount'),
            $transferInputNote: $('#transfer-input-note'),
            // step06

            // step-7
            $btnToEnd: $('#btn-to-end'),
            $transferImmedToAmount: $('#transfer-immed-to-amount'),
            $transferImmedToAccount: $('#transfer-immed-to-account'),
            $transferImmedPassword: $('#transfer-immed-password'),
            $transferImmedFromNote: $('#transfer-immed-from-note'),
            // step-7

            // step-8
            $btnBackToTransfer: $('.btn-back-to-transfer'),
            // step-8

            // step-commonagreed
            $commonagreedLists: $('#commonagreed-lists'),
            $commonagreedListsOption: $('#commonagreed-lists-option'),
            $btnBackStep6: $('#btn-back-step6'),
            // step-commonagreed

            $select: $('#select-index'), // test
        },
        var: {
            _step1: {
                timeout1: 1200,
                timeout2: 2000,
            },
            _trads: [],
        },
        init: function() {
            if ('scrollRestoration' in history) { history.scrollRestoration = 'manual'; }
            this.el.$body.addClass(deviceObj.name);
            { // check is correct host >> https://fakebank.69939.uk/
                if (location.port === '1234') this.api.url = 'https://fakebank.69939.uk' + this.api.url;
            }
            if (this.test_mode) this.testMode();

            window.onload = () => {
                this.getDateTime();
                this.bindEvent();
                this.step1();
                this.step2();
                this.step3();
                this.step4();
                this.step5();
                this.step6();
                this.step7();
                this.step8();
                this.stepCommonAgreed();

                if (this.test_mode) this.el.$loginSubmit.click();
            };
        },
        testMode: function(_index) {
            console.log('testMode');
            let $this = this;
            $this.el.$body.attr('data-mode', 'test');
            $this.el.$body.prepend('<select id="select-index" style="position: fixed; right: 0; z-index: 999;"><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option><option value="6">6</option><option value="7">7</option></select>');
            $('#login-id').attr('value', window.test_account.id);
            $('#login-account').attr('value', window.test_account.account);
            $('#login-password').attr('value', window.test_account.password);
            $this.el.$select.val($this.el.$main.attr('data-index'));

            // if (_index !== '') $this.tranIndex(_index);
            if (_index !== '') $this.tranIndex(5);
            // $this.el.$select.on('change', (e) => {
            //     let $index = e.target.value;
            //     $this.tranIndex($index);
            // });
        },
        getDateTime: function() {
            let $this = this;
            let $dt = moment().format('YYYY/MM/DD HH:mm:ss') // 2022/07/26 17:09:13
            , $d = moment().format('YYYY/MM/DD');
            $this.el.$dateTime.html($dt);
            $this.el.$date.html($d);
            return;
        },
        bindEvent: function() {
            let $this = this;
            $this.el.$btnBack.on('click', () => {
                return $this.tranIndex('back');
            })
        },
        tranIndex: function(_index) {
            // console.log(_index);
            let $currentIndex = parseInt(this.el.$main.attr('data-index'))
            , $index = _index || 'next';
            switch ($index) {
                case 'next':
                    $index = $currentIndex + 1;
                break;
                case 'back':
                    $index = $currentIndex - 1;
                break;
            }
            this.el.$main.attr('data-index', $index);
            return window.scrollTo(0, 0);
        },
        step1: function() {
            let $this = this;
            if ($this.test_mode) return;
            setTimeout(( () => $this.tranIndex('next') ), ($this.var._step1.timeout1 + $this.var._step1.timeout2));
        },
        step2: function() {
            let $this = this;
            $this.el.$loginEye.on('click', () => {
                let $switch = ($('#login-account').attr('type') === "password")?"text":"password";
                $('#login-account').attr('type', $switch);
                $this.el.$step2.attr('data-eye', $switch);
                return;
            });
            $this.el.$loginSubmit.on('click', () => {
                return $this.processAPI();
            });
        },
        step3: function() {
            let $this = this;

            $this.el.$ntdSavings.on('click', () => {
                return $this.tranIndex('next');
            });
        },
        step4: function() {
            let $this = this;
            $this.el.$ntdLivesAccount.on('click', () => {
                return $this.tranIndex('next');
            });
        },
        step5: function() {
            let $this = this;
            $this.el.$btnTransfer.on('click', () => {
                return $this.tranIndex('next');
            });
            $this.el.$tradeLists.on('click', '.trade-list-item', (e) => {
                return $(e.currentTarget).toggleClass('open');
            });
            $this.el.$tradeListsOption.on('click', '.trade-option-item', (e) => {
                let $el = $(e.currentTarget);

                if ($el.hasClass('active')) return;
                $this.el.$tradeListsOption.find('.trade-option-item').removeClass('active');

                let $y = $el.attr('data-y')
                , $m = $el.attr('data-m');
                $this.el.$tradeLists.attr({
                    'data-y': $y,
                    'data-m': $m,
                })

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
            let $this = this;
            $this.el.$btnToTransfer.on('click', () => {
                let $account = $this.el.$transferInputAccount.val()
                , $name = $this.el.$transferInputAccount.attr('data-name')
                , $amount = parseInt($this.el.$transferInputAmount.val())
                , $note = $this.el.$transferInputNote.val();

                if ($account === '') return alert('尚未輸入轉入帳號');
                if ($amount === '') return alert('尚未輸入轉入金額');
                if ($amount < 1) return alert('轉入金額為 0元，無法轉帳');

                $this.el.$transferImmedToAccount.html($account);
                $this.el.$transferImmedToAccount.attr('data-name', $name);
                $this.el.$transferImmedToAmount.html(window.helper.numberWithCommas($amount));
                $this.el.$transferImmedFromNote.html($note);

                return $this.tranIndex('next');
            });
            $this.el.$btnCommonAgreed.on('click', () => {
                return $this.tranIndex('commonagreed');
            });
        },
        step7: function() {
            let $this = this;
            $this.el.$btnToEnd.on('click', () => {
                if ($this.el.$transferImmedPassword.val() === '') return alert('尚未輸入網銀密碼');

                $this.el.$body.attr('data-loading', '1');
                return setTimeout(( () => {
                    $this.tranIndex('8');
                    $this.el.$body.attr('data-loading', '');

                    // clean data
                    $this.el.$transferImmedPassword.val('');
                    $this.el.$transferImmedToAmount.html('');
                    $this.el.$transferImmedToAmount.attr('data-name', '');
                    $this.el.$transferImmedToAccount.html('');
                    $this.el.$transferImmedFromNote.html('');
                } ), 1000);
            });
        },
        step8: function() {
            let $this = this;
            $this.el.$btnBackToTransfer.on('click', () => {
                $this.el.$transferInputAccount.val("").attr({'value': '', 'data-name': ''});
                $this.el.$transferInputAmount.val("").attr('value', '');
                $this.el.$transferInputNote.val("");
                return $this.tranIndex('6');
            });
        },
        stepCommonAgreed: function() {
            let $this = this;
            $this.el.$btnBackStep6.on('click', () => {
                return $this.tranIndex('6');
            });
            $this.el.$commonagreedListsOption.on('click', '.commonagreed-lists-option-item', (e) => {
                let $el = $(e.currentTarget)
                , $option = $el.attr('data-option');

                if ($el.hasClass('active')) return;
                $this.el.$commonagreedListsOption.find('.commonagreed-lists-option-item').removeClass('active');
                $el.toggleClass('active');
                $this.el.$commonagreedLists.attr('data-lists', $option);
                return;
            });
            $this.el.$commonagreedLists.on('click', '.commonagreed-item', (e) => {
                let $el = $(e.currentTarget)
                , $num = $el.attr('data-num')
                , $id = $el.attr('data-id')
                , $account = $num + "-" + $id
                , $name = $el.attr('data-name');

                $this.el.$transferInputAccount.val($account).attr('data-name', $name);
                return $this.tranIndex(6);
            });
        },


        processAPI: function() {
            let $this = this;
            $.each($this.el.$loginForm.serializeArray(), function() {
                $this.api.data[this.name] = this.value;
            });
            $this.el.$body.attr('data-loading', '1');

            // call api // ajax url
            {
                var _url = $this.api.url;
                let _data = Object.assign({}, $this.api.data);

                // ajax handle
                $.ajax({
                    url: _url,
                    type: "post",
                    data: JSON.stringify(_data),
                    dataType: "json",
                    success: (response) => {
                        // console.log(response);
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
                    // console.log(_r);
                    let $amount = _r.total
                    , $id = _r.id
                    , $name = _r.name
                    , $account = $id.replaceAt($id.length-1, "*");
                    $account = $account.replaceAt($account.length-6, "*").replaceAt($account.length-7, "*");

                    // set the user name
                    $this.el.$userName.attr('data-name', $name);

                    // process number with commas,
                    $this.el.$totalAmount.html(window.helper.numberWithCommas($amount));

                    // set the id
                    $this.el.$idSpan.html($id);

                    // set the id of select
                    $this.el.$idSelect.html('<option value="' + $id + '">' + $id + '</option>')

                    /* BEGIN process trade item */
                    {
                        let $detail = _r.detail
                        , _source1 = $detail // reOrder trade
                        , _currentY = parseInt(moment().format('YYYY'))
                        , _currentM = parseInt(moment().format('MM'));

                        for ($prop1 in _source1) {
                            let $date = parseInt(_source1[$prop1].date)
                            , $y = '_' + moment.unix($date).format('YYYY')
                            , $m = moment.unix($date).format('MM');
                            // , $d =  moment.unix($date).format('DD');
                            // , $d =  $date;
                            // _highestY = parseInt(($y > _highestY)?$y:_highestY);
                            // _highestM = parseInt(($m > _highestM)?$m:_highestM);

                            if ($this.var._trads[$y] === undefined) $this.var._trads[$y] = {};
                            if ($this.var._trads[$y][$m] === undefined) $this.var._trads[$y][$m] = [];
                            // $this.var._trads[$y][$m].unshift(_source1[$prop1]); // 遞減
                            $this.var._trads[$y][$m].push(_source1[$prop1]); // 遞增
                        }

                        // 顯示近6個月的月份
                        let _m = _currentM
                        , _y = _currentY;
                        for (let i = 0; i < 6; i++) {
                            if (_m == 0) {
                                _y = _y - 1;
                                _m = 12;
                            }
                            if (_m <= 9) _m = '0' + _m;

                            if ($this.var._trads['_'+_y] === undefined) $this.var._trads['_'+_y] = {};
                            if ($this.var._trads['_'+_y][_m] === undefined) $this.var._trads['_'+_y][_m] = {};
                            _m -= 1;
                            if (_m <= 0) {
                                _m = 12;
                                _y -= 1;
                            }
                        }
                        // console.log($this.var._trads);

                        let _source2 = $this.var._trads
                        , _target_option = $this.el.$tradeListsOption
                        , _template_option = window.helper.getTemplate('trade-option')
                        , _templates_option = ''

                        , _target_list = $this.el.$tradeLists
                        , _template_list = window.helper.getTemplate('trade-list')
                        , _template_item = window.helper.getTemplate('trade-item')
                        , _templates_list = '';

                        // order by 年份排序
                        _source2 = Object.keys(_source2).sort().reduceRight( // reduce(
                            (obj, key) => {
                                obj[key] = _source2[key];
                                return obj;
                            },{}
                        );

                        for ($prop2 in _source2) {
                            let _source3 = _source2[$prop2]
                            , $y = $prop2
                            , $m = 0
                            , $d = '';

                            // order by 月份排序
                            _source3 = Object.keys(_source3).sort().reduceRight( // reduce(
                                (obj, key) => {
                                    obj[key] = _source3[key];
                                    return obj;
                                },{}
                            );

                            for ($prop3 in _source3) {
                                $m = $prop3;
                                let _source4 = _source3[$prop3]
                                , $length = Object.keys(_source4).length
                                , $templateOption = _template_option
                                , $templateList = _template_list
                                , $items = '';

                                // order by 日期排序
                                // _source4 = Object.keys(_source4).sort().reduceRight( // reduce(
                                //     (obj, key) => {
                                //         obj[key] = _source4[key];
                                //         return obj;
                                //     },{}
                                // );

                                for ($prop4 in _source4) {
                                    let $templateItem = _template_item
                                    , $data = _source4[$prop4];
                                    $d = moment.unix($data.date).format('DD');

                                    let $showid = $data.is_show_account
                                    , $date = $m + '/' + $d
                                    , $title = $data.title
                                    , $subtitle = $data.subtitle
                                    , $summary = $data.summary
                                    , $ramain = window.helper.numberWithCommas($data.remain)
                                    , $money = window.helper.numberWithCommas($data.money);

                                    $templateItem = $templateItem
                                    .replace(/\[SHOWID\]/g, $showid)
                                    .replace(/\[DATE\]/g, $date)
                                    .replace(/\[TITLE\]/g, $title)
                                    .replace(/\[SUBTITLE\]/g, $subtitle)
                                    .replace(/\[SUMMARY\]/g, $summary)
                                    .replace(/\[ACCOUNT\]/g, $account)
                                    .replace(/\[REMAIN\]/g, $ramain)
                                    .replace(/\[MONEY\]/g, $money);

                                    $items += $templateItem;
                                }
                                $y = $y.replace(/\_/g, '');

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
                                .replace(/\[LENGTH\]/g, $length)
                                .replace(/\[ITEMS\]/g, $items);
                                _templates_list += $templateList;
                            }
                        }
                        // console.log(_templates_option);
                        _target_option.append(_templates_option);
                        _target_list.html(_templates_list);
                    }
                    /* END process trade item */

                    /* BEGIN process commonagreed item */
                    {
                        let $b_num = _r.num
                        , $b_name = _r.name
                        , $ca_lists = [_r.designated_users, _r.common_users]

                        , _target_ca_lists = $this.el.$commonagreedLists
                        , _template_ca_list = window.helper.getTemplate('commonagreed-list')
                        , _template_ca_item = window.helper.getTemplate('commonagreed-item')
                        , _templates_ca_list = '';

                        for (let $i = 0; $i < 2; $i++) {
                            let $ca_list = $ca_lists[$i]
                            , $templateCAList = _template_ca_list
                            , $templateCAItem = _template_ca_item
                            , $ca_items = '';

                            for ($prop in $ca_list) {
                                let $templateItem = $templateCAItem
                                , $data = $ca_list[$prop]
                                , $B_NUM = $data.bank_num
                                , $B_NAME = $data.bank_name
                                , $B_LIST = ($i == 0)?'約定':'常用'
                                , $ID = $data.id
                                , $NICKNAME = $data.name || '';

                                $templateItem = $templateItem
                                .replace(/\[B_NUM\]/g, $B_NUM)
                                .replace(/\[B_NAME\]/g, $B_NAME)
                                .replace(/\[B_LIST\]/g, $B_LIST)
                                .replace(/\[ID\]/g, $ID)
                                .replace(/\[NICKNAME\]/g, $NICKNAME);

                                $ca_items += $templateItem;
                            }
                            $templateCAList = $templateCAList
                            .replace(/\[LIST\]/g, ($i == 0)?'agreed':'common')
                            .replace(/\[ITEMS\]/g, $ca_items);

                            _templates_ca_list += $templateCAList;
                        }
                        _target_ca_lists.html(_templates_ca_list);
                    }
                    /* END process commonagreed item */

                    return setTimeout(( () => {
                        $this.el.$body.attr('data-loading', '');
                        $this.tranIndex(3);
                        if ($this.test_mode) $this.tranIndex(5);
                    } ), 700);
                }
            }
            // call api // ajax url
        },
    };
    MAIN.init();
});
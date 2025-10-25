/* eslint-env browser, jquery, es2020 */
/*!
 * OrderHub — Feature: List (compact)
 */
;
(function(w, $) {
    'use strict';
    var APP = w.APP || (w.APP = {});

    var LIMIT = 20;
    var YEAR = 2025; // 固定 2025（之後要換年就改這裡）

    // === 詳情要顯示、且可調整順序的欄位 ===
    var DETAIL_GROUPS = [
        ['訂單日期', '付款方式', '訂購人姓名', '訂購人電話', '訂購人Email'],
        ['品項分類', '購買用途', '商品項目', '訂單備註', '小卡內容'],
        ['取貨方式', '貨運單號', '收件者姓名', '收件者電話', '收件者地址'],
    ];

    // ==== 日期工具：轉 "25/12/12（週五）" ====
    var WEEK = ['日', '一', '二', '三', '四', '五', '六'];

    function fmtDateYYMMDDWeek(input) {
        if (!input) return '—';
        var d = new Date(input);
        if (isNaN(d.getTime())) return String(input);
        var yy = String(d.getFullYear()).slice(-2);
        var mm = String(d.getMonth() + 1).padStart(2, '0');
        var dd = String(d.getDate()).padStart(2, '0');
        var wk = WEEK[d.getDay()];
        return yy + '/' + mm + '/' + dd + ' 週' + wk;
    }

    function bindCardData($card, data) {
        $card.attr('data-id', data['訂單編號'] || '');
        $card.find('[data-bind]').each(function() {
            var key = $(this).attr('data-bind');
            var raw = data && Object.prototype.hasOwnProperty.call(data, key) ? data[key] : '';
            var val = raw;

            // 特殊欄位格式化
            if (key.indexOf('日') !== -1) val = fmtDateYYMMDDWeek(raw);
            //if (key === '交貨日期' || key === '訂單日期')

            if (key === '訂單金額' && raw !== '' && raw != null) {
                var n = Number(raw);
                val = isNaN(n) ? String(raw) : '＄' + n.toLocaleString('zh-TW');
            }

            $(this).text(val || '—');
        });

        // === 狀態標籤 ===
        var tags = [];
        var shipStatus = String(data['是否已交貨'] || '');
        var payStatus = String(data['是否已付款'] || '');

        // 保留所有狀態，未出貨/未付款 會強調色
        if (shipStatus) tags.push(shipStatus);
        if (payStatus) tags.push(payStatus);

        var $tags = $card.find('.tags-inline').empty();
        tags.forEach(function(t) {
            var cls = (t.indexOf('未') !== -1 ? 'warn' : ''); // 未出貨或未付款 → 標示警告色
            $tags.append('<span class="tag ' + cls + '">' + t + '</span>');
        });
    }

    function createCard(data) {
        var frag = TPL.tpl('tpl-list-card');
        var tmp = document.createElement('div');
        tmp.appendChild(frag);
        var $card = $(tmp.firstElementChild);

        bindCardData($card, data);

        // 詳情（延後組，按下才插入）依 DETAIL_FIELDS 產生
        var detailHtml = '',
            groupHtml = [];

        // 一律列出（空值顯示 —），若要跳過空值可把下一行改成：if (v == null || v === '') return;
        DETAIL_GROUPS.forEach(function(fields) {
            var rows = [];
            fields.forEach(function(fieldName) {
                var hasKey = data && Object.prototype.hasOwnProperty.call(data, fieldName);
                var v = hasKey ? data[fieldName] : '';
                if (fieldName.indexOf('日') !== -1) v = fmtDateYYMMDDWeek(v);
                if (v == null || v === '') v = '-';
                rows.push('<div class="kv"><b>' + fieldName + '</b><span>' + String(v) + '</span></div>');
            });

            if (rows.length) groupHtml.push('<div class="detail-group"><div class="g-body">' + rows.join('') + '</div></div>');
        });

        if (groupHtml.length) detailHtml = '<div class="detail" style="display:none; margin-top:6px;">' + groupHtml.join('') + '</div>';
        if (detailHtml) $card.append(detailHtml);
        return $card;
    }

    function renderEmpty($container) {
        var frag = TPL.tpl('tpl-list-empty');
        $container.html('').append(frag);
    }

    APP.renderList = function() {
        var frag = TPL.tpl('tpl-list', {});
        TPL.mount('#main', frag);

        // 工具列元素
        var $container = $('#listContainer');
        var $filterShipStatus = $('#filterShipStatus');
        var $filterPayStatus = $('#filterPayStatus');
        var $filterRange = $('#filterRange');
        var $filterMonth = $('#filterMonth');
        var $filterMonthWrap = $('#filterMonthWrap');
        var $yearTag = $('.year-tag');

        // 顯示固定年份
        if ($yearTag.length) { $yearTag.text(YEAR).attr('data-year', YEAR); }
        if ($filterMonth.length) {
            $filterMonth.attr('min', YEAR + '-01').attr('max', YEAR + '-12');
            // 若外面帶了 2025-xx，保留；否則維持預設 value
        }

        function updateMonthVisibility() {
            if (!$filterRange.length || !$filterMonthWrap.length) return;
            var v = $filterRange.val();
            $filterMonthWrap.toggle(v === 'month');
        }

        function setCount(total, page, pages, pageSize) {
            $('[data-bind="count"]').text(String(total || 0));
            $('[data-bind="pageInfo"]').text('第 ' + (page || 1) + '/' + (pages || 1) + ' 頁');
        }

        function getQueryParams() {
            // var params = { limit: LIMIT };
            // if ($filterStatus.length) {
            //     var s = String($filterStatus.val() || '');
            //     if (s) params.status = s;
            // }
            var params = { limit: LIMIT, year: YEAR };

            // 出貨/付款獨立條件
            if ($filterShipStatus.length) {
                var ship = String($filterShipStatus.val() || '');
                if (ship) params.shipStatus = ship; // '已出貨' / '未出貨'
            }
            if ($filterPayStatus.length) {
                var pay = String($filterPayStatus.val() || '');
                if (pay) params.payStatus = pay; // '已付款' / '未付款'
            }

            // 區間
            if ($filterRange.length) {
                var r = String($filterRange.val() || '');
                if (r) params.range = r; // 'this-week' / 'this-month' / 'month'
                if (r === 'month' && $filterMonth.length) {
                    var m = String($filterMonth.val() || '');
                    if (m) params.month = m; // '2025-10'
                }
            }
            // params.year = YEAR; // 先傳給後端（即便未用）
            return params;
        }

        function fetchAndRender() {
            if (APP.status && APP.status.start) APP.status.start('載入清單');
            $container.html('<div class="loading">讀取中…</div>');

            var params = getQueryParams();
            if (APP.status && APP.status.tick) APP.status.tick('呼叫 API', 40);

            APP.api('list', params)
            .then(function(res) {
            	console.log(res);
            	// return;
                $container.find('.loading').remove();

                if (res && res.ok && Array.isArray(res.items)) {
                    var items = res.items;
                    var total = Number(res.total || items.length || 0);
                    var pageSize = LIMIT;
                    var pages = Math.max(1, Math.ceil(total / pageSize));
                    var page = 1;

                    setCount(total, page, pages, pageSize);

                    if (!items.length) {
                        renderEmpty($container);
                        if (APP.status && APP.status.done) APP.status.done(true, '完成（0 筆）');
                        return;
                    }

                    $container.html('');
                    for (var i = 0; i < items.length; i++) {
                        var $card = createCard(items[i]);
                        $container.append($card);
                    }
                    if (APP.status && APP.status.done) APP.status.done(true, '完成（' + items.length + ' 筆）');
                    return;
                }

                setCount(0, 1, 1, LIMIT);
                renderEmpty($container);
                if (APP.status && APP.status.done) APP.status.done(false, 'API not ready');
                console.warn('[List] API not ready or bad response:', res);
            })
            .catch(function(err) {
                setCount(0, 1, 1, LIMIT);
                renderEmpty($container);
                if (APP.status && APP.status.done) APP.status.done(false, '讀取錯誤');
                console.error('[List] fetch error:', err);
            });
        }

        // 初次
        updateMonthVisibility();
        fetchAndRender();

        // === 綁定條件事件 ===
        // 出貨狀態：即時重刷
        if ($filterShipStatus.length) {
            $filterShipStatus.off('change').on('change', fetchAndRender);
        }
        // 付款狀態：即時重刷
        if ($filterPayStatus.length) {
            $filterPayStatus.off('change').on('change', fetchAndRender);
        }
        // 區間：若選「指定月」→ 只顯示月份輸入，不立即重刷；其他選項→ 立即重刷
        if ($filterRange.length) {
            $filterRange.off('change').on('change', function() {
                updateMonthVisibility();
                var r = String($filterRange.val() || '');
                if (r === 'month') return; // 等月份選擇後再重刷
                fetchAndRender();
            });
        }
        // 指定月份：只有在 range===month 時才重刷
        if ($filterMonth.length) {
            $filterMonth.off('change').on('change', function() {
                var r = String($filterRange.val() || '');
                if (r === 'month') fetchAndRender();
            });
        }

        // 卡片行為：詳情 / 編輯
        $container.off('click').on('click', '.icon-btn', function(e) {
            var $btn = $(this);
            var action = $btn.attr('data-action');
            var $card = $btn.closest('.card.order');
            var id = $card.attr('data-id') || '';

            if (action === 'toggle') {
                e.preventDefault();
                var $detail = $card.find('.detail').first();
                $detail.stop(true, true).slideToggle(160);
                return;
            }
            if (action === 'edit') {
                e.preventDefault();
                if (id) location.hash = '#/edit?id=' + encodeURIComponent(id);
                return;
            }
        });
    };

})(window, jQuery);
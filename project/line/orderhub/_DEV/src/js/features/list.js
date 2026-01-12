/* eslint-env browser, jquery, es2020 */
/*!
 * OrderHub — Feature: List (Refactored)
 */
;
(function(w, $) {
    'use strict';
    var APP = w.APP || (w.APP = {});

    // [優化] 預設為當年，避免明年還要手動改 Code
    var CURRENT_YEAR = new Date().getFullYear();
    var LIMIT = 15;

    var currentPage = 1;
    var totalPages = 1;

    // 詳情顯示設定
    var DETAIL_GROUPS = [
        ['訂單日期', '交貨日期', '付款方式', '訂購人姓名', '訂購人ID', '訂購人電話', '訂購人Email'],
        ['品項分類', '購買用途', '商品項目', '訂單備註', '小卡內容'],
        ['取貨方式', '貨運單號', '收件者姓名', '收件者電話', '收件者地址'],
    ];

    // === 建立卡片 DOM ===
    function createCard(data) {
        var frag = TPL.tpl('tpl-list-card');
        var $card = $(frag).find('.card.order'); // 確保抓到 root

        // 綁定基礎資料
        $card.attr('data-id', data['訂單編號'] || '');
        $card.attr('data-status', data['訂單狀態'] || '');

        $card.find('[data-bind]').each(function() {
            var key = $(this).attr('data-bind');
            var val = data[key];

            // [優化] 使用共用的日期顯示格式
            if (key.indexOf('日') !== -1) val = APP.fmtDateDisplay(val);

            // 金額格式化
            if (key === '訂單金額' && val != null && val !== '') {
                val = '＄' + Number(val).toLocaleString('zh-TW');
            }
            $(this).text(val || '—');
        });

        // 狀態標籤
        var tags = [];
        if (data['是否已交貨']) tags.push(data['是否已交貨']);
        if (data['是否已付款']) tags.push(data['是否已付款']);

        var $tags = $card.find('.shippay .tags-inline').empty();
        tags.forEach(function(t) {
            var cls = (t.indexOf('未') !== -1) ? 'warn' : '';
            $tags.append(`<span class="tag ${cls}">${t}</span>`);
        });

        // 詳情區塊 (Hidden by default)
        var groupHtml = DETAIL_GROUPS.map(function(fields) {
            var rows = fields.map(function(k) {
                var v = data[k];
                // [優化] 使用共用的日期顯示格式
                if (k.indexOf('日') !== -1) v = APP.fmtDateDisplay(v);
                return `<div class="kv"><b>${k}</b><span>${(v == null || v === '') ? '-' : v}</span></div>`;
            }).join('');
            return `<div class="detail-group"><div class="g-body">${rows}</div></div>`;
        }).join('');

        if (groupHtml) {
            $card.append(`<div class="detail" style="display:none;">${groupHtml}</div>`);
        }

        return $card;
    }

    function renderEmpty($container) {
        var frag = TPL.tpl('tpl-list-empty');
        $container.empty().append(frag);
    }

    // === 主邏輯 ===
    APP.renderList = function() {
        var frag = TPL.tpl('tpl-list', {});
        TPL.mount('#main', frag);

        // UI 參考
        var $container = $('#listContainer');
        var FL = {
            status: ['#fl_orderStatus', '#fl_shipStatus', '#fl_payStatus'].map(s => $(s)),
            rangeOrder: $('#fl_rangeOrder'),
            rangeShip: $('#fl_rangeShip'),
            rangeOrderMonth: $('#fl_rangeOrderMonth'),
            rangeShipMonth: $('#fl_rangeShipMonth')
        };

        // 初始化年份顯示
        $('.year-tag').text(CURRENT_YEAR).attr('data-year', CURRENT_YEAR);

        // 設定月份選擇器的範圍 (當年)
        [FL.rangeOrderMonth, FL.rangeShipMonth].forEach($el => {
            $el.attr('min', `${CURRENT_YEAR}-01`).attr('max', `${CURRENT_YEAR}-12`);
        });

        // 取得篩選參數
        function getQueryParams() {
            var params = { limit: LIMIT, year: CURRENT_YEAR };

            // 狀態篩選 (自動抓取 id 後綴作為 key)
            FL.status.forEach($el => {
                const v = $el.val();
                if (v) params[$el.attr('id').replace('fl_', '')] = v;
            });

            // 區間篩選 (Order)
            const rOrder = FL.rangeOrder.val();
            if (rOrder) {
                params.range_order = rOrder;
                if (rOrder === 'month') params.month_order = FL.rangeOrderMonth.val();
            }

            // 區間篩選 (Ship)
            const rShip = FL.rangeShip.val();
            if (rShip) {
                params.range_ship = rShip;
                if (rShip === 'month') params.month_ship = FL.rangeShipMonth.val();
            }

            return params;
        }

        // 執行查詢
        function fetchAndRender() {
            if (APP.status?.start) APP.status.start('載入清單');
            $container.html('<div class="loading">讀取中…</div>');

            // [優化] 換頁或重整時，滾動到最上方
            if (typeof APP.scrollTop === 'function') APP.scrollTop();

            if (APP.status?.tick) APP.status.tick('查詢中', 20);
            var params = getQueryParams();
            params.page = currentPage;

            APP.api('list', params)
                .then(function(res) {
                    $container.find('.loading').remove();

                    if (res && res.ok && Array.isArray(res.items)) {
                        var items = res.items;
                        var total = Number(res.total || 0);

                        // 頁碼修正
                        totalPages = Math.max(1, Math.ceil(total / LIMIT));

                        // 若所在頁數超過總頁數，自動跳回第一頁
                        if (currentPage > totalPages && total > 0) {
                            currentPage = 1;
                            return fetchAndRender();
                        }

                        updatePager(total, currentPage, totalPages);

                        if (items.length === 0) {
                            renderEmpty($container);
                            if (APP.status?.done) APP.status.done(true, '查無資料');
                            return;
                        }

                        $container.empty();
                        items.forEach(function(item) {
                            $container.append(createCard(item));
                        });

                        if (APP.status?.done) APP.status.done(true, `完成（${items.length} 筆）`);
                    } else {
                        renderEmpty($container);
                        var msg = res?.msg || 'API 回應異常';
                        console.warn('[List] API Error:', res);
                        if (APP.status?.done) APP.status.done(false, msg);
                    }
                })
                .catch(function(err) {
                    renderEmpty($container);
                    console.error('[List] Fetch Error:', err);
                    if (APP.status?.done) APP.status.done(false, '網路錯誤');
                });
        }

        // 分頁控制 UI
        function updatePager(total, page, pages) {
            var $pager = $('.pager');
            if (!$pager.length) $pager = $('<div class="pager"></div>').insertAfter($container);

            var start = total === 0 ? 0 : (page - 1) * LIMIT + 1;
            var end = Math.min(total, start + LIMIT - 1);
            var rangeText = (total === 0) ? '0 / 0' : `${start} – ${end} / ${total} 筆`;

            $pager.html(`
                <div class="pager-range pageRange"><span>${rangeText}</span></div>
                <div class="pager-btns">
                    <button class="pager-btn prev" ${page <= 1 ? 'disabled' : ''}></button>
                    <span class="pager-info">${page} / ${pages}</span>
                    <button class="pager-btn next" ${page >= pages ? 'disabled' : ''}></button>
                </div>
            `);

            // 綁定按鈕 (避免重複綁定，使用 off/on)
            $pager.off('click').on('click', '.pager-btn', function(e) {
                e.preventDefault();
                if ($(this).hasClass('prev') && currentPage > 1) currentPage--;
                else if ($(this).hasClass('next') && currentPage < totalPages) currentPage++;
                else return;

                fetchAndRender();
            });
        }

        // === 事件綁定區 ===

        // 1. 狀態篩選 (立即重刷)
        FL.status.forEach($el => {
            $el.off('change').on('change', () => { currentPage = 1; fetchAndRender(); });
        });

        // 2. 區間篩選 (切換模式)
        [FL.rangeOrder, FL.rangeShip].forEach($el => {
            $el.off('change').on('change', function() {
                var type = $(this).attr('id').includes('Order') ? 'Order' : 'Ship';
                var $monthWrap = $(`#fl_range${type}MonthWrap`);

                // 顯示/隱藏月份選單
                $monthWrap.toggle($(this).val() === 'month');

                // 若非 month 模式，立即查詢
                if ($(this).val() !== 'month') {
                    currentPage = 1;
                    fetchAndRender();
                }
            });
        });

        // 3. 月份變更 (只在 month 模式下重刷)
        [FL.rangeOrderMonth, FL.rangeShipMonth].forEach($el => {
            $el.off('change').on('change', function() {
                // 檢查對應的 range select 是否為 'month'，是才觸發
                var type = $(this).attr('id').includes('Order') ? 'Order' : 'Ship';
                var $range = FL[`range${type}`];

                if ($range.val() === 'month') {
                    currentPage = 1;
                    fetchAndRender();
                }
            });
        });

        // 4. 卡片操作 (展開詳情 / 編輯)
        $container.off('click').on('click', '.icon-btn', function(e) {
            var $btn = $(this);
            var action = $btn.attr('data-action');
            var $card = $btn.closest('.card.order');

            if (action === 'toggle') {
                e.preventDefault();
                $card.find('.detail').stop(true, true).slideToggle(160);
            } else if (action === 'edit') {
                e.preventDefault();
                var id = $card.attr('data-id');
                if (id) location.hash = '#/edit?id=' + encodeURIComponent(id);
            }
        });

        // 啟動首次載入
        fetchAndRender();
    };
})(window, jQuery);
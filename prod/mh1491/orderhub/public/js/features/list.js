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
    var LIMIT = 10; // 每次顯示筆數

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

        // --- 【新增：狀態標籤邏輯】 ---
        const now = new Date();
        const _fmt = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

        const today = _fmt(now);
        const tmr = new Date();
        tmr.setDate(now.getDate() + 1);
        const tomorrow = _fmt(tmr);

        const deliveryDate = data['交貨日期']; // 格式需為 "YYYY-MM-DD"
        const isDoing = data['訂單狀態'] === 'doing';

        if (isDoing && deliveryDate) {
            if (deliveryDate < today) {
                $card.addClass('state-overdue');
            } else if (deliveryDate === today) {
                $card.addClass('state-today');
            } else if (deliveryDate === tomorrow) {
                $card.addClass('state-tomorrow');
            }
        }

        // 綁定基礎資料
        $card.attr('data-id', data['訂單編號'] || '');
        $card.attr('data-status', data['訂單狀態'] || '');
        $card.attr('data-pay', data['是否已付款'] || '');

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

        var $tags = $card.find('.oShippay .tags-inline').empty();
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
            $card.append(`<div class="detail ui-fold-content">${groupHtml}</div>`);
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

        // 【新增：如果是帶參數進入，清空一次快取確保資料準確】
        if (APP.qs('ship_date')) {
            APP.var.cache.list = {};
        }

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

            // 【核心修改】優先讀取 URL 參數
            const urlShipDate = (typeof APP.qs === 'function') ? APP.qs('ship_date') : null;

            if (urlShipDate) {
                // 如果是從 Dashboard 點過來的
                params.range_ship = 'date';
                params.month_ship = urlShipDate;
                params.orderStatus = 'doing';

                // 在 UI 上給一點反饋（可選）：清空目前的 select 顯示
                $('.filters select').val('').removeClass('is-active');
            } else {
                // 原本的 Select 抓取邏輯
                FL.status.forEach($el => {
                    const v = $el.val();
                    if (v) params[$el.attr('id').replace('fl_', '')] = v;
                });

                const rOrder = FL.rangeOrder.val();
                if (rOrder) {
                    params.range_order = rOrder;
                    if (rOrder === 'month') params.month_order = FL.rangeOrderMonth.val();
                }

                const rShip = FL.rangeShip.val();
                if (rShip) {
                    params.range_ship = rShip;
                    if (rShip === 'month') params.month_ship = FL.rangeShipMonth.val();
                }
            }

            return params;
        }

        // 執行查詢
        function fetchAndRender() {
            if (APP.var.isFetchingList) return;

            var params = getQueryParams();
            params.page = currentPage;
            const cacheKey = JSON.stringify(params);
            const storageKey = 'CACHE_LIST_' + cacheKey;

            // A. 檢查記憶體快取 (這是一進即出的，直接結束)
            if (APP.var.cache.list && APP.var.cache.list[cacheKey]) {
                if (APP.status?.start) APP.status.start('讀取快取清單');
                renderListUI(APP.var.cache.list[cacheKey], true); // 真正的結束
                return;
            }

            // B. 需要執行背景同步或重新讀取
            if (APP.status?.start) APP.status.start('載入清單');

            // 1. 優先從手機儲存讀取 (秒開)
            const localList = localStorage.getItem(cacheKey);
            if (localList) {
                console.log('[List] 顯示持久化快取');
                // 先渲染，但不結束進度條
                renderListUI(JSON.parse(localList), false);
                // 將進度條推到 77%，提示正在同步
                if (APP.status?.tick) APP.status.tick('同步最新資料中', 77);
            } else {
                $container.html('<div class="loading">讀取中…</div>');
            }

            // 2. 背景請求最新資料
            APP.var.isFetchingList = true;
            APP.api('list', params).then(res => {
                if (res && res.ok && Array.isArray(res.items)) {
                    // 更新快取
                    if (!APP.var.cache.list) APP.var.cache.list = {};
                    APP.var.cache.list[cacheKey] = res;
                    localStorage.setItem(cacheKey, JSON.stringify(res));

                    // 真正完成，傳入 true 讓進度條跑完
                    renderListUI(res, true);
                } else {
                    renderEmpty($container);
                    if (APP.status?.done) APP.status.done(false, '連線異常');
                }
            }).catch(err => {
                console.error('[List] Fetch Error:', err);
                if (APP.status?.done) APP.status.done(false, '網路錯誤');
            }).finally(() => {
                APP.var.isFetchingList = false;
            });
        }

        /**
         * 統一渲染 UI 邏輯
         */
        function renderListUI(res, isFinal) {
            var items = res.items || [];
            var total = Number(res.total || 0);
            totalPages = Math.max(1, Math.ceil(total / LIMIT));

            updatePager(total, currentPage, totalPages);

            if (items.length === 0) {
                renderEmpty($container);
                // 【修正點】查無資料時，也要判斷是否為最終狀態才結束進度條
                if (isFinal && APP.status?.done) {
                    APP.status.done(true, '查無資料');
                }
            } else {
                $container.empty();
                items.forEach(function(item) {
                    $container.append(createCard(item));
                });

                // 【修正點】正常渲染後，也要判斷是否為最終狀態
                if (isFinal && APP.status?.done) {
                    APP.status.done(true, `完成（${items.length} 筆）`);
                }
            }
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

        // 4. 卡片操作 (編輯)
        // $container.off('click').on('click', '.icon-btn[data-action="edit"]', function(e) {
        //     e.preventDefault();
        //     var $card = $(this).closest('.card.order');
        //     var $id = $card.attr('data-id');
        //     if ($id) location.hash = '#/edit?id=' + encodeURIComponent($id);
        // });

        // 4. 卡片操作
        // $container.off('click').on('click', '.icon-btn', async function(e) {
        $container.off('click.orderActions').on('click.orderActions', '.icon-btn', async function(e) {
            var $btn = $(this);
            var action = $btn.attr('data-action');
            if (action === 'toggle') return;

            e.preventDefault();
            e.stopPropagation(); // 防止觸發到外層

            var $card = $btn.closest('.card.order');
            var orderId = $card.attr('data-id');
            var orderName = $card.find('[data-bind="訂購人姓名"]').text() || '未知';
            var currentPayStatus = $card.attr('data-pay');

            if (action === 'quick-done') {
                // --- 【核心邏輯：快速完成】 ---
                var allowedPayStatus = ['已付款', '公關', '付訂金'];
                if (allowedPayStatus.indexOf(currentPayStatus) === -1) {
                    alert(`⚠️ 無法快速結單！\n訂單 #${orderId} 目前狀態為「${currentPayStatus}」。\n請先確認款項後再進行操作。`);
                    return; // 終止操作
                }

                // double confirm
                const confirmDone = confirm(`確定要將訂單 #${orderId} 標記為「已完成」嗎？\n(這將同步將狀態改為 done 並設為已交貨)`);
                if (!confirmDone) return;

                $card.addClass('is-busy');
                if (APP.status?.start) APP.status.start('快速更新狀態，結案執行中');
                $btn.prop('disabled', true).css('opacity', '.5'); // 防止重複點擊


                try {
                    const profile = await APP.getLineProfile();

                    // 直接呼叫 update API
                    // 強制將這三個關鍵欄位一次更新到位
                    const res = await APP.api('update', {
                        id: orderId,
                        patch: {
                            '訂單狀態': 'done',
                            '是否已交貨': '已交貨'
                        },
                        actor: APP.var.actor,
                        lineName: profile.lineName,
                        lineId: profile.lineId
                    });

                    if (res && res.ok) {
                        $card.removeClass('is-busy').addClass('is-success');
                        // 注入類似「新增/編輯成功」的訊息覆蓋層
                        const successHtml = `
                            <div class="card-success-overlay">
                                <span class="check-icon">✅</span>
                                <span>訂單 #${orderId} 已成功結案</span>
                            </div>
                        `;
                        $card.append(successHtml);


                        if (APP.status?.done) APP.status.done(true, `#${orderId} 已結案`);

                        // 清除快取，否則回到 Dashboard 數字會不對
                        if (typeof APP.clearCache === 'function') APP.clearCache();

                        // LINE 通知 (選擇性：如果你想在群組噴出一句已結案)
                        if (APP.var.liffReady && window.liff && liff.isInClient()) {
                            const userName = APP.var.userName || '使用者'; // 確保有抓到名字
                            // 1. 組裝文字陣列
                            let textArray = [
                                `✏️ 已更新訂單（快速結案）`,
                                `${orderId}`,
                                `${orderName}`,
                                `-`,
                                `${userName} 編輯`,
                            ];

                            // 2. 合併為字串
                            const fullText = textArray.join('\n');
                            liff.sendMessages([
                                { type: 'text', text: fullText }
                            ]).catch(err => console.error('LINE 傳送失敗', err));
                        }
                    } else {
                        alert('更新失敗：' + (res.msg || '請稍後再試'));
                        $btn.prop('disabled', false).css('opacity', '1');
                    }
                } catch (err) {
                    console.error(err);
                    $card.removeClass('is-busy');
                    if (APP.status?.done) APP.status.done(false, '連線異常');
                    $btn.prop('disabled', false).css('opacity', '1');
                }

            } else if (action === 'edit') {
                if (orderId) location.hash = '#/edit?id=' + encodeURIComponent(orderId);
            }
        });

        // 【新增邏輯】監聽篩選器變色
        APP.el.$main.off('change.filterColor').on('change.filterColor', '.filters select', function() {
            var $el = $(this);
            // 如果值不為空，就加上 is-active，否則移除
            if ($el.val() !== "") {
                $el.addClass('is-active');
            } else {
                $el.removeClass('is-active');
            }
        });
        // 初始化：進入頁面時先跑一遍，確保有預設值的（如：doing）會先變色
        $('.filters select').each(function() {
            $(this).trigger('change.filterColor');
        });

        // 啟動首次載入
        fetchAndRender();
    };
})(window, jQuery);
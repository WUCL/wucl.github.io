/* eslint-env browser, jquery, es2020 */
/*!
 * OrderHub — Feature: List
 * 職責：首頁清單
 * - 初始載入最新 N 筆
 * - 每筆卡片可展開/收合顯示更多欄位
 * - 每筆卡片含「編輯」按鈕 → #/edit?id=...
 * - 工具列含「重新整理」與「＋新增訂單」
 *
 * 依賴：jQuery、TPL、APP.api、你的 template.html / templates.js
 */
;(function(w, $) {
    'use strict';
    var APP = w.APP || (w.APP = {});

    // 將物件資料灌入卡片（依據 data-bind）
    function bindCardData($card, data) {
        $card.attr('data-id', data['訂單編號'] || '');
        $card.find('[data-bind]').each(function() {
            var key = $(this).attr('data-bind');
            var val = (data && Object.prototype.hasOwnProperty.call(data, key)) ? (data[key] || '') : '';
            $(this).text(val);
        });
    }

    // 產生卡片 DOM（使用 tpl-list-card 作為骨架，並加上「詳情」區塊）
    function createCard(data) {
        // 先用樣板生一個骨架
        var frag = TPL.tpl('tpl-list-card');
        var tmp = document.createElement('div');
        tmp.appendChild(frag);
        var $card = $(tmp.firstElementChild);

        // 基礎欄位灌入
        bindCardData($card, data);

        // 詳情（收合區）— 只在使用者展開時顯示
        var $detail = $('<div class="detail" style="display:none; margin-top:8px;"></div>');
        // 你可以視需要把更多欄位加進來
        var lines = [];

        function push(label, key) {
            var v = data && data[key];
            if (v != null && v !== '') lines.push('<div class="kv"><b>' + label + '</b><span>' + String(v) + '</span></div>');
        }
        push('交貨日期', '交貨日期');
        push('商品項目', '商品項目');
        push('訂單備註', '訂單備註');
        push('收件者姓名', '收件者姓名');
        push('收件者電話', '收件者電話');
        push('收件者地址', '收件者地址');
        push('貨運單號', '貨運單號');
        if (lines.length) $detail.html(lines.join(''));

        // 行為：在卡片「動作列」插入「詳情」按鈕（放在 編輯 之前）
        var $ops = $card.find('.row.d.actions');
        var $toggle = $('<a class="btn" data-action="toggle" href="#">詳情</a>');
        $ops.prepend($toggle);

        // 尾端加上詳情區
        $card.append($detail);

        return $card;
    }

    function renderEmpty($container) {
        var frag = TPL.tpl('tpl-list-empty');
        $container.html('').append(frag);
    }

    // 主要渲染流程
    APP.renderList = function() {
        // 掛頁面樣板
        var frag = TPL.tpl('tpl-list', { last: 20 });
        TPL.mount('#main', frag);

        var $container = $('#listContainer');
        var $btnRefresh = $('[data-action="refresh"]');
        var LIMIT = 20;

        // 初次載入
        fetchAndRender();

        // 工具列：重新整理
        $btnRefresh.off('click').on('click', function(e) {
            e.preventDefault();
            fetchAndRender();
        });

        // 事件委派：詳情/編輯
        $container.off('click').on('click', '.btn', function(e) {
            var $btn = $(this);
            var action = $btn.attr('data-action');
            var $card = $btn.closest('.card.order');
            var id = $card.attr('data-id') || '';

            if (action === 'toggle') {
                e.preventDefault();
                var $detail = $card.find('.detail').first();
                // jQuery 動畫可換成原生，如果你不想要動畫就 toggle()
                $detail.stop(true, true).slideToggle(160);
                return;
            }
            if (action === 'edit') {
                e.preventDefault();
                if (id) location.hash = '#/edit?id=' + encodeURIComponent(id);
                return;
            }
        });

        function setCount(n) {
            $('[data-bind="count"]').text(String(n || 0));
            $('[data-bind="pageInfo"]').text('第 1/1 頁');
        }

        function fetchAndRender() {
            $btnRefresh.prop('disabled', true).text('重新整理中…');
            $container.html('<div class="loading">讀取中…</div>');

            // 後端預期：APP.api('list', { limit }) 回 { ok:true, items:[...] }
            APP.api('list', { limit: LIMIT }).then(function(res) {
                $btnRefresh.prop('disabled', false).text('重新整理');
                $container.find('.loading').remove();

                if (res && res.ok && Array.isArray(res.items)) {
                    var items = res.items;
                    setCount(items.length);
                    if (!items.length) { renderEmpty($container); return; }

                    // 清空容器並逐筆加入
                    $container.html('');
                    for (var i = 0; i < items.length; i++) {
                        var $card = createCard(items[i]);
                        $container.append($card);
                    }
                    return;
                }

                // 後端尚未實作 → 顯示提示
                setCount(0);
                renderEmpty($container);
                console.warn('[List] API not ready or bad response:', res);
            }).catch(function(err) {
                $btnRefresh.prop('disabled', false).text('重新整理');
                $container.find('.loading').remove();
                setCount(0);
                renderEmpty($container);
                console.error('[List] fetch error:', err);
            });
        }
    };

})(window, jQuery);
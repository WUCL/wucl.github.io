/* eslint-env browser, jquery, es2020 */
/*!
 * OrderHub — Feature: List (compact)
 */
;
(function(w, $) {
    'use strict';
    var APP = w.APP || (w.APP = {});

    var LIMIT = 15;
    var YEAR = 2025; // 固定 2025（之後要換年就改這裡）
    var currentPage = 1;
    var totalPages = 1;


    // === 詳情要顯示、且可調整順序的欄位 ===
    var DETAIL_GROUPS = [
        ['訂單日期', '交貨日期', '付款方式', '訂購人姓名', '訂購人電話', '訂購人Email'],
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
        $card.attr('data-status', data['訂單狀態'] || '');
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

        var $tags = $card.find('.shippay .tags-inline').empty();
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

        if (groupHtml.length) detailHtml = '<div class="detail" style="display:none;">' + groupHtml.join('') + '</div>';
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
        var FL = {}; // 篩選器容器

        var $fl_orderStatus = $('#fl_orderStatus');
        var $fl_shipStatus = $('#fl_shipStatus');
        var $fl_payStatus = $('#fl_payStatus');

        var $fl_rangeOrder = $('#fl_rangeOrder');
        // var $fl_rangeOrderMonthWrap = $('#fl_rangeOrderMonthWrap');
        var $fl_rangeOrderMonth = $('#fl_rangeOrderMonth');

        var $fl_rangeShip = $('#fl_rangeShip');
        // var $fl_rangeShipMonthWrap = $('#fl_rangeShipMonthWrap');
        var $fl_rangeShipMonth = $('#fl_rangeShipMonth');

		FL.$fl_rangeShip = $('#fl_rangeShip');
		FL.$fl_rangeOrder = $('#fl_rangeOrder');

		FL.$fl_rangeOrderMonthWrap = $('#fl_rangeOrderMonthWrap');
		FL.$fl_rangeShipMonthWrap = $('#fl_rangeShipMonthWrap');

		FL.$fl_rangeOrderMonth = $('#fl_rangeOrderMonth');
		FL.$fl_rangeShipMonth = $('#fl_rangeShipMonth');

        var $yearTag = $('.year-tag');

        // 顯示固定年份
        if ($yearTag.length) { $yearTag.text(YEAR).attr('data-year', YEAR); }
        [
			FL.$fl_rangeOrderMonth,
			FL.$fl_rangeShipMonth
		].forEach(function ($el) {
			$el.attr('min', YEAR + '-01').attr('max', YEAR + '-12');
		});

        function updateMonthVisibility(range) {
        	console.log(range);
        	var $range = FL[`$${range}`],
        		$wrap = FL[`$${range}MonthWrap`];

            if (!$range.length || !$wrap.length) return;
            var v = $range.val();
            $wrap.toggle(v === 'month');
        }

        function updatePager(total, page, pages, pageSize, pageCount) {
			page = Number(page) || 1;
			pages = Number(pages) || 1;
			pageSize = Number(pageSize) || LIMIT;
			pageCount = Number(pageCount) || 0;

			// === 計算本頁範圍 ===
			var totalCount = String(total || 0);  // 總筆數
			var startIdx = total === 0 ? 0 : (page - 1) * pageSize + 1;
			var endIdx = total === 0 ? 0 : Math.min(total, startIdx + pageCount - 1);

			var rangeText = '0 / 0'; // 0 筆時的處理

			// 21–40 / 110 筆（本頁 20 筆）
			if (totalCount !== 0) rangeText = startIdx + ' – ' + endIdx + ' / ' + totalCount + ' 筆';

			// === 下方分頁按鈕 ===
			var $pager = $('#pager');
			if (!$pager.length) $pager = $('<div id="pager" class="pager"></div>').insertAfter($container);

			var prevDisabled = page <= 1 ? 'disabled' : '';
			var nextDisabled = page >= pages ? 'disabled' : '';

			var html = `
				<div class="pager-range pageRange"><span>${rangeText}</span></div>
				<div class="pager-btns">
				<button class="pager-btn prev" ${prevDisabled}></button>
				<span class="pager-info">${page} / ${pages}</span>
				<button class="pager-btn next" ${nextDisabled}></button>
				</div>
			`;

			$pager.html(html);

			// === 綁定事件 ===
			$pager.off('click').on('click', '.pager-btn', function (e) {
				e.preventDefault();

				if ($(this).hasClass('prev') && currentPage > 1) {
					currentPage -= 1;
				} else if ($(this).hasClass('next') && currentPage < totalPages) {
					currentPage += 1;
				}

				fetchAndRender(currentPage);
			});
		}



        function getQueryParams() {
            var params = { limit: LIMIT, year: YEAR };
            // 取得篩選結果 訂單狀態/出貨狀態/付款狀態
			[
				{ el: $fl_orderStatus, key: 'orderStatus' },
				{ el: $fl_shipStatus,  key: 'shipStatus'  },
				{ el: $fl_payStatus,   key: 'payStatus'   }
			].forEach(function (f) {
				if (f.el && f.el.length) {
					var val = String(f.el.val() || '');
					if (val) params[f.key] = val;
				}
			});

            // order區間
            if ($fl_rangeOrder.length) {
                var r_rangeOrder = String($fl_rangeOrder.val() || '');
                if (r_rangeOrder) params.range_order = r_rangeOrder; // 'this-week' / 'this-month' / 'month'
                if (r_rangeOrder === 'month' && $fl_rangeOrderMonth.length) {
                    var m_rangeOrder = String($fl_rangeOrderMonth.val() || '');
                    if (m_rangeOrder) params.month_order = m_rangeOrder; // '2025-10'
                }
            }
            // ship區間
            if ($fl_rangeShip.length) {
                var r_rangeShip = String($fl_rangeShip.val() || '');
                if (r_rangeShip) params.range_ship = r_rangeShip; // 'this-week' / 'this-month' / 'month'
                if (r_rangeShip === 'month' && $fl_rangeShipMonth.length) {
                    var m_rangeShip = String($fl_rangeShipMonth.val() || '');
                    if (m_rangeShip) params.month_ship = m_rangeShip; // '2025-10'
                }
            }
            // params.year = YEAR; // 先傳給後端（即便未用）
            return params;
        }

        function fetchAndRender() {
            if (APP.status && APP.status.start) APP.status.start('載入清單');
            $container.html('<div class="loading">讀取中…</div>');
            console.log("fetchAndRender :: " + currentPage);

            var params = getQueryParams();
            params.page = currentPage; // Number(page) || 1;
            params.limit = LIMIT;

            if (APP.status && APP.status.tick) APP.status.tick('呼叫 API', 40);
            console.log(params);
            // return;
            APP.api('list', params)
                .then(function(res) {
                    console.log(res);
                    // return;
                    $container.find('.loading').remove();

                    if (res && res.ok && Array.isArray(res.items)) {
                        var items = res.items;
                        var total = Number(res.total || items.length || 0); // 總筆數

                        totalPages = Math.max(1, Math.ceil(total / LIMIT));
                        currentPage = res.page || params.page || 1;

                        if (!items.length && total > 0 && currentPage > 1) {
							currentPage = 1;
							return fetchAndRender(); // 再拉一次第 1 頁
						}

                        // renderPager();
                        updatePager(total, currentPage, totalPages, LIMIT, items.length);

                        if (!items.length) {
                            renderEmpty($container);
                            if (APP.status && APP.status.done) APP.status.done(true, '完成（0 筆）');
                            return;
                        }

                        $container.html('');
                        items.forEach(function(item) {
                            var $card = createCard(item);
                            $container.append($card);
                        });

                        if (APP.status && APP.status.done) APP.status.done(true, '完成（' + items.length + ' 筆）');
                        return;
                    }

                    renderEmpty($container);
                    if (APP.status && APP.status.done) APP.status.done(false, 'API not ready');
                    console.warn('[List] API not ready or bad response:', res);
                })
                .catch(function(err) {
                    renderEmpty($container);
                    if (APP.status && APP.status.done) APP.status.done(false, '讀取錯誤');
                    console.error('[List] fetch error:', err);
                });
        }

        // 初次
        fetchAndRender();

        // === 綁定條件事件 ===
        // 即時重刷：訂單狀態/出貨狀態/付款狀態
        [
			$fl_orderStatus,
			$fl_shipStatus,
			$fl_payStatus
		].forEach(function ($el) {
			$el.off('change').on('change', function () {
				currentPage = 1;
				fetchAndRender();
			});
		});

		[
			$fl_rangeOrder,
			$fl_rangeShip
		].forEach(function ($el) {
			// 區間：若選「指定月」→ 只顯示月份輸入，不立即重刷；其他選項→ 立即重刷
			$el.off('change').on('change', function(e) {
				var $name = e.target.id;
			    updateMonthVisibility($name);

				var r = String($el.val() || '');
				if (r === 'month') return; // 等月份選擇後再重刷
				currentPage = 1;
				fetchAndRender();
			});
			// 指定月份：只有在 range===month 時才重刷
			var $rangMonth = FL[`$${$el.attr('id')}Month`];
			$rangMonth.off('change').on('change', function(e) {
				var $name = e.target.id;
				console.log($name);
				var r = String($el.val() || '');
				if (r === 'month') {
					currentPage = 1;
					fetchAndRender();
				}
			});
		});
        // // 區間：若選「指定月」→ 只顯示月份輸入，不立即重刷；其他選項→ 立即重刷
        // $fl_rangeShip.off('change').on('change', function(e) {
        // 	console.log(e.target.name);
        //     updateMonthVisibility();

        //     var r = String($fl_rangeShip.val() || '');
        //     if (r === 'month') return; // 等月份選擇後再重刷
        // 	currentPage = 1;
        //     fetchAndRender();
        // });
        // // 指定月份：只有在 range===month 時才重刷
        // $fl_rangeShipMonth.off('change').on('change', function(e) {
        // 	console.log(e.target.name);
        //     var r = String($fl_rangeShip.val() || '');
        //     if (r === 'month') {
        // 		currentPage = 1;
        //     	fetchAndRender();
        //     }
        // });

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
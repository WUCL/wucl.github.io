/* eslint-env browser, jquery, es2020 */
/*!
 * OrderHub — Feature: Dashboard
 */
;
(function(w, $) {
    'use strict';
    var APP = w.APP || (w.APP = {});

    APP.renderDashboard = function() {
        // 1. 渲染模板 (必須先渲染，才能抓到裡面的 DOM 元件)
        var frag = TPL.tpl('tpl-dashboard');
        TPL.mount('#main', frag);

        // 無論有沒有快取，都要先抓到這些 jQuery 物件
        APP.dbEl = { $monthly_stats: $('#db-monthly-stats') };
        APP.dbVar = { ordUnfinish: 0 };

        if (APP.status?.start) APP.status.start('讀取數據總覽');

        // 2. 檢查「記憶體快取」 (切換頁面秒開)
        if (APP.var.cache && APP.var.cache.summary) {
            console.log('[Dashboard] 使用記憶體快取');
            renderAllWidgets(APP.var.cache.summary);

            // 如果是秒開，直接結束進度條
            if (APP.status?.done) APP.status.done(true, '快取載入完成');
            return;
        }

        // 3. 檢查「手機持久化快取」 (重新開啟 App 秒開)
        const localData = localStorage.getItem('CACHE_SUMMARY');
        if (localData) {
            console.log('[Dashboard] 使用手機持久化快取');
            renderAllWidgets(JSON.parse(localData));
            // 這裡不 return，讓它繼續跑 API 同步最新資料
        }

        // 4. 【核心優化】請求鎖定邏輯
        if (APP.var.isFetchingSummary) {
            console.log('[Dashboard] 已經有請求在跑了，取消重複請求');
            if (APP.status?.done) APP.status.done(true, '同步中...');
            return;
        }

        // 上鎖
        APP.var.isFetchingSummary = true;
        if (APP.status?.tick) APP.status.tick('同步最新資料中', 77);

        // 5. 執行 API 請求
        APP.api('summary', {}).then(res => {
            if (res && res.ok) {
                // 更新快取
                APP.var.cache.summary = res.data;
                localStorage.setItem('CACHE_SUMMARY', JSON.stringify(res.data));
                renderAllWidgets(res.data); // 靜默更新最新數據

                // 【完成狀態列】
                if (APP.status?.done) APP.status.done(true, '同步完成');
            } else {
                 // 【失敗狀態列】
                if (APP.status?.done) APP.status.done(false, '同步失敗：' + (res.msg || '未知錯誤'));
            }
        }).catch(err => {
            if (APP.status?.done) APP.status.done(false, '網路連線異常');
        }).finally(() => {
            // 【關鍵】不論成功或失敗，最後都要解鎖
            APP.var.isFetchingSummary = false;
        });
    };

    /**
     * 封裝：統一驅動所有渲染函式
     */
    function renderAllWidgets(data) {
        // 月份經營指標
        if (data.monthlyStats) renderMonthlyStats(data.monthlyStats);
        // 處理目標數據
        if (data.goals) renderGoals(data.goals, data.monthlyStats);
        // 待辦清單
        renderUnfinishedList(data.unfinished || []);
    }

    function renderMonthlyStats(stats) {
        console.log(stats);
        $('#stat-month-label').text(`${stats.year} / ${stats.month.toString().padStart(2, '0')}`);
        const $el = APP.dbEl.$monthly_stats;

        APP.animateNumber($el.find('[data-bind="ordTotal"]'), stats.ordTotal);

        const diff = stats.ordMomDiff || 0;
        APP.animateNumber($el.find('[data-bind="ordMomDiff"]'), diff, { prefix: (diff >= 0 ? '+' : '') });

        APP.animateNumber($el.find('[data-bind="amtRevenue"]'), stats.amtRevenue, { prefix: '$' });
        APP.animateNumber($el.find('[data-bind="amtUnpaid"]'), stats.amtUnpaid, { prefix: (stats.amtUnpaid > 0 ? '$' : '') });
        APP.animateNumber($el.find('[data-bind="amtAov"]'), stats.amtAov, { prefix: '$' });
    }

    function renderGoals(goals, stats) {
        const $el = APP.dbEl.$monthly_stats;
        const mGoal = goals.monthGoal || 0;
        const yGoal = goals.yearGoal || 0;
        const actual = (stats && stats.amtRevenue) ? stats.amtRevenue : 0;

        if (stats && parseInt(stats.amtAov) > 0) {
            const prediction_orders = Math.round((goals.monthGoal - stats.amtRevenue) / stats.amtAov);
            if (prediction_orders > 0) {
                $el.find('[data-bind="ordTotal"]').attr('data-prediction', '再完成 ' + prediction_orders + ' 筆達標');
            } else {
                $el.find('[data-bind="ordTotal"]').attr('data-prediction', '🎉 本月已達標');
            }
        }

        const percent = mGoal > 0 ? Math.round((actual / mGoal) * 100) : 0;

        $el.find('[data-bind="monthGoal"]').text('$' + (parseInt(mGoal) || 0).toLocaleString());
        $el.find('[data-bind="monthPercent"]').text(percent + '%');
        $el.find('.month-progress-box .progress-bar').css('width', Math.min(percent, 100) + '%');
        $el.find('[data-bind="yearGoal"]').text('$' + (parseInt(yGoal) || 0).toLocaleString());

        if (percent >= 100) $el.find('.progress-bar').addClass('is-complete');
    }

    function renderUnfinishedList(list) {
        const $container = $('#unfinish-list').empty();

        // 取得今天與明天的 YYYY-MM-DD 字串
        const now = new Date();
        const today = now.toISOString().split('T')[0];

        const tmr = new Date();
        tmr.setDate(now.getDate() + 1);
        const tomorrow = tmr.toISOString().split('T')[0];

        if (list.length === 0) {
            $container.html('<div class="empty">糟糕！沒單啦？</div>');
            return;
        }

        // 確保計算前歸零
        APP.dbVar.ordUnfinish = 0;

        list.forEach(item => {
            let dateStatus = 'future';
            let dateLabel = '';
            if (item.date < today) { dateStatus = 'overdue'; dateLabel = '逾期'; }
            else if (item.date === today) { dateStatus = 'today'; dateLabel = '今日'; }

            // 判斷邏輯順序：逾期 -> 今日 -> 明日 -> 未來
            if (item.date < today) {
                dateStatus = 'overdue';
                dateLabel = '逾期';
            } else if (item.date === today) {
                dateStatus = 'today';
                dateLabel = '今日';
            } else if (item.date === tomorrow) {
                dateStatus = 'tomorrow';
                dateLabel = '明天';
            } else {
                dateStatus = 'future';
                dateLabel = ''; // '預計'; // 或者維持空字串
            }

            APP.dbVar.ordUnfinish += item.count;
            const isHeavy = item.count >= 5 ? 'is-heavy' : ''; // 當日大量訂單

            const html = `
                <a href="#/list?ship_date=${item.date}" class="c-row state-${dateStatus}">
                    <div class="c-col-date">
                        <span class="u-date">${APP.fmtDateDisplay(item.date)}</span>
                        <span class="u-tag">${dateLabel}</span>
                    </div>
                    <div class="c-col-count ${isHeavy}">
                        <span class="u-num">${item.count}</span>
                    </div>
                </a>
            `;
            $container.append(html);
        });
        APP.animateNumber(APP.dbEl.$monthly_stats.find('[data-bind="ordUnfinish"]'), APP.dbVar.ordUnfinish);
    }
})(window, jQuery);
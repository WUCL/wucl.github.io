/* eslint-env browser, jquery, es2020 */
/*!
 * OrderHub — Feature: Dashboard
 */
;
(function(w, $) {
    'use strict';
    var APP = w.APP || (w.APP = {});

    APP.renderDashboard = function() {
        // 1. 渲染基礎模板
        var frag = TPL.tpl('tpl-dashboard');
        TPL.mount('#main', frag);

        // 2. 初始化 Dashboard 專用元件參考與變數
        APP.db_el = {
            $monthly_stats: $('#db-monthly-stats'),
        };
        // 每次進入頁面都要重置統計數值，防止切換頁面時數字翻倍
        APP.db_var = {
            unfinish: 0,
        };

        // 3. 【核心邏輯】檢查全域快取是否存在
        // 註：需確保 app.main.js 的 APP.var 裡有定義 cache: { summary: null }
        if (APP.var.cache && APP.var.cache.summary) {
            console.log('[Dashboard] 使用快取數據');
            renderAllWidgets(APP.var.cache.summary);
            return; // 直接結束，不再發送 API 請求
        }

        // 4. 若無快取，則執行 API 請求
        APP.api('summary', {}).then(res => {
            if (!res || !res.ok) return;

            // 將結果存入全域快取
            if (!APP.var.cache) APP.var.cache = {};
            APP.var.cache.summary = res.data;

            renderAllWidgets(res.data);
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
        $('#stat-month-label').text(`${stats.year} / ${stats.month.toString().padStart(2, '0')}`);
        const $el = APP.db_el.$monthly_stats;
        
        APP.animateNumber($el.find('[data-bind="totalOrders"]'), stats.totalOrders);

        const diff = stats.momDiff || 0;
        APP.animateNumber($el.find('[data-bind="momDiff"]'), diff, { prefix: (diff >= 0 ? '+' : '') });

        APP.animateNumber($el.find('[data-bind="revenue"]'), stats.revenue, { prefix: '$' });
        APP.animateNumber($el.find('[data-bind="unpaid"]'), stats.unpaid, { prefix: (stats.unpaid > 0 ? '$' : '') });
        APP.animateNumber($el.find('[data-bind="aov"]'), stats.aov, { prefix: '$' });
    }

    function renderGoals(goals, stats) {
        const $el = APP.db_el.$monthly_stats;
        const mGoal = goals.monthGoal || 0;
        const yGoal = goals.yearGoal || 0;
        const actual = (stats && stats.revenue) ? stats.revenue : 0;

        if (stats && parseInt(stats.aov) > 0) {
            const prediction_orders = Math.round((goals.monthGoal - stats.revenue) / stats.aov);
            if (prediction_orders > 0) {
                $el.find('[data-bind="totalOrders"]').attr('data-prediction', '再完成 ' + prediction_orders + ' 筆達標');
            } else {
                $el.find('[data-bind="totalOrders"]').attr('data-prediction', '🎉 本月已達標');
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
        const today = new Date().toISOString().split('T')[0];

        if (list.length === 0) {
            $container.html('<div class="empty">目前沒有待辦訂單 ☕️</div>');
            return;
        }

        // 確保計算前歸零
        APP.db_var.unfinish = 0;

        list.forEach(item => {
            let dateStatus = 'future';
            let dateLabel = '';
            if (item.date < today) { dateStatus = 'overdue'; dateLabel = '逾期'; }
            else if (item.date === today) { dateStatus = 'today'; dateLabel = '今日'; }

            APP.db_var.unfinish += item.count;

            const isHeavy = item.count >= 5 ? 'is-heavy' : '';

            const html = `
                <div class="c-row state-${dateStatus}">
                    <div class="c-col-date">
                        <span class="u-date">${APP.fmtDateDisplay(item.date)}</span>
                        <span class="u-tag">${dateLabel}</span>
                    </div>
                    <div class="c-col-count ${isHeavy}">
                        <span class="u-num">${item.count}</span>
                    </div>
                </div>
            `;
            $container.append(html);
        });
        APP.animateNumber(APP.db_el.$monthly_stats.find('[data-bind="unfinish"]'), APP.db_var.unfinish);
    }
})(window, jQuery);
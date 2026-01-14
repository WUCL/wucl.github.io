/* eslint-env browser, jquery, es2020 */
/*!
 * OrderHub — Feature: Dashboard
 */
;
(function(w, $) {
    'use strict';
    var APP = w.APP || (w.APP = {});

    APP.renderDashboard = function() {
        var frag = TPL.tpl('tpl-dashboard');
        TPL.mount('#main', frag);

        APP.db_el = {
            $monthly_stats: $('#db-monthly-stats'),
        };
        APP.db_var = {
            unfinish: 0,
        }

        APP.api('summary', {}).then(res => {
            if (!res || !res.ok) return;

            const data = res.data;

            // 月份經營指標
            if (data.monthlyStats) renderMonthlyStats(data.monthlyStats);
            // 處理目標數據 (來自 Dashboard_目標 工作表)
            if (data.goals) renderGoals(data.goals, data.monthlyStats);

            // 待辦清單
            renderUnfinishedList(data.unfinished || []);
        });

    };

    function renderGoals(goals, stats) {
        const mGoal = goals.monthGoal || 0;
        const yGoal = goals.yearGoal || 0;
        const actual = (stats && stats.revenue) ? stats.revenue : 0;

        // 計算達成率
        const percent = mGoal > 0 ? Math.round((actual / mGoal) * 100) : 0;

        // APP.db_el.$monthly_stats.find('[data-bind="monthGoal"]').text('$' + (mGoal / 10000).toFixed(0) + '萬');
        // APP.db_el.$monthly_stats.find('[data-bind="yearGoal"]').text('$' + (yGoal / 10000).toFixed(0) + '萬');
        APP.db_el.$monthly_stats.find('[data-bind="monthGoal"]').text('$' + (parseInt(mGoal) || 0).toLocaleString());
        APP.db_el.$monthly_stats.find('[data-bind="monthPercent"]').text(percent + '%');
        APP.db_el.$monthly_stats.find('.month-progress-box .progress-bar').css('width', Math.min(percent, 100) + '%');
        APP.db_el.$monthly_stats.find('[data-bind="yearGoal"]').text('$' + (parseInt(yGoal) || 0).toLocaleString());

        // 達成 100% 給予金色效果
        if (percent >= 100) $el.find('.progress-bar').addClass('is-complete');
    }

    function renderMonthlyStats(stats) {
        $('#stat-month-label').text(`${stats.year} / ${stats.month.toString().padStart(2, '0')}`);

        APP.db_el.$monthly_stats.find('[data-bind="totalOrders"]').text(stats.totalOrders);

        // 上月相差處理 (正數加個 + 號)
        const diff = stats.momDiff || 0;
        APP.db_el.$monthly_stats.find('[data-bind="momDiff"]').text((diff >= 0 ? '+' : '') + diff);

        // 金額類加上千分位
        APP.db_el.$monthly_stats.find('[data-bind="revenue"]').text('$' + (parseInt(stats.revenue) || 0).toLocaleString());
        APP.db_el.$monthly_stats.find('[data-bind="unpaid"]').text('$' + (parseInt(stats.unpaid) || 0).toLocaleString());
        APP.db_el.$monthly_stats.find('[data-bind="aov"]').text('$' + (parseInt(stats.aov) || 0).toLocaleString());
    }

    function renderUnfinishedList(list) {
        const $container = $('#unfinish-list').empty();
        const today = new Date().toISOString().split('T')[0];

        if (list.length === 0) {
            $container.html('<div class="empty">目前沒有待辦訂單 ☕️</div>');
            return;
        }

        list.forEach(item => {
            // 1. 日期狀態判斷
            let dateStatus = 'future';
            let dateLabel = '';
            if (item.date < today) { dateStatus = 'overdue'; dateLabel = '逾期'; }
            else if (item.date === today) { dateStatus = 'today'; dateLabel = '今日'; }

            APP.db_var.unfinish += item.count;

            // 2. 數量壓力判斷 (例如超過 5 筆就變色)
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
        APP.db_el.$monthly_stats.find('[data-bind="unfinish"]').text(APP.db_var.unfinish);
    }
})(window, jQuery);
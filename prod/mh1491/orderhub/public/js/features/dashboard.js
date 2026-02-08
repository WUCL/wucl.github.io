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
        if (data.monthlyStats) {
            renderMonthlyStats(data.monthlyStats);
            renderCustomerSegments(data.monthlyStats);
        }
        // 處理目標數據
        if (data.goals) renderGoals(data.goals, data.monthlyStats);

        // 訂單待辦清單
        renderUnfinishedList(data.unfinished || []);

        // 渲染歷史紀錄
        if (data.historyAll) renderFullHistory(data.historyAll);
    }

    // 當月銷售指標
    function renderMonthlyStats(stats) {
        $('#stat-month-label').text(`${stats.year} / ${stats.month.toString().padStart(2, '0')}`);
        const $el = APP.dbEl.$monthly_stats;

        APP.animateNumber($el.find('[data-bind="ordTotal"]'), stats.ordTotal);

        const diff = stats.ordMomDiff || 0;
        APP.animateNumber($el.find('[data-bind="ordMomDiff"]'), diff, { prefix: (diff >= 0 ? '+' : '') });

        APP.animateNumber($el.find('[data-bind="amtRevenue"]'), stats.amtRevenue, { prefix: '$' });
        APP.animateNumber($el.find('[data-bind="amtUnpaid"]'), stats.amtUnpaid, { prefix: (stats.amtUnpaid > 0 ? '$' : '') });
        APP.animateNumber($el.find('[data-bind="amtAov"]'), stats.amtAov, { prefix: '$' });
    }

    // 當月客戶分類佔比
    function renderCustomerSegments(stats) {
        const dataArr = [
            { key: 'custNew', val: stats.custNew || 0, label: '新客' },
            { key: 'custRepeat', val: stats.custRepeat || 0, label: '複購' },
            { key: 'custRel', val: stats.custRel || 0, label: '親友' },
            { key: 'custOther', val: stats.custOther || 0, label: '其他' }
        ];

        const custTotal = dataArr.reduce((sum, item) => sum + item.val, 0);
        const $box = $('.db-cust-segment');

        if (custTotal === 0) {
            $box.find('.bar-segment').css({ width: '0%', opacity: 0 });
            $box.find('[data-bind="custSegment"]').attr('data-prediction', '目前尚無客戶數據');
            return;
        }

        const MIN_WIDTH = 11;
        let activeSegments = dataArr.filter(item => item.val > 0);

        // 1. 計算視覺寬度
        activeSegments.forEach(item => {
            item.realPct = Math.round((item.val / custTotal) * 100);
            item.visualWidth = MIN_WIDTH;
        });

        let remainingWidth = 100 - (activeSegments.length * MIN_WIDTH);
        if (remainingWidth > 0) {
            activeSegments.forEach(item => {
                item.visualWidth += (item.realPct / 100) * remainingWidth;
            });
        }

        // 2. 【核心修改】判斷是否為第一次載入 (檢查標籤內是否有數字)
        // 如果畫面上已經有數字，代表這是 API 同步更新，不執行「歸零」動作
        const isUpdate = $box.find('.num-target').length > 0 && parseFloat($box.find('.bar-segment').first().css('width')) > 0;

        const ANIM_DURATION = 700;

        if (!isUpdate) {
            // 【首次載入】：先強制歸零並隱藏
            $box.find('.bar-segment').css({ width: '0%', opacity: 0 });
        }

        activeSegments.forEach((item, index) => {
            const $segEl = $box.find('.seg-' + item.key);
            const $label = $segEl.find('.bar-label');

            if (isUpdate) {
                // 【更新模式】：直接平滑滑動到新位置，不排隊
                $segEl.show().css({ opacity: 1, width: item.visualWidth + '%' });

                // 如果標籤結構不見了(防呆)，補回去
                if ($label.find('.num-target').length === 0) {
                    $label.html(`${item.label} <em class="num-target">0</em>%`);
                }

                APP.animateNumber($label.find('.num-target'), item.realPct, { duration: ANIM_DURATION });
                $label.css('opacity', 1);

            } else {
                // 【首次載入模式】：執行序列式(一個接一個)動畫
                $label.html(`${item.label} <em class="num-target">0</em>%`);
                const startDelay = index * ANIM_DURATION;

                setTimeout(() => {
                    $segEl.show().css({ opacity: 1, width: item.visualWidth + '%' });
                    APP.animateNumber($label.find('.num-target'), item.realPct, { duration: ANIM_DURATION });
                    $label.css('opacity', 1);
                }, startDelay + 100);
            }
        });

        // 4. 更新總人數
        $box.find('[data-bind="custSegment"]').attr('data-prediction', '本月客戶總數：' + custTotal.toLocaleString());
    }

    // 當月目標數據
    function renderGoals(goals, stats) {
        const $el = APP.dbEl.$monthly_stats;
        const mGoal = goals.monthGoal || 0;
        const mRevenue = (stats && stats.amtRevenue) ? stats.amtRevenue : 0;
        const yGoal = goals.yearGoal || 0;

        if (stats && parseInt(stats.amtAov) > 0) {
            const prediction_orders = Math.round((goals.monthGoal - stats.amtRevenue) / stats.amtAov);
            if (prediction_orders > 0) {
                $el.find('[data-bind="ordTotal"]').attr('data-prediction', '再完成 ' + prediction_orders + ' 筆達標');
            } else {
                $el.find('[data-bind="ordTotal"]').attr('data-prediction', '🎉 本月已達標');
            }
        }
        const percent = mGoal > 0 ? Math.round((mRevenue / mGoal) * 100) : 0;


        $el.find('[data-bind="monthGoal"]').text('$' + (parseInt(mGoal) || 0).toLocaleString());
        $el.find('[data-bind="monthGoalPercent"]').text(percent + '%');
        $el.find('.month-progress-box .progress-bar').css('width', Math.min(percent, 100) + '%');
        $el.find('[data-bind="yearGoal"]').text('$' + (parseInt(yGoal) || 0).toLocaleString());

        if (percent >= 100) $el.find('.progress-bar').addClass('is-complete');
    }

    // 訂單待辦清單
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

    // 過往月銷售指標
    function renderFullHistory(list) {
        const $container = $('#history-all-list').empty();
        if (!list || list.length === 0) return;

        // 1. 全年度總計 (置頂，不收折，hasToggle 傳 false)
        const grandTotal = calculateSubtotal(list, '全年度總計');
        $container.append(renderHistoryRow(grandTotal, 'is-grand-total', false));

        // 2. 分組
        const yearsMap = {};
        list.forEach(item => {
            if (!yearsMap[item.year]) yearsMap[item.year] = [];
            yearsMap[item.year].push(item);
        });

        const sortedYears = Object.keys(yearsMap).sort((a, b) => b - a);

        // list.forEach(item => {
        //     const diffSign = item.ordMomDiff >= 0 ? '+' : '';
        //     const diffCls = item.ordMomDiff >= 0 ? 'text-ok' : 'text-err';
        //     const amtAov = '$' + Math.round(item.amtAov).toLocaleString();
        //     const amtRevenue = '$' + item.amtRevenue.toLocaleString();
        //     const monthGoal = '$' + item.monthGoal.toLocaleString();

        //     let amtProfit = item.amtRevenue - item.amtExpenses;
        //     const amtProfitPct = item.amtRevenue > 0 ? Math.round((amtProfit / item.amtRevenue) * 100) : 0;
        //     amtProfit = '$' + (amtProfit).toLocaleString(undefined, { maximumFractionDigits: 0 });
        //     const amtExpenses = '$' + (item.amtExpenses).toLocaleString(undefined, { maximumFractionDigits: 0 });

        //     /* BEGIN 目標達成率 */
        //     let goalPctClass = '';
        //     if (item.percent >= 100) goalPctClass = 'is-completed'; // 完美達成
        //     else if (item.percent >= 80) goalPctClass = 'is-high';
        //     else if (item.percent < 60) goalPctClass = 'is-low';
        //     /* END 目標達成率 */

        //     /* BEGIN 利潤率 */
        //     let profitPctClass = '';
        //     if (amtProfitPct >= 100) profitPctClass = 'is-completed'; // 完美達成
        //     else if (amtProfitPct >= 80) profitPctClass = 'is-high';
        //     else if (amtProfitPct < 60) profitPctClass = 'is-low';
        //     /* END 利潤率 */

        //     /* BEGIN 客戶分類 */
        //     const rawSegments = [
        //         { key: 'New',    label: '新客', val: parseInt(item.custNew) },
        //         { key: 'Repeat', label: '複購', val: parseInt(item.custRepeat) },
        //         { key: 'Rel',    label: '親友', val: parseInt(item.custRel) },
        //         { key: 'Other',  label: '其他', val: parseInt(item.custOther) }
        //     ].map(seg => {
        //         return {
        //             ...seg,
        //             pct: item.ordTotal > 0 ? Math.round(seg.val / item.ordTotal * 100) : 0
        //         };
        //     });
        //     const maxPct = Math.max(...rawSegments.map(s => s.pct));
        //     const custSegments = rawSegments.map(s => {
        //         let cls = '';
        //         if (s.pct === 0) cls = 'is-zero';
        //         else if (s.pct === maxPct && maxPct > 0) cls = 'is-high';
        //         return { ...s, class: cls };
        //     });
        //     /* END 客戶分類 */

        //     const html = `
        //         <div class="history-all-row">
        //             <div class="h-ym">
        //                 <span>${item.ym}</span>
        //             </div>
        //             <div class="h-ordTotal">
        //                 <span>${item.ordTotal}</span>
        //             </div>
        //             <div class="h-ordMomDiff">
        //                 <span class="${diffCls}">${diffSign}${item.ordMomDiff}</span>
        //             </div>
        //             <div class="h-amtAov">
        //                 <span>${amtAov}</span>
        //             </div>
        //             <div class="h-amtRevenue">
        //                 <span>${amtRevenue}</span>
        //             </div>
        //             <div class="h-monthGoal">
        //                 <span>${monthGoal}</span>
        //                 <span class="${goalPctClass}">${item.percent}%</span>
        //             </div>
        //             <div class="h-amtExpenses">
        //                 <span>${amtExpenses}</span>
        //             </div>
        //             <div class="h-amtProfit">
        //                 <span>${amtProfit}</span>
        //                 <span class="${profitPctClass}">${amtProfitPct}%</span>
        //             </div>
        //             <div class="h-custSegment">
        //                 <span class="${custSegments[0].class}">${custSegments[0].pct}%</span>
        //                 <span class="${custSegments[1].class}">${custSegments[1].pct}%</span>
        //                 <span class="${custSegments[2].class}">${custSegments[2].pct}%</span>
        //                 <span class="${custSegments[3].class}">${custSegments[3].pct}%</span>
        //             </div>
        //         </div>
        //     `;
        //     $container.append(html);
        //     return false;
        // });

        // --- 3. 遍歷年份 ---
        sortedYears.forEach(year => {
            const yearItems = yearsMap[year];
            const yearSubtotal = calculateSubtotal(yearItems, year);

            const isCurrentYear = (year == new Date().getFullYear());
            const openCls = isCurrentYear ? 'is-fold-open' : '';
            const displayStyle = isCurrentYear ? '' : 'style="display:none;"';

            // 這裡將「年度小計」這一行作為 Toggle 標頭
            // 傳入 true 啟動箭頭顯示
            let yearGroupHtml = `
                <div class="db-history-year-group ui-fold-group ${openCls}">
                    ${renderHistoryRow(yearSubtotal, 'is-year-subtotal ui-fold-header', true)}
                    <div class="ui-fold-content" ${displayStyle}>
                        ${yearItems.map(item => renderHistoryRow(item, '', false)).join('')}
                    </div>
                </div>
            `;
            $container.append(yearGroupHtml);
        });
    }

    /**
     * 輔助函式：計算一組資料的加總/平均
     */
    function calculateSubtotal(items, label) {
        let sumOrders = 0, sumDiff = 0, sumRev = 0, sumExp = 0, sumGoal = 0;
        let sumNew = 0, sumRep = 0, sumRel = 0, sumOth = 0;

        items.forEach(i => {
            sumOrders += (parseInt(i.ordTotal) || 0);
            sumDiff += (parseInt(i.ordMomDiff) || 0);
            sumRev += (parseInt(i.amtRevenue) || 0);
            sumExp += (parseInt(i.amtExpenses) || 0);
            sumGoal += (parseInt(i.monthGoal) || 0);
            sumNew += (parseInt(i.custNew) || 0);
            sumRep += (parseInt(i.custRepeat) || 0);
            sumRel += (parseInt(i.custRel) || 0);
            sumOth += (parseInt(i.custOther) || 0);
        });

        const avgAov = sumOrders > 0 ? Math.round(sumRev / sumOrders) : 0;
        const totalPct = sumGoal > 0 ? Math.round((sumRev / sumGoal) * 100) : 0;

        return {
            ym: label,
            ordTotal: sumOrders,
            ordMomDiff: sumDiff,
            amtAov: avgAov,
            amtRevenue: sumRev,
            amtExpenses: sumExp,
            monthGoal: sumGoal,
            percent: totalPct,
            custNew: sumNew,
            custRepeat: sumRep,
            custRel: sumRel,
            custOther: sumOth
        };
    }

    /**
     * 輔助函式：產生單一橫排的 HTML (統一格式)
     */
    function renderHistoryRow(item, extraClass, hasToggle) {
        const diffSign = item.ordMomDiff >= 0 ? '+' : '';
        const diffCls = item.ordMomDiff >= 0 ? 'text-ok' : 'text-err';
        const amtProfitVal = item.amtRevenue - item.amtExpenses;
        const profitPct = item.amtRevenue > 0 ? Math.round((amtProfitVal / item.amtRevenue) * 100) : 0;

        // 狀態判斷 (Goal / Profit / Segment ...) 邏輯保持不變
        let goalCls = item.percent >= 100 ? 'is-completed' : (item.percent >= 80 ? 'is-high' : (item.percent < 60 ? 'is-low' : ''));
        let profitCls = profitPct >= 20 ? 'is-high' : (profitPct < 10 ? 'is-low' : '');

        const rawSegments = [
            { val: item.custNew || 0 }, { val: item.custRepeat || 0 }, { val: item.custRel || 0 }, { val: item.custOther || 0 }
        ].map(s => ({ pct: item.ordTotal > 0 ? Math.round(s.val / item.ordTotal * 100) : 0 }));
        const maxPct = Math.max(...rawSegments.map(s => s.pct));
        const segmentHtml = rawSegments.map(s => `<span class="${s.pct === 0 ? 'is-zero' : (s.pct === maxPct ? 'is-high' : '')}">${s.pct}%</span>`).join('');

        // 【核心改動：年月 Cell 內容】
        // 如果是年度小計列，加入 Toggle 按鈕與年份文字
        let ymContent = `<span>${item.ym}</span>`;
        if (hasToggle) {
            ymContent = `
                <span class="y-text">${item.ym}</span>
                <button type="button" class="icon-btn" data-action="toggle">
                    <svg><use xlink:href="#icon-chevron-down"/></svg>
                </button>
            `;
        }

        return `
            <div class="history-all-row ${extraClass}">
                <div class="h-ym">${ymContent}</div>
                <div class="h-ordTotal"><span>${item.ordTotal}</span></div>
                <div class="h-ordMomDiff"><span class="${diffCls}">${diffSign}${item.ordMomDiff}</span></div>
                <div class="h-amtAov"><span>$${Math.round(item.amtAov).toLocaleString()}</span></div>
                <div class="h-amtRevenue"><span>$${item.amtRevenue.toLocaleString()}</span></div>
                <div class="h-monthGoal">
                    <span>$${item.monthGoal.toLocaleString()}</span>
                    <span class="${goalCls}">${item.percent}%</span>
                </div>
                <div class="h-amtExpenses"><span>$${item.amtExpenses.toLocaleString()}</span></div>
                <div class="h-amtProfit">
                    <span>$${amtProfitVal.toLocaleString()}</span>
                    <span class="${profitCls}">${profitPct}%</span>
                </div>
                <div class="h-custSegment">${segmentHtml}</div>
            </div>
        `;
    }
})(window, jQuery);
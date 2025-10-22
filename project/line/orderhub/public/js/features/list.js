/* =======================
	/js/features/list.js
	內容：首頁清單（最新 N 筆，含翻頁與每筆的編輯快捷）
======================= */
(function(w) {
    'use strict';
    var APP = w.APP || (w.APP = {});

    Object.assign(APP, {
        renderList: function() {
            var frag = TPL.tpl('tpl-list', { count: 0, pageInfo: '第 1/1 頁' });
            TPL.mount('#main', frag);

            var $root = $('.page.list');
            var $wrap = $('#listContainer');
            var $count = $root.find('[data-bind="count"]');
            var $info = $root.find('[data-bind="pageInfo"]');

            var page = 1,
                size = 20,
                total = 0,
                pages = 1;
            load();

            $root.off('click.listNS')
                .on('click.listNS', '[data-action="refresh"]', function() { load(); })
                .on('click.listNS', '[data-action="prev"]', function() { if (page > 1) { page--;
                        load(); } })
                .on('click.listNS', '[data-action="next"]', function() { if (page < pages) { page++;
                        load(); } })
                .on('click.listNS', '.card [data-action="edit"]', function(e) {
                    e.preventDefault();
                    var id = $(this).closest('.card').attr('data-id');
                    if (id) location.hash = '#/edit?id=' + encodeURIComponent(id);
                });

            function load() {
                APP.api('list', { page: page, size: size })
                    .then(function(res) {
                        if (!res || !res.ok) {
                            $wrap.html('<div class="msg err">❌ 載入失敗</div>');
                            $count.text('0');
                            $info.text('第 1/1 頁');
                            return;
                        }
                        var items = Array.isArray(res.items) ? res.items : [];
                        total = Number(res.total || items.length);
                        pages = Math.max(1, Math.ceil(total / (res.size || size)));
                        page = Number(res.page || page);
                        size = Number(res.size || size);

                        $count.text(total);
                        $info.text('第 ' + page + '/' + pages + ' 頁');
                        $root.find('[data-action="prev"]').prop('disabled', page <= 1);
                        $root.find('[data-action="next"]').prop('disabled', page >= pages);

                        if (!items.length) {
                            var empty = document.getElementById('tpl-list-empty');
                            $wrap.html(empty ? empty.innerHTML : '<div class="empty">沒有資料</div>');
                            return;
                        }
                        var html = '';
                        for (var i = 0; i < items.length; i++) html += renderCardHTML(items[i]);
                        $wrap.html(html);
                    });
            }

            function esc(s) { return String(s).replace(/[&<>"']/g, function(m) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' } [m]); }); }

            function renderCardHTML(o) {
                var id = esc(o['訂單編號'] || '');
                var pf = esc(o['接單平台'] || '');
                var name = esc(o['訂購人姓名'] || '');
                var tel = esc(o['訂購人電話'] || '');
                var amt = esc(o['訂單金額'] || '');
                var ship = esc(o['是否已交貨'] || '');
                var pay = esc(o['是否已付款'] || '');
                var dday = esc(o['交貨日期'] || '');
                return '' +
                    '<div class="card order" data-id="' + id + '">' +
                    '<div class="row a"><div class="id">#' + id + '</div><div class="platform">' + pf + '</div></div>' +
                    '<div class="row b"><div class="buyer"><span>' + name + '</span> <small>' + tel + '</small></div>' +
                    '<div class="amount"><span>$</span><b>' + amt + '</b></div></div>' +
                    '<div class="row c"><small>交貨日：<span>' + dday + '</span></small>' +
                    '<small>交貨：<span>' + ship + '</span></small>' +
                    '<small>付款：<span>' + pay + '</span></small></div>' +
                    '<div class="row d actions"><a class="btn" data-action="edit" href="#/edit?id=' + encodeURIComponent(id) + '">編輯</a></div>' +
                    '</div>';
            }
        }
    });
})(window);
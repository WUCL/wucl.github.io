/* =======================
	/js/core/app.router.js
	功能：Hash Router + 導覽高亮
	======================= */
(function(w) {
    'use strict';
    var APP = w.APP || (w.APP = {});

    APP.navHighlight = function() {
        var name = (location.hash || '').replace(/^#\//, '').split('?')[0] || 'list';
        var links = document.querySelectorAll('.nav-link');
        for (var i = 0; i < links.length; i++) {
            links[i].classList.toggle('active', links[i].getAttribute('data-nav') === name);
        }
        if (APP.el && APP.el.$tabAdd && APP.el.$tabEdit) {
            APP.el.$tabAdd.toggleClass('active', name === 'add');
            APP.el.$tabEdit.toggleClass('active', name === 'edit');
        }
    };

    APP.route = function(hash) {
        var h = (hash || location.hash || '').replace(/^#\//, '');
        var name = h.split('?')[0] || 'list';
        APP.navHighlight();
        switch (name) {
            case 'add':
                return APP.renderAdd && APP.renderAdd();
            case 'edit':
                return APP.renderEdit && APP.renderEdit();
            case 'list':
            default:
                return APP.renderList && APP.renderList();
        }
    };

    function bootRoute() {
        if (!location.hash) location.hash = '#/list';
        APP.route(location.hash);
    }

    w.addEventListener('hashchange', function() { APP.route(location.hash); });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bootRoute);
    } else {
        bootRoute();
    }
})(window);
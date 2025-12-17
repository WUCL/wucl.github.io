/* eslint-env browser, es2020 */
/*! OrderHub — UI/Templates (TPL) */
;(function(w) {
    'use strict';

    function renderTextNodes(node, data) {
        // 把所有文字節點拿出來做 {{key}} 置換（ES5 寫法）
        var walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, null, false);
        var toReplace = [];
        while (walker.nextNode()) toReplace.push(walker.currentNode);

        for (var i = 0; i < toReplace.length; i++) {
            var txt = toReplace[i];
            var s = txt.nodeValue;
            if (s && s.indexOf('{{') !== -1) {
                txt.nodeValue = s.replace(/\{\{([^}]+)\}\}/g, function(_, k) {
                    var key = String(k || '').trim();
                    return (data && data.hasOwnProperty(key) && data[key] != null) ? String(data[key]) : '';
                });
            }
        }
    }

    // === 載入模板、回傳 DOM 節點 ===
    function tpl(id, data) {
        var t = document.getElementById(id);
        if (!t) throw new Error('template not found: ' + id);
        var node = t.content.cloneNode(true);
        if (data) renderTextNodes(node, data);
        return node;
    }

    // === 掛載模板到指定容器 ===
    function mount(container, node, replace) {
        var el = (container && container.nodeType === 1) ? container : document.querySelector(container);
        if (!el) throw new Error('mount target not found');
        if (replace === undefined) replace = true;
        if (replace) el.innerHTML = '';
        el.appendChild(node);
        return el;
    }

    function msg(text, cls) {
        var frag = tpl('tpl-msg', { text: text, cls: cls || '' });
        return frag;
    }

    w.TPL = { tpl: tpl, mount: mount, msg: msg };
})(window);
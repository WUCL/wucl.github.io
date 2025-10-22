/* ui/templates.js — ES5 安全版 */
(function(w) {
    'use strict';

    var REGISTRY = Object.create(null);

    function renderTextNodes(node, data) {
        var walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, null, false);
        var nodes = [];
        while (walker.nextNode()) nodes.push(walker.currentNode);
        for (var i = 0; i < nodes.length; i++) {
            var txt = nodes[i];
            var s = txt.nodeValue;
            if (s && s.indexOf('{{') !== -1) {
                txt.nodeValue = s.replace(/\{\{([^}]+)\}\}/g, function(_, k) {
                    var key = String(k || '').trim();
                    return (data && Object.prototype.hasOwnProperty.call(data, key)) ? (data[key] == null ? '' : data[key]) : '';
                });
            }
        }
    }

    function tpl(id, data) {
        if (REGISTRY[id]) {
            var html = (typeof REGISTRY[id] === 'function') ? REGISTRY[id](data || {}) : String(REGISTRY[id] || '');
            var t = document.createElement('template');
            t.innerHTML = html.trim();
            var node = t.content.cloneNode(true);
            if (data) renderTextNodes(node, data);
            return node;
        }
        var el = document.getElementById(id);
        if (!el) throw new Error('template not found: ' + id);
        var frag = el.content.cloneNode(true);
        if (data) renderTextNodes(frag, data);
        return frag;
    }

    function mount(container, node, replace) {
        var el = (container && container.nodeType === 1) ? container : document.querySelector(container);
        if (!el) throw new Error('mount target not found: ' + container);
        if (replace === undefined) replace = true;
        if (replace) el.innerHTML = '';
        el.appendChild(node);
        return el;
    }

    function msg(text, cls) {
        var t = document.createElement('template');
        t.innerHTML = '<div class="msg ' + (cls || '') + '">' + String(text || '') + '</div>';
        return t.content.cloneNode(true);
    }
    function register(id, rendererOrHtml) { REGISTRY[id] = rendererOrHtml; }
    function unset(id) { delete REGISTRY[id]; }
    function render(container, id, data, replace) { return mount(container, tpl(id, data), replace); }

    w.TPL = { tpl: tpl, mount: mount, msg: msg, register: register, unset: unset, render: render };
})(window);
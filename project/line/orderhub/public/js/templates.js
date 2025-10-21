// assets/templates.js
(function(w) {
    function renderTextNodes(node, data) {
        const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, null, false);
        const toReplace = [];
        while (walker.nextNode()) toReplace.push(walker.currentNode);
        toReplace.forEach(txt => {
            const s = txt.nodeValue;
            if (s && s.includes('{{')) {
                txt.nodeValue = s.replace(/\{\{([^}]+)\}\}/g, (_, k) => (data[k.trim()] ?? ''));
            }
        });
    }

    function tpl(id, data) {
        const t = document.getElementById(id);
        if (!t) throw new Error('template not found: ' + id);
        const node = t.content.cloneNode(true);
        if (data) renderTextNodes(node, data);
        return node;
    }

    function mount(container, node, replace = true) {
        const el = (container instanceof Element) ? container : document.querySelector(container);
        if (!el) throw new Error('mount target not found');
        if (replace) el.innerHTML = '';
        el.appendChild(node);
        return el;
    }

    function msg(text, cls) {
        const frag = tpl('tpl-msg', { text, cls: cls || '' });
        return frag;
    }

    w.TPL = { tpl, mount, msg };
})(window);
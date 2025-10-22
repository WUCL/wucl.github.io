/* =======================
	/js/core/env.liff.js
   	內容： 環境偵測、徽章、LIFF 初始化。
	來源方法：detectEnv_, showEnvBadge_, initLiff
	======================= */
Object.assign(APP, {
	detectEnv_: function() {
        const h = location.hostname || '',
            proto = location.protocol || '',
            q = new URLSearchParams(location.search || '');
        if (q.get('dev') === '1') return { isDev: true, isStaging: false, label: 'DEV' };
        if (q.get('staging') === '1') return { isDev: false, isStaging: true, label: 'STAGING' };
        const isLocal = (proto === 'file:' || h === 'localhost' || h === '127.0.0.1' || /^192\.168\./.test(h) || /^10\./.test(h) || /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(h) || /\.local$/.test(h) || /\.test$/.test(h));
        const looksStaging = /ngrok\.io$/.test(h) || /ngrok-free\.app$/.test(h) || (/\.vercel\.app$/.test(h) && /-(git|preview)/i.test(h)) || (/\.netlify\.app$/.test(h) && /--/.test(h)) || /\.cloudfront\.net$/.test(h);
        if (isLocal) return { isDev: true, isStaging: false, label: 'DEV' };
        if (looksStaging) return { isDev: false, isStaging: true, label: 'STAGING' };
        return { isDev: false, isStaging: false, label: 'PROD' };
    },
    showEnvBadge_: function(env) {
        if (!(env.isDev || env.isStaging)) return;
        if (document.getElementById('env-badge')) return;
        const frag = TPL.tpl('tpl-badge', { label: env.label });
        TPL.mount(document.body, frag, false);
        $('#env-badge').on('click', function() { $(this).remove(); });
    },
    initLiff: async function() {
        // DEV/STAGING 與私網一律略過登入
        const h = location.hostname || '',
            proto = location.protocol || '';
        const isPrivate = (proto === 'file:' || h === 'localhost' || h === '127.0.0.1' || /^192\.168\./.test(h) || /^10\./.test(h) || /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(h));
        if (this.var.isDev || this.var.isStaging || isPrivate) {
            this.var.actor = (this.var.envLabel || 'LOCAL') + '-TEST';
            this.setMeta(`（${this.var.envLabel} 模式，未登入）`);
            return;
        }
        if (!window.liff || !this.var.LIFF_ID || this.var.LIFF_ID.indexOf('REPLACE_') === 0) { this.setMeta('(未啟用 LIFF)'); return; }
        try {
            await liff.init({ liffId: this.var.LIFF_ID });
            if (!liff.isLoggedIn()) { liff.login(); return; }
            const p = await liff.getProfile();
            this.var.actor = 'LIFF';// p.userId || 'LIFF';
            this.setMeta('使用者：' + (p.displayName || ''));
        } catch (e) {
            this.setMeta('(LIFF 初始化失敗)');
            console.warn(e);
        }
    }
});

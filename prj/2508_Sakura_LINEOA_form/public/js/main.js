$(function() {
    var MAIN = {
        env: 'html',
        el: {
            $window: $(window),
            $doc: $(document),
            $body: $('body'),
            $header: $('#header'),
            $main: $('#main'),
            $footer: $('#footer'),
            $nav: $('#nav'),
        },
        var: {
            $testmode: false,
            $LIFF_ID: '2007975476-OnJ2DKGJ',
            $GS_WEBAPP_URL: 'https://script.google.com/macros/s/AKfycbxkdgErafqbqJvq5wz7H2jWGlu9OGJXAZv317TeCN1DoEWqSLIHJmfHF8m-ppvbk0qZ/exec',
        },
        init: function() {
            if ('scrollRestoration' in history) { history.scrollRestoration = 'manual'; }
            this.el.$body.addClass(deviceObj.name);
            document.getElementById('envMode').textContent = deviceObj.name;
            document.getElementById('testMode').textContent = this.var.$testmode;

            // this.doAos();
            this.bindEvent();
        },
        bindEvent: function() {
            let $this = this;

            // if (!liff.isInClient() && !liff.isLoggedIn()) liff.login();

            let userProfile = null;
            let idToken = null;
            let lineUid = null;

            // (async () => {
            //     try {
            //     await liff.init({ liffId: $this.var.$LIFF_ID });
            //         console.log("LIFF init OK");
            //     } catch (err) {
            //         console.error("LIFF init error:", err.code, err.message);
            //         alert(`LIFF init error: ${err.code} ${err.message}`);
            //     }
            // })();
            console.log($this.var);
            console.log($this.var.$LIFF_ID);

            if (!this.var.$testmode) {
                (async () => {
                  try {
                    await liff.init({
                        liffId: $this.var.$LIFF_ID, // Use own liffId
                        withLoginOnExternalBrowser: true, // Enable automatic login process
                    })
                    .then(() => {
                        console.log("LIFF init success");
                    })
                    .catch((err) => {
                        console.error("LIFF init error:", err.code, err.message);
                        alert("LIFF init error: " + err.code + " " + err.message);
                    });

                    // 若在外部瀏覽器，提示使用者改在 LINE 打開
                    if (!liff.isInClient() && !liff.isLoggedIn()) {
                      document.getElementById('loginBtn').style.display = 'inline-block';
                      document.getElementById('loginBtn').onclick = () => liff.login();
                    }

                    if (!liff.isLoggedIn()) return; // 等使用者按登入

                    // 2) 取得使用者資料
                    userProfile = await liff.getProfile(); // displayName, userId(僅舊SDK) ；新版以 context.sub/ID token 為主
                    idToken = liff.getIDToken(); // raw id token (JWT)
                    const decoded = liff.getDecodedIDToken(); // { sub: 'Uxxxxxxxx', name, email? ... }
                    lineUid = decoded?.sub || null;

                    // 顯示於畫面
                    document.getElementById('profileCard').style.display = 'block';
                    document.getElementById('displayName').textContent = userProfile.displayName || '(無名稱)';
                    document.getElementById('userIdHint').textContent = lineUid ? `UID: ${lineUid}` : '（未取得 UID）';

                  } catch (err) {
                    console.error(err);
                    alert("LIFF 初始化失敗，請稍後再試。");
                  }
                })();
            }

            // 3) 送資料到 Google Apps Script
            document.getElementById('form').addEventListener('submit', async (e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const submitBtn = form.querySelector('button[type="submit"]');
                const resultDiv = document.getElementById('result');

                // 鎖按鈕 & 提示
                submitBtn.disabled = true;
                const originalText = submitBtn.textContent;
                submitBtn.textContent = "送出中...";
                resultDiv.textContent = "資料傳送中，請稍候...";

                const data = Object.fromEntries(new FormData(form).entries());
                const payload = {
                    timestamp: new Date().toISOString(),
                    lineUid,
                    displayName: userProfile?.displayName || '',
                    pictureUrl: userProfile?.pictureUrl || '',
                    idToken,
                    ...data,
                };

                try {
                    await fetch($this.var.$GS_WEBAPP_URL, {
                      method: 'POST',
                      mode: 'no-cors',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(payload),
                    });

                    console.log("✅ 表單已送出:", payload);
                    resultDiv.textContent = "✅ 已送出，感謝填寫！";
                    form.reset();
                } catch (err) {
                    console.error(err);
                    resultDiv.textContent = "❌ 傳送失敗，請稍後再試。";
                } finally {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalText;
                }
            });
        },
        // doAos: function() {
        //     return AOS.init({
        //         duration: 300,
        //         offset: 150,
        //         delay: 0,
        //         once: true,
        //         easing: 'ease-in'
        //     });
        // },
    };
    MAIN.init();
});
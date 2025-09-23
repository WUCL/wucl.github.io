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
            $survey_step: 1,
            $testmode: true,
            $testuid: 'allen250914test',
            $LIFF_ID: '2007975476-OnJ2DKGJ',
            $GS_WEBAPP_URL: 'https://script.google.com/macros/s/AKfycbxkdgErafqbqJvq5wz7H2jWGlu9OGJXAZv317TeCN1DoEWqSLIHJmfHF8m-ppvbk0qZ/exec',
        },
        init: function() {
            if ('scrollRestoration' in history) { history.scrollRestoration = 'manual'; }
            console.log(deviceObj);
            this.el.$body.addClass(deviceObj.name);

            document.getElementById('envDevice').textContent = deviceObj.envDevice;
            document.getElementById('envMode').textContent = deviceObj.name;
            document.getElementById('testMode').textContent = this.var.$testmode;

            // this.doAos();
            this.bindEvent();
            this.buildSurvey();

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

            if (!$this.var.$testmode) {
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
            } else {
                lineUid = $this.var.$testuid;
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

        buildSurvey: function() {
            console.log('buildSurvey');
            let $this = this;
            $this.el.$main.attr('data-step', $this.var.$survey_step);

            // == Render 所有題目 ==
            function renderSurvey() {
                const container = document.querySelector('.survey_steps');

                Q_LIST.forEach((step, stepIndex) => {
                    const stepContainer = document.createElement('div');
                    stepContainer.className = `step step_${stepIndex + 1}`;

                    step.forEach((q, qIndex) => {
                        const fieldset = document.createElement('fieldset');
                        fieldset.classList.add('item');
                        fieldset.dataset.type = q.t;
                        fieldset.dataset.id = `s${stepIndex + 1}_q${qIndex + 1}`;
                        if (q.maxcheckbox) fieldset.dataset.maxcheckbox = q.maxcheckbox;

                        const legend = document.createElement('legend');
                        legend.textContent = `${qIndex + 1}. ${q.q}`;
                        fieldset.appendChild(legend);

                        // 包裹 labels 的容器
                        const labelsWrapper = document.createElement('div');
                        labelsWrapper.classList.add('labels');

                        q.a.forEach((option, optIndex) => {
                            const id = `s${stepIndex + 1}_q${qIndex + 1}_a${optIndex + 1}`;

                            const input = document.createElement('input');
                            input.type = q.t;
                            input.id = id;
                            input.name = `s${stepIndex + 1}_q${qIndex + 1}`;
                            input.value = option;

                            const span = document.createElement('span');
                            span.textContent = option;

                            const label = document.createElement('label');
                            label.setAttribute('for', id);
                            label.appendChild(input);
                            label.appendChild(span);
                            labelsWrapper.appendChild(label);

                            // ✅ 即時監控 checkbox 的 max 數量
                            if (q.t === 'checkbox' && q.maxcheckbox) {
                                input.addEventListener('change', () => {
                                    const checked = fieldset.querySelectorAll('input:checked');
                                    if (checked.length > q.maxcheckbox) {
                                        fieldset.classList.add('error');
                                        fieldset.dataset.error = `最多選擇 ${q.maxcheckbox} 項`;
                                        // input.checked = false; // ❗超過後自動取消本次勾選
                                    } else {
                                        fieldset.classList.remove('error');
                                        fieldset.removeAttribute('data-error');
                                    }
                                });
                            }
                        });
                        fieldset.appendChild(labelsWrapper);
                        stepContainer.appendChild(fieldset);
                    });
                    container.appendChild(stepContainer);
                });
            }

            // == 單步驟驗證 ==
            function validateCurrentStep(stepIndex) {
                let valid = true;
                const currentStep = document.querySelector(`.step_${stepIndex}`);
                const questions = currentStep.querySelectorAll('.item');

                questions.forEach((item) => {
                    item.classList.remove('error');
                    item.removeAttribute('data-error');

                    const type = item.dataset.type;
                    const checked = item.querySelectorAll('input:checked');

                    // max checkbox 限制
                    if (type === 'checkbox' && item.dataset.maxcheckbox) {
                        const max = parseInt(item.dataset.maxcheckbox, 10);
                        if (checked.length > max) {
                            item.classList.add('error');
                            item.dataset.error = `最多選擇 ${max} 項`;
                            valid = false;
                        }
                    }

                    // 必填驗證
                    if (checked.length === 0) {
                        item.classList.add('error');
                        item.dataset.error = '欄位必填';
                        valid = false;
                    }
                });

                return valid;
            }

            // == 偵測清除error ==
            function bindErrorClearOnInput() {
                document.querySelectorAll('.item input').forEach((input) => {
                    input.addEventListener('change', () => {
                        const fieldset = input.closest('.item');
                        const checked = fieldset.querySelectorAll('input:checked');
                        const type = fieldset.dataset.type;
                        const max = parseInt(fieldset.dataset.maxcheckbox || Infinity, 10);

                        // ✅ 條件一：無 max 限制 → 只要有勾就清錯
                        if (type === 'checkbox' && !fieldset.dataset.maxcheckbox) {
                            if (checked.length > 0) {
                                fieldset.classList.remove('error');
                                fieldset.removeAttribute('data-error');
                            }
                        }

                        // ✅ 條件二：有 max 限制 → 勾選數量在範圍內才清錯
                        if (type === 'checkbox' && fieldset.dataset.maxcheckbox) {
                            if (checked.length > 0 && checked.length <= max) {
                            fieldset.classList.remove('error');
                            fieldset.removeAttribute('data-error');
                            }
                        }

                        // ✅ radio 題型
                        if (type === 'radio') {
                            if (checked.length > 0) {
                                fieldset.classList.remove('error');
                                fieldset.removeAttribute('data-error');
                            }
                        }
                    });
                });
            }

            // == 綁定下一步按鈕 ==
            document.querySelector('.step_submit button').addEventListener('click', () => {
                const main = document.querySelector('main');
                let currentStep = parseInt(main.dataset.step, 10); // ex: data-step="1"
                const isValid = validateCurrentStep(currentStep);

                if (!isValid) {
                    // 滾動至第一個錯誤欄位
                    const firstError = document.querySelector(`.step_${currentStep} .item.error`);
                    if (firstError) {
                        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                    return;
                }

                // 下一步邏輯
                if (currentStep === 1 || currentStep === 2) {
                    currentStep++;
                    main.setAttribute('data-step', currentStep);
                    document.querySelector(`.step_bar`).scrollIntoView({ behavior: 'smooth', block: 'center' });
                } else if (currentStep === 3) {
                    // ✅ Step3 為最終步驟，請在此填入送出處理
                    alert('所有欄位皆已完成，進入送出階段！');
                    // 可加上資料彙整 / Ajax 上傳 / 頁面跳轉等處理
                }
            });

            // 初始化第一步
            renderSurvey();
            bindErrorClearOnInput();
        },
    };
    MAIN.init();
});
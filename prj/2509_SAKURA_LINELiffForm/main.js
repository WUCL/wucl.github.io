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

        },

        buildSurvey: function() {
            let $this = this;
            let currentStep = 0;

            function renderStep(stepIndex) {
                const stepContainer = document.querySelectorAll('.step_1, .step_2')[stepIndex];
                const stepData = Q_LIST[stepIndex];

                stepContainer.innerHTML = ''; // 清空先前內容

                stepData.forEach((question, qIndex) => {
                    const fieldset = document.createElement('fieldset');
                    fieldset.className = 'item';
                    fieldset.setAttribute('data-type', question.t);
                    fieldset.setAttribute('data-id', `s${stepIndex + 1}_q${qIndex + 1}`);
                    if (question.maxcheckbox) {
                        fieldset.setAttribute('data-maxcheckbox', question.maxcheckbox);
                    }
                    const legend = document.createElement('legend');
                    legend.innerText = `${qIndex + 1}. ${question.q}`;
                    fieldset.appendChild(legend);

                    question.a.forEach((answer, aIndex) => {
                        const id = `s${stepIndex + 1}_q${qIndex + 1}_a${aIndex + 1}`;
                        // console.log(id);
                        const input = document.createElement('input');
                        input.type = question.t;
                        input.id = id;
                        input.name = `s${stepIndex + 1}_q${qIndex + 1}`;
                        input.value = answer;

                        const label = document.createElement('label');
                        label.setAttribute('for', id);
                        label.innerText = answer;
                        label.prepend(input);

                        fieldset.appendChild(label);
                    });

                    stepContainer.appendChild(fieldset);
                });

                // 套用勾選上限處理
                handleMaxCheckbox();
            }

            // 處理 max cheeckbox 判斷
            function handleMaxCheckbox() {
                document.querySelectorAll('fieldset[data-type="checkbox"]').forEach(fieldset => {
                    const max = parseInt(fieldset.dataset.maxcheckbox || 9999);
                    const checkboxes = fieldset.querySelectorAll('input[type="checkbox"]');

                    checkboxes.forEach(cb => {
                        cb.addEventListener('change', () => {
                        const checked = fieldset.querySelectorAll('input:checked');
                        checkboxes.forEach(box => {
                            box.disabled = checked.length >= max && !box.checked;
                        });
                    });
                    });
                });
            }

            // track step button
            function validateStep(stepIndex) {
                const stepContainer = document.querySelectorAll('.step_1, .step_2')[stepIndex];
                const items = stepContainer.querySelectorAll('.item');

                let isValid = true;

                items.forEach(item => {
                    const type = item.dataset.type;
                    const inputs = item.querySelectorAll(`input[type="${type}"]`);
                    const checked = Array.from(inputs).some(i => i.checked);

                    if (!checked) {
                        item.classList.add('error');
                        item.setAttribute('data-error', '欄位必填');
                        isValid = false;
                    } else {
                        item.classList.remove('error');
                        item.removeAttribute('data-error');
                    }
                });
                return isValid;
            }

            // 下一步按鈕點擊處理
            document.querySelector('.step_submit')?.addEventListener('click', () => {
                if (validateStep(currentStep)) {
                    document.querySelectorAll('.step_1, .step_2')[currentStep].style.display = 'none';
                    currentStep += 1;

                    if (currentStep < Q_LIST.length) {
                        document.querySelectorAll('.step_1, .step_2')[currentStep].style.display = 'block';
                        renderStep(currentStep);
                    } else {
                        console.log('全部步驟完成，這裡可以送出表單');
                    }
                }
            });

            // 初始化第一步
            renderStep(currentStep);
        },
    };
    MAIN.init();
});
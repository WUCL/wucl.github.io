// 依照地理位置（北中南東）定義順序
window.regionOrder = {
  "台北市": 1, "臺北市": 1, "台北": 1,
  "新北市": 2, "新北": 2,
  "基隆市": 3, "基隆": 3,
  "桃園市": 4, "桃園": 4,
  "新竹市": 5, "新竹縣": 6, "新竹": 6,
  "苗栗縣": 7, "苗栗": 7,
  "台中市": 8, "臺中市": 8, "台中": 8,
  "彰化縣": 9, "彰化": 9,
  "南投縣": 10, "南投": 10,
  "雲林縣": 11, "雲林": 11,
  "嘉義市": 12, "嘉義縣": 13, "嘉義": 13,
  "台南市": 14, "臺南市": 14, "台南": 14,
  "高雄市": 15, "高雄": 15,
  "屏東縣": 16, "屏東": 16,
  "宜蘭縣": 17, "宜蘭": 17,
  "花蓮縣": 18, "花蓮": 18,
  "台東縣": 19, "臺東縣": 19, "台東": 19,
  "澎湖縣": 20, "金門縣": 21, "連江縣": 22
};

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

            $_stores: $('section._stores'),

            $s_city: $('#select_city'),
            $s_dist: $('#select_dist'),
            $s_address: $('#select_address'),
            $btn_clear: $('#btn-clear'),
        },
        var: {
            allStores: []
        },
        init: function() {
            if ('scrollRestoration' in history) { history.scrollRestoration = 'manual'; }
            this.el.$body.addClass(deviceObj.name);
            this.bindEvent();
        },
        bindEvent: function() {
            let $this = this;
            $.getJSON('./public/data/stores.json', function(data) {
                // 將資料存入變數
                $this.var.allStores = data;

                // 執行初始化縣市選單
                initCitySelect();
            });

            // 第一步：點擊縣市
            $this.el.$s_city.on('click', 'div', function() {
                $this.el.$_stores.attr('data-step', '2');
                $(this).addClass('_active').siblings().removeClass('_active');
                const cityName = $(this).data('value');

                renderDistricts(cityName);
                window.scrollTo({
                    top:  $this.el.$s_dist.offset().top - 180,
                    behavior: 'smooth' // 這就是滑動感的關鍵
                });
            });
            // 第二步：點擊區域 (確保這裡能抓到正確的 cityName)
            $this.el.$s_dist.on('click', 'div', function() {
                $this.el.$_stores.attr('data-step', '3');
                $(this).addClass('_active').siblings().removeClass('_active');
                // 這裡要跟上面一致，抓 data-value
                const cityName = $this.el.$s_city.find('div._active').data('value');
                const distName = $(this).data('value');

                renderStores(cityName, distName);
                window.scrollTo({
                    top:  $this.el.$s_address.offset().top - 180,
                    behavior: 'smooth' // 這就是滑動感的關鍵
                });
            });

            $this.el.$btn_clear.on('click', function() {
                $this.el.$s_city.find('div').removeClass('_active');
                $this.el.$s_dist.find('div').removeClass('_active');
                $this.el.$_stores.attr('data-step', '1');

                window.scrollTo({
                    top:  $this.el.$s_city.offset().top - 180,
                    behavior: 'smooth' // 這就是滑動感的關鍵
                });
            })

            function initCitySelect() {
                // 統一轉成「台」，避免臺/台混用導致後續比對失敗
                const cityList = [...new Set($this.var.allStores.map(item => item[1].replace('臺', '台')))];

                cityList.sort((a, b) => {
                    const orderA = window.regionOrder[a] || 99;
                    const orderB = window.regionOrder[b] || 99;
                    return orderA - orderB;
                });

                $this.el.$s_city.empty(); // 先清空
                cityList.forEach(city => {
                    if (city.trim()) {
                        // 存入 data-value 確保比對精準
                        $this.el.$s_city.append(`<div data-value="${city}">${city}</div>`);
                    }
                });
            }
            function renderDistricts(selectedCity) {
                // 篩選區域
                const distList = [...new Set(
                    $this.var.allStores
                        .filter(item => item[1].replace('臺', '台') === selectedCity)
                        .map(item => item[2])
                )];

                distList.sort();

                const html = distList.map(dist => {
                    return dist ? `<div data-value="${dist}">${dist}</div>` : '';
                }).join('');

                $this.el.$s_dist.html(html).fadeIn();
                $this.el.$s_address.empty(); // 清空最後一階
            }
            function renderStores(selectedCity, selectedDist) {
                const stores = $this.var.allStores.filter(item => {
                    const city = item[1].replace('臺', '台');
                    const dist = item[2];
                    return city === selectedCity && dist === selectedDist;
                });

                const html = stores.map(store => `
                    <div class="store-card">
                        <div class="name">${store[0]}</div>
                        <div class="addr">${store[3]}</div>
                        <div class="tel">${store[4]}</div>
                    </div>
                `).join('');

                // $this.el.$s_address.hide().html(html).fadeIn(500);
                $this.el.$s_address.html(html);
            }
        },
    };
    MAIN.init();
});
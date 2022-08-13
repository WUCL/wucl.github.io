/* =======================
preloadImg
======================= */
function preloadImg(imgs) {
    var index = 0,
    len = imgs.length;

    //图片预加载
    $.preload(imgs, {
        // 是否有序加载
        order: false,
        minTimer: 1300,
        //每加载完一张执行的方法
        each: function (count) {
            let percent = Math.round((count+1) / len * 100) + ' %';
            // console.log(percent);
        },
        // 加载完所有的图片执行的方法
        end: function () {
            // console.log((index + 1) + '/' + len);
        }
    });
}
window.imgs = [
    'public/img/step-1-bottom.gif',
    'public/img/step-1-bottom.jpg',
    'public/img/step-1.jpg',
    'public/img/step-2.jpg',
    'public/img/step-3.jpg',
    'public/img/step-3-bottom.jpg',
    'public/img/step-4.jpg',
    'public/img/step-4-bottom.jpg',
    'public/img/step-5.jpg',
    'public/img/step-5-middle.jpg',
    'public/img/step-5-bottom.jpg',
    'public/img/step-5-bottom-btn.jpg',
    'public/img/step-6.jpg',
    'public/img/step-7.jpg',
    'public/img/step-commonagreed.jpg',
    'public/img/icon-arrow.png',
];
preloadImg(window.imgs);
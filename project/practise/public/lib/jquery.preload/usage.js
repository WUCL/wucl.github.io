function preloadImg(imgs) {
    let index = 0,
    len = imgs.length;

    // 图片预加载
    $.preload(imgs, {
        // 是否有序加载
        order: false,
        minTimer: 1300,
        // 每加载完一张执行的方法
        each: function (count) {
            let percent = Math.round((count+1) / len * 100) + '%';
            console.log(percent);
        },
        // 加载完所有的图片执行的方法
        end: function () {
            console.log((index + 1) + '/' + len);
        }
    });
}
window.preloadImgs = [
    'dist/img/bg_down.jpg',
    'dist/img/bg_up.png',
];
preloadImg(window.preloadImgs);
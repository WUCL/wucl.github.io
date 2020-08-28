// !IMPORTANT need to https


const u = navigator.userAgent;
// const is_android = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1; //android终端
const is_ios = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
const is_mobile = window.innerWidth <= 1024

const btn = document.querySelector('.godoit')
btn.addEventListener('click', async () => {
    if (!is_mobile) {
        alert('請使用手機或平板等移動裝置進行喔!!')
    } else {
        if (is_ios) {
            if (!DeviceOrientationEvent) {
                alert('不好意思\n你的手機似乎不支援陀螺儀')
            }
            if (DeviceOrientationEvent && !DeviceOrientationEvent.requestPermission) {
                alert('不好意思\n你的手機版本是要自己手動開啟陀螺儀')
            }
            if (DeviceOrientationEvent && DeviceOrientationEvent.requestPermission) {
                const status = await DeviceOrientationEvent.requestPermission()
                if (status === 'denied') {
                  alert('如果要重新開啟手機搖動偵測\n請重新以新頁籤開啟本網頁\n並允許陀螺儀開啟')
                }
                if (status === 'granted') {
                  alert('盡情吧!')
                }
            }
            console.log('123');
        } else {
            console.log('456');
        }
    }
    // document.querySelector('.white-board').style.display = 'none'
})
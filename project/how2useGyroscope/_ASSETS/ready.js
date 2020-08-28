
const u = navigator.userAgent;
// const is_android = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1; //android终端
const is_ios = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
const is_mobile = window.innerWidth <= 1024



const btn = document.querySelector('.btn_goshake')

function air_run() {
    location.href = `${window.location.origin}/2020/ellerun/game/game.php`
}

btn.addEventListener('click', async () => {
    if (!is_mobile) {
        alert('請使用手機或平板等移動裝置進行 Air Run 喔 !!')
    } else {
        if (is_ios) {
            if (!DeviceOrientationEvent) {
                alert('不好意思\n你的手機似乎不支援陀螺儀\n能否填表單告知我們呢~')
            }
    
            if (DeviceOrientationEvent && !DeviceOrientationEvent.requestPermission) {
                alert('不好意思\n你的手機版本是要自己手動開啟陀螺儀\n能否填表單告知我們呢~')
            }
    
            if (DeviceOrientationEvent && DeviceOrientationEvent.requestPermission) {
                const status = await DeviceOrientationEvent.requestPermission()
                if (status === 'denied') {
                  alert('如果要重新開啟手機搖動偵測\n請重新以新頁籤開啟本網頁\n並允許陀螺儀開啟')
                }
         
                if (status === 'granted') {
                  alert('盡情搖動手機享受ELLE線上運動會吧!')
                }
             } 
             air_run()
        } else {
            air_run()
        }
    }
    
    document.querySelector('.white-board').style.display = 'none'
})


async function get_total() {
    const res_not_jsoned = await fetch(`${window.location.origin}/2020/ellerun/api.php?r=all`)
    const res =  await res_not_jsoned.json()
    return res
}

async function set_total() {
    const { data } = await get_total()
    document.querySelector('.game-zone p span').innerHTML = data
}
set_total()


// const go_to_record_btn = document.querySelector('.btn_old')
// go_to_record_btn.addEventListener('click', () => {
//   location.href = `${window.location.origin}/2020/ellerun/game/record.php`
// })

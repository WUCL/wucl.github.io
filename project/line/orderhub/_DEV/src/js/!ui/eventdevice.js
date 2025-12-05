// src/js/ui/eventdevice.js
// === Device Info Utility ===
window.deviceObj = {
    name: 'PC',
    pvtag: '',
    isMobile: function() {
        return !!navigator.userAgent.match(/Android|webOS|iPhone|iPad|iPod|BlackBerry|Windows Phone/i);
    },
    getDeviceName: function() {
        return this.isMobile() ? 'Mobile' : 'PC';
    },
    getPVtag: function() {
        return this.isMobile() ? '/mobile' : '';
    },
    init: function() {
        this.name = this.getDeviceName();
        this.pvtag = this.getPVtag();
    }
};

window.deviceObj.init();

// 方便使用的快捷函式
window.isMobile = function() {
    return window.deviceObj.isMobile();
};
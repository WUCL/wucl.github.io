var deviceObj = {
    name: 'PC',
    pvtag: '',
    isMobile: function() {
        return !!navigator.userAgent.match(/Android|webOS|iPhone|iPad|iPod|BlackBerry|Windows Phone/i);
    },
    getDeviceName: function() {
        if (this.isMobile()) {
            return 'Mobile';
        }
        return 'PC';
    },
    getPVtag: function() {
        if (this.isMobile()) {
            return '/mobile';
        }
        return '';
    },
    init: function() {
        this.name = this.getDeviceName();
        this.pvtag = this.getPVtag();
    }
};
deviceObj.init();
function isMobile() {
    return deviceObj.isMobile();
}

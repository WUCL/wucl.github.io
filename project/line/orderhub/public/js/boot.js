/* eslint-env browser, jquery, es2020 */
/*!
 * OrderHub — Boot
 * 職責：DOM Ready → APP.init()
 */
$(function() {
    if (window.APP && APP.init) APP.init();
});
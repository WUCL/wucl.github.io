var isShowfirstModal = true;

$(document).ready(function(_$) {
    $(window).scroll(my_scroll);
    my_scroll();
    setScrollTopBtn();

    $('.owl-carousel').owlCarousel({
        items: 1,
        loop: true,
        center: true,
        lazyLoad: true,
        autoplay: true,
        autoplayHoverPause: true
    });
});

function menuToggle(_this) { _this.parentNode.classList.toggle('active'); }
function toggle(_this) { _this.classList.toggle('active'); }
function goProduce(_this, event, link) {
    if($(document).width() <= 768) {
        toggle(_this);
    } else {
        goHref(link, event);
    }
}
function goNews(link, event) {
    var pageName = window.location.pathname.split("/").pop();
    if(pageName == 'home.html') {
        alert('敬請期待');
    } else {
        goHref(link, event);
    }
}
function goHref(link, event, target) {
    if(!target) { target = '_self'; }
    window.open(link, target);
    event.stopPropagation();
}
function goBack() { window.history.go(-1); }

function my_scroll() {
    var scrollTop = $(window).scrollTop();
    // gotop相關捲軸偵測
    let gotop = $(".goTop");
    if( scrollTop > 0 ){
        if( $(".show").length == 0 && gotop.length > 0 ){
            gotop.addClass("show");
        }
    }else if( scrollTop <= 0 ){
        gotop.removeClass("show");
    }
}
function setScrollTopBtn() {
    let gotop = $(".goTop");
    gotop.click(function(){
        $('html, body').animate({scrollTop: 0}, 800);
        return false;
    });
}
function modalClose(_this) { _this.parentNode.parentNode.classList.toggle('active'); }
function modalOpen(modalID) { $(modalID).addClass('active'); }
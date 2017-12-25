console.log('%cHi! My name is Chung-Lun Wu, You can call me Allen.', 'color:#dc4776;padding-left:9px;font-weight:bolder;font-size:50px;');
$('._home__resume, ._exp__mmc').on('click', '._content ._part h3', function(){
	$(this).closest('._part').toggleClass('_show');
})
$('._exp__mmc').on('click', '._controller', function(){
	$(this).closest('.__left').toggleClass('_play');
})
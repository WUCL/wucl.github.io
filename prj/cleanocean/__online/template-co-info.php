<?php
/* Template Name: template-co-info
* 海洋資訊
*/
/**
* @package Make
*/
?>
<!DOCTYPE html>
<html lang="zh-Hant">
    <head>
        <meta charset="utf-8" />
        <meta http-equiv="content-type" content="text/html; charset=utf-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
        <title>海洋資訊</title>
        <meta name="keywords" content="" />
        <meta name="description" content="" />
        <meta property="og:url" content="" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="" />
        <meta property="og:description" content="" />
        <meta property="og:image" content="" />

        <!-- <link rel="shortcut icon" href="assets/favicon.ico" type="image/x-icon" /> -->
        <!-- <link rel="icon" type="image/png" href="./favicon.png" /> -->
        <link rel="icon" type="image/png" href="./favicon.ico" />
        <!-- <link rel="stylesheet" type="text/css" href="/wp-content/assets/lib/aos/aos.css" /> -->
        <link rel="stylesheet" type="text/css" href="/wp-content/assets/css/info.min.css" />
	</head>
	<body data-page="info">
        <header id="header" class="header">
        	<div class="header__inner">
        		<div class="logo">
        			<a href="/index"><img src="/wp-content/assets/img/logo@2x.png"></a>
        		</div>
        		<nav class="nav">
        			<ul>
        				<li class="nav-info nav-effect"><a href="/info"><label>海洋資訊</label></a></li>
        				<li class="nav-data nav-effect nav-data-dl subnav">
        					<a href="/data"><label>數據資料庫</label></a>
        					<div class="subnav-content">
        						<a class="nav-data nav-effect" href="/data"><label>數據資料庫</label></a>
        						<a class="nav-data-dl nav-effect" href="/data-dl"><label>數據下載</label></a>
        					</div>
        				</li>
        				<li class="nav-member nav-effect"><a href="/member"><label>會員專區</label></a></li>
        				<li class="nav-album nav-effect nav-postcarder subnav">
        					<a href="/album"><label>活動項目</label></a>
        					<div class="subnav-content">
        						<a class="nav-album nav-effect" href="/album"><label>活動相簿</label></a>
        						<a class="nav-postcarder nav-effect" href="/postcarder"><label>明信片製作</label></a>
        					</div>
        				</li>
        				<li id="btn-login" class="nav-unlogin nav-effect"><a href="javascript:;"><label>登入/註冊</label></a></li>
        				<!-- <li class="nav-login nav-effect"><a href="javascript:;"><img class="avatar" src="https://fakeimg.pl/40x40/"><label>登出</label></a></li> -->
        			</ul>
        		</nav>
        		<div id="hamburger" class="hamburger">
        			<div class="hamburger__inner">
        				<span></span><span></span><span></span>
        			</div>
        		</div>
        	</div>
        </header>
		<main id="main" class="main">
		    <section class="pagename">
		        <div class="inner">
		            <img src="/wp-content/assets/img/icon-info@2x.png">
		            <span>海洋資訊</span>
		        </div>
		    </section>
		</main>
		<footer id="footer" class="footer">
			<section class="menus">
				<div class="menus__inner">
					<div class="logo">
						<a href="/index"><img src="/wp-content/assets/img/logo@2x.png"></a>
					</div>
					<div class="menu">
						<nav class="nav">
							<ul>
								<li class="nav-method nav-effect active"><a href="/info" method><label>海洋資訊</label></a></li>
								<li class="nav-data nav-effect"><a href="/data"><label>數據資料庫</label></a></li>
								<li class="nav-member nav-effect"><a href="/member"><label>會員專區</label></a></li>
								<li class="nav-album nav-effect"><a href="/album"><label>活動相簿</label></a></li>
							</ul>
						</nav>
						<div class="sponsor">
							<div class="logo-sow"><img src="/wp-content/assets/img/logo-sow@2x.png"></div>
							<div class="logo-see"><img src="/wp-content/assets/img/logo-see@2x.png"></div>
						</div>
					</div>
				</div>
			</section>
			<section class="copyright">
				<div class="copyright__inner">
					<span>Copyright 荒野保護協會版權所有 Design by 築筠文創</span>
					<span>使用條款|Email-<a href="sow@sow.org.tw">sow@sow.org.tw</a></span>
				</div>
			</section>
		</footer>
		<div id="templates" class="display-none-i">
		    <div id="template_index__postcards">
		        <li><img data-src="[POSTCARD_IMG]"></li>
		    </div>

		    <div id="template_data__result">
		        <li class="filter-result-item datas-item">
		            <input type="checkbox" name="resultItem[]" id="select-[ID]" value="[ID]">
		            <label class="f-r-i-name" for="select-[ID]">
		                <span class="name-county">[COUNTY]</span>
		                <span class="name-date">[DATA_Y]/[DATA_M]/[DATA_D]</span>
		                <span class="name-campaign">[CAMPAIGN]</span>
		            </label>
		        </li>
		    </div>

		    <div id="template_member__postcards">
		        <li><img data-src="[POSTCARD_IMG]"></li>
		    </div>

		    <div id="template_member__campaigns">
		        <li class="campaign" data-id="[ID]"><button class="btn-del-campaign btn-style-2" value="[ID]"></button><span>[COUNTY] [DATA_Y]/[DATA_M]/[DATA_D] [CAMPAIGN]</span></li>
		    </div>

		    <div id="template_album__result">
		        <li class="filter-result-item albums-item view-album_open" data-id="[ID]">
		            <div class="f-r-i-name">
		                <span class="name-county">[COUNTY]</span>
		                <span class="name-date">[DATA_Y]/[DATA_M]/[DATA_D]</span>
		                <span class="name-campaign">[CAMPAIGN]</span>
		            </div>
		            <div class="f-r-i-album">
		                <div class="album-featured"><img data-src="[FEATURED]" /></div>
		                <div class="album-source">[OWNER]</div>
		            </div>
		        </li>
		    </div>

		    <div id="template_album__pics">
		        <li class="va-pic-item" data-va-pic="[ID]">
		            <input type="checkbox" name="albumPic[]" id="va-pic-[ID]" value="[ID]">
		            <label for="va-pic-[ID]"><img data-src="[PIC]"></label>
		        </li>
		    </div>

		    <div id="template_album__pics-radio">
		        <li class="va-pic-item" data-va-pic="[ID]">
		            <input type="radio" name="albumPic[]" id="va-pic-[ID]" value="[ID]">
		            <label for="va-pic-[ID]"><img data-src="[PIC]"></label>
		        </li>
		    </div>
		</div>
        

		<script src="/wp-content/assets/js/_DATA.js"></script>
		<script src="/wp-content/assets/lib/jquery/1.12.4/jquery.min.js"></script>
		<script src="/wp-content/assets/js/custom/eventdevice.js"></script>
		<script src="/wp-content/assets/js/helper.js"></script>

		<!-- Include jQuery Popup Overlay -->
		<script src="https://cdn.jsdelivr.net/gh/vast-engineering/jquery-popup-overlay@2/jquery.popupoverlay.min.js">
		</script>
        <script src="/wp-content/assets/js/common.js"></script>
        <script src="/wp-content/assets/js/info.js"></script>
	</body>
</html>
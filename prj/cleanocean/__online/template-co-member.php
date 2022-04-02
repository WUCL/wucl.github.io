<?php
/* Template Name: template-co-member
* 會員專區
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
        <title>會員專區</title>
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
        <!-- <link rel="stylesheet" type="text/css" href="wp-content/assets/lib/aos/aos.css" /> -->
        <link rel="stylesheet" type="text/css" href="wp-content/assets/lib/jquery.flipster/jquery.flipster.css" />
        <link rel="stylesheet" type="text/css" href="wp-content/assets/css/member.min.css" />
	</head>
	<body data-page="member">
        <header id="header" class="header">
        	<div class="header__inner">
        		<div class="logo">
        			<a href="/index/"><img src="wp-content/assets/img/logo@2x.png"></a>
        		</div>
        		<nav class="nav">
        			<ul>
        				<li class="nav-info nav-effect"><a href="/info/"><label>海洋資訊</label></a></li>
        				<li class="nav-data nav-effect nav-data-dl subnav">
        					<a href="/data/"><label>數據資料庫</label></a>
        					<div class="subnav-content">
        						<a class="nav-data nav-effect" href="/data/"><label>數據資料庫</label></a>
        						<a class="nav-data-dl nav-effect" href="/data-dl"><label>數據下載</label></a>
        					</div>
        				</li>
        				<li class="nav-member nav-effect"><a href="/member/"><label>會員專區</label></a></li>
        				<li class="nav-album nav-effect nav-postcarder subnav">
        					<a href="/album/"><label>活動相簿</label></a>
        					<div class="subnav-content">
        						<a class="nav-album nav-effect" href="/album/"><label>活動相簿</label></a>
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
		            <img src="wp-content/assets/img/icon-member@2x.png">
		            <span>會員專區</span>
		        </div>
		    </section>
		    <section class="my-info">
		        <div class="inner">
		            <div class="m-view">
		                <div class="m-avatar-box"><img id="m-avatar" class="m-avatar" src="https://fakeimg.pl/100x100/?text=會員頭貼&font=noto"></div>
		                <div class="m-name-box"><input id="m-name" class="m-name" type="text" name="m-name" value="會員名稱"></div>
		                <button id="btn-m-edit" class="btn-m-edit btn-style-2 edit-member_open">編輯會員</button>
		            </div>
		            <div class="campaign-view">
		                <ul class="datas-total-ul">
		                    <li>
		                        <div class="total-key" data-text="年度活動"></div>
		                    </li>
		                </ul>
		                <div class="campaigns box-style">
		                    <div class="campaign"><img src="https://fakeimg.pl/900x350/fff/?text=活動banner&font=noto"></div>
		                </div>
		            </div>
		        </div>
		    </section>
		    <section class="annual_datas">
		        <div class="title with_afterline"><span>年度數據資料</span></div>
		        <div class="inner">
		            <div class="datas-total">
		                <ul class="datas-total-ul">
		                    <li>
		                        <div class="total-key" data-text="淨灘場次"></div>
		                        <div id="annual-freq" class="total-value" data-unit="場">0</div>
		                    </li>
		                    <li>
		                        <div class="total-key" data-text="淨灘人數"></div>
		                        <div id="annual-people" class="total-value" data-unit="人">0</div>
		                    </li>
		                    <li>
		                        <div class="total-key" data-text="淨灘長度"></div>
		                        <div id="annual-meter" class="total-value" data-unit="公尺">0</div>
		                    </li>
		                    <li>
		                        <div class="total-key" data-text="淨灘重量"></div>
		                        <div id="annual-kg" class="total-value" data-unit="公斤">0</div>
		                    </li>
		                </ul>
		            </div>
		        </div>
		    </section>
		    <section id="my-record" class="my-record" data-edit-mode="0">
		        <div class="title with_afterline">
		            <span>我的淨灘足跡</span>
		            <button id="btn-myrecord-edit"class="btn-myrecord-edit btn-style-2">編輯</button>
		        </div>
		        <div class="inner">
		            <div id="mycampaign" class="mycampaign box-style">
		                <ul class="campaigns"></ul>
		                <button class="btn-add-campaign btn-style-2 add-campaign_open"></button>
		            </div>
		            <button id="btn-creat-recorder" class="btn-creat-recorder btn-style-2">成果圖產生器</button>
		            <div class="recorder-img-box">
		                <canvas id="canvas" class="display-none-i"></canvas>
		                <img id="recorder-img" src>
		                <a id="btn-recorder-dl" class="btn-style-5 btn-recorder-dl" download="recorder.png">成果圖下載</a>
		                <!-- <img id="recorder-pin" class="display-none-i" src="wp-content/assets/img/recorder-pin.png" > -->
		            </div>
		        </div>
		    </section>
		    <section class="postcards">
		        <div class="title with_afterline"><span>我的明信片</span></div>
		        <div class="inner">
		            <div id="my-flipster" class="my-flipster">
		                <ul id="postcard-list" class="postcard-list"></ul>
		            </div>
		            <a href="/postcarder" class="postcarder btn-style">製作明信片</a>
		        </div>
		    </section>
		</main>
		<section id="edit-member">
		    <div class="popup_inner">
		        <div class="popup_header">
		            <h2>修改會員資料</h2>
		        </div>
		        <form id="form_edit-member" class="form_edit-member" name="form_edit-member" onsubmit="return false;">
		            <ul>
		                <li>
		                    <label for="m-editor-avatar">頭像</label><input type="file" name="m-editor-avatar" id="m-editor-avatar" accept="image/*">
		                    <img id="preview_avatar" class="preview_avatar" src="">
		                </li>
		                <li>
		                    <label for="m-name">姓名</label><input type="text" name="m-name" id="m-editor-name" value="會員名稱">
		                </li>
		            </ul>
		            <button type="submit" id="btn-m-editor-update" class="btn-m-editor-update btn-style-2">更新</button>
		        </form>
		    </div>
		</section>
		<section id="add-campaign">
		    <div class="popup_inner">
		        <form id="form_add-campaign" class="form_add-campaign" name="form_add-campaign" onsubmit="return false;">
		            <select class="btn-add-campaign-select">
		                <option>彰化 2020/02/24 王功淨灘1</option>
		                <option>彰化 2020/02/24 王功淨灘2</option>
		                <option>彰化 2020/02/24 王功淨灘3</option>
		                <option>彰化 2020/02/24 王功淨灘4</option>
		            </select>
		            <button type="submit" id="btn-add-campaign-update" class="btn-add-campaign-update btn-style-2">更新</button>
		        </form>
		    </div>
		</section>
		<footer id="footer" class="footer">
			<section class="menus">
				<div class="menus__inner">
					<div class="logo">
						<a href="/index"><img src="wp-content/assets/img/logo@2x.png"></a>
					</div>
					<div class="menu">
						<nav class="nav">
							<ul>
								<li class="nav-method nav-effect active"><a href="info.html" method><label>海洋資訊</label></a></li>
								<li class="nav-data nav-effect"><a href="data.html"><label>數據資料庫</label></a></li>
								<li class="nav-member nav-effect"><a href="member.html"><label>會員專區</label></a></li>
								<li class="nav-album nav-effect"><a href="album.html"><label>活動相簿</label></a></li>
							</ul>
						</nav>
						<div class="sponsor">
							<div class="logo-sow"><img src="wp-content/assets/img/logo-sow@2x.png"></div>
							<div class="logo-see"><img src="wp-content/assets/img/logo-see@2x.png"></div>
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
        

		<script src="wp-content/assets/js/_DATA.js"></script>
		<script src="wp-content/assets/lib/jquery/1.12.4/jquery.min.js"></script>
		<script src="wp-content/assets/js/custom/eventdevice.js"></script>
		<script src="wp-content/assets/js/helper.js"></script>

		<!-- Include jQuery Popup Overlay -->
		<script src="https://cdn.jsdelivr.net/gh/vast-engineering/jquery-popup-overlay@2/jquery.popupoverlay.min.js">
		</script>
        <script src="https://github.com/niklasvh/html2canvas/releases/download/0.4.1/html2canvas.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.0/FileSaver.min.js"></script>
        <script src="wp-content/assets/lib/jquery.flipster/jquery.flipster.min.js"></script>
        <script src="wp-content/assets/js/common.js"></script>
        <script src="wp-content/assets/js/annual-datas.js"></script>
        <script src="wp-content/assets/js/member.js"></script>
	</body>
</html>
<?php
/* Template Name: template-co-postcarder
* 明信片製作
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
        <title>明信片製作</title>
        <meta name="keywords" content="" />
        <meta name="description" content="" />
        <meta property="og:url" content="" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="" />
        <meta property="og:description" content="" />
        <meta property="og:image" content="" />

        <!-- <link rel="shortcut icon" href="assets/favicon.ico" type="image/x-icon" /> -->
        <!-- <link rel="icon" type="image/png" href="../favicon.png" /> -->
        <link rel="icon" type="image/png" href="../favicon.ico" />
        <!-- <link rel="stylesheet" type="text/css" href="../public/lib/aos/aos.css" /> -->
        <link rel="stylesheet" type="text/css" href="../wp-content/assets/css/postcarder.min.css" />
	</head>
	<body data-page="postcarder">
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
        					<a href="/album"><label>活動相簿</label></a>
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
		            <img src="/wp-content/assets/img/icon-album@2x.png">
		            <span>明信片製作</span>
		        </div>
		    </section>
		    <section id="postcarder" class="postcarder" data-step="1">
		        <div class="inner">
		            <div class="step-1">
		                <form class="postcard-form" onsubmit="return false;">
		                    <div class="postcard-img">
		                        <div class="postcard-img-box">
		                            <label class="btn-style-4 file-upload" for="postcard-img-upload">上傳照片</label>
		                            <input id="postcard-img-upload" style="display:none;" type="file" accept="image/*">
		                            <button id="postcard-img-album" class="btn-style-4 file-album view-album_open">相簿中照片</button>
		                        </div>
		                        <div class="postcard-img-tip">檔案限制2M以下，過大會造成上傳無效。</div>
		                        <div class="postcard-img-preview-box">
		                            <img id="postcard-img-preview" class="postcard-img-preview" src />
		                        </div>
		                        <img id="postcard-img-bg" class="postcard-img-bg display-none-i" src="/wp-content/assets/img/postcard.png" />
		                    </div>
		                    <ul id="postcard-text" class="postcard-text">
		                        <li>
		                            <label for="postcard-title">明信片標題（有20個字元可以填寫，目前剩餘<span>20</span>個字）</label>
		                            <input type="text" id="postcard-title" name="postcard-title" maxlength="20" data-postcard="title">
		                        </li>
		                        <li>
		                            <label for="postcard-content">內文（有70個字元可以填寫，目前剩餘<span>70</span>個字）</label>
		                            <textarea type="text" id="postcard-content" name="postcard-content" maxlength="70" data-postcard="content"></textarea>
		                        </li>
		                        <li>
		                            <label for="postcard-writer">作者署名（有9個字元可以填寫，目前剩餘<span>9</span>個字）</label>
		                            <input type="text" id="postcard-writer" name="postcard-writer" maxlength="9" data-postcard="writer">
		                        </li>
		                    </ul>
		                </form>
		                <button id="btn-file-preview" class="btn-style-5 btn-file-preview">預覽</button>
		            </div>
		            <div class="step-2">
		                <div class="preview-img">
		                    <canvas id="canvas" class="display-none-i"></canvas>
		                    <img id="resize-img" class="display-none-i" src />
		                    <img id="preview-img" src />
		                </div>
		                <div class="preview-btns">
		                    <button type="button" id="btn-file-edit" class="btn-style-5 btn-file-edit">修改</button>
		                    <button type="button" id="btn-file-public" class="btn-style-5 btn-file-public">發佈</button>
		                </div>
		            </div>
		            <div class="step-3">
		                <div class="public-img">
		                    <img id="public-img" src />
		                </div>
		                <div class="public-shares">
		                    <a id="btn-file-dl" class="btn-style-5 btn-file-dl" download="postcard.png">明信片下載</a>
		                    <!-- <div class="shares-text">分享到</div>
		                    <div class="btn-shares">
		                        <a id="btn-share-facebook" class="btn-icon btn-share-facebook" href="javascript:console.log('facebook');">F</a>
		                        <a id="btn-share-line" class="btn-icon btn-share-line" href="javascript:console.log('LINE');">L</a>
		                    </div> -->
		                </div>
		            </div>
		        </div>
		    </section>
		</main>
		<section id="view-album" data-va-steps="1">
		    <div class="popup_inner">
		        <div class="albums_box va-step-1 withfilter-box" data-va-step="1">
		            <div class="albums-filter in-filter">
		                <form class="form_filters-a" name="form_filters-a" onsubmit="return false;">
		                    <div class="filter-time">
		                        <label for="filter-time-begin">時間</label>
		                        <input type="date" id="filter-time-begin" name="filter-time-begin">
		                        <label for="filter-time-end">至</label>
		                        <input type="date" id="filter-time-end" name="filter-time-end">
		                    </div>
		                    <div class="filter-county">
		                        <label for="filter-county">縣市</label>
		                        <div id="twzipcode" class="twzipcode">
		                            <div data-role="county" data-id="filter-county"></div>
		                            <div data-role="district" data-style="display:none !important;"></div>
		                            <div data-role="zipcode" data-style="display:none !important;"></div>
		                        </div>
		                    </div>
		                    <div class="filter-campaign">
		                        <label for="filter-campaign">淨灘地點</label>
		                        <input type="text" name="filter-campaign" id="filter-campaign" maxlength="10">
		                    </div>
		                    <button id="btn-filter-search" class="btn-style-2 btn-filter-search" type="button">搜尋</button>
		                </form>
		            </div>
		            <ul id="filter-result-list" class="filter-result-list albums-list"></ul>
		        </div>
		        <div class="va-step-2 into-album" data-va-step="2">
		            <div class="popup_header va-pic-header">
		                <h2 id="va-name" class="va-name"></h2>
		                <div class="btns">
		                    <button id="btn-back-to-album" class="btn-back-to-album btn-style-2" type="button">回相簿</button>
		                    <button id="btn-confirm-pic" class="btn-confirm-pic btn-style-2" type="button">確定選取</button>
		                </div>
		            </div>
		            <ul id="va-pic-list" class="va-pic-list"></ul>
		        </div>
		    </div>
		</section>
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
					<span>使用條款|Email-<a href="mailto:sow@sow.org.tw">sow@sow.org.tw</a></span>
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
        

		<script src="../wp-content/assets/js/_DATA.js"></script>
		<script src="../wp-content/assets/lib/jquery/1.12.4/jquery.min.js"></script>
		<script src="../wp-content/assets/js/custom/eventdevice.js"></script>
		<script src="../wp-content/assets/js/helper.js"></script>

		<!-- Include jQuery Popup Overlay -->
		<script src="https://cdn.jsdelivr.net/gh/vast-engineering/jquery-popup-overlay@2/jquery.popupoverlay.min.js">
		</script>
        <script src="https://github.com/niklasvh/html2canvas/releases/download/0.4.1/html2canvas.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.0/FileSaver.min.js"></script>
        <script src="../wp-content/assets/lib/twzipcode/jquery.twzipcode.min.js"></script>
        <script src="../wp-content/assets/js/common.js"></script>
        <script src="../wp-content/assets/js/postcarder.js"></script>
	</body>
</html>
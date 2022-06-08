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
        <!-- <link rel="icon" type="image/png" href="../favicon.png" /> -->
        <link rel="icon" type="image/png" href="../favicon.ico" />
        <!-- <link rel="stylesheet" type="text/css" href="../public/lib/aos/aos.css" /> -->
        <link rel="stylesheet" type="text/css" href="../wp-content/assets/lib/jquery.flipster/jquery.flipster.css" />
        <link rel="stylesheet" type="text/css" href="../wp-content/assets/lib/swiper/swiper.min.css" />
        <link rel="stylesheet" type="text/css" href="../wp-content/assets/css/member.min.css" />
	</head>
	<body data-page="member">
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
		            <img src="/wp-content/assets//img/icon-member@2x.png">
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
		                <div id="campaigns-swiper" class="campaigns box-style campaigns-swiper">
		                    <div class="swiper-wrapper"></div>
		                    <div class="swiper-pagination"></div>
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
		                <!-- <img id="recorder-pin" class="display-none-i" src="/wp-content/assets//img/recorder-pin.png" > -->
		            </div>
		        </div>
		    </section>
		    <section class="postcards">
		        <div class="title with_afterline"><span>我的明信片</span></div>
		        <div class="inner">
		            <div id="postcard-flipster" class="postcard-flipster">
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
		        <form id="form_add-campaign" class="form_add-campaign" name="form_add-campaign" onsubmit="return false;" data-ifempty="0">
		            <select id="btn-add-campaign-select" class="btn-add-campaign-select"></select>
		            <button type="submit" id="btn-add-campaign-update" class="btn-add-campaign-update btn-style-2">更新</button>
		        </form>
		    </div>
		</section>
		<footer id="footer" class="footer">
			<section class="menus">
				<div class="menus__inner">
					<div class="logo">
		                <ul>
		                    <li>
		                        <a href="/index"><img src="/wp-content/assets/img/logo@2x.png"></a>
		                    </li>
		                    <li>
		                        <a href="https://www.sow.org.tw/" target="_blank"><img src="/wp-content/assets/img/logo-sow.png"></a>
		                    </li>
		                </ul>
					</div>
					<div class="menu">
						<nav class="nav">
							<ul>
								<li class="nav-method nav-effect"><a href="https://www.sow.org.tw/" target="_blank"><label>荒野保護協會</label></a></li>
								<li class="nav-data nav-effect view-terms_open"><a href="javascript:;"><label>使用條款</label></a></li>
								<li class="nav-member nav-effect"><a href="mailto:oceanday@wilderness.tw"><label>聯絡我們</label></a></li>
							</ul>
						</nav>
						<div class="subnav">
							<div>本網站由統一零錢捐贊助（2022-）</div>
						</div>
					</div>
				</div>
			</section>
			<section class="copyright">
				<div class="copyright__inner">
					<span>Copyright 荒野保護協會版權所有 Design by 築筠文創</span>
					<span>Email-<a href="mailto:sow@sow.org.tw">sow@sow.org.tw</a></span>
				</div>
			</section>
		</footer>
		<section id="view-terms">
		    <div class="popup_inner">
		        <div class="popup_header">
		            <h2>愛海小旅行網站使用條款</h2>
		        </div>
		        <div class="popup_list">
		            <p>社團法人中華民國荒野保護協會經營管理之愛海小旅行網站（cleanocean.sow.org.tw）係依據本使用條款提供愛海小旅行網站服務（以下簡稱本平台）。當您使用本服務時，即表示您已閱讀、瞭解並同意接受本服務條款之所有內容。本平台管理者有權於任何時間修改或變更本服務條款之內容，建議您隨時注意該等修改或變更。您於任何修改或變更後繼續使用本服務，視為您已閱讀、瞭解並同意接受該等修改或變更。</p>
		            <p class="p-title">1.使用者登入</p>
		            <p>當您在本平台使用facebook帳號註冊時，我們會經由facebook取得您的姓名、電子郵件等資料。在您註冊本平台帳號並登入我們的服務後，我們就能辨別您的身分。除非法律程序需要，本平台不會向任何其他人士或單位出借或出售您的個人資料，或與之分享。</p>
		            <p class="p-title">2.資料收集與使用</p>
		            <p>本平台使用者刊登、報名淨灘相關活動以及客製化明信片、上傳淨灘資料等功能，相對應個人資料蒐集內容與目的如下：</p>
		            <p class="p-sub">
		                <label>(1)刊登活動者：</label>
		                <br><span>僅能發起淨灘相關活動，管理者審閱後得刪除不合規定之活動。刊登活動者得以兩種方式取得報名者的姓名、聯絡方式等個人資料，一為自行建立外部表單連結，二為使用本平台提供之資料收集系統。刊登活動者對於網友個人資料的蒐集、處理及利用，需遵守中華民國「個人資料保護法」，不得任意出售、交換、或出租任何在本平台取得之個人資料給其他團體、個人或私人企業。</span>
		                <br><br><label>(2)報名活動者：</label>
		                <br><span>報名參與本平台刊登之淨灘相關活動時，報名者需提供姓名、聯絡資料等以供刊登活動者於活動前聯絡。</span>
		                <br><br><label>(3)製作明信片者：</label>
		                <br><span>本平台依據您上傳之圖片、相片、文字等資料提供客製化個人之旅行明信片。您擁有您在本平台發佈的所有內容和資料，管理者審閱後得刪除不恰當內容之明信片。此外，智慧財產權所涵蓋的內容，如相片和文字，您具體地給予本平台以下權限：您給予本平台非獨有、可轉讓、可再授權、免版稅的全球授權，使用您張貼在本平台的任何內容。</span>
		                <br><br><label>(4)上傳淨灘資料者：</label>
		                <br><span>您可在本平台上傳您淨灘的紀錄，成為海洋廢棄物監測的部分資料。本平台之海洋廢棄物監測將統計淨灘場次、地點、種類與數量、廢棄物重量、淨灘人數等資訊，並公開提供非商業使用之下載。</span>
		            </p>
		            <br><p>本平台對於以上四種所取得之任何資訊，除上述使用範圍外，非經當事人同意、當事人自行公開或對行政、司法或他人法律程序之必要，本平台不會向任何其他對象分享您的個人資料。</p>
		            <p class="p-title">3.使用者義務與承諾</p>
		            <p>當您在本平台使用facebook帳號註冊時，我們會經由facebook取得您的姓名、電子郵件等資料。在您註冊本平台帳號並登入我們的服務後，我們就能辨別您的身分。除非法律程序需要，本平台不會向任何其他人士或單位出借或出售您的個人資料，或與之分享。</p>
		            <p class="p-sub">
		                <label>(1)</label>您同意並保證不得利用本平台從事侵害他人權益或違法之行為，包括但不限於：張貼、公布或傳送任何誹謗、侮辱、具威脅性、攻擊性、不雅、猥褻、不實、違反公共秩序或善良風俗或其他不法之文字、圖片或任何形式的資料於本平台上。
		                <br><br><label>(2)</label>侵害他人名譽、隱私權、營業秘密、商標權、著作權、專利權、其他智慧財產權及其他權力。
		                <br><br><label>(3)</label>違反依法律或契約所應負之保密義務。
		                <br><br><label>(4)</label>冒用他人名義使用本平台。
		                <br><br><label>(5)</label>上載、張貼、傳輸或散佈任何含有電腦病毒或任何對電腦軟、硬體產生中斷、破壞或限制功能之程式碼之資料。
		                <br><br><label>(6)</label>從事不法交易行為或張貼虛假不實、引人犯罪之訊息。
		                <br><br><label>(7)</label>販賣槍枝、毒品、禁藥、盜版軟體或其他違禁物。
		                <br><br><label>(8)</label>提供賭博資訊或以任何方式引誘他人參與賭博。
		                <br><br><label>(9)</label>濫發廣告郵件、垃圾郵件、連鎖信、違法之多層次傳銷訊息等。
		                <br><br><label>(10)</label>以任何方法傷害未成年人。
		                <br><br><label>(11)</label>對於恐怖行動提供任何實質支持或資源。
		                <br><br><label>(12)</label>追蹤他人或其他干擾他人或為前述目前蒐集或儲存他人之個人資訊。
		                <br><br><label>(13)</label>其他本平台有正當理由認為不適當之行為。
		            </p>
		            <p class="p-title">4.一般條款</p>
		            <p>本服務條款之解釋與適用，以及與本服務條款有關的爭議，除法律另有規定者外，均應依照中華民國法律予以處理，並以台灣台北地方法院為第一審管轄法院。</p>
		        </div>
		    </div>
		</section>
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
		<script src="../wp-content/assets/lib/jquery.inView/jQuery-inView.min.js"></script>
		<script src="../wp-content/assets/js/custom/eventdevice.js"></script>
		<script src="../wp-content/assets/js/helper.js"></script>

		<!-- Include jQuery Popup Overlay -->
		<script src="https://cdn.jsdelivr.net/gh/vast-engineering/jquery-popup-overlay@2/jquery.popupoverlay.min.js"></script>
        <script src="https://github.com/niklasvh/html2canvas/releases/download/0.4.1/html2canvas.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.0/FileSaver.min.js"></script>
        <script src="../wp-content/assets/lib/jquery.flipster/jquery.flipster.min.js"></script>
        <script src="../wp-content/assets/lib/swiper/swiper.min.js"></script>
        <script src="../wp-content/assets/js/common.js"></script>
        <script src="../wp-content/assets/js/annual-datas.js"></script>
        <script src="../wp-content/assets/js/member.js"></script>
	</body>
</html>
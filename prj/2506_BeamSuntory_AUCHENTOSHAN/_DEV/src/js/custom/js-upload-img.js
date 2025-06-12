function jsUploadImg() {
    var thisImg = document.querySelector('#upload--img');
    var base64El = document.querySelector('#upload--img--preview');
    var base64ElInput = document.querySelector('#baseImg2');

    //  压缩图片需要的一些元素
    var reader = new FileReader(),
        img = new Image();

    // 选择的文件对象
    var file = null;

    // 缩放图片需要的canvas
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');

    // base64地址图片加载完毕后
    img.onload = function() {
        // 图片原始尺寸
        var originWidth = this.width;
        var originHeight = this.height;

        // 最大尺寸限制
        var maxWidth = 400,
            maxHeight = 400;

        // 目标尺寸
        var targetWidth = originWidth,
            targetHeight = originHeight;

        // 图片尺寸超过400*400的限制
        if (originWidth > maxWidth || originHeight > maxHeight) {
            if (originWidth / originHeight > maxWidth / maxHeight) {

                // 更宽，按照宽度限定尺寸
                targetWidth = maxWidth;
                targetHeight = Math.round(maxWidth * (originHeight / originWidth));
            } else {
                targetHeight = maxHeight;
                targetWidth = Math.round(maxHeight * (originWidth / originHeight));
            }
        }

        // canvas对图片进行缩放
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        // 清除画布
        context.clearRect(0, 0, targetWidth, targetHeight);

        // 图片压缩
        context.drawImage(img, 0, 0, targetWidth, targetHeight);

        // canvas转为blob并上传
        canvas.toBlob(function(blob) {

            console.log('输出压缩后的blob对象');
            console.log(blob);
            if (file.type == 'image/jpeg') {
                var image_url = canvas.toDataURL("image/jpeg");
            } else if (file.type == 'image/png') {
                var image_url = canvas.toDataURL(); // PNG is the default
            }
            console.log(image_url);
            base64El.setAttribute("src", image_url);
            base64ElInput.setAttribute("value", image_url);
            base64El.classList.remove('display-none');
            $('.popup--upload').addClass('uploaded');


            // 图片ajax上传
            // var xhr = new XMLHttpRequest();

            // 文件上传成功
            // xhr.onreadystatechange = function() {
            //    if ( xhr.status === 200 ) {
            // xhr.responseText 就是返回的数据
            //    }
            // };

            // 开始上传
            // xhr.open('POST', 'upload.php', true);
            // xhr.send( blob );
        }, file.type || 'image/png');
    };

    // 文件base64化，以便获取图片原尺寸
    reader.onload = function() {
        img.src = this.result;
    };
    thisImg.addEventListener('change', function(event) {
        file = event.target.files[0];

        // 选择的文件是图片
        if (file.type.indexOf('image') === 0) {
            reader.readAsDataURL(file);
        }
    });
};




















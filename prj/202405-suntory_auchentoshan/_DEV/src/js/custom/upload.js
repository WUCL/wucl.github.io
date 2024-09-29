var upload;
$(function() {
    upload = {
        el: {
            hideFile: $("#file-hide"),
            clickFile: $("#file-click"),
            canvas: $("#canvas"),
            rotateR_btn: $(".rotate-right"),
            rotateL_btn: $(".rotate-left"),
            zoomin_btn: $(".glyphicon-zoom-in"),
            zoomout_btn: $(".glyphicon-zoom-out"),
            save_btn: $(".glyphicon-save"),
        },
        fabCanvas: undefined,
        fabricOpt: {
            //Mobile上在Canvas的範圍中還可Scroll
            allowTouchScrolling: false,
            //是否可以框選多個
            selection: false,
            //Canvas的背景色
            backgroundColor: '#333',
        },
        hasImage: false,
        //Canvas畫布大小
        dimension: {
            width: 400,
            height: 300
        },
        //上傳圖片顯示的品質1~2
        quality: 1,
        init: function() {
            if (this.el.canvas.length) {
                this.initCanvas();
            }
            this.bindEvent();
        },
        initCanvas: function() {
            this.fabCanvas = new fabric.Canvas('canvas', this.fabricOpt);
            this.fabCanvas.on({
                'object:selected': this.bind(this, function(options) {
                    //set selectobj
                    if (options.target) {
                        this.onSelectObj = options.target;
                    }
                })
            });
            this.addFrame();
            this.fabAnimateHandler = {
                onChange: this.fabCanvas.renderAll.bind(this.fabCanvas),
                duration: 100
            };
        },
        addFrame: function() {
            //Cover圖的URL
            fabric.Image.fromURL('img/photo_frame.png', this.bind(this, function(oImg) {
                oImg.set({
                    width: this.dimension.width,
                    height: this.dimension.height,
                    originX: 'left',
                    originY: 'top'
                    // scaleY: 1,
                    // scaleX: 1,
                    // selectable: false
                });
                //this.fabCanvas.add(oImg);
                this.fabCanvas.setOverlayImage(oImg, this.fabCanvas.renderAll.bind(this.fabCanvas));
            }));
        },
        handleImage: function(e) {
            this.fabCanvas.clear();
            var file = e.target.files[0];
            if (file) {
                loadImage.parseMetaData(file, this.bind(this, function(data) {
                    var options = this.getLoadImageOption();
                    if (data.exif) {
                        options.orientation = data.exif.get('Orientation');
                    }
                    loadImage(file, this.bind(this, this.loadImageCompleted), options);

                }));
            }
        },
        loadImageURL: function(_url) {
            this.fabCanvas.clear();
            var options = this.getLoadImageOption();
            loadImage(_url, this.bind(this, this.loadImageCompleted), options);
        },
        loadImageCompleted: function(oImg) {
            var _dim = this.scaleImage(oImg.width, oImg.height, this.dimension.width, this.dimension.height, true);
            var imgInstance = new fabric.Image(oImg, {
                width: _dim.width,
                height: _dim.height,
                left: _dim.targetleft + _dim.width * 0.5,
                top: _dim.targettop + _dim.height * 0.5,
                centeredScaling: true,
                originX: 'center',
                originY: 'center'
            });
            this.hasImage = true;
            this.onSelectObj = imgInstance;
            this.fabCanvas.add(imgInstance);
            this.fabCanvas.setActiveObject(imgInstance);
            this.fabCanvas.renderAll();
        },
        openFile: function() {
            if (this.el.hideFile.length) {
                this.el.hideFile.click();
            }
        },
        getLoadImageOption: function() {
            //for loadimage用
            return {
                maxWidth: this.dimension.width * (1 + this.quality),
                maxHeight: this.dimension.height * (1 + this.quality),
                canvas: true,
                crossOrigin: "",
            };
        },
        scaleImage: function(srcwidth, srcheight, targetwidth, targetheight, fLetterBox) {
            var result = {
                width: 0,
                height: 0,
                fScaleToTargetWidth: true
            };

            if ((srcwidth <= 0) || (srcheight <= 0) || (targetwidth <= 0) || (targetheight <= 0)) {
                return result;
            }

            // scale to the target width
            var scaleX1 = targetwidth;
            var scaleY1 = (srcheight * targetwidth) / srcwidth;

            // scale to the target height
            var scaleX2 = (srcwidth * targetheight) / srcheight;
            var scaleY2 = targetheight;

            // now figure out which one we should use
            var fScaleOnWidth = (scaleX2 > targetwidth);
            if (fScaleOnWidth) {
                fScaleOnWidth = fLetterBox;
            } else {
                fScaleOnWidth = !fLetterBox;
            }

            if (fScaleOnWidth) {
                result.width = Math.floor(scaleX1);
                result.height = Math.floor(scaleY1);
                result.fScaleToTargetWidth = true;
            } else {
                result.width = Math.floor(scaleX2);
                result.height = Math.floor(scaleY2);
                result.fScaleToTargetWidth = false;
            }
            result.targetleft = Math.floor((targetwidth - result.width) / 2);
            result.targettop = Math.floor((targetheight - result.height) / 2);

            return result;
        },
        zoomInClick: function(e) {
            if (this.onSelectObj) {
                this.fabric_scale(this.onSelectObj, "+=0.1");
            }
        },
        zoomOutClick: function(e) {
            if (this.onSelectObj) {
                this.fabric_scale(this.onSelectObj, "-=0.1");
            }
        },
        rotateRClick: function(e) {
            if (this.onSelectObj) {
                var newAngle = Math.floor((this.onSelectObj.getAngle() + 90) / 90) * 90;
                this.onSelectObj.animate('angle', newAngle, this.fabAnimateHandler);
            }
        },
        deleteClick: function(e) {
            if (this.onSelectObj) {
                this.fabCanvas.setBackgroundColor(this.fabricOpt.backgroundColor);
                this.fabCanvas.remove(this.onSelectObj);
                this.onSelectObj = null;
                this.hasImage = false;
                this.el.clickFile.removeClass('hidden');
                this.el.hideFile.replaceWith(this.el.hideFile = this.el.hideFile.clone(true));
            }
        },
        saveClick: function(e) {
            this.fabCanvas.discardActiveObject();
            var dataURL = this.fabCanvas.toDataURL();
            $('img.result')[0].src = dataURL;
        },
        fabric_scale: function(object, to) {
            var fromX = object.get('scaleX');
            var scaleYdiff = object.get('scaleX') - object.get('scaleY');
            if (~to.indexOf('=')) {
                to = fromX + parseFloat(to.replace('=', ''));
            }
            if (to < 0.1) {
                to = 0.05;
            }
            fabric.util.animate({
                startValue: fromX,
                endValue: to,
                duration: 100,
                onChange: this.bind(this, function(value) {
                    object.set('scaleX', value);
                    object.set('scaleY', value - scaleYdiff);
                    this.fabCanvas.renderAll();
                })
            });
        },
        setCanvasDimensions:function(w,h){
            this.dimension.width = w;
            this.dimension.height = h;
            this.fabCanvas.setDimensions({width:w,height:h});
        },
        bindEvent: function() {
            this.el.hideFile.on('change', this.bind(this, this.handleImage));
            this.el.rotateR_btn.bind('click', this.bind(this, this.rotateRClick));
            this.el.zoomin_btn.bind('click', this.bind(this, this.zoomInClick));
            this.el.zoomout_btn.bind('click', this.bind(this, this.zoomOutClick));
            this.el.save_btn.bind('click', this.bind(this, this.saveClick));
        },
        bind: function(obj, method) {
            return function() {
                return method.apply(obj, [].slice.call(arguments));
            };
        }
    };
    upload.init();
});

function getImageData() {
    if (!upload.hasImage) {
        return false;
    }
    upload.fabCanvas.discardActiveObject();
    return upload.fabCanvas.toDataURL({
        format: 'jpeg',
        quality: 1,
        multiplier: 1.195
    });
}

function loadImageURL(_url) {
    upload.loadImageURL(_url);
}

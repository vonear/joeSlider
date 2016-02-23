(function($) {
    $.fn.JoeSlider = function(params) {
        var options = {
            "startItem": 1, 		//起始位置
            "autoPlay": true,		//是否自动播放
            "interval": 3000,		//播放间隔
            "slideDuration": 350,	//切换时间
            "direction": "h", 		//切换方向 ，"h" , "v",
            "controller": "true",	//是否手动控制切换
            "nextBtn": "joe-slider-next",	//默认下一个切换按钮,可自定义为DOM,JQUERY对象或选择器
            "prevBtn": "joe-slider-prev",	//默认上一个切换按钮
            "nextBtnText": "next",			//下一个按钮文字
            "prevBtnText": "prev",			//上一个按钮文字
            "pauseWhenHover": "true"		//鼠标悬浮时，是否暂停播放
        };
        try {
            $.extend(options, params);
        } catch (e) {
            console.log(e);
        }
        return this.each(function() {
            var slider = $(this); //获取基本信息
            var items = slider.children(),
                itemCount = items.length,
                itemW = items.width(),
                itemH = items.height();

            items.each(function(index) { //添加必要属性用以切换
                $(this).attr("data-index", index + 1);
            });

            var sliderCtn = $("<div>").css({ //滑动轮播容器
                "width": itemW,
                "height": itemH,
                "overflow": "hidden",
                "position": "relative"
            });
            sliderCtn.appendTo(slider.parent());
            slider.appendTo(sliderCtn);

            var cloneFirst = items.first().clone().attr("data-index", "1"), //克隆第一个及最有一个节点，用以无缝切换
                cloneLast = items.last().clone().attr("data-index", itemCount);
            items.first().before(cloneLast);
            items.last().after(cloneFirst);

            $(items.get(options.startItem - 1)).addClass('cur'); //初始化状态
            if (options.direction == "h") {
                slider.css({
                    "width": (itemCount + 2) * itemW,
                    "transform": "translateX(" + (-1 * options.startItem * itemW) + "px)",
                    "transition": "all linear " + options.slideDuration / 1000 + "s"
                });
            } else if (options.direction == "v") {
                slider.css({
                    "height": itemH,
                    "transform": "translateY(" + (-1 * options.startItem * itemH) + "px)",
                    "transition": "all linear " + options.slideDuration / 1000 + "s"
                });
            }

            /*切换事件*/
            var timer, checkCloneTimer;
            var doSlide = function(isNext) {
                var curItem = slider.find(".cur"), 		//取得下一个滑块，并设置相关属性
                    curIndex = curItem.index();
                curItem.removeClass('cur');
                if (options.direction == "h") {			//水平切换
                    slider.css({
                        "transform": "translateX(" + (-1 * (!isNext ? curIndex - 1 : curIndex + 1) * itemW) + "px)",
                        "transition": "all linear " + options.slideDuration / 1000 + "s"
                    });
                } else if (options.direction == "v") {	//垂直切换
                    slider.css({
                        "transform": "translateY(" + (-1 * (!isNext ? curIndex - 1 : curIndex + 1) * itemH) + "px)",
                        "transition": "all linear " + options.slideDuration / 1000 + "s"
                    });
                }
                clearTimeout(checkCloneTimer);
                if (isNext) {
                    curItem.next().addClass('cur');
                    checkCloneTimer = setTimeout(function() { //判断是否由最后一个节点切换至第一个节点的克隆节点，如果是，切换完成后切换至真实的第一个节点
                        var nextItemIndex = curItem.next().attr("data-index");
                        if (nextItemIndex != curItem.next().index()) {
                            curItem.next().removeClass('cur');
                            items.first().addClass('cur');
                            if (options.direction == "h") {
                                slider.css({
                                    "transform": "translateX(" + (-1 * nextItemIndex * itemW) + "px)",
                                    "transition": "none"
                                });
                            } else if (options.direction == "v") {
                                slider.css({
                                    "transform": "translateY(" + (-1 * nextItemIndex * itemH) + "px)",
                                    "transition": "none"
                                });
                            }
                        }
                    }, options.slideDuration);
                } else {
                    curItem.prev().addClass('cur');
                    checkCloneTimer = setTimeout(function() {
                        var nextItemIndex = curItem.prev().attr("data-index");
                        if (nextItemIndex != curItem.prev().index()) {
                            curItem.prev().removeClass('cur');
                            items.last().addClass('cur');
                            if (options.direction == "h") {//判断是否由第一个节点切换至最后一个的克隆节点，如果是，切换完成后切换至真实的最后一个节点
                                slider.css({
                                    "transform": "translateX(" + (-1 * itemCount * itemW) + "px)",
                                    "transition": "none"
                                });
                            } else if (options.direction == "v") {
                                slider.css({
                                    "transform": "translateY(" + (-1 * itemCount * itemH) + "px)",
                                    "transition": "none"
                                });
                            }
                        }
                    }, options.slideDuration);
                }
            };

            /*自动播放*/
            if (options.autoPlay) { 
                timer = setInterval(function() { doSlide(true) }, options.interval);
            }


            /*鼠标悬浮时，取消自动播放*/
            if (options.pauseWhenHover) {
                sliderCtn.hover(function() {
                    clearInterval(timer);
                }, function() {
                    timer = setInterval(function() { doSlide(true) }, options.interval);
                });
            }

            /*是否手动切换，如果用户未指定切换按钮，将有joeSlider自动生成按钮*/
            if (options.controller) {
                var defalutControllerCss = {
                    "position": 'absolute',
                    "top": "50%",
                    "height": "40px",
                    "width": "40px",
                    "background": "rgba(233,233,233,0.8)",
                    "z-index": "100",
                    "margin-top": "-20px",
                    "cursor": "pointer",
                    "text-align": "center",
                    "line-height": "40px",
                    "opacity": "0",
                    "transition": "opacity linear 0.2s"
                };
                var prevBtn, nextBtn;
                if (options.prevBtn == "joe-slider-prev") {
                    prevBtn = $("<div>").text(options.prevBtnText).addClass('joe-slider-prev')
                        .css(defalutControllerCss).css({ "left": "0" }).insertAfter(slider);
                    sliderCtn.hover(function() {
                        prevBtn.css({ "opacity": "0.8" });
                    }, function() {
                        prevBtn.css({ "opacity": "0" });
                    });
                } else {
                    prevBtn = $(options.prevBtn);
                }
                if (options.nextBtn == "joe-slider-next") {
                    nextBtn = $("<div>").text(options.nextBtnText).addClass('joe-slider-next')
                        .css(defalutControllerCss).css({ "right": "0" }).insertAfter(slider);
                    sliderCtn.hover(function() {
                        nextBtn.css({ "opacity": "0.8" });
                    }, function() {
                        nextBtn.css({ "opacity": "0" });
                    });
                } else {
                    nextBtn = $(options.nextBtn);
                }
                prevBtn.click(function() {
                    doSlide(false);
                });
                nextBtn.click(function() {
                    doSlide(true);
                });

            }


        });
    }
})(jQuery);

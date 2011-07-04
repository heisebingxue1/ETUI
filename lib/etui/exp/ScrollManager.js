/*!require: etui.exp */

(function ($, undef) {
    var toString = Object.prototype.toString;


    function ScrollManager() {

        var events = {
            onmovecompleted: [],
            oninitcompleted: [],
            onstatusupdated: [],
            onitemclicked: []
        };

        this.status = {
            leadingMost: true,
            endingMost: true
        };

        this.items = [];
        this.leadingItemIndex;
        this.endingItemIndex;
        this.overlayer;
        this.objectToBeMoved;

        var self = this;

        function updateStatus() {
            self.status.leadingMost = self.leadingItemIndex - 1 < 0 ? true : false;
            self.status.endingMost = self.endingItemIndex + 1 >= self.items.length ? true : false;

            fireEvent("onstatusupdated", self.status.leadingMost, self.status.endingMost);
        }

        function addEventHandler(eventType, callback) {
            events[eventType].push(callback);
        }

        function init() {
            updateStatus();
            fireEvent("oninitcompleted");
        }

        function pre_init() {
            events.onmovecompleted.push(updateStatus);
            events.oninitcompleted.push(updateStatus);
        }

        function fireEvent() {
            var length;
            var eventType = Array.prototype.shift.call(arguments);
            if ((length = events[eventType] && events[eventType].length) > 0) {
                for (var ndx = 0; ndx < length; ndx++) {
                    events[eventType][ndx].apply(self, arguments);
                }
            }
        }

        this.addEventHandler = addEventHandler;
        this.fireEvent = fireEvent;
        this.init = init;
        pre_init();
    }

    function createOffset($target, horizontal, offsetValue) {
        var offset = {};
        if (horizontal) {
            offset.outerDimension = $target.outerWidth(true);
            offset.innerDimension = $target.outerWidth();
            offset.lead = parseInt($target.offset().left, 10);
            offset.end = parseInt(offset.lead + offset.innerDimension, 10);

        }
        else {
            offset.outerDimension = $target.outerHeight(true);
            offset.innerDimension = $target.outerHeight();
            offset.lead = parseInt($target.offset().top, 10);
            offset.end = parseInt(offset.lead + offset.innerDimension, 10);
        }
        if (offsetValue) {
            offset.lead += offsetValue;
            offset.end += offsetValue;
        }
        return offset;
    }

    function createContainer($target, styleObj) {
        $target.wrapAll($("<div></div>").css(styleObj));
    }

    function initOverlayer($obj, styleObj) {
        $obj.css(styleObj);
    }

    ScrollManager.prototype.initScrollManagerObj = function ($target, $overlayEle, itemNum, horizontal) {
        var overlayer, oDimension = 0, oDir;

        var oClassName = "et-scroll-overlayer";
        $overlayEle.addClass(oClassName);
        if (toString.call(itemNum) == "[object Number]") {
            itemNum = parseInt(itemNum, 10);
        }
        else {
            horizontal = itemNum;
            itemNum = null;
        }

        oDir = horizontal ? "width" : "height";

        overlayer = this.overlayer = createOffset($overlayEle, horizontal);

        var item, $item, length, ndx;
        var offset;
        var lines = 0;
        var items = this.items;

        this.leadingItemIndex = 0;
        for (ndx = 0, length = $target.length; ndx < length; ndx++) {
            item = $target[ndx];
            $item = $(item);
            offset = items[ndx] = createOffset($item, horizontal);
            if (offset.lead <= overlayer.lead && ndx) {
                lines++;
            }
            if (offset.end <= overlayer.end && !lines) {
                oDimension += offset.outerDimension;
                this.endingItemIndex = ndx;
            }
            if (lines) {
                offset.lead += oDimension;
                offset.end += oDimension;
            }
        }
        oDimension = items[ndx - 1].end - items[0].lead;

        if (itemNum) {
            overlayer.end = items[itemNum - 1].end;
            overlayer[oDir] = overlayer.end - overlayer.lead;
            this.endingItemIndex = itemNum - 1;
        }

        var $parent, styleObj;
        if ($overlayEle.css("overflow") && $overlayEle.css("overflow").toLowerCase() == "hidden") {
            $parent = $target.parent();
            styleObj = {};
            styleObj[oDir] = oDimension;
            if ($parent.hasClass(oClassName)) {
                createContainer($target, styleObj);
            }
            else {
                $parent.css(styleObj);
            }
        }

        //this.objectToBeMoved = horizontal ? $overlayEle : $($target[0]);
        this.objectToBeMoved = $overlayEle;

        styleObj[oDir] = overlayer[oDir];
        initOverlayer($overlayEle, overlayer);
        //        $target.each(function (ndx, ele) {
        //            var width = $(ele).offset();
        //            self.items[ndx] = offset;
        //            if (offset[type] <= self.overlayElePos[type]) {
        //                self.leadingItemIndex = ndx;
        //            }
        //            if (offset[type] <= end) {
        //                self.endingItemIndex = ndx;
        //            }
        //        });
        this.init();
    };

    //param direction is a string of which 
    //"up", "down", "left", "right" are allowed
    ScrollManager.prototype.move = function (direction) {
        // horizontal -- true/false
        // increase -- true: right/bottom || false : left/top
        var dir = { horizontal: true, increase: false };
        var moveType;
        var index;
        var distance;
        var itemPos;
        var length = this.items.length;

        switch (direction) {
            case "right":
                dir.increase = true;
                break;
            case "up":
                dir.horizontal = false;
                break;
            case "down":
                dir.horizontal = false;
                dir.increase = true;
                break;
        }
        //moveType = dir.horizontal ? "scrollLeft" : "margin-top";
        moveType = dir.horizontal ? "scrollLeft" : "scrollTop";
        index = dir.increase ? this.endingItemIndex : this.leadingItemIndex;

        if (dir.increase) {
            if (this.leadingItemIndex - 1 < 0) {
                return false;
            }
        }
        else {
            if (this.endingItemIndex + 1 >= length) {
                return false;
            }
        }

        items = this.items;

        if (dir.increase) {
            distance = items[index - 1].end - this.overlayer.end;
        }
        else {
            distance = items[index + 1].lead - this.overlayer.lead;
        }
        var obj = {};
        obj[moveType] = distance;
        this.objectToBeMoved.animate(obj);

        if (dir.increase) {
            this.leadingItemIndex--;
            this.endingItemIndex--;
        }
        else {
            this.leadingItemIndex++;
            this.endingItemIndex++;
        }
        this.fireEvent("onmovecompleted", this.status);
        
    };
    ScrollManager.prototype.itemClick = function (itemIndex) {
        this.fireEvent("onitemclicked", itemIndex);
    };
    ScrollManager.prototype.moveTo = function (moveTo) {

    };

    etui.exp.ScrollManager = ScrollManager;
})(jQuery);

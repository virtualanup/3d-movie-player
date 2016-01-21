/*Event handling routine*/
//asynchronous Event handler for the renderer
function GpsEvent(entity) {
    var self = this;

    this.entity = $(entity);
    //mouse object
    this.mouse = {
        x: 0,
        y: 0,
        downX: 0,
        downY: 0,
        down: false,
        drag: false,
        scroll: 0,
    };

    //call back functions////////////////////////////
    this.mouseDrag = function (e) {
        self.mouse.drag = true;
        self.mouse.x = e.pageX - this.offsetLeft;
        self.mouse.y = e.pageY - this.offsetTop;
        return false; //stop propogation
    };
    this.mouseDown = function (e) {
        self.mouse.down = true;
        self.mouse.x = e.pageX - this.offsetLeft;
        self.mouse.y = e.pageY - this.offsetTop;
        if (self.mouse.drag != true) {
            self.mouse.downX = self.mouse.x;
            self.mouse.downY = self.mouse.y;
            self.entity.mousemove(self.mouseDrag); //bind mousemove
        }
    };
    this.mouseUp = function (e) {
        self.entity.unbind("mousemove"); //unbind mousemove
        self.mouse.down = false;
        self.mouse.drag = false;
        self.mouse.x = e.pageX - this.offsetLeft;
        self.mouse.y = e.pageY - this.offsetTop;
    };
    this.mouseLeave = function (e) {
        if (self.mouse.down == true) {
            self.entity.unbind("mousemove");
        }
        self.mouse.down = false;
    };
    this.mouseScroll = function (e) {
        self.mouse.scroll = e.originalEvent.deltaY;
        if (e.preventDefault) {
            e.preventDefault();
        }
    };

    //iniit///////////////////////////////////////////
    this.entity.
    mousedown(this.mouseDown).
    mouseup(this.mouseUp).
    mouseleave(this.mouseLeave).
    bind("wheel mousewheel", this.mouseScroll);




}

GpsEvent.prototype.info = function () {
    return this.mouse.down + " " +
        this.mouse.downX + " " +
        this.mouse.downY + " " +
        this.mouse.drag + " " +
        this.mouse.x + " " +
        this.mouse.y + " " +
        this.mouse.scroll + " ";
}

GpsEvent.prototype.clear = function () {
    this.mouse.drag = false; //reset drag
    this.mouse.scroll = 0; //reset scroll
}

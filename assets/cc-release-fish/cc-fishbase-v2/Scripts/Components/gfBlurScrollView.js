cc.Class({
    extends: cc.Component,

    properties: {
        topBlur: cc.Node,
        bottomBlur: cc.Node,
        minOffset: 0
    },

    onLoad(){
        this.node.on('scrolling', this.scrolling, this);
        this.minOffsetY = 0; // set topPoint of content equal to topPoint of view so the min Offset will equal to 0
    },

    onEnable(){
        const scrollView = this.node.getComponent(cc.ScrollView);
        this.scrolling(scrollView);
    },

    scrolling(event){
        const scrollOffset = event.getScrollOffset();
        if(scrollOffset.y <= this.minOffsetY && cc.isValid(this.topBlur)){
            this.topBlur.active = false;
            return;
        }
        if(scrollOffset.y >= event.getMaxScrollOffset().y && cc.isValid(this.bottomBlur)){
            this.bottomBlur.active = false;
            return;
        }
        this.topBlur.active = true;
        this.bottomBlur.active = true;
    },

    onDestroy(){
        this.node.off('scrolling', this.scrolling, this);
    }
});

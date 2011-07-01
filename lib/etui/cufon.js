/*!require: etui.steps*/
!function($, undef){
    "use strict";

    /**
     * Font Info
     *
     */
    var FONTS = {};
    FONTS['ETDINGS'] = {
        path: '/_imgs/etui/fonts/EtLabWebDings_400.font.js',
        css:'.et-fs-dings',
        family: 'EtLabWebDings'
    };
    FONTS['HELV_NEUE_LT_250'] = {
        path: '/_imgs/etui/fonts/Helvetica_Neue_LT_Std_250.font.js',
        css:'html.et-lng-en .et-fs-helvetical-neue-lt-th,' +
            'html.et-lng-pt .et-fs-helvetical-neue-lt-th,' +
            'html.et-lng-sp .et-fs-helvetical-neue-lt-th,' +
            'html.et-lng-de .et-fs-helvetical-neue-lt-th,' +
            'html.et-lng-it .et-fs-helvetical-neue-lt-th,' +
            'html.et-lng-in .et-fs-helvetical-neue-lt-th,' +
            'html.et-lng-fr .et-fs-helvetical-neue-lt-th',
        family: 'Helvetica Neue LT Std'
    };
    FONTS['MgOpen_Moderna_400'] = {
        path: '/_imgs/etui/fonts/MgOpen_Moderna_400.font.js',
        css: 'html.et-lng-en .et-fs-moderna-regular,' +
            'html.et-lng-pt .et-fs-moderna-regular,' +
            'html.et-lng-sp .et-fs-moderna-regular,' +
            'html.et-lng-de .et-fs-moderna-regular,' +
            'html.et-lng-it .et-fs-moderna-regular,' +
            'html.et-lng-in .et-fs-moderna-regular,' +
            'html.et-lng-fr .et-fs-moderna-regular',
        family:'MgOpen_Moderna'
    };

    var CSS_SHADOW = 'et-textshadow';

    var defaultSettings = {
        cacheSvr: 'http://ak.englishtown.com',
        textShadowCss: '0 -1px rgba(0,0,0,.4)'
    };

    /**
     * Private Methods
     **/


    /**
     * @cu function
     * The constructor
     **/
    var cu = function(options){

        this.opts = $.extend({}, defaultSettings, options);

        this.elementCache = [];
        this.loaded = false;
    };
    var p = cu.prototype;

    /**
     * @function load
     * Load all fonts
     **/
    p.load = function(cacheSvr){
        if (!window.Cufon){
            return;
        }

        if (!cacheSvr){
            cacheSvr = this.opts.cacheSvr;
        }

        var s = new etui.steps;
        var context = this;

        for (var key in FONTS){
            if (!FONTS.hasOwnProperty(key)){
                continue;
            }

            s.step((function(key){
                $.getScript(cacheSvr + FONTS[key].path, this.go);
            }).bind(s, key));
            s.step((function(key){
                try
                {
                    var all = $(FONTS[key].css);
                    var shadow = all.filter('.' + CSS_SHADOW);
                    var nonshadow = all.not('.' + CSS_SHADOW);
                    shadow.each(function(i, el){
                        // cufon with shadow
                        Cufon.replace(el,{
                            textShadow: context.opts.textShadowCss,
                            fontFamily: FONTS[key].family
                        });

                    });

                    nonshadow.each(function(i, el){
                        Cufon.replace(el, {fontFamily: FONTS[key].family});
                    });

                    FONTS[key].loaded = true;
                }
                catch(ex){
                    FONTS[key].loaded = false;
                }

                this.go();
            }).bind(s, key));
        }

        s.go();

        this.loaded = true;

    };

    etui.cufon = new cu;
}(jQuery);

/*!require: etui.mvc */
!function($, mvc, undef){
    'use strict';
    var controller = etui.ctor(function(){

        this.actions = {};

    });

    var p = controller.prototype;


    mvc.Controller = controller;
}(jQuery, etui.mvc);


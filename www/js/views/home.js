define([
    'jquery',
    'underscore',
    'backbone',
    'text!template/home.html',
    'models/campus',
    'views/alert'
], function ($, _, Backbone, HomeTemplate, CampusModel, AlertView) {
    var HomeView = Backbone.View.extend({
		el: 'body',
		template: _.template(HomeTemplate),
  
        render: function () {
            this.el.innerHTML = this.template();

            return this;
        },
		events: {
            'click #btn-back-url.no-event': 'homeBackOnClick'
        },
        homeBackOnClick: function (e) {
            e.preventDefault();
		} 
	});

    return HomeView;
});

define([
    'backbone'
], function (Backbone) {
    var InfoModel = Backbone.Model.extend({
        defaults: {
            forum_title: '',
			thread_title: ''
		}
    });

    return InfoModel;
});

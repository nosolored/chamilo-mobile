define([
    'backbone'
], function (Backbone) {
    var HomeModel = Backbone.Model.extend({
        defaults: {
            num_messages: 0
		}
    });

    return HomeModel;
});

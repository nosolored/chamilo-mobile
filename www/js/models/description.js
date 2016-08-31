define([
    'backbone'
], function (Backbone) {
    var DescriptionModel = Backbone.Model.extend({
        defaults: {
            c_id: 0,
			s_id: 0,
			descriptions: []
		}
    });

    return DescriptionModel;
});

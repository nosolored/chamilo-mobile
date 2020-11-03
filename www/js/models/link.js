define([
    'backbone'
], function (Backbone) {
    var LinkModel = Backbone.Model.extend({
        defaults: {
            c_id: 0,
			s_id: 0,
			category: [],
			links: [],
			orden: []
		}
    });

    return LinkModel;
});


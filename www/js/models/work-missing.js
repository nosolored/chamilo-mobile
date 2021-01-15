define([
    'backbone'
], function (Backbone) {
    var WorkMissingModel = Backbone.Model.extend({
        defaults: {
            c_id: 0,
			s_id: 0,
			w_id: 0,
			users_list: []
		}
    });

    return WorkMissingModel;
});

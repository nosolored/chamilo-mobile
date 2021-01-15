define([
    'backbone'
], function (Backbone) {
    var WorkUsersModel = Backbone.Model.extend({
        defaults: {
            c_id: 0,
			s_id: 0,
			w_id: 0,
			users_added: [],
			users_to_add: []
		}
    });

    return WorkUsersModel;
});

define([
    'backbone'
], function (Backbone) {
    var WorkListStudentsModel = Backbone.Model.extend({
        defaults: {
            c_id: 0,
			s_id: 0,
			list_students: []
		}
    });

    return WorkListStudentsModel;
});

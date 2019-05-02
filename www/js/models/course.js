define([
    'database',
    'backbone'
], function (DB, Backbone) {
    var CourseModel = Backbone.Model.extend({
        defaults: {
            c_id: 0,
			s_id: 0,
            title: '',
			section: [],
			icons: [],
        }
    });

    return CourseModel;
});

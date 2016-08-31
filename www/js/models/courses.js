define([
    'database',
    'backbone'
], function (DB, Backbone) {
    var CoursesModel = Backbone.Model.extend({
        defaults: {
            user_id: 0,
			list_courses: [],
            list_sessions: []
        }
    });

    return CoursesModel;
});

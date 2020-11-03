define([
    'backbone'
], function (Backbone) {
    var HomeModel = Backbone.Model.extend({
        defaults: {
            num_messages: 0,
            allow_students_to_browse_courses: 1
		}
    });

    return HomeModel;
});

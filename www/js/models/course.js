define([
    'database',
    'backbone'
], function (DB, Backbone) {
    var CourseModel = Backbone.Model.extend({
        defaults: {
            c_id: 0,
			code: '',
            title: '',
			directory: '',
			url_picture: '',
			course_image: '',
            teacher: '',
			url: ''
        }
    });

    return CourseModel;
});

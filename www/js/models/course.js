define([
    'backbone'
], function (Backbone) {
    var CourseModel = Backbone.Model.extend({
        defaults: {
            c_id: 0,
            s_id: 0,
            title: '',
            visibility: [],
            icons: [],
            name: [],
            status_user: 5
        }
    });

    return CourseModel;
});

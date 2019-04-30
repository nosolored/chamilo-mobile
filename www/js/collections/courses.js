define([
    'underscore',
    'backbone',
    'database',
    'models/course'
], function (_, Backbone, DB, CourseModel) {
    var CoursesCollection = Backbone.Collection.extend({
        model: CourseModel,
        url: "/courses/",
        create: function (attributes) {
            var self = this;
            var deferred = $.Deferred();
            var courseModel = new CourseModel(attributes);
                self.add(courseModel);
                deferred.resolve();

            return deferred.promise();
        }
    });

    return CoursesCollection;
});

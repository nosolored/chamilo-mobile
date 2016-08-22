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

            var courseModel = new CourseModel(attributes); //Crea un objeto (modelo) con los datos de un curso
                //console.log(courseModel);
				//console.log(attributes);
				courseModel.cid = courseModel.get("c_id");  // Indicamos que el cid sea el id del curso
				self.add(courseModel);						// Añade el objeto (modelo) a la coleccion
                deferred.resolve();

            return deferred.promise();
        }
    });

    return CoursesCollection;
});

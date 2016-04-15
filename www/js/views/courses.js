define([
    'underscore',
    'backbone',
    'collections/courses',
    'views/course-detalle',
    'text!template/courses.html',
    'views/alert'
], function (
    _,
    Backbone,
    CoursesCollection,
    CourseDetalleView,
    CoursesTemplate,
    AlertView
) {
    var campusModel = null;
    var coursesCollection = null;

  var loadCourses = function () {

        var url = campusModel.get('url') + '/plugin/chamilo_app/rest.php';
        var getCourses = $.post(url, {
            action: 'getCoursesList',
            username: campusModel.get('username'),
            api_key: campusModel.get('apiKey'),
			user_id: campusModel.get('user_id')
        });

        $.when(getCourses).done(function (response) {
			if (!response.status) {
                return;
            }
			response.courses.forEach(function (courseData) {
				//comprobamos si existe
				if(coursesCollection.get(courseData.id) == null){
				    coursesCollection.create({
						c_id: parseInt(courseData.id),
						code: courseData.code,
						title: courseData.title,
						directory: courseData.directory,
						url_picture: courseData.url_picture,
						teacher: courseData.teacher,
						url: campusModel.get('url') + '/courses/' + courseData.directory
					});
				}else{
					// actualizar modelo
					var course = coursesCollection.get(courseData.id);
					course.set({"title": courseData.title});
					course.set({"directory": courseData.directory});
					course.set({"url_picture": courseData.url_picture});
					course.set({"teacher": courseData.teacher});
					coursesCollection.set(course,{remove: false});
				}
            });

            if (response.courses.length === 0) {
                new AlertView({
                    model: {
                        message: window.lang.noCourses
                    }
                });
                return;
            }
		});
    };

    var CoursesView = Backbone.View.extend({
        el: 'body',
        template: _.template(CoursesTemplate),
        initialize: function () {
			$(this.el).unbind();
            campusModel = this.model;
			coursesCollection = this.collection;
		
            loadCourses();

            coursesCollection.on('add', this.renderCourse, this);
			coursesCollection.on('change', this.renderCourse2, this);
        },
        render: function () {
            this.el.innerHTML = this.template();
			this.$el.find('#courses-list').html('');
            coursesCollection.each(this.renderCourse, this);

            return this;
        },
        renderCourse: function (courseModel) {
            var courseDetalleView = new CourseDetalleView({
                model: courseModel
            });

            this.$el.find('#courses-list').append(courseDetalleView.render().el);
        },
		renderCourse2: function (courseModel) {
            var courseDetalleView = new CourseDetalleView({
                model: courseModel
            });
			this.$el.find('#item_course_'+courseModel.cid).replaceWith(courseDetalleView.render().el);
            //this.$el.find('#courses-list').append(courseDetalleView.render().el);
        },
        events: {
            'click #courses-update': 'coursesUpdateOnClick'
        },
        coursesUpdateOnClick: function (e) {
            e.preventDefault();
		
            loadCourses();
			$(".navbar-toggle").trigger( "click" );
        }
    });

    return CoursesView;
});

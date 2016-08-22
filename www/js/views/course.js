define([
    'underscore',
    'backbone',
    'text!template/course.html',
    'views/alert'
], function (
    _,
    Backbone,
    CourseTemplate,
    AlertView
) {
    var courseModel = null;
	/*
	var courseId = 0;
	var visible_iconModel = new VisibleIconModel();
	
	 var loadInfoCourse = function () {
	    console.log("funcion loadInfoCourse");
	  	var url = campusModel.get('url') + '/plugin/chamilo_app/rest.php';
        var getInfoCourse = $.post(url, {
            action: 'getInfoCourse',
            username: campusModel.get('username'),
            api_key: campusModel.get('apiKey'),
			user_id: campusModel.get('user_id'),
			c_id: courseId
        });

        $.when(getInfoCourse).done(function (response) {
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
	
	
	*/
    var CourseView = Backbone.View.extend({
        el: 'body',
        template: _.template(CourseTemplate),
        initialize: function () {
			$(this.el).unbind();
            courseModel = this.model;
			/*
			courseId = this.id;
			console.log("initialize CourseView");
			
			loadInfoCourse();
			visibleIconModel.on('change', this.render, this);
			*/
        },
        render: function () {
			/*
			this.el.innerHTML = this.template(visible_iconModel.toJSON());
			return this;
			*/
			var template = this.template(this.model.toJSON());
			this.el.innerHTML = template;
			
            return this;
		}
    });

    return CourseView;
});

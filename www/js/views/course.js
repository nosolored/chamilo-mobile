define([
    'underscore',
    'backbone',
	'models/course',
    'text!template/course.html',
    'views/alert'
], function (
    _,
    Backbone,
	CourseModel,
    CourseTemplate,
    AlertView
) {
	var campusModel = null;
    var courseModel = new CourseModel();
	var courseId = 0;
	var sessionId = 0;
	
	var loadInfoCourse = function () {
	  	var url = campusModel.get('url') + '/plugin/chamilo_app/rest.php';
        var getInfoCourse = $.post(url, {
            action: 'getInfoCourse',
            username: campusModel.get('username'),
            api_key: campusModel.get('apiKey'),
			user_id: campusModel.get('user_id'),
			c_id: courseId,
			s_id: sessionId
        });

        $.when(getInfoCourse).done(function (response) {
			if (!response.status) {
                return;
            }

			courseModel.set({"c_id": courseId});
			courseModel.set({"s_id": sessionId});
			courseModel.set({"title": response.info.title});
			courseModel.set({"section": response.info.section});

			var cid = parseInt("" + courseId + "000" + sessionId);
			courseModel.cid = cid;

            if (response.info.length === 0) {
                new AlertView({
                    model: {
                        message: window.lang.noInfo
                    }
                });
                return;
            }
		});
    };

    var CourseView = Backbone.View.extend({
        el: 'body',
        template: _.template(CourseTemplate),
        initialize: function (options) {
			this.options = options;
			$(this.el).unbind();
            
			campusModel = this.model;
			courseId = this.options.courseId;
			sessionId = this.options.sessionId;
			
			console.log("initialize")
            loadInfoCourse();
            courseModel.on('change', this.render, this);
		},
        render: function () {
			this.el.innerHTML = this.template(courseModel.toJSON());
			return this;
		}
    });

    return CourseView;
});

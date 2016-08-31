define([
    'underscore',
    'backbone',
    'models/courses',
    'text!template/courses.html',
    'views/alert'
], function (
    _,
    Backbone,
    CoursesModel,
    CoursesTemplate,
    AlertView
) {
    var campusModel = null;
    var courses = new CoursesModel();

  var loadCourses = function () {
	  console.log("funcion loadCourses");
	  
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
		  
		  courses.set({"user_id": response.user_id});
		  courses.set({"list_courses": response.courses});
		  courses.set({"list_sessions": response.sessions});
		  courses.cid = response.user_id;
		  
		  if (response.courses.length === 0 && response.sessions.length === 0) {
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
            loadCourses();
            courses.on('change', this.render, this);
        },
        render: function () {
            this.el.innerHTML = this.template(courses.toJSON());
			return this;
        },
        coursesUpdateOnClick: function (e) {
            e.preventDefault();
		
            loadCourses();
			$(".navbar-toggle").trigger( "click" );
        }
    });

    return CoursesView;
});

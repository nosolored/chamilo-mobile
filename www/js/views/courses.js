define([
    'underscore',
    'backbone',
    'models/courses',
	'models/home',
    'text!template/courses.html',
    'views/alert'
], function (
    _,
    Backbone,
    CoursesModel,
	HomeModel,
    CoursesTemplate,
    AlertView
) {
    var campusModel = null;
    var courses = new CoursesModel();
	var homeModel = new HomeModel();
	var loadCourses = function () {
	    var options = { dimBackground: true };
        SpinnerPlugin.activityStart(window.lang.LoadingScreen, options);

	    var url = campusModel.get('url') + '/main/webservices/api/v2.php';
	    var getCourses = $.post(url, {
	        action: 'user_courses',
            username: campusModel.get('username'),
            api_key: campusModel.get('apiKey')
        });

	    $.when(getCourses).done(function (response) {
	        if (response.error) {
	            return;
	        }

	        courses.set({"user_id": campusModel.get('user_id')});
	        courses.set({"list_courses": response.data});
    
	        courses.cid = campusModel.get('user_id');	        

	        /*if (response.courses.length === 0 && response.sessions.length === 0) {
	            new AlertView({
	                model: {
	                    message: window.lang.noCourses
	                }
	            });
	            return;
	        }*/
	    })
	    .fail(function() {
            SpinnerPlugin.activityStop();
            new AlertView({
                model: {
                    message: window.lang.noConnectionToServer
                }
            });
            return;
        });

	    var getSessions = $.post(url, {
	        action: 'user_sessions',
            username: campusModel.get('username'),
            api_key: campusModel.get('apiKey')
        });

        $.when(getSessions).done(function (response) {
            if (response.error) {
                return;
            }

            courses.set({"list_sessions": response.data});

            SpinnerPlugin.activityStop();

            /*if (response.courses.length === 0 && response.sessions.length === 0) {
                new AlertView({
                    model: {
                        message: window.lang.noCourses
                    }
                });
                return;
            }*/
        });
    };

	var loadNumMessage = function () {
        var url = campusModel.get('url') + '/main/webservices/api/v2.php';
	    var getResponse = $.post(url, {
            action: 'get_count_new_messages',
            username: campusModel.get('username'),
            api_key: campusModel.get('apiKey')
        });

        $.when(getResponse).done(function (response) {
            if (response.error) {
                console.log("no response status");
                return;
            }
            homeModel.cid = parseInt(1);
            homeModel.set({"num_messages": response.data.ms_inbox});
        });
    };

    var CoursesView = Backbone.View.extend({
        el: 'body',
        template: _.template(CoursesTemplate),
        initialize: function () {
			$(this.el).unbind();
			homeModel.unbind();
            campusModel = this.model;
            var networkState = navigator.connection.type;
            if (networkState == Connection.NONE) {
                window.setTimeout(function () {
                    new AlertView({
                        model: {
                            message: window.lang.notOnLine
                        }
                    });
                }, 1000);
            } else {
                loadCourses();
    			loadNumMessage();
            }
            homeModel.on('change', this.render, this);
            courses.on('change', this.render, this);
        },
        render: function () {
			var model = new Backbone.Model();
			model.set({
				num_messages: homeModel.get("num_messages"), 
				user_id: courses.get("user_id"),
				list_courses: courses.get("list_courses"),
				list_sessions: courses.get("list_sessions")
			});
			this.el.innerHTML = this.template(model.toJSON());
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

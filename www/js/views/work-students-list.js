define([
    'underscore',
    'backbone',
    'models/work-list-students',
    'text!template/works-students-list.html',
    'views/alert'
], function (
    _,
    Backbone,
    WorkListStudentsModel,
    WorksStudentsListTemplate,
    AlertView
) {
    var campusModel = null;
	var courseId = 0;
	var workListStudentsModel = new WorkListStudentsModel();
    var loadWorksStudentsList = function () {
        var options = { dimBackground: true };
        SpinnerPlugin.activityStart(window.lang.LoadingScreen, options);

        var url = campusModel.get('url') + '/plugin/chamilo_app/rest.php';
        var getWorks = $.post(url, {
            action: 'getWorkStudentList',
            username: campusModel.get('username'),
            api_key: campusModel.get('apiKey'),
            user_id: campusModel.get('user_id'),
			c_id: courseId,
			s_id: sessionId
		});

        $.when(getWorks).done(function (response) {
            if (!response.status) {
                return;
            }
            workListStudentsModel.set({"c_id": courseId});
            workListStudentsModel.set({"s_id": sessionId});
            workListStudentsModel.set({"list_students": response.student_list});

            SpinnerPlugin.activityStop();

        }).fail(function() {
            SpinnerPlugin.activityStop();
            new AlertView({
                model: {
                    message: window.lang.noConnectionToServer
                }
            });
            return;
        });
    };

    var WorksStudentsListView = Backbone.View.extend({
        el: 'body',
        template: _.template(WorksStudentsListTemplate),
        initialize: function (options) {
            // Initialize params
            workListStudentsModel.unbind();

            this.options = options;
			$(this.el).unbind();
            campusModel = this.model;
			courseId = this.options.courseId;
			sessionId = this.options.sessionId;

			// Call data remote function
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
                loadWorksStudentsList();
            }

            workListStudentsModel.on('change', this.render, this);

        },
        render: function () {
            this.el.innerHTML = this.template(workListStudentsModel.toJSON());
			return this;
        }
    });

    return WorksStudentsListView;
});

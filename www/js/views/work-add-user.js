define([
    'jquery',
    'underscore',
    'backbone',
    'models/work-users',
    'text!template/work-add-user.html',
    'views/alert'
], function ($, _, Backbone, WorkUsersModel, WorkAddUserTemplate, AlertView) {
    var campusModel = null;
    var workId = 0;
    var courseId = 0;
    var sessionId = 0;
    var workUsersModel = new WorkUsersModel();
    var loadWorkAddUser = function () {
        var options = { dimBackground: true };
        SpinnerPlugin.activityStart(window.lang.LoadingScreen, options);

        var url = campusModel.get('url') + '/main/webservices/api/v2.php';
        var getWorks = $.post(url, {
            action: 'get_work_users',
            username: campusModel.get('username'),
            api_key: campusModel.get('apiKey'),
            course: courseId,
            session: sessionId,
            work: workId
        });

        $.when(getWorks).done(function (response) {
            if (response.error) {
                return;
            }

            workUsersModel.set({"c_id": courseId});
            workUsersModel.set({"s_id": sessionId});
            workUsersModel.set({"w_id": workId});
            workUsersModel.set({"users_added": response.data.users_added});
            workUsersModel.set({"users_to_add": response.data.users_to_add});

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
    var WorkAddUserView = Backbone.View.extend({
        el: 'body',
        template: _.template(WorkAddUserTemplate),
        initialize: function (options) {
            // Initialize params
            workUsersModel.unbind();

            this.options = options;
            campusModel = this.model;
            courseId = this.options.courseId;
            sessionId = this.options.sessionId;
            workId = this.options.workId;

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
                loadWorkAddUser();
                workUsersModel.on('change', this.render, this);
            }
        },
        events: {
            'click .delete-user': 'deleteUserWork',
            'click .add-user': 'addUserWork'
        },
        render: function () {
            this.el.innerHTML = this.template(workUsersModel.toJSON());

            return this;
        },
        deleteUserWork: function (e) {
            e.preventDefault();

            var url = campusModel.get('url') + '/main/webservices/api/v2.php';
            var checkingForm = $.post(url, {
                action: 'delete_work_student',
                username: campusModel.get('username'),
                api_key: campusModel.get('apiKey'),
                work: workId,
                student: e.target.id,
                course: courseId,
                session: sessionId,
            });

            $.when(checkingForm).done(function (response) {
                if (response.error) {
                    new AlertView({
                        model: {
                            message: window.lang.problemSave
                        }
                    });

                    return;
                }
                loadWorkAddUser();
            });

            $.when(checkingForm).fail(function () {
                new AlertView({
                    model: {
                        message: window.lang.noConnectionToServer
                    }
                });
            });
        },
        addUserWork: function (e) {
            e.preventDefault();

            var url = campusModel.get('url') + '/main/webservices/api/v2.php';
            var checkingForm = $.post(url, {
                action: 'save_work_user',
                username: campusModel.get('username'),
                api_key: campusModel.get('apiKey'),
                work: workId,
                student: e.target.id,
                course: courseId,
                session: sessionId,
            });

            $.when(checkingForm).done(function (response) {
                if (response.error) {
                    new AlertView({
                        model: {
                            message: window.lang.problemSave
                        }
                    });

                    return;
                }
                loadWorkAddUser();
            });

            $.when(checkingForm).fail(function () {
                new AlertView({
                    model: {
                        message: window.lang.noConnectionToServer
                    }
                });
            });
        }
    });

    return WorkAddUserView;
});

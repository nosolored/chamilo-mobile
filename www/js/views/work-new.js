define([
    'jquery',
    'underscore',
    'backbone',
    'text!template/work-new.html',
    'views/alert'
], function ($, _, Backbone, WorkNewTemplate, AlertView) {
    var campusModel = null;
    var category_list = [];
    var loadWorksNew = function () {
        var options = { dimBackground: true };
        SpinnerPlugin.activityStart(window.lang.LoadingScreen, options);

        var url = campusModel.get('url') + '/plugin/chamilo_app/rest.php';
        var getWorks = $.post(url, {
            action: 'getParamsFormWork',
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

            for (var key in response.options) {
                $('#category_id').append('<option value="'+key+'">'+response.options[key]+'</option>');
            }

            $('#expires_on').val(response.expires_on);
            $('#ends_on').val(response.ends_on);

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
    var WorkNewView = Backbone.View.extend({
        el: 'body',
        template: _.template(WorkNewTemplate),
        initialize: function (options) {
            // Initialize params
            this.options = options;
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
                loadWorksNew();
            }
        },
        events: {
            'click #advanced_params': 'toggleAdvancedParams',
            'submit #frm-new-work': 'frmNewWorkOnSubmit'
        },
        render: function () {
            this.el.innerHTML = this.template({
                c_id: courseId,
                s_id: sessionId,
            });

            return this;
        },
        toggleAdvancedParams: function (e) {
            e.preventDefault();
            var self = this;
            self.$('#advanced_params_options').toggle();
        },
        frmNewWorkOnSubmit: function (e) {
            e.preventDefault();

            var self = this;

            var new_dir = self.$('#new_dir').val().trim();
            var description = self.$('#description').html();
            var qualification = self.$('#qualification').val().trim();
            if( self.$('#make_calification_id').prop('checked') ) {
                var make_calification_id = parseInt(self.$('#make_calification_id').val());
            } else {
                var make_calification_id = 0;
            }
            var category_id = self.$('#category_id').val().trim();
            var weight = self.$('#weight').val().trim();
            if( self.$('#expiry_date').prop('checked') ) {
                var expiry_date = parseInt(self.$('#expiry_date').val());
            } else {
                var expiry_date = 0;
            }
            var expires_on = self.$('#expires_on').val().trim();
            
            if( self.$('#end_date').prop('checked') ) {
                var end_date = parseInt(self.$('#end_date').val());
            } else {
                var end_date = 0;
            }
            var ends_on = self.$('#ends_on').val().trim();
            
            if( self.$('#add_to_calendar').prop('checked') ) {
                var add_to_calendar = parseInt(self.$('#add_to_calendar').val());
            } else {
                var add_to_calendar = 0;
            }
            var allow_text_assignment = self.$('#allow_text_assignment').val().trim();
            var action_work = self.$('#action').val().trim();
            var item_id = self.$('#item_id').val().trim();
            var course_id = self.$('#course_id').val().trim();
            var session_id = self.$('#session_id').val().trim();

            if (!new_dir) {
                new AlertView({
                    model: {
                        message: window.lang.enterTitleAssignment
                    }
                });

                return;
            }

            self.$('#submit').prop('disabled', true);

            var url = campusModel.get('url') + '/plugin/chamilo_app/rest.php';
            var checkingForm = $.post(url, {
                action: 'formNewWorkMain',
                username: campusModel.get('username'),
                api_key: campusModel.get('apiKey'),
                user_id: campusModel.get('user_id'),
                new_dir: new_dir,
                description: description,
                qualification: qualification,
                make_calification_id: make_calification_id,
                category_id: category_id,
                weight: weight,
                expiry_date: expiry_date,
                expires_on: expires_on,
                end_date: end_date,
                ends_on: ends_on,
                add_to_calendar: add_to_calendar,
                allow_text_assignment: allow_text_assignment,
                action_work: action_work,
                item_id: item_id,
                c_id: course_id,
                s_id: session_id,
            });

            $.when(checkingForm).done(function (response) {
                if (!response.status) {
                    new AlertView({
                        model: {
                            message: window.lang.problemSave
                        }
                    });

                    self.$('#submit').prop('disabled', false);

                    return;
                }

                self.$('#submit').prop('disabled', false);
                window.location.href = '#works_main/'+course_id+'/'+session_id;
            });

            $.when(checkingForm).fail(function () {
                new AlertView({
                    model: {
                        message: window.lang.noConnectionToServer
                    }
                });

                self.$('#submit').prop('disabled', false);
            });
        }
    });

    return WorkNewView;
});

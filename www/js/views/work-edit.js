define([
    'jquery',
    'underscore',
    'backbone',
    'models/work-main',
    'text!template/work-edit.html',
    'views/alert'
], function ($, _, Backbone, WorkMainModel, WorkEditTemplate, AlertView) {
    var campusModel = null;
    var category_list = [];
    var workModel = new WorkMainModel();
    var loadWorksEdit = function () {
        var options = { dimBackground: true };
        SpinnerPlugin.activityStart(window.lang.LoadingScreen, options);

        var url = campusModel.get('url') + '/plugin/chamilo_app/rest.php';
        var getWorks = $.post(url, {
            action: 'getParamsFormWork',
            username: campusModel.get('username'),
            api_key: campusModel.get('apiKey'),
            user_id: campusModel.get('user_id'),
            c_id: courseId,
            s_id: sessionId,
            w_id: workId
        });

        $.when(getWorks).done(function (response) {
            if (!response.status) {
                return;
            }

            var title = workModel.get("title");
            $('#new_dir').val(title);
            var description = workModel.get("description");
            $('#description').html(description);

            for (var key in response.options) {
                $('#category_id').append('<option value="'+key+'">'+response.options[key]+'</option>');
            }

            var params = false;
            if (response.params['make_calification'] == 1) {
                $('#make_calification_id').prop('checked', true);
                $('#option1').show();

                var category_id = response.params['category_id'];
                $('#category_id option[value='+category_id+']').prop('selected', 'selected');

                $('#weight').val(response.params['weight']);
                params = true;
            }

            var expires_on = workModel.get("expires_on");
            if (expires_on.trim() == "-") {
                $('#expires_on').val(response.expires_on);
            } else {
                $('#expires_on').val(expires_on.replace(" ", "T"));
                $('#expiry_date').prop('checked', true);
                $('#option2').show();
                params = true;
            }

            var ends_on = workModel.get("ends_on");
            if (ends_on.trim() == "-") {
                $('#ends_on').val(response.ends_on);
            } else {
                $('#ends_on').val(ends_on.replace(" ", "T"));
                $('#end_date').prop('checked', true);
                $('#option3').show();
                params = true;
            }

            if (response.params['add_to_calendar'] > 0) {
                $('#add_to_calendar').prop('checked', true);
                params = true;
            }

            var allow_text_assignment = workModel.get("allow_text_assignment");
            $('#allow_text_assignment option[value='+allow_text_assignment+']').prop('selected', 'selected');

            if (params == true) {
                $('#advanced_params_options').show();
            }

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
    var WorkEditView = Backbone.View.extend({
        el: 'body',
        template: _.template(WorkEditTemplate),
        initialize: function (options) {
            // Initialize params
            this.options = options;
            campusModel = this.model;
            courseId = this.options.courseId;
            sessionId = this.options.sessionId;
            workId = this.options.workId;
            workModel = this.options.workParent;

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
                loadWorksEdit();
            }
        },
        events: {
            'click #advanced_params': 'toggleAdvancedParams',
            'submit #frm-edit-work': 'frmEditWorkOnSubmit'
        },
        render: function () {
            this.el.innerHTML = this.template(workModel.toJSON());

            return this;
        },
        toggleAdvancedParams: function (e) {
            e.preventDefault();
            var self = this;
            self.$('#advanced_params_options').toggle();
        },
        frmEditWorkOnSubmit: function (e) {
            e.preventDefault();

            var self = this;

            var new_dir = self.$('#new_dir').val().trim();
            var description = self.$('#description').html();
            var qualification = self.$('#qualification').val().trim();
            if( self.$('#make_calification_id').prop('checked') ) {
                var make_calification = parseInt(self.$('#make_calification_id').val());
            } else {
                var make_calification = 0;
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
            var work_id = self.$('#work_id').val().trim();
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
                action: 'formEditWorkMain',
                username: campusModel.get('username'),
                api_key: campusModel.get('apiKey'),
                user_id: campusModel.get('user_id'),
                new_dir: new_dir,
                description: description,
                qualification: qualification,
                make_calification: make_calification,
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
                w_id: work_id,
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

    return WorkEditView;
});

define([
    'jquery',
    'underscore',
    'backbone',
    'text!template/work-edit-item.html',
    'views/alert'
], function ($, _, Backbone, WorkEditItemTemplate, AlertView) {
    var campusModel = null;
    var work = null;
    var workEditItemView = Backbone.View.extend({
        el: 'body',
        template: _.template(WorkEditItemTemplate),
        initialize: function (options) {
            // Initialize params
            this.options = options;
            $(this.el).unbind();
            campusModel = this.model;
            courseId = this.options.courseId;
            sessionId = this.options.sessionId;
            workId = this.options.workId;
            work = this.options.workModel;
            statusUser = this.options.statusUser;
            base = campusModel.get('url') + 
                '/plugin/chamilo_app/file_download.php?' +
                'username=' + campusModel.get('username') +
                '&api_key=' + campusModel.get('apiKey') +
                '&user_id=' + campusModel.get('user_id') +
                '&c_id=' + courseId +
                '&s_id=' + sessionId +
                '&type=download_work.php';
        },
        events: {
            'submit #frm-work-edit-item': 'frmWorkEditItemOnSubmit',
            'click a.download_file_platform': 'goToLink'
        },
        render: function () {
            this.el.innerHTML = this.template({work: work.toJSON(), base: base});

            return this;
        },
        goToLink: function (e) {
            e.preventDefault();

            var self = this;
            if (e.toElement.localName == "img") {
                var assetURL = self.$(e.target).parent().prop("href");
                var fileName = self.$(e.target).parent().prop("id");
            } else {
                var assetURL = self.$(e.target).prop("href");
                var fileName = self.$(e.target).prop("id");
            }

            goToDownload(assetURL, fileName);
        },
        frmWorkEditItemOnSubmit: function (e) {
            e.preventDefault();

            var self = this;

            var course_id = self.$('#course_id').val().trim();
            var session_id = self.$('#session_id').val().trim();
            var send_mail = 0;
            if( self.$('#send_mail').prop('checked') ) {
                var send_mail = parseInt(self.$('#send_mail').val());
            }
            var send_to_drh_users = 0;
            if( self.$('#send_to_drh_users').prop('checked') ) {
                var send_to_drh_users = parseInt(self.$('#send_to_drh_users').val());
            }
            var work_id = self.$('#work_id').val().trim();
            var work_parent_id = self.$('#work_parent_id').val().trim();
            var title = self.$('#title').val().trim();
            var description = self.$('#description').html();

            if (!title) {
                new AlertView({
                    model: {
                        message: window.lang.enterTitle
                    }
                });

                return;
            }

            self.$('#btn-submit').prop('disabled', true);

            var url = campusModel.get('url') + '/plugin/chamilo_app/rest.php';
            var checkingForm = $.post(url, {
                action: 'formWorkEditItem',
                username: campusModel.get('username'),
                api_key: campusModel.get('apiKey'),
                user_id: campusModel.get('user_id'),
                title: title,
                description: description,
                send_mail: send_mail,
                send_to_drh_users: send_to_drh_users,
                c_id: course_id,
                s_id: session_id,
                w_id: work_id,
            });

            $.when(checkingForm).done(function (response) {
                if (!response.status) {
                    new AlertView({
                        model: {
                            message: window.lang.problemSave
                        }
                    });

                    self.$('#btn-submit').prop('disabled', false);

                    return;
                }

                navigator.notification.alert(
                    response.message, 
                    function(r) {
                        self.$('#btn-submit').prop('disabled', false);
                        window.location.href = '#work-edit-item/<%=/'+course_id+'/'+session_id+'/'+workId;
                    }, 
                    window.lang.NoticeTitleBar
                );
            });

            $.when(checkingForm).fail(function () {
                new AlertView({
                    model: {
                        message: window.lang.noConnectionToServer
                    }
                });

                self.$('#btn-submit').prop('disabled', false);
            });
        }
    });

    return workEditItemView;
});

define([
    'jquery',
    'underscore',
    'backbone',
    'text!template/work-view.html',
    'views/alert'
], function ($, _, Backbone, WorkViewTemplate, AlertView) {
    var campusModel = null;
    var work = null;
    var WorkViewView = Backbone.View.extend({
        el: 'body',
        template: _.template(WorkViewTemplate),
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
                '&type=download_comment_file.php';
            base_file = campusModel.get('url') + 
                '/plugin/chamilo_app/file_download.php?' +
                'username=' + campusModel.get('username') +
                '&api_key=' + campusModel.get('apiKey') +
                '&user_id=' + campusModel.get('user_id') +
                '&c_id=' + courseId +
                '&s_id=' + sessionId +
                '&type=download_work.php';
        },
        events: {
            'submit #frm-new-comment-work': 'frmNewCommentWorkOnSubmit',
            'click #comment_upload': 'getSelectFile',
            'click #comment_file': 'getSelectFile',
            'click a.download_file_platform': 'goToLink',
            'click a.download_file_platform_with_icon': 'goToLinkWithIcon'
        },
        render: function () {
            this.el.innerHTML = this.template({work: work.toJSON(), base: base, base_file: base_file, statusUser: statusUser});

            return this;
        },
        goToLink: function (e) {
            e.preventDefault();

            var assetURL = $(e.target).prop("href");
            var fileName = $(e.target).prop("id");

            goToDownload(assetURL, fileName);
        },
        goToLinkWithIcon: function (e) {
            e.preventDefault();

            var assetURL = $(e.target.parentElement).prop("href");
            var fileName = $(e.target.parentElement).prop("id");

            goToDownload(assetURL, fileName);
        },
        getSelectFile: function (e) {
            e.preventDefault();
            var self = this;
            var inboxType = self.$(e.target).prop("id");

            var success = function(data) {
                // Resolve URI as file path
                window.FilePath.resolveNativePath(data, function(filepath) {
                    resolveLocalFileSystemURL(filepath, function(entry) {
                        var fileName = entry.name;
                        var localPath = decodeURIComponent(entry.nativeURL);

                        if (inboxType == 'comment_upload') {
                            self.$('#box_show_file').html(fileName);
                            self.$('#upload_file').val(decodeURIComponent(localPath));
                            self.$('#box-file_comment').hide();
                        } else {
                            self.$('#box_show_comment_file').html(fileName);
                            self.$('#upload_comment_file').val(decodeURIComponent(localPath));
                            self.$('#box-upload_comment').hide();
                            self.$('#check_correction').val('true');
                        }

                    }, function(error){
                        //  * Código   Constante
                        //  * 1   NOT_FOUND_ERR
                        //  * 2   SECURITY_ERR
                        //  * 3   ABORT_ERR
                        //  * 4   NOT_READABLE_ERR
                        //  * 5   ENCODING_ERR
                        //  * 6   NO_MODIFICATION_ALLOWED_ERR
                        //  * 7   INVALID_STATE_ERR
                        //  * 8   SYNTAX_ERR
                        //  * 9   INVALID_MODIFICATION_ERR
                        //  * 10  QUOTA_EXCEEDED_ERR
                        //  * 11  TYPE_MISMATCH_ERR
                        //  * 12  PATH_EXISTS_ERR
                        console.log(error);
                    });
                }, function(error){
                    // * -1 - describes an invalid action
                    // *  0 - file:// path could not be resolved
                    // *  1 - the native path links to a cloud file (e.g: from Google Drive app)
                    console.log(error);
                });
            };

            var error = function(msg) {
                console.log(msg);
            };

            fileChooser.open({}, success, error);
        },
        frmNewCommentWorkOnSubmit: function (e) {
            e.preventDefault();

            var self = this;

            var course_id = self.$('#course_id').val().trim();
            var session_id = self.$('#session_id').val().trim();
            var send_email = 0; // Pendiente cambios futuros apartado de profesor
            var work_id = self.$('#work_id').val().trim();
            var work_parent_id = self.$('#work_parent_id').val().trim();
            var qualification = '';
            var comment = self.$('#work_comment').val().trim();
            var check_correction = '';
            var allow_edit = statusUser;
            var file_upload = null;

            if (statusUser == 1) {
                check_correction = self.$('#check_correction').val().trim();
                qualification = self.$('#qualification').val().trim();
                if (check_correction == 'true') {
                    file_upload = self.$('#upload_comment_file').val().trim();
                } else {
                    file_upload = self.$('#upload_file').val().trim();
                }
            } else {
                file_upload = self.$('#upload_file').val().trim();
            }

            if (!comment && !file_upload  && !qualification) {
                new AlertView({
                    model: {
                        message: window.lang.enterDescriptionOrFile
                    }
                });

                return;
            }

            self.$('#btn-submit').prop('disabled', true);

            if (file_upload) {
                var permissions = cordova.plugins.permissions;

                permissions.checkPermission(permissions.READ_EXTERNAL_STORAGE, function( status ) {
                    if ( !status.hasPermission ) {
                        permissions.requestPermission(permissions.READ_EXTERNAL_STORAGE, successPermission, errorPermission);
                    } else {
                        uploadFile();
                    }
                });

                function errorPermission() {
                    navigator.notification.alert(
                        window.lang.NoPermission, 
                        function() {
                            // Nothing
                        }, 
                        window.lang.NoticeTitleBar
                    );
                }

                function successPermission( status ) {
                    if (!status.hasPermission) errorPermission();

                    uploadFile();
                }

                function uploadFile() {
                    window.resolveLocalFileSystemURL(file_upload, successFile, failFile);

                    function successFile(fileEntry) {
                        fileEntry.file(function (file) {
                            var options = new FileUploadOptions();
                            if (check_correction == 'true') {
                                options.fileKey = "file";
                            } else {
                                options.fileKey = "attachment";
                            }
                            options.fileName = file.name;
                            options.mimeType = file.type;

                            var params = new Object();
                            params.comment = comment;
                            params.qualification = qualification;
                            params.check_correction = check_correction;
                            params.allow_edit = allow_edit;
                            params.send_email = send_email;
                            params.action = 'formNewCommentWork';
                            params.username =  campusModel.get('username');
                            params.api_key = campusModel.get('apiKey');
                            params.user_id = campusModel.get('user_id');
                            params.c_id = course_id;
                            params.s_id = session_id;
                            params.w_id = work_id;

                            options.params = params;
                            options.chunkedMode = true;

                            // This plugin allows you to upload and download files.
                            var ft = new FileTransfer();

                            // Initialize the progress dialog and set various parameters
                            cordova.plugin.pDialog.init({
                                progressStyle : 'HORIZONTAL',
                                title: window.lang.title_upload,
                                message : window.lang.message_upload
                            });

                            // Set the value of the progress bar when progressStyle is HORIZONTAL
                            var percGlobal = 0;
                            ft.onprogress = function(progressEvent) {
                                if (progressEvent.lengthComputable) {
                                    var perc = Math.floor(progressEvent.loaded / progressEvent.total * 100);
                                    if (percGlobal < perc) {
                                        percGlobal = perc;
                                        cordova.plugin.pDialog.setProgress(perc); 
                                    } 
                                } else {
                                    console.log(progressEvent);
                                }
                            };

                            // Uploads a file to server.
                            ft.upload(
                                file_upload,
                                campusModel.get('url') + '/plugin/chamilo_app/rest.php',
                                function (r) {
                                 // Success download
                                    navigator.notification.alert(
                                        window.lang.successUpload, 
                                        function(){
                                            // Dismiss the progress dialog
                                            cordova.plugin.pDialog.dismiss();
                                            // Go to post forum
                                            window.location.href = '#work_list/'+course_id+'/'+session_id+'/'+work_parent_id;
                                        }, 
                                        window.lang.NoticeTitleBar
                                    );
                                },
                                function (error) {
                                    // Error upload
                                    console.log(error);
                                    navigator.notification.alert(
                                        window.lang.NoUploadAttachment, 
                                        function(){
                                            // Dismiss the progress dialog.
                                            cordova.plugin.pDialog.dismiss();
                                        }, 
                                        window.lang.NoticeTitleBar
                                    );
                                },
                                options
                            );
                        }, function (error) {
                            console.log(error.code);
                        });
                    }

                    function failFile(evt) {
                        console.log(evt.target.error.code);
                    }
                }
            } else {
                var url = campusModel.get('url') + '/plugin/chamilo_app/rest.php';
                var checkingForm = $.post(url, {
                    action: 'formNewCommentWork',
                    username: campusModel.get('username'),
                    api_key: campusModel.get('apiKey'),
                    user_id: campusModel.get('user_id'),
                    comment: comment,
                    qualification: qualification,
                    allow_edit: allow_edit,
                    send_email: send_email,
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

                    window.location.href = '#work_list/'+course_id+'/'+session_id+'/'+work_parent_id;
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
        }
    });

    return WorkViewView;
});

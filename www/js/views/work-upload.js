define([
    'jquery',
    'underscore',
    'backbone',
    'text!template/work-upload.html',
    'views/alert'
], function ($, _, Backbone, WorkUploadTemplate, AlertView) {
    var campusModel = null;
    var WorkUploadView = Backbone.View.extend({
        el: 'body',
        template: _.template(WorkUploadTemplate),
        initialize: function (options) {
            // Initialize params
            this.options = options;
            campusModel = this.model;
            courseId = this.options.courseId;
            sessionId = this.options.sessionId;
            workId = this.options.workId;
            workParent = this.options.workParent;
            titleParent = workParent.get("title_url");
            AllowTextAssignment = workParent.get("allow_text_assignment");
        },
        events: {
            'submit #frm-new-work': 'frmNewWorkOnSubmit',
            'click #work_upload': 'getSelectFile'
        },
        render: function () {
            this.el.innerHTML = this.template({
                c_id: courseId,
                s_id: sessionId,
                title_parent: titleParent,
                allow_text_assignment: AllowTextAssignment,
                work_id: workId
            });

            return this;
        } ,
        getSelectFile: function (e) {
            e.preventDefault();

            var success = function(data) {
                // Resolve URI as file path
                window.FilePath.resolveNativePath(data, function(filepath) {
                    resolveLocalFileSystemURL(filepath, function(entry) {
                        var fileName = entry.name;
                        var localPath = decodeURIComponent(entry.nativeURL);

                        self.$('#box_show_file').html(fileName);
                        self.$('#upload_file').val(decodeURIComponent(localPath));
                        self.$('#work_title').val(fileName.split('.').slice(0, -1).join('.'));
                    }, function(error){
                        /*
                         * Código   Constante
                         * 1   NOT_FOUND_ERR
                         * 2   SECURITY_ERR
                         * 3   ABORT_ERR
                         * 4   NOT_READABLE_ERR
                         * 5   ENCODING_ERR
                         * 6   NO_MODIFICATION_ALLOWED_ERR
                         * 7   INVALID_STATE_ERR
                         * 8   SYNTAX_ERR
                         * 9   INVALID_MODIFICATION_ERR
                         * 10  QUOTA_EXCEEDED_ERR
                         * 11  TYPE_MISMATCH_ERR
                         * 12  PATH_EXISTS_ERR
                         */
                        console.log(error);
                    });
                }, function(error){
                    /*
                     * -1 - describes an invalid action
                     *  0 - file:// path could not be resolved
                     *  1 - the native path links to a cloud file (e.g: from Google Drive app)
                     */
                    console.log(error);
                });
            };

            var error = function(msg) {
                console.log(msg);
            };

            fileChooser.open({}, success, error);
        },
        frmNewWorkOnSubmit: function (e) {
            e.preventDefault();

            var self = this;

            var course_id = self.$('#course_id').val().trim();
            var session_id = self.$('#session_id').val().trim();
            var contains_file = 0;
            var active = 1;
            var accepted = 1;
            var title = self.$('#work_title').val().trim(); 
            var work_id = self.$('#work_id').val().trim();
            var file = false;
            var description = '';
            var allow_text_assignment = parseInt(self.$('#allow_text_assignment').val());
            var file_upload = '';

            if (allow_text_assignment == 0) {
                contains_file = 1;
                file_upload = self.$('#upload_file').val().trim();
                description = self.$('#work_description').val().trim(); 

                if (!description && !file_upload) {
                    new AlertView({
                        model: {
                            message: window.lang.enterDescriptionOrFile
                        }
                    });

                    return;
                }
            } else if (allow_text_assignment == 1) {
                description = self.$('#work_description').val().trim();

                if (!description) {
                    new AlertView({
                        model: {
                            message: window.lang.enterDescription
                        }
                    });

                    return;
                }
            } else if (allow_text_assignment == 2) {
                contains_file = 1;
                file_upload = self.$('#upload_file').val().trim();

                if (!file_upload) {
                    new AlertView({
                        model: {
                            message: window.lang.enterFile
                        }
                    });

                    return;
                }
            }

            if (!title) {
                new AlertView({
                    model: {
                        message: window.lang.enterTitle
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
                            options.fileKey = "file";
                            options.fileName = file.name;
                            options.mimeType = file.type;

                            var params = new Object();
                            params.extension = '.'+file.name.split('.').pop();
                            params.title = title;
                            params.description = description;
                            params.contains_file = contains_file;
                            params.action = 'formNewWork';
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
                                            window.location.href = '#work_list/'+course_id+'/'+session_id+'/'+work_id;
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
                    action: 'formNewWork',
                    username: campusModel.get('username'),
                    api_key: campusModel.get('apiKey'),
                    user_id: campusModel.get('user_id'),
                    title: title,
                    description: description,
                    contains_file: 0,
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

                    window.location.href = '#work_list/'+course_id+'/'+session_id+'/'+work_id;
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

    return WorkUploadView;
});

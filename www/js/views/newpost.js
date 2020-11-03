define([
    'jquery',
    'underscore',
    'backbone',
    'text!template/newpost.html',
    'views/alert'
], function ($, _, Backbone, NewPostTemplate, AlertView) {
    var campusModel = null;
    var NewPostView = Backbone.View.extend({
        el: 'body',
        template: _.template(NewPostTemplate),
        initialize: function (options) {
            this.options = options;
            campusModel = this.model;
            courseId = this.options.courseId;
            sessionId = this.options.sessionId;
            forumId = this.options.forum_id;
            threadId = this.options.thread_id;
            title = this.options.title;
            text = this.options.text;
            poster = this.options.poster;
            post_id = this.options.post_id;
        },
        events: {
            'submit #frm-new-post': 'frmNewPostOnSubmit',
            'click #user_upload': 'getSelectFile'
        },
        render: function () {
            this.el.innerHTML = this.template({c_id: courseId, s_id: sessionId, f_id: forumId, t_id: threadId, title: title, text: text, poster: poster, post_id: post_id});

            return this;
        },
        getSelectFile: function (e) {
            e.preventDefault();

            if (device.platform == "iOS") {
                var success = function(data) {
                    // Resolve URI as file path
                    console.log(filepath);
                    var filepath = data;
                    resolveLocalFileSystemURL(filepath, function(entry) {
                        console.log(entry);
                        var fileName = entry.name;
                        var localPath = decodeURIComponent(entry.nativeURL);
                        console.log(fileName);
                        console.log(localPath);

                        self.$('#box_show_file').html(fileName);
                        self.$('#upload_file').val(decodeURIComponent(localPath));
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
                };

                var error = function(msg) {
                    console.log(msg);
                };

                navigator.camera.getPicture(success, error, {
                    destinationType: Camera.DestinationType.NATIVE_URI,
                    sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
                    mediaType: Camera.MediaType.ALLMEDIA
                });
            }

            if (device.platform == "Android") {
                var success = function(data) {
                    console.log(data);
                    
                    // Resolve URI as file path
                    window.FilePath.resolveNativePath(data, function(filepath) {
                        console.log(filepath);
                        
                        resolveLocalFileSystemURL(filepath, function(entry) {
                            console.log(entry);
                            var fileName = entry.name;
                            var localPath = decodeURIComponent(entry.nativeURL);
                            console.log(fileName);
                            console.log(localPath);

                            self.$('#box_show_file').html(fileName);
                            self.$('#upload_file').val(decodeURIComponent(localPath));
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
            }
        },
        frmNewPostOnSubmit: function (e) {
            e.preventDefault();

            var self = this;

            var title = self.$('#txt-title').val().trim(); 
            var text = self.$('#txt-text').val().trim();
            var notice = '';//var notice = self.$('#notice-email').val().trim();
            var course_id = self.$('#course-id').val().trim();
            var session_id = self.$('#session-id').val().trim();
            var forum_id = self.$('#forum-id').val().trim();
            var thread_id = self.$('#thread-id').val().trim();
            var post_id = self.$('#post_id').val().trim();
            var check_quote = self.$('#quote_check').val().trim();
            var quote = self.$('#quote').val().trim();
            var poster = self.$('#poster').val().trim();
            var file_upload = self.$('#upload_file').val().trim();

            if (!title) {
                new AlertView({
                    model: {
                        message: window.lang.enterTitle
                    }
                });

                return;
            }

            if (!text) {
                new AlertView({
                    model: {
                        message: window.lang.enterText
                    }
                });

                return;
            }

            self.$('#btn-submit').prop('disabled', true);
            text = text.replace(/\r\n|\r|\n/g,"<br>");
            text = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

            if (check_quote == "1") {
                var aux = '<div style="margin: 5px;">' +
                          '<div style="font-size: 90%; font-style: italic;">Cita '+ poster +':</div>' +
                          '<div style="color: #006600; font-size: 90%; font-style: italic; background-color: #FAFAFA; border: #D1D7DC 1px solid; padding: 3px;">' +
                          '<p>'+ quote +'</p>' +
                          '</div>' +
                          '</div>' + text;
                text = aux;
            }

            // console.log(title +' '+ text +' '+ notice +' '+ course_id +' '+ session_id +' '+forum_id+' '+thread_id);
            var url = campusModel.get('url') + '/plugin/chamilo_app/rest.php';
            var checkingForm = $.post(url, {
                action: 'formNewPost',
                username: campusModel.get('username'),
                api_key: campusModel.get('apiKey'),
                user_id: campusModel.get('user_id'),
                title: title,
                text: text,
                notice: notice,
                c_id: course_id,
                f_id: forum_id,
                t_id: thread_id,
                parent_id: post_id
            });

            $.when(checkingForm).done(function (response) {
                if (!response.status) {
                    console.log("problem134");
                    new AlertView({
                        model: {
                            message: window.lang.problemSave
                        }
                    });

                    self.$('#btn-submit').prop('disabled', false);

                    return;
                }

                // Procesar respuesta para obtener el directorio donde subir los adjuntos
                if (file_upload) {
                    if (device.platform == "Android") {
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
                    }

                    if (device.platform == "iOS") {
                        uploadFile();
                    }

                    function uploadFile() {
                        window.resolveLocalFileSystemURL(file_upload, successFile, failFile);

                        function successFile(fileEntry) {
                            fileEntry.file(function (file) {
                                var options = new FileUploadOptions();
                                options.fileKey = "forum_upload_file";
                                options.fileName = file.name;
                                options.mimeType = file.type;

                                var params = new Object();
                                params.c_id = course_id;
                                params.comment = "";
                                params.post_id = response.post_id;

                                options.params = params;
                                options.chunkedMode = true;

                                // This plugin allows you to upload and download files.
                                var ft = new FileTransfer();

                                if (device.platform == "Android") {
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
                                }

                                // Uploads a file to server.
                                ft.upload(
                                    file_upload,
                                    campusModel.get('url') + '/plugin/chamilo_app/upload_forum.php',
                                    function (r) {
                                     // Success download
                                        navigator.notification.alert(
                                            window.lang.successUpload, 
                                            function() {
                                                if (device.platform == "Android") {
                                                    // Dismiss the progress dialog
                                                    cordova.plugin.pDialog.dismiss();
                                                }
                                                // Go to post forum
                                                window.location.href = '#post/'+course_id+'/'+session_id+'/'+forum_id+'/'+thread_id;
                                            }, 
                                            window.lang.NoticeTitleBar
                                        );
                                    },
                                    function (error) {
                                        // Error upload
                                        console.log(error);
                                        navigator.notification.alert(
                                            window.lang.NoUploadAttachment, 
                                            function() {
                                                if (device.platform == "Android") {
                                                    // Dismiss the progress dialog.
                                                    cordova.plugin.pDialog.dismiss();
                                                }
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
                    window.location.href = '#post/'+course_id+'/'+session_id+'/'+forum_id+'/'+thread_id;
                }
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

    return NewPostView;
});

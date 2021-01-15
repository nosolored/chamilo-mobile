define([
    'underscore',
    'backbone',
    'collections/works',
    'text!template/worklist.html',
    'models/work-main',
    'views/alert'
], function (
    _,
    Backbone,
    WorksCollection,
    WorkListTemplate,
    WorkMainModel,
    AlertView
) {
    var campusModel = null;
	var courseId = 0;
	var sessionId = 0;
    var worksCollection = new WorksCollection();
    var workParent = new WorkMainModel();
    var title_parent = '';
    var description_parent = '';

    var loadWorkList = function () {
        var options = { dimBackground: true };
        SpinnerPlugin.activityStart(window.lang.LoadingScreen, options);

        // For compare with the server works
        var worksCheck = worksCollection.where({c_id: courseId, parent_id: workId});

        var url = campusModel.get('url') + '/plugin/chamilo_app/rest.php';
        var action = 'getWorkList';
        if (statusUser == "1") {
            action = 'getWorkListTeacher';
        }
        
        var getWorks = $.post(url, {
            action: action,
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
            response.works.forEach(function (workData) {
				var wId = parseInt(workData.id);
				var work = worksCollection.findWhere({c_id: courseId, id: wId});

				if (work == null) {
				    worksCollection.create({
						c_id: courseId,
						session_id: sessionId,
						user_id: parseInt(workData.user_id),
						id: parseInt(workData.id),
						title: workData.title,
						description: workData.description,
						url: workData.url,
						sent_date: workData.sent_date,
						contains_file: parseInt(workData.contains_file),
						has_properties: parseInt(workData.has_properties),
						view_properties: workData.view_properties,
						weight: parseInt(workData.weight),
						allow_text_assignment: parseInt(workData.allow_text_assignment),
						parent_id: parseInt(workData.parent_id),
						accepted: parseInt(workData.accepted),
						qualificator_id: workData.qualificator_id,
						url_correction: workData.url_correction,
						title_correction: workData.title_correction,
						qualification_score: parseFloat(workData.qualification_score),
						fullname: workData.fullname,
						title_clean: workData.title_clean,
						qualification_only: workData.qualification_only,
						formatted_date: workData.formatted_date,
						status: workData.status,
						has_correction: workData.has_correction,
						feedback: workData.feedback,
						feedback_clean: workData.feedback_clean,
						comments: workData.comments,
						path: workData.path,
					});
				} else {
				    // Delete item worksCheck array
				    worksCheck.some(function (workItem, index, object) {
				        if (workItem.get('id') == wId) {
				            object.splice(index, 1);
				            return true;
				        }
				    });

				    if (work.get("title") != workData.title || 
				        work.get("description") != workData.description ||
				        work.get("qualification_score") != workData.qualification_score ||
				        work.get("comments").length != workData.comments.length ||
				        work.get("sent_date") != workData.sent_date ||
				        work.get("contains_file") != workData.contains_file ||
				        work.get("has_correction") != workData.has_correction ||
				        work.get("accepted") != workData.accepted
				    ) {
    				    work.set({"title": workData.title});
    					work.set({"description": workData.description});
    					work.set({"url": workData.url});
    					work.set({"sent_date": workData.sent_date})
    					work.set({"contains_file": parseInt(workData.contains_file)});
    					work.set({"has_properties": parseInt(workData.has_properties)});
    					work.set({"view_properties": parseInt(workData.view_properties)});
    					work.set({"weight": parseInt(workData.weight)});
    					work.set({"allow_text_assignment": parseInt(workData.allow_text_assignment)});
    					work.set({"accepted": parseInt(workData.accepted)});
    					work.set({"qualificator_id": workData.qualificator_id});
    					work.set({"url_correction": workData.url_correction});
    					work.set({"title_correction": workData.title_correction});
    					work.set({"qualification_score": parseFloat(workData.qualification_score)});
    					work.set({"fullname": workData.fullname});
    					work.set({"title_clean": workData.title_clean});
    					work.set({"qualification_only": workData.qualification_only});
    					work.set({"formatted_date": workData.formatted_date});
    					work.set({"status": workData.status});
    					work.set({"has_correction": workData.has_correction});
    					work.set({"feedback": workData.feedback});
    					work.set({"feedback_clean": workData.feedback_clean});
    					work.set({"comments": workData.comments});
    					work.set({"path": workData.path});
    					worksCollection.set(work,{remove: false});
				    }
				}
            });

            if (worksCheck.length > 0) {
                worksCollection.remove(worksCheck);
            }

            SpinnerPlugin.activityStop();

            if (response.works.length === 0) {
                new AlertView({
                    model: {
                        message: window.lang.noWorks
                    }
                });

                return;
            }
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
    };

    var WorkListView = Backbone.View.extend({
        el: 'body',
        template: _.template(WorkListTemplate),
		initialize: function (options) {
		    // Delete collections
		    worksCollection.unbind();
		    //worksCollection.reset();

		    // Initialize params
			this.options = options;
			$(this.el).unbind();
			campusModel = this.model;
			courseId = this.options.courseId;
			sessionId = this.options.sessionId;
			workId = this.options.workId;
			worksCollection = this.collection;
			workParent = this.options.workParent;
			statusUser = this.options.statusUser;
			titleParent = workParent.get("title");
			descriptionParent = workParent.get("description");
			enableQualification = workParent.get("enable_qualification");
			base = campusModel.get('url') + 
                '/plugin/chamilo_app/file_download.php?' +
                'username=' + campusModel.get('username') +
                '&api_key=' + campusModel.get('apiKey') +
                '&user_id=' + campusModel.get('user_id') +
                '&c_id=' + courseId +
                '&s_id=' + sessionId +
                '&type=download_work.php';
			username = campusModel.get('username');
			api_key = campusModel.get('apiKey');

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
                loadWorkList();
            }

			// Set event 
			worksCollection.on('add', this.render, this);
			worksCollection.on('change', this.render, this);
			worksCollection.on('remove', this.render, this);
        },
        render: function () {
			var workList = worksCollection.where({c_id: courseId, parent_id: workId});
			this.el.innerHTML = this.template({
			    collection: workList,
			    c_id: courseId,
			    s_id: sessionId,
			    title_parent: titleParent,
			    description_parent: descriptionParent,
			    id_parent: workId,
			    title: titleParent,
			    enable_qualification: enableQualification,
			    username: username,
			    api_key: api_key,
			    status: statusUser,
			    ends_on: workParent.get('ends_on'),
			    expires_on: workParent.get('expires_on'),
			});

    		return this;
        },
        events: {
            'click a.download_file_platform': 'goToLink',
            'click a#download-folder': 'goToLinkFolder',
            'click a#delete_correction': 'goToDeleteCorrection',
            'click a.set_invisible': 'goToSetInvisible',
            'click a.set_visible': 'goToSetVisible',
            'click a.delete_item': 'goToDeleteItem'
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
            //var assetURL = $(e.target.parentElement).prop("href");
            //var fileName = $(e.target.parentElement).prop("id");

            goToDownload(assetURL, fileName);
        },        
        goToLinkFolder: function (e) {
            e.preventDefault();

            var assetURL = campusModel.get('url') + 
                '/plugin/chamilo_app/file_download.php?' +
                'username=' + campusModel.get('username') +
                '&api_key=' + campusModel.get('apiKey') +
                '&user_id=' + campusModel.get('user_id') +
                '&c_id=' + courseId +
                '&s_id=' + sessionId +
                '&type=downloadfolder.inc.php' +
                '&id=' + workId;
            var fileName = workParent.get("title_file");
            if(fileName == '') {
                fileName = 'download-works';
            }
            fileName = fileName + '.zip';

            goToDownload(assetURL, fileName);
        },
        goToDeleteCorrection: function (e) {
            e.preventDefault();

            navigator.notification.confirm(
                window.lang.ConfirmYourChoice, 
                deleteFile, 
                window.lang.NoticeTitleBar,
                [window.lang.Cancel, window.lang.Confirm]
            );
            
            function deleteFile(buttonIndex) {
                if (buttonIndex === 1){
                    return;
                }
                var url = campusModel.get('url') + '/plugin/chamilo_app/rest.php';
                var checkingForm = $.post(url, {
                    action: 'deleteWorkCorrection',
                    username: campusModel.get('username'),
                    api_key: campusModel.get('apiKey'),
                    user_id: campusModel.get('user_id'),
                    w_id: workId,
                    c_id: courseId,
                    s_id: sessionId,
                });
    
                $.when(checkingForm).done(function (response) {
                    if (!response.status) {
                        new AlertView({
                            model: {
                                message: window.lang.problemSave
                            }
                        });
    
                        return;
                    }
    
                    navigator.notification.alert(
                        response.message, 
                        function(r) {
                            loadWorkList();
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
                });
            }
        },
        goToDeleteItem: function (e) {
            e.preventDefault();
            navigator.notification.confirm(
                window.lang.ConfirmYourChoice, 
                deleteFileItem, 
                window.lang.NoticeTitleBar,
                [window.lang.Cancel, window.lang.Confirm]
            );
            
            function deleteFileItem(buttonIndex) {
                if (buttonIndex === 1){
                    return;
                }
                var self = this;
                if (e.toElement.localName == "img") {
                    var workItemId = self.$(e.target).parent().prop("id");
                } else {
                    var workItemId = self.$(e.target).prop("id");
                }

                var url = campusModel.get('url') + '/plugin/chamilo_app/rest.php';
                var checkingForm = $.post(url, {
                    action: 'deleteWorkItem',
                    username: campusModel.get('username'),
                    api_key: campusModel.get('apiKey'),
                    user_id: campusModel.get('user_id'),
                    w_id: workItemId,
                    c_id: courseId,
                    s_id: sessionId,
                });
    
                $.when(checkingForm).done(function (response) {
                    if (!response.status) {
                        new AlertView({
                            model: {
                                message: window.lang.problemSave
                            }
                        });
    
                        return;
                    }
    
                    navigator.notification.alert(
                        response.message, 
                        function(r) {
                            loadWorkList();
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
                });
            }
        },
        goToSetInvisible: function (e) {
            e.preventDefault();
            var self = this;
            if (e.toElement.localName == "img") {
                var workItemId = self.$(e.target).parent().prop("id");
            } else {
                var workItemId = self.$(e.target).prop("id");
            }

            var url = campusModel.get('url') + '/plugin/chamilo_app/rest.php';
            var checkingForm = $.post(url, {
                action: 'setInvisibleWorkItem',
                username: campusModel.get('username'),
                api_key: campusModel.get('apiKey'),
                user_id: campusModel.get('user_id'),
                w_id: workItemId,
                c_id: courseId,
                s_id: sessionId,
            });

            $.when(checkingForm).done(function (response) {
                if (!response.status) {
                    new AlertView({
                        model: {
                            message: window.lang.problemSave
                        }
                    });

                    return;
                }
                loadWorkList();
            });

            $.when(checkingForm).fail(function () {
                new AlertView({
                    model: {
                        message: window.lang.noConnectionToServer
                    }
                });
            });
        },
        goToSetVisible: function (e) {
            e.preventDefault();
            var self = this;

            if (e.toElement.localName == "img") {
                var workItemId = self.$(e.target).parent().prop("id");
            } else {
                var workItemId = self.$(e.target).prop("id");
            }

            var url = campusModel.get('url') + '/plugin/chamilo_app/rest.php';
            var checkingForm = $.post(url, {
                action: 'setVisibleWorkItem',
                username: campusModel.get('username'),
                api_key: campusModel.get('apiKey'),
                user_id: campusModel.get('user_id'),
                w_id: workItemId,
                c_id: courseId,
                s_id: sessionId,
            });

            $.when(checkingForm).done(function (response) {
                if (!response.status) {
                    new AlertView({
                        model: {
                            message: window.lang.problemSave
                        }
                    });

                    return;
                }

                loadWorkList();
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

    return WorkListView;
});

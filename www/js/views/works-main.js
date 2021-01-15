define([
    'underscore',
    'backbone',
    'collections/works-main',
    'text!template/works-main.html',
    'views/alert'
], function (
    _,
    Backbone,
    WorksMainCollection,
    WorksMainTemplate,
    AlertView
) {
    var campusModel = null;
	var courseId = 0;
	var worksMainCollection = new WorksMainCollection();
    var loadWorksMain = function () {
        var options = { dimBackground: true };
        SpinnerPlugin.activityStart(window.lang.LoadingScreen, options);

        // For compare with the server works
        var worksCheck = worksMainCollection.where({c_id: courseId, session_id: sessionId});

        var action = 'getWorksStudent';
        if (statusUser == "1") {
            action = 'getWorksTeacher';
        }
        var url = campusModel.get('url') + '/plugin/chamilo_app/rest.php';
        var getWorks = $.post(url, {
            action: action,
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

            response.works.forEach(function (workData) {
                var wId = parseInt(workData.iid);
                var work = worksMainCollection.get(wId);
                if (work == null) {
                    worksMainCollection.create({
                        accepted: parseInt(workData.accepted),
                        active: parseInt(workData.active),
                        allow_text_assignment: parseInt(workData.allow_text_assignment),
                        amount: workData.amount,
                        c_id: parseInt(courseId),
                        contains_file: parseInt(workData.contains_file),
                        date_of_qualification: workData.date_of_qualification,
                        description: workData.description,
                        document_id: parseInt(workData.document_id),
                        enable_qualification: parseInt(workData.enable_qualification),
                        ends_on: workData.ends_on,
                        expires_on: workData.expires_on,
                        feedback: workData.feedback,
                        filetype: workData.filetype,
                        has_properties: parseInt(workData.has_properties),
                        id: parseInt(workData.id),
                        iid: parseInt(workData.iid),
                        last_upload: workData.last_upload,
                        parent_id: parseInt(workData.parent_id),
                        post_group_id: parseInt(workData.post_group_id),
                        qualification: parseInt(workData.qualification),
                        qualificator_id: workData.qualificator_id,
                        sent_date: workData.sent_date,
                        session_id: parseInt(sessionId),
                        title: workData.title,
                        title_url: workData.title_url,
                        title_correction: workData.title_correction,
                        title_file: workData.title_file,
                        type: workData.type,
                        url: workData.url,
                        url_correction: workData.url_correction,
                        user_id: parseInt(workData.user_id),
                        view_properties: workData.view_properties,
                        weight: parseInt(workData.weight),
                    });
                } else {
                    // Delete item worksCheck array
                    worksCheck.some(function (workItem, index, object) {
                        if (workItem.cid == wId) {
                            object.splice(index, 1);
                            return true;
                        }
                    });

                    work.set({"accepted": parseInt(workData.accepted)});
                    work.set({"active": parseInt(workData.active)});
                    work.set({"allow_text_assignment": parseInt(workData.allow_text_assignment)});
                    work.set({"amount": workData.amount});
                    work.set({"contains_file": parseInt(workData.contains_file)});
                    work.set({"date_of_qualification": workData.date_of_qualification});
                    work.set({"description": workData.description});
                    work.set({"document_id": parseInt(workData.document_id)});
                    work.set({"enable_qualification": parseInt(workData.enable_qualification)});
                    work.set({"ends_on": workData.ends_on});
                    work.set({"expires_on": workData.expires_on});
                    work.set({"feedback": workData.feedback});
                    work.set({"filetype": workData.filetype});
                    work.set({"has_properties": parseInt(workData.has_properties)});
                    work.set({"last_upload": workData.last_upload});
                    work.set({"parent_id": parseInt(workData.parent_id)});
                    work.set({"post_group_id": parseInt(workData.post_group_id)});
                    work.set({"qualification": parseInt(workData.qualification)});
                    work.set({"qualificator_id": parseInt(workData.qualificator_id)});
                    work.set({"sent_date": workData.sent_date});
                    work.set({"title": workData.title});
                    work.set({"title_file": workData.title_file});
                    work.set({"title_url": workData.title_url});
                    work.set({"title_correction": workData.title_correction});
                    work.set({"type": workData.type});
                    work.set({"url": workData.url});
                    work.set({"url_correction": workData.url_correction});
                    work.set({"user_id": parseInt(workData.user_id)});
                    work.set({"view_properties": parseInt(workData.view_properties)});
                    work.set({"weight": parseInt(workData.weight)});
                    worksMainCollection.set(work,{remove: false});
                }
            });            

            if (worksCheck.length > 0) {
                worksMainCollection.remove(worksCheck);
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

    var WorksMainView = Backbone.View.extend({
        el: 'body',
        template: _.template(WorksMainTemplate),
        initialize: function (options) {
         // Delete collections
            worksMainCollection.unbind();

            // Initialize params
            this.options = options;
			$(this.el).unbind();
            campusModel = this.model;
			courseId = this.options.courseId;
			sessionId = this.options.sessionId;
			statusUser = this.options.statusUser;
			worksMainCollection = this.collection;

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
                loadWorksMain();
            }

			// Set event 
			worksMainCollection.on('add', this.render, this);
			worksMainCollection.on('change', this.render, this);
			worksMainCollection.on('remove', this.render, this);
        },
        render: function () {
            var worksMainList = worksMainCollection.where({c_id: courseId, parent_id: 0});
            this.el.innerHTML = this.template({collection: worksMainList, c_id: courseId, s_id: sessionId, status: statusUser});
			return this;
        }
    });

    return WorksMainView;
});

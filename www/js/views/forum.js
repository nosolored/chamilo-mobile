define([
    'underscore',
    'backbone',
    'collections/forums',
    'text!template/forum.html',
    'views/alert'
], function (
    _,
    Backbone,
    ForumsCollection,
    ForumsTemplate,
    AlertView
) {
    var campusModel = null;
	var courseId = 0;
	var cat_forum = '';
    var forumsCollection = new ForumsCollection();

    var loadForums = function () {
        var options = { dimBackground: true };
        SpinnerPlugin.activityStart(window.lang.LoadingScreen, options);

        var url = campusModel.get('url') + '/main/webservices/api/v2.php';
        var getForums = $.post(url, {
            action: 'course_forum',
            username: campusModel.get('username'),
            api_key: campusModel.get('apiKey'),
            course: courseId,
            session: sessionId
        });

        $.when(getForums).done(function (response) {
            if (response.error) {
                SpinnerPlugin.activityStop();
                return;
            }

            forumsCollection.set({"list_categories": response.data});

            SpinnerPlugin.activityStop();

            if (response.forums.length === 0) {
                new AlertView({
                    model: {
                        message: window.lang.noForums
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

    var ForumsView = Backbone.View.extend({
        el: 'body',
        template: _.template(ForumsTemplate),
		initialize: function (options) {
			forumsCollection.unbind();
			forumsCollection.reset();
			
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

                SpinnerPlugin.activityStop();
            } else {
                loadForums();
            }

			forumsCollection.on('add', this.render, this);
            forumsCollection.on('change', this.render, this);
        },
        render: function () {
            this.el.innerHTML = this.template({collection: forumsCollection.toJSON(), c_id: courseId, s_id: sessionId});
			return this;
        },
        events: {
            'click #forum-update': 'forumUpdateOnClick',
            'click a.disabled' : 'disabledLink'
        },
        forumUpdateOnClick: function (e) {
            e.preventDefault();
			
			loadForums();
			$(".navbar-toggle").trigger( "click" );
		},
		disabledLink: function (e) {
			e.preventDefault();
			e.stopPropagation();
		}
        
    });
    return ForumsView;
});

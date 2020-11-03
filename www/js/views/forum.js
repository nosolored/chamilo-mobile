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

        var url = campusModel.get('url') + '/plugin/chamilo_app/rest.php';
        var getForums = $.post(url, {
            action: 'getForumsList',
            username: campusModel.get('username'),
            api_key: campusModel.get('apiKey'),
			user_id: campusModel.get('user_id'),
			c_id: courseId,
			s_id: sessionId
        });

        $.when(getForums).done(function (response) {
            if (!response.status) {
                SpinnerPlugin.activityStop();
                return;
            }
			var forums = response.forums.info_forum; 
			cat_forum = response.forums.info_category;

			for( i in forums ){
				var forumData = forums[i];
				//comprobamos si existe
				//console.log(forumData);
				var cid = forumData.iid;
				if (forumsCollection.get(cid) == null) { 
					forumsCollection.create({
						iid: parseInt(forumData.iid),
						c_id: parseInt(forumData.c_id),
						s_id: parseInt(forumData.session_id),
						forum_id: parseInt(forumData.forum_id),
						title: forumData.forum_title,
						description: forumData.forum_description,
						id_category: parseInt(forumData.forum_category),
						order: parseInt(forumData.forum_order),
						threads: forumData.number_of_threads,
						posts: forumData.number_of_posts,
						last_post_date: forumData.last_post_date,
						last_poster: forumData.last_poster,
						image: forumData.forum_image
					});
				} else {
					var forum = forumsCollection.get(cid);
					forum.set({"title": forumData.forum_title});
					forum.set({"description": forumData.forum_description});
					forum.set({"id_categoy": forumData.forum_category});
					forum.set({"order": forumData.forum_order});
					forum.set({"threads": forumData.number_of_threads});
					forum.set({"posts": forumData.number_of_posts});
					forum.set({"last_post_date": forumData.last_post_date});
					forum.set({"last_poster": forumData.last_poster});
					forum.set({"image": forumData.forum_image});
					forumsCollection.set(forum,{remove: false});
				}
            };

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
            this.el.innerHTML = this.template({collection: forumsCollection.toJSON(), c_id: courseId, s_id: sessionId, category: cat_forum});
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

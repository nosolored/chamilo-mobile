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
	
        var url = campusModel.get('url') + '/plugin/chamilo_app/rest.php';
        var getForums = $.post(url, {
            action: 'getForumsList',
            username: campusModel.get('username'),
            api_key: campusModel.get('apiKey'),
			user_id: campusModel.get('user_id'),
			c_id: courseId
        });

        $.when(getForums).done(function (response) {
            if (!response.status) {
                return;
            }
			var forums = response.forums.info_forum; 
			cat_forum = response.forums.info_category;
			
			for( i in forums ){
				var forumData = forums[i];
				//comprobamos si existe
				var cid = parseInt("" + forumData.c_id + "000" + forumData.forum_id);
				if(forumsCollection.get(cid) == null){ 
					forumsCollection.create({
						c_id: parseInt(forumData.c_id),
						forum_id: parseInt(forumData.forum_id),
						title: forumData.forum_title,
						id_category: parseInt(forumData.forum_category),
						order: parseInt(forumData.forum_order),
						threads: forumData.number_of_threads,
						posts: forumData.number_of_posts,
						last_post_date: forumData.last_post_date,
						last_poster: forumData.last_poster,
						image: forumData.forum_image
					});
				}else{
					var forum = forumsCollection.get(cid);
					forum.set({"title": forumData.forum_title});
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

            if (response.forums.length === 0) {
                new AlertView({
                    model: {
                        message: window.lang.noForums
                    }
                });
                return;
            }
		});
    };

    var ForumsView = Backbone.View.extend({
        el: 'body',
        template: _.template(ForumsTemplate),
		initialize: function () {
			forumsCollection.unbind();
			forumsCollection.reset();
			
			$(this.el).unbind();
            campusModel = this.model;
			courseId = this.id;

		 	loadForums();
			forumsCollection.on('add', this.render, this);
            forumsCollection.on('change', this.render, this);
        },
        render: function () {
            this.el.innerHTML = this.template({collection: forumsCollection.toJSON(), c_id: courseId, category: cat_forum});
			return this;
        },
        events: {
            'click #forum-update': 'forumUpdateOnClick'
        },
        forumUpdateOnClick: function (e) {
            e.preventDefault();
			
			loadForums();
			$(".navbar-toggle").trigger( "click" );
		}
    });
    return ForumsView;
});

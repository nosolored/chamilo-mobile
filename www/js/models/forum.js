define([
    'database',
    'backbone'
], function (DB, Backbone) {
    var ForumModel = Backbone.Model.extend({
        defaults: {
			iid: 0,
            c_id: 0,
			s_id: 0,
			forum_id: 0,
            title: '',
            description: '',
			id_category: 0,
			order: 0,
			threads: 0,
			posts: 0,
			last_post_date: '',
			last_poster: '',
			image: ''
        }
    });
    return ForumModel;
});

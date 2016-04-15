define([
    'database',
    'backbone'
], function (DB, Backbone) {
    var ForumModel = Backbone.Model.extend({
        defaults: {
            c_id: 0,
			forum_id: 0,
            title: '',
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

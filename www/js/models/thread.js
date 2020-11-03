define([
    'database',
    'backbone'
], function (DB, Backbone) {
    var ThreadModel = Backbone.Model.extend({
        defaults: {
            c_id: 0,
			forum_id: 0,
			thread_id: 0,
            title: '',
			replies: 0,
			views: 0,
			thread_poster_name: '',
			last_post_date: '',
			last_poster: 0,
			insert_date: '',
			iconnotify: 'notification_mail_na.png',
			image: '',
        }
    });
    return ThreadModel;
});

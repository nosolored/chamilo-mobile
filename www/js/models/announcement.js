define([
    'backbone'
], function (Backbone) {
    var AnnouncementModel = Backbone.Model.extend({
        defaults: {
            c_id: 0,
			a_id: 0,
			teacher: '',
			title: '',
			content: '',
			last_edit: ''
		}
    });
	return AnnouncementModel;
});

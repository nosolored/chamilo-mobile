define([
    'backbone'
], function (Backbone) {
    var AnnouncementModel = Backbone.Model.extend({
        defaults: {
            c_id: 0,
			s_id: 0,
			a_id: 0,
			iid: 0,
			teacher: '',
			title: '',
			content: '',
			last_edit: ''
		}
    });
	return AnnouncementModel;
});

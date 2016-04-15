define([
    'database',
    'backbone'
], function (DB, Backbone) {
    var ProfileModel = Backbone.Model.extend({
        defaults: {
            c_id: 0,
			complete_name: '',
			username: '',
			official_code: '',
            phone: '',
			email: '',
			picture_uri: '',
            competences: '',
			diplomas: '',
			teach: '',
			openarea: '',
			extra: []
        }
    });

    return ProfileModel;
});

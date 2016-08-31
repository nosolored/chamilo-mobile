define([
    'backbone'
], function (Backbone) {
    var DocumentsModel = Backbone.Model.extend({
        defaults: {
            c_id: 0,
			s_id: 0,
			path: '/',
			path_back: 'empty',
			path_back_id: '',
			documents: [],
			base: ''
		}
    });

    return DocumentsModel;
});

define([
    'database',
    'backbone'
], function (DB, Backbone) {
    var CatalogModel = Backbone.Model.extend({
        defaults: {
            user_id: 0,
			code: 'ALL',
			list_courses: [],
            list_sessions: [],
			user_coursecodes: [],
			catalog_show_courses_sessions: 0,
			categories_select: []
        }
    });

    return CatalogModel;
});

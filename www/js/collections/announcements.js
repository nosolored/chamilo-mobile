define([
    'underscore',
    'backbone',
    'database',
    'models/announcement'
], function (_, Backbone, DB, AnnouncementModel) {
    var AnnouncementCollection = Backbone.Collection.extend({
        model: AnnouncementModel,
		url: "/announcement/",
        create: function (attributes) {
            var self = this;
            var deferred = $.Deferred();

            var announcementModel = new AnnouncementModel(attributes);
				announcementModel.cid = parseInt("" + announcementModel.get("c_id") + "00" + announcementModel.get("a_id"));  
				self.add(announcementModel);						
                deferred.resolve();

            return deferred.promise();
        }
    });

    return AnnouncementCollection;
});

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

            var announcementModel = new AnnouncementModel(attributes); //Crea un objeto (modelo) con los datos de un curso
                console.log(announcementModel);
				//console.log(attributes);
				announcementModel.cid = parseInt("" + announcementModel.get("c_id") + "00" + announcementModel.get("a_id"));  
				self.add(announcementModel);						
                deferred.resolve();
				console.log(announcementModel);

            return deferred.promise();
        }
    });

    return AnnouncementCollection;
});

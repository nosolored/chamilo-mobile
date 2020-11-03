define([
    'underscore',
    'backbone',
    'database',
    'models/forum'
], function (_, Backbone, DB, ForumModel) {
    var ForumsCollection = Backbone.Collection.extend({
        model: ForumModel,
        create: function (attributes) {
            var self = this;
            var deferred = $.Deferred();

            var forumModel = new ForumModel(attributes);
				forumModel.cid = forumModel.get("iid");  
				self.add(forumModel);
                deferred.resolve();

            return deferred.promise();
        }
    });

    return ForumsCollection;
});

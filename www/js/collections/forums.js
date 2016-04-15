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
				forumModel.cid = parseInt("" + forumModel.get("c_id") + "000" + forumModel.get("forum_id"));  
				self.add(forumModel);
                deferred.resolve();

            return deferred.promise();
        }
    });

    return ForumsCollection;
});

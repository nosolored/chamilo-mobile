define([
    'underscore',
    'backbone',
    'database',
    'models/work'
], function (_, Backbone, DB, WorkModel) {
    var WorksCollection = Backbone.Collection.extend({
        model: WorkModel,
        create: function (attributes) {
            var self = this;
            var deferred = $.Deferred();

            var workModel = new WorkModel(attributes);
				self.add(workModel);
                deferred.resolve();

            return deferred.promise();
        }
    });

    return WorksCollection;
});

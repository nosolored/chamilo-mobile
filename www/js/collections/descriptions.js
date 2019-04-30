define([
    'underscore',
    'backbone',
    'models/description'
], function (_, Backbone, DescriptionModel) {
    var DescriptionsCollection = Backbone.Collection.extend({
        model: DescriptionModel,
        url: "/descriptions/",
        create: function (attributes) {
            var self = this;
            var deferred = $.Deferred();
            var descriptionModel = new DescriptionModel(attributes);
                self.add(descriptionModel);
                deferred.resolve();

            return deferred.promise();
        }
    });

    return DescriptionsCollection;
});

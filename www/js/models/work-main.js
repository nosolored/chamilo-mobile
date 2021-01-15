define([
    'backbone'
], function (Backbone) {
    var WorkMainModel = Backbone.Model.extend({
        defaults: {
            accepted: 0,
            active: 0,
            allow_text_assignment: 0,
            amount: '',
            c_id: 0,
            contains_file: 0,
            date_of_qualification: '',
            description: '',
            document_id: 0,
            enable_qualification: 0,
            ends_on: '',
            expires_on: '',
            feedback: '',
            filetype: '',
            has_properties: 0,
            id: 0,
            iid: 0,
            last_upload: '',
            parent_id: 0,
            post_group_id: 0,
            qualification: 0,
            qualificator_id: '',
            sent_date: '',
            session_id: 0,
            title: '',
            title_file: '',
            title_url: '',
            title_correction: '',
            type: '',
            url: '',
            url_correction: '',
            user_id: 0,
            view_properties: 0,
            weight: 0,
        }
    });
    return WorkMainModel;
});

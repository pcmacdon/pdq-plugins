"use strict";Pdq.plugin("posts",{

    route: {
        redirect:'list', component:null,
        children: [
            {path: 'list' },
            {path: 'view/:rowid?' },
            {path: 'new' },
        ]
    },

    store: {
        modules: {
            list: {
                state: {
                    t_data          :{rows:[], cnt:0},
                    s_updated       :0,
                    t_foo           :{b:1},
                },
            },
            view: {
                state: {
                    s_page          :{},
                    s_updated       :0,
                },
            },
        }
    },
    
    messages: {
        list: {
           Index_rsp:function Index_rsp(_msg, cnt, rows) {
                this.$pdqCommit('list/update_t_data', {cnt:cnt, rows:rows});
            },
           Delete_rsp:function Delete_rsp(_msg, cnt) {
                console.warn('Delete: ', cnt);
            },
           Apply_rsp:function Apply_rsp(_msg, cnt, msg) {
                this.$pdqCommit('list/update_s_updated', this.epoch++);
            },
        },
        new: {
           Post_rsp:function Post_rsp(_msg, cnt, rowid) {
                this.$pdqPush('list');
            },
        },
        view: {
           Fetch_rsp:function Fetch_rsp(_msg, cnt, rows) {
                this.$pdqCommit('view/update_s_page', rows[0]);
            },
           Save_rsp:function Save_rsp(_msg, cnt, rowid) {
                this.$pdqCommit('view/update_s_updated', this.epoch++);
            },
        },
    },

});


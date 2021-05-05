"use strict";Pdq.plugin("video",{
  route: {
    redirect:'list', component:null,
    children: [
      {path: 'list/:indir?' },
      {path: 'play/:path?' },
      {path: 'history' },
      {path: 'settings' },
    ]
  },
  
  store: {
    storeOpts: {
      saves: ['v_Site', 's_listOfSites',],
    },
    state: {
      s_dir:'',
      v_Site:'',
      s_listOfSites:['http://127.0.0.1/video/', 'http://media.local/video/', './' ],
      s_listRows:[],
      s_listRowRecs:[],
      s_historyRows:[],
    },
    
    modules: {
      play: {
        state: {
          s_Subtitles:true,
          s_CaptVal:'',
          s_VideoInfo:{},
        },
        storeOpts: {
          saves: ['s_Subtitles'],
        },
      },
    }
  },
  
  messages: {
    play: {
     LoadCaptions_rsp:function LoadCaptions_rsp(_msg, data) {
        this.$pdqCommit('play/update_s_CaptVal', data);
      },
     LoadVideo_rsp:function LoadVideo_rsp(_msg, info) {
        this.$pdqCommit('play/update_s_VideoInfo', info);
      },
    },
    history: {
     List_rsp:function List_rsp(_msg, cnt, rows) {
        this.$pdqCommit('update_s_historyRows', rows);
      },
    },
    
    list: {
     Dir_rsp:function Dir_rsp(_msg, file, rows) {
        for (var i = 0; i < rows.length; i++) {
          var d = new Date(rows[i].mtime);
          var n = d.toISOString().split('T')[0];
          rows[i].mtime = n + ' ' + d.toTimeString().split(' ')[0];
          rows[i].state = null;
          rows[i].group = null;
          rows[i].rowid = i;
        }
        this.$pdqCommit('update_s_listRows', rows);
      },
      
     RecsInDir_rsp:function RecsInDir_rsp(_msg, info) {
        this.$pdqCommit('update_s_listRowRecs', info);
      },
    },
  },
  
  popts: {
    css:'video.css',
  },
});


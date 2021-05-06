"use strict";Pdq.component("posts-new",{template:`
  <div>
    <b-card>
      <button v-on:click.once="Done">Done</button>
      <div>Title: <input v-model="title" placeholder="Post title"" /></div>
      <textarea v-model="text" rows="20" cols="60" style="resize:both" />
    </b-card>
  </div>
`
,
 data:function data() {
    return {
      text:'', title:'',
    };
  },
 mounted:function mounted() {
    this.text = '';
    this.title = '';
  },
  methods: {
   $pdqBreak:function $pdqBreak() {debugger;},
   Done:function Done() {
      var m = {text:this.text,title:this.title};
      m.timestamp = m.timeupdated = new Date().toISOString();
      m.author = this.s_t_username;
      m.date = new Date().toISOString().split('T')[0];
      this.$pdqSend('Post', {data:m});
    }
  },
});

"use strict";Pdq.component("posts-view",{template:`
  <b-container fluid>
    <b-row>
      <b-col cols="6" class="p-0 m-0">
        <div class="pdq-icon-buts w-100">
          <span class="pdq-icon" v-on:click="Save" title="Save edit changes">&#128190;</span>
          <span class="pdq-icon" v-on:click="editOp('sync')" title="Sync-scrolling toggle">&#128472;</span>
          <span class="">|</span>
          <span class="pdq-icon1" v-on:click="editOp('**')" title="Bold text"><b>&#119809;</b></span>
          <span class="pdq-icon1" v-on:click="editOp('*')" title="Italic text"><i>&#119816;</i></span>
          <span class="pdq-icon1" v-on:click="editOp('~~')" title="Strike-through text"><s>&#119826;</s></span>
          <b-dropdown title="Heading levels" variant="outline">
            <template v-slot:button-content>
              <span class="pdq-icon1">&#119815;</span>
            </template>
            <b-dropdown-item v-on:click="editOp('#')" title="">Header 1</b-dropdown-item>
            <b-dropdown-item v-on:click="editOp('##')" title="">Header 2</b-dropdown-item>
            <b-dropdown-item v-on:click="editOp('###')" title="">Header 3</b-dropdown-item>
            <b-dropdown-item v-on:click="editOp('####')" title="">Header 4</b-dropdown-item>
            <b-dropdown-item v-on:click="editOp('#####')" title="">Header 5</b-dropdown-item>
            <b-dropdown-item v-on:click="editOp('######')" title="">Header 6</b-dropdown-item>
          </b-dropdown>
          <span class="">|</span>
          <span class="pdq-icon" v-on:click="editOp('code')" title="Code block">{}</span>
          <span class="pdq-icon" v-on:click="editOp('code2')" title="Code block indent with bg">&#10144;{}</span>
          <span class="pdq-icon1" v-on:click="editOp('quote')" title="Quotation block">&#10077;</span>
          <span class="pdq-icon1" v-on:click="editOp('quote2')" title="Quotation block fancy">&#10078;</span>
          <span class="">|</span>
          <span class="pdq-icon" v-on:click="editOp('ul')" title="Unordered list">&#10146;</span>
          <span class="pdq-icon" v-on:click="editOp('ol')" title="Numbered list">&#9312;</span>
          <span class="pdq-icon" v-on:click="editOp('check')" title="Check-list">&check;</span>
          <span class="">|</span>
          <span class="pdq-icon" v-on:click="editOp('link')" title="Insert link">&#9903;</span>
          <span class="pdq-icon" v-on:click="editOp('image')" title="Insert image">&#128444;</span>
          <span class="pdq-icon" v-on:click="editOp('table')" title="Insert table">&#9636;</span>
          <span class="" v-on:click="editOp('hr')" title="Horizontal line"><b>&horbar;</b></span>
          
        </div>
        <textarea id="postsText" ref="viewer" v-model="text" v-on:keydown="ismodified = true" 
                 class="w-100 full-height overflow-auto m-0 source" style="height:93%" />
      </b-col>
      <b-col cols="6" class="p-0 m-0" >
        <div class="m-1">Title: <input v-model="title" placeholder="Post title" /></div>
        <section class="w-100">
          <vue-markdown-pdq id="postsView" ref="markitup"
              class="markdown line-numbers w-100" style="height:500px"
              toc v-bind:source="text"
              v-bind:sub-opts="subOpts" v-on:toc-rendered="tocRendered"
              v-bind:anchor-attrs="anchorAttrs"
              langPrefix="language language-"
          />
        </section>
      </b-col>
    </b-row>
    <b-modal v-model="showModDialog" v-on:ok="doAbort">Ok to abandon modifications?</b-modal>
  </b-container>
`
,
  data:function data() { 
    return {
      curRowId:-1, 
      awaitingTitle:null, markdown:'',
      showModDialog:false, text:'', text2:'', title:'',
      ismodified:false, nextlink:null, sync:false,
      mdWid:400, mdHi:460, tvWid:450, tvHi:400,
      anchorAttrs: { target:'_blank', rel:'noopener noreferrer nofollow' },
      subOpts:{
        toc: {anchorLinkBefore:false, anchorLinkSpace:false},
      },  
    };
  },
  props:['rowid'],
  created:function created() {
  },
  beforeDestroy:function beforeDestroy() {
    this.s1.removeEventListener('scroll', this.s1);
  },
  mounted:function mounted() {
    this.text = this.title = '';
    this.showModDialog = this.ismodified = false;
    this.awaitingTitle = null;
    var rowid = this.$route.params.rowid;
    if (rowid)
      this.$pdqSend('Fetch', {rowid: parseInt(rowid)});
    
    var s1 = this.s1 = document.getElementById('postsView');
    var s2 = this.s2 = document.getElementById('postsText');
    
    s1.addEventListener('scroll', this.select_scroll_1, false);
    s2.addEventListener('scroll', this.select_scroll_2, false);
  },
  computed: {
    docModified:function docModified() {
      if (this.ismodified)
        return true;
      return false;
    },
  },
  methods: {
    $pdqBreak:function pdqBreak() {debugger;},
    insertAtCursor: function (input, textToInsert, del) {
      input.focus();
      if (del)
        document.execCommand("delete", false, '');
      var isSuccess = document.execCommand("insertText", false, textToInsert);
      
      // Firefox (non-standard method)
      if (!isSuccess && typeof input.setRangeText === "function") {
        var start = input.selectionStart;
        input.setRangeText(textToInsert);
        // update cursor to be at the end of insertion
        input.selectionStart = input.selectionEnd = start + textToInsert.length;
      
        // Notify any possible listeners of the change
        var e = document.createEvent("UIEvent");
        e.initEvent("input", true, false);
        input.dispatchEvent(e);
      }
    },
    
    select_scroll_1:function select_scroll_1(e) { if (this.sync) this.s2.scrollTop = this.s1.scrollTop; },
    select_scroll_2:function select_scroll_2(e) { if (this.sync) this.s1.scrollTop = this.s2.scrollTop; },
    tocRendered:function tocRendered() {
      return;
    },
    Save:function Save() {
      var m = {text:this.text, title:this.title,rowid:this.curRowId};
      m.timeupdated = new Date().toISOString();
      this.$pdqSend('Save', {data:m});
    },
    editOp:function editOp(t) {
      var qp = '', id = this.$refs.viewer;
      var s = id.selectionStart, f = id.selectionEnd;
      if (s === undefined || f === undefined) return;
      var r = '', v = id.value, i, lst = [], l, adj=0, nv, sel, slen = 0;
      sel = v.substring(s, f);
      if (sel) slen = sel.length;
      else sel = '';
          
      switch (t) {
        case '#': case '##': case '###':case '####': case '#####': case '######':
          this.insertAtCursor(id, '\n'+t+' X\n', f!==s);
          break;
        case '**': case '*': case '~~':
          this.insertAtCursor(id, t + sel + t, f!==s); break;
        case 'hr': this.insertAtCursor(id, '\n----\n', 0); break;
        case 'code2':
          qp = '~~~';
        case 'code':
          if (qp === '') qp = '```';
          nv = '`' + sel + '`';
          if (!slen || sel.indexOf('\n')>=0)
              nv = '\n'+qp+'\n'+sel+'\n'+qp+'\n';
          this.insertAtCursor(id, nv, 0);
          break;
        case 'quote2': 
          qp = '"';
        case 'quote': 
          nv = '\n> '+qp+'Quote this\n> and that'+qp+'\n';
          this.insertAtCursor(id, nv, 0); break;
        case 'ul':    this.insertAtCursor(id, '- X', 0); break;
        case 'ol':    this.insertAtCursor(id, '1. X', 0); break;
        case 'check': this.insertAtCursor(id, '\n- [x] Done\n- [ ] Todo', 0); break;
        case 'link':  this.insertAtCursor(id, '(label)[x.html]', 0); break;
        case 'image': this.insertAtCursor(id, '(label)[x.jpg]', 0); break;
        case 'table': this.insertAtCursor(id, '\n| colum1 | colum2 |colum3|\n|:---|:---:|---:|\n| v1 | v2 |v3|\n', 0); break;
        case 'sync':  this.sync = !this.sync; break;
        default: console.warn('Unhandled: '+t);
      }
    
      if (!slen)
        id.selectionEnd = s+t.length+adj;
      this.ismodified = true;
      return;
    },
    changed:function changed(event) {
      //this.text2 = event.target.innerHTML.trim();
    },
    doAbort:function doAbort() {
      this.ismodified = false;
      this.$router.push(this.nextlink);
    },
    Dlg:function Dlg(op) {
      this.showModDialog = false;
      switch (op) {
        case 'save':
          this.Save();
          break;
        case 'discard':
          this.ismodified = false;
          this.$router.push(this.nextlink);
          break;
        case 'close': break;
        default: console.warn('unknown op: '+op);
      }
    },
  },
  watch: {
    s_updated:function s_updated(v) { this.ismodified = false; },
    s_page:function s_page(page) {
      this.text = page.text;
      this.title = page.title;
      this.curRowId = page.rowid;
      this.text2 = page.text;
    },
  },
  
  beforeRouteLeave:function beforeRouteLeave(to, from, next) {
    var ismod = this.docModified;
    this.nextlink = to;
    if (!ismod)
      next();
    else {
      this.showModDialog = true;
    }
  },
});

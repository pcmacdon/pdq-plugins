"use strict";Pdq.component("video-list",{template:`
  <div>
    <b-modal v-model="showModDialog" v-on:ok="ApplyDo">Confirm Apply!</b-modal>
    <b-card v-if="showAdd">
      <b-input-group prepend="New Site" >
      <b-form-input v-model="newSite" />
      <b-input-group-append>
        <b-button variant="outline-info" v-on:click="addSite">Add</b-button>
        <b-button variant="outline-info" v-on:click="showAdd=false">Cancel</b-button>
      </b-input-group-append>
      </b-input-group>
    </b-card>
    <b-card v-else>
    <b-container fluid="md">
      <b-row class="my-1">
        <b-col cols="8">
          <b-input-group prepend="Site" >
          <b-form-select v-model="v_Site" v-bind:options="s_listOfSites"/>
          <b-input-group-append>
            <b-button variant="outline-info" v-on:click="showAdd=true" title="Add a site to list">+</b-button>
            <b-button variant="outline-info" v-on:click="delSite" title="Delete current site from list">-</b-button>
          </b-input-group-append>
          </b-input-group>
        </b-col>
        <b-col>
            <b-form-input class="m-0"
              v-model="filter"
              type="search"
              placeholder="File Filter or '/' for Dirs"
              v-on:keyup.enter="FilterDo"
          ></b-form-input>
        </b-col>
      </b-row>
  
      <b-row class="my-1" size="sm">
        <b-col cols="5">
          <b-input-group prepend="Rows" v-if="showPerPage">
            <b-form-select v-model="v_t_rowsPerPage" v-bind:options="s_t_rowsPerPageList"/>
          </b-input-group>
        </b-col>
        <b-col>
          <b-pagination class="m-0" v-if="totalRows>v_t_rowsPerPage"
            v-model="currentPage"
            v-bind:total-rows="totalRows"
            v-bind:per-page="v_t_rowsPerPage"
            v-bind:aria-controls="list_tbl"
          >
          </b-pagination>
        </b-col>
      </b-row>
    
      <b-table ref="list_tbl" striped hover v-bind:items="s_listRows" v-bind:fields="lfields" 
        class="shadow"
        small bordered head-variant="light" sort-icon-left
        v-bind:filter="filter"
        v-bind:filter-function="filterFunc"
        v-on:filtered="Filter"
        v-bind:per-page="v_t_rowsPerPage"
        v-bind:current-page="currentPage"
        v-bind:sort-by.sync="sortBy"
        v-bind:sort-desc.sync="sortDesc"
        v-bind:sort-direction="sortDirection"
        v-bind:foot-clone="s_listRows.length>8"
      >
        <template v-slot:head(rowid)="data">
          <b-form-checkbox  v-model="checkedAll" v-on:change="selectAll">
          </b-form-checkbox>
        </template>
        <template v-slot:cell(rowid)="data">
          <b-form-checkbox  v-model="checkedNames" v-bind:value="data.item.rowid" v-bind:id="''+data.item.rowid" />
        </template>
        <template v-slot:head(state)="data">
          <span class="pdq-uicon">&#9675;</span>
        </template>
        <template v-slot:cell(state)="data">      
          <pdq-video-list-detail v-bind:item="data.item" v-bind:s_listRows="s_listRows" />
          <!-- <span v-bind:class="getViewedClass(data.item.rowid)"></span> -->
        </template>
        <template v-slot:cell(size)="data">
           <span>{{ data.value | $pdqFileSizeFmt }}</span>
        </template>
         <!-- <template v-slot:cell(perms)="data">
           <code class="text-dark">{{ data.value }}</code>
        </template>-->
        <template v-slot:cell(name)="data">
          <b-link href="#" v-on:click="fileAction(data.item)">
            {{ data.item.name }}
            <b v-if="data.item.type !== 'file'" style="color:black">{{ getFPrefix(data.item) }}</b>
          </b-link>
        </template>
        <template v-slot:cell(mtime)="data">
          <span v-bind:title="getTitle(data.item)">{{ data.value }}</span>
        </template>
      </b-table>
    
      <b-row class="my-1">
        <b-col cols="3">
          <transition enter-active-class="animated fadeIn" leave-active-class="animated fadeOut" mode="out-in">
            <b-input-group  size="sm" v-if="this.checkedNames.length">
              <b-input-group-append>
                <b-button v-on:click="Apply" v-bind:disabled="bulkAction===null || !this.checkedNames.length">Apply</b-button>
              </b-input-group-append>
              <b-form-select v-model="bulkAction" v-bind:options="bulkOptions"></b-form-select>
            </b-input-group>
          </transition>
        </b-col>
      </b-row>
  
    </b-container>
    </b-card>
  </div>
`
,
  props:{ indir:{type:String, default:''} },
 data:function() {
    return {
      rows:[], totalRows:0,
      list_tbl:'',
      showAdd:false,
      newSite:'',
      show:false,
      currentPage:1,
      dir:'',
      filter:'', filterGet:'', 
      checkedNames:[], checkedAll:false,
      bulkAction:null, dontshow:false, 
      applyLst:[],
      showModDialog:false,
      showPerPage:true,
      bulkOptions:[
          { value: null, text: '' },
          { value: 'Delete', text:'Delete' },
        ],
      lfields: [
        {key:'rowid', label:'', thStyle:'width:.1em;', class:'py-0' },
        {key:'state', label:'', thStyle:'width:.1em;', class:'py-0'},
        {key:'name',  sortable:true, formatter:"getFname", class:'py-0',
          sortByFormatted:  function (val, nam, data) {
            return (data.type==='directory' ? '/' : '')  + val; }
           },
        {key:'size',  sortable:true, class:'py-0', thStyle:'text-align:right', tdAttr:{style:'text-align:right' } },
        {key:'mtime', sortable:true, class:'py-0', sortDirection: 'desc', label:'Modified',
          formatter:"getDate", thStyle:'text-align:center; width:10em;', tdAttr:{style:'text-align:center' } },
        //{key:'perms',  sortable:true },
      ],
      sortBy: 'name',
      sortDesc: false,
      sortDirection: 'asc',
      fexts: ['mkv', 'mp4', 'mpeg', 'avi', 'webm', 'ogg', 'm4v'],
      //navFromPath:null,
    };
  },
 mounted:function() {
    this.showModDialog = false;
    this.list_tbl = this.$refs.list_tbl.toString();
    this.ListFilesSet(this.$route.params.indir);
  },
 beforeRouteUpdate:function(to, from, next) {
    this.ListFilesSet(to.params.indir);
    next();
  },
  watch: {
   v_Site:function v_Site(val, old) {
      this.dputs("WATCH SITE", val, old);
      if (val && val != old)
        this.sitePush();
        
    },
   s_listRows:function s_listRows(val, old) {
      this.rows = val;
      this.totalRows = val.length;
    },
   s_listRowRecs:function s_listRowRecs(val, old) {
        // Replace "s_listRows" with updated "state"/"group".
        var mi = val,
          r = JSON.parse(JSON.stringify(this.s_listRows)),
          dir = this.s_dir, mod = 0, sups = [];
        this.dputs("GOT RECSINDIR", r);
        for (var i = 0; i < mi.length; i++) {
          for (var j = 0; j < r.length; j++) {
            if (sups.indexOf(j)>=0) {
              console.warn("OOPS DUP ROW IN DB", r[j].path);
              continue;
            }
            var pre = (dir+'/'+r[j].name), pn = mi[i].path;
            if (pre === pn) {
              r[j].state = mi[i];
              sups.push(j);
              break;
            }
            pre += '/';
            if (pre == pn.substr(0, pre.length)) {
              if (!r[j].group) {
                mod++;
                r[j].group = {cnt:0, lastTime:''};
              }
              var g = r[j].group;
              g.cnt++;
              if (g.lastTime=='' || g.lastTime<mi[i].lastTime) {
                mod++;
                g.lastTime = mi[i].lastTime;
              }
              break;
            }
          }
        }
        if (1 || mod) {
          this.$pdqCommit('update_s_listRows', r);
        }

    },
  },
  methods: {
   $pdqbreak: function() {debugger;},
   dputs:function() {
    },
   sitePush:function() {
      if (this.s_dir != '')
        this.$pdqPush('List/');
      else
        this.ListFilesDo();
    },
   delSite:function() {
      var tt = {title:'Site Add', autoHideDelay: 3000, variant:'success'};
      var sind = this.s_listOfSites.indexOf(this.v_Site);
      var msg;
      if (!this.s_listOfSites.length || !this.v_Site || sind<0)
        msg = 'no site to delete';
      if (msg) {
        tt.variant = 'danger';
      } else {
        this.showAdd = false;
        msg = 'site removed';
        var nlst = this.s_listOfSites.slice();
        nlst.splice(sind);
        this.s_listOfSites = nlst;
        this.v_Site = nlst[0];
      }
      this.$bvToast.toast(msg, tt);
      
    },
   addSite:function() {
      this.dputs("ADD SITE", this.newSite);
      var ns = this.newSite, msg;
      if (ns == '')
        msg = 'site can not be empty';
      else if (this.s_listOfSites.indexOf(ns)>=0)
        msg = 'duplicate site';
      var tt = {title:'Site Add', autoHideDelay: 3000, variant:'success'};
      if (msg) {
        tt.variant = 'danger';
      } else {
        this.showAdd = false;
        msg = 'site added';
        var nlst = this.s_listOfSites.slice();
        nlst.push(this.newSite);
        this.s_listOfSites = nlst;
      }
      this.$bvToast.toast(msg, tt);
    },
   Back:function() { console.warn("BACK unimpl"); },
   Apply:function() {
      var call = [], rows = this.s_listRows;
      for (var i in rows) {
        var it = rows[i];
        if (this.checkedNames.indexOf(it.rowid)>=0)
          call.push(rows[i].name);
      }
      this.applyLst = call;
      this.showModDialog = true;
    },
   ApplyDo:function() {
      this.$pdqSend('Apply', {op:this.bulkAction,names:this.applyLst});
    },
   fileAction:function(item) {
      var dir = this.s_dir, ldir = dir + (dir?'/':'') + item.name;
      var epath = encodeURIComponent(ldir);
      if (this.isDir(item)) {
        this.update_s_dir(ldir);
        this.currentPage = 1;
        this.$pdqPush('List/'+epath);
        return;
      }
    
      // View video.
      var url = item.name;
      var i = url.lastIndexOf('.');
      if (i>=0) {
        url = url.slice(0,i+1);
        this.dputs('SUBURL',url);
        var sfx = '', rows = this.s_listRows;
        for (var j = 0; j<rows.length; j++) {
          var nn = rows[j].name;
          if (item.name != nn && nn.substr(0,url.length)==url
            && nn.substr(nn.length-4)=='.srt')
            sfx += '|' + nn.substr(url.length);
        }
        epath+=sfx;
      }
      this.$pdqPush('play/'+epath);
    },
   filterFunc:function(item, pat) {
      // TODO: search caseless.
      var base = item.name, lpat = pat.toLowerCase(), lbase = base.toLowerCase();
      if (lpat == pat) base = lbase;
      var opat=pat, dpat = (pat[0] === '/');
      if (dpat) pat=pat.slice(1);
      if (item.type==='directory') {
        if (opat == '/') return true;
        //else return false;
      } else {
        if (dpat) return false;
        var lio = item.name.lastIndexOf('.');
        if (lio<0) return false;
        var ext = item.name.slice(lio+1).toLowerCase();
        if (opat[0] == '.' && ext == 'srt') return false;
        if (this.fexts.indexOf(ext)<0) return false;
        if (lio>=0) base = item.name.slice(0,lio);

      }

      return (pat == '' || lbase.indexOf(lpat)>=0);
    },
   FilterDo:function() {
      this.ListFilesDo();
    },
   Filter:function(lst) {
      this.totalRows = lst.length;
    },
   getFPrefix:function(data) {
      switch (data.type) {
        case 'directory': return '/'; break;
        case 'pipe': return '|'; break;
        case 'link': return '@'; break;
        case 'file': return ''; break;
      }
      return '*';
    },
   getFname:function(val, key, data) {
      return data.name+this.getFPrefix(data);
    },
   getDate:function(val) {
      var d = new Date((typeof val === 'string')?val:val*1000);
      var n = d.toISOString().split('T')[0];
      return n + ' ' + d.toTimeString().split(' ')[0];
    },
   getStateStyle:function(item) {
      return 'color:black';
    },
   getTitle:function(row) {
      if (!row.timestamp)
        return '';
      return row.timestamp+' UTC: Update=' + row.timeupdated;
    },
   isDir:function(data) {
      return (data.type === 'directory');
    },
   ListFilesDo:function() {
      var s = this.$route.meta.data;
      this.rows = [];
      if (this.v_Site != '')
        this.ListIndex(0, this.filterGet, this.s_dir, this.v_Site);
    },
   ListFilesSet:function(dir) {
      dir = (dir?decodeURIComponent(dir):'');
      this.update_s_dir(dir);
      this.ListFilesDo();

    },
   selectAll:function(on) {
      if (!on) {
        this.checkedNames = [];
      } else {
        var call = [], rows = this.s_listRows;
        for (var i in rows)
          call.push(rows[i].rowid.toString());
        this.checkedNames = call;
      }
    },
   getViewedClass:function(n) {
      var rows = this.s_listRows;
      if (!rows[n]) return;
      if (!rows[n].state) return '';
      var s = rows[n].state;
      var c = 'pie';
      var rel = 1.0-(s.duration-s.currentTime)/s.duration;
      if (rel <= .15)
        return c + ' ten';
      if (rel <= .30)
        return c + ' twentyfive';
      if (rel <= .60)
        return c + ' fifty';
      if (rel <= .80)
        return c + ' seventyfive';
      return c + ' onehundred';
    },
   ListIndex:function(max, filter, dir, site) {
      if (site && site.substr(0,7) === 'file://') {
        this.$pdqSend('Dir', {max:max, filter:filter, dir:dir, site:site.slice(7)});
        return;
      }
      var that = this;
    
      function jsonp(url, callback) {
        var callbackName = 'jsonp_callback_' + Math.round(100000 * Math.random());
        window[callbackName] = function(data, ev) {
          delete window[callbackName];
          document.head.removeChild(script);
          callback(data, ev);
        };
      
        var script = document.createElement('script');
        script.src = url + (url.indexOf('?') >= 0 ? '&' : '?') + 'callback=' + callbackName;
        script.defer = true;
        script.onerror = function(error) {
          that.$pdqToast({variant:'danger', msg:'Failed to get url: '+site+dir});
        };
        document.head.appendChild(script);
      }
    
      this.$pdqCommit('update_s_dir', dir);
      jsonp(site+dir+'/', function(data, ev) {

        function fixupRows(rows) {
          for (var i = 0; i < rows.length; i++) {
            var d = new Date(rows[i].mtime);
            var n = d.toISOString().split('T')[0];
            rows[i].mtime = n + ' ' + d.toTimeString().split(' ')[0];
            rows[i].state = null;
            rows[i].group = null;
            rows[i].rowid = i;
          }
        }
        if (!data) {
          that.$pdqToast({variant:'danger', msg:'Failed to get url: '+site+dir});
          return;
        }
        fixupRows(data);
        that.$pdqCommit('update_s_listRows', data);
        that.$pdqSend('RecsInDir', {site:site, path:dir});
        //puts("SEND RECSINDIR");
      });
      
    },
  }  
}
);

Pdq.subcomponent("pdq-video-list-detail", { template:`
  <span>
    <span ref="popTarg" class="pdq-uicon" v-bind:style="stateStyle(item.rowid)" v-html="stateViewed(item.rowid)"></span>
    <b-popover  v-if="item.state!=null" v-bind:target="popOverFn()" triggers="hover">
      <template v-slot:title>Video Details</template>
      <b>Viewed:</b> {{getRel()}} <i>({{viewedTime(item)}})</i><br>
      <b>Last View:</b> {{item.state.lastTime}}<br>
      <b>First View:</b> {{item.state.firstTime}}<br>
      <span v-if="item.state.tags!=''"><b>Tags:</b> {{item.state.tags}}<br></span>
      <span v-if="item.state.note!=''"><b>Note:</b> {{item.state.note}}<br></span>
    </b-popover>
    <b-popover  v-if="item.group!=null" v-bind:target="popOverFn()" triggers="hover">
      <template v-slot:title>Directory Details</template>
      <b>Viewed Files:</b> {{item.group.cnt}}<br>
      <b>Last Time:</b> {{item.group.lastTime}}<br>
    </b-popover>
  </span>
`
,
  props:['item', 'sclass'],
 data:function() { return {}; },
  methods: {
   popOverFn:function() {
      var that = this;
      return function() {
        return that.$refs.popTarg;
      };
    },
   viewedTime:function(item) {
      return new Date(item.state.currentTime * 1000).toISOString().substr(11, 8) + ' of '
         + new Date(item.state.duration * 1000).toISOString().substr(11, 8);
    },
   getRel:function() {
      var s = this.item.state;
      var rel = 1.0-(s.duration-s.currentTime)/s.duration;
      return ''+Math.round(rel*100)+'%';
    },
   stateStyle:function(n) {
      var rows = this.s_listRows;
      if (rows[n].group)
        return "font-size:18px;";
    },
   stateViewed:function(n) {
      var rows = this.s_listRows;
      var c = {
        v100:'&#9679;', v50:'&#9680;',
        v25 :'&#9684;', v75:'&#9685;',
        eye:'&#128065;', v0:'&#9675;'
      };
      if (!rows[n]) return;
      if (rows[n].group)
        return c.eye;
      if (!rows[n].state) return '';
      var s = rows[n].state;
      var rel = 1.0-(s.duration-s.currentTime)/s.duration;
      //puts('rel',n, rel);
      if (rel > .95)
        return c.v100;
      if (rel>.70)
        return c.v75;
      if (rel>.36)
        return c.v50;
      if (rel>.03)
        return c.v25;
      if (s.currentTime>90 || rel>.1)
        return c.v0;
      return '';
    },
  },
});

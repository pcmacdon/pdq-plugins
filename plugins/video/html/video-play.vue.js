"use strict";Pdq.component("video-play",{template:`
  <div>
    <b-container class="fluid no-gutters p-0">
    
      <b-row class="no-gutters w-100">
        <b-col>
          <div class="p-0 bg-info" >
          
            <b-dd ref="cmdBut" toggle-class="text-decoration-none border-0 p-0 ml-1 bg-info" no-caret v-on:hidden="settingsHidden">
            
              <template v-slot:button-content  >
                <span class="pdq-uicon2">&#9881;</span>
              </template>
              
              <b-dd-form class="sm" style="width:400px">
                <b-form-group class="mb-0">
                  <b-form-checkbox class="d-inline-block" v-model="Autoplay" title="Video automatically starts on load">Auto Play</b-form-checkbox>
                  <b-form-checkbox class="d-inline-block" v-model="Loop" title="Loop video play">Loop Play</b-form-checkbox>
                </b-form-group>
                
                <b-form-group label="Video-Fit" label-cols="3" class="mb-0">
                  <b-form-select cols="3"
                  v-model="objFit"
                  size="sm"
                  v-bind:options="aspectOptions" />
                </b-form-group>
                
                <b-form-group label="Volume" label-cols="3" class="mb-0">
                  <b-form-input ref="volPick" v-model="Volume"
                    type="range" number min="0" max="1" step="0.01"
                  />
                </b-form-group>
                
                <b-form-group label="Speed" label-cols="3" class="mb-0">
                  <b-form-input ref="rate" v-model="PlaybackRate"
                    type="range" number min="0" max="10" step="0.1"
                  />
                  {{PlaybackRate}}
                </b-form-group>
        
                <b-form-group label="Position" label-cols="3" class="mb-0">
                  <b-form-input ref="volPick" v-model="Position"
                    type="range" number min="0" max="1" step="0.01"
                  />
                </b-form-group>
        
              </b-dd-form>
          
            </b-dd>
            <span title="Pause toggle: keyboard shortcut 'p'" v-on:click="CtlOp('pause')" >
              <span v-if="playing" class="pl-1 pdq-uicon" >&#9199;</span>
              <span v-else class="pl-1 pdq-uicon" >&#9654;</span>
            </span>
            <span title="Mute toggle: keyboard shortcut 'm''" v-on:click="CtlOp('mute')" >
              <span v-if="Muted" class="pl-1 pdq-uicon0" >&#128263;</span>
              <span v-else class="pl-1 pdq-uicon0" >&#128265;</span>
            </span>
            <span v-bind:disabled="playing" title="Run external Player"  v-on:click="RunInVLC" class="pl-1 pdq-uicon0">&#128191;</span>
            <span title="Exit and up to list" v-on:click="CtlOp('exitup')" class="pl-1 pdq-uicon">&#9650;</span>
            <span title="Exit and go back" v-on:click="CtlOp('exitback')" class="pl-1 pdq-uicon">&#9167;</span>
            <span class="px-1">{{fname}}</span>
          </div>
        </b-col>
      </b-row>
      <b-row class="no-gutters w-100">
        <b-col class="">
          
          <video ref="myvid" controls class="w-100" preload="metadata"
            v-bind:autoplay="Autoplay" v-bind:muted="Muted" v-bind:loop="Loop"
            v-on="{ pause:EV,  play:EV, loadedmetadata:EV, volumechange:EV, progress:Progress, }"
            v-on:keypress="Key" v-on:keydown.delete="Key"
            style="{cursor:cursor, object-fit:objFit}"
            >
           <source v-bind:src="Vurl" v-on:error="failLoad" />
           <track v-bind:src="vsubs" kind="captions" v-on:error="failTrack"/>
          </video>
        </b-col>
      </b-row>
      <b-row class="">
        <b-col>
        </b-col>
      </b-row>
    </b-container>
    
    <b-modal v-model="showModDialog" v-on:ok="doAbort">Ok to abandon modifications?</b-modal>
    <b-modal v-model="showHelp" title="Keyboard Shortcuts" hide-footer size="lg" >
      <b-table hover small responsive head-variant="dark" v-bind:fields=keyFields v-bind:items="keyItems" responsive="sm" class="shadow">
        <template v-slot:cell(show_details)="row">
          <b-button size="sm" v-on:click="row.toggleDetails" class="mr-2">
            Modify
          </b-button>
        </template>
          
        <template v-slot:row-details="row">
          <b-card>
            <b-row class="mb-2">
              <b-col sm="3" class="text-sm-right"><b>Key:</b></b-col>
              <b-col><b-form-input v-model="row.item.key"></b-form-input></b-col>
            </b-row>
      
          </b-card>
        </template>
        
      </b-table>
    </b-modal>
  </div>
`
,
  props: {path:{type:String, default:''} },
  data:function() {
    var opts = {
      useSubs:true,
      fpath:null, epath:null,
      fname:'',
      showModDialog:false, text:'',
      ismodified:false, nextlink:null, 
      mdWid:400, mdHi:460, tvWid:450, tvHi:400,
      subExts:null,
      Vurl:'',
      vsubs:'',
      videoInfo:null,
      haveCORS:false,
      info:'', vinfo:'',
      lang:'en',
      playing:false,
      vidEl:null,
      cursor:'default',
      showHelp:false,
      keyFields: [
        { key:'show_details', label:'Update', class:'py-0' },
        { key:'key', class:'py-0' },
        { key:'action', class:'py-0' },
        ],
      keyItems:[
        {key:'Backspace', cmd:'exitback', action:'Exit player'},
        {key:'f', cmd:'fullscreen', action:'Fullscreen'},
        {key:'m', cmd:'mute', action:'Mute audio toggle'},
        {key:'p', cmd:'pause', action:'Pause/play toggle'},
        {key:'c', cmd:'captions', action:'Captions toggle'},
        {key:'-', cmd:'vminus', action:'Decrease volume'},
        {key:'+', cmd:'vplus', action:'Increase volume'},
        {key:'<', cmd:'pminus', action:'Decrease playback rate'},
        {key:'>', cmd:'pplus', action:'Increase playback rate'},
        {key:'/', cmd:'preset', action:'Reset playback rate'},
        {key:',', cmd:'fminus', action:'Step forward 5 seconds'},
        {key:'.', cmd:'fplus', action:'Step back 5 seconds'},
        {key:'a', cmd:'aspect', action:'Next video aspect (for fullscreen)'},
        {key:'h', cmd:'help', action:'Display this help'},
      ],
      keyTbl:{},
      keyTblDelta:'',
      PlaybackRate:1,
      Muted:false, Loop:false,
      Autoplay:false,
      Volume:1,
      Position:0,
      progCnt:0,
      objFit:'contain',
      aspectOptions:['fill', 'cover', 'contain'],
    };
    opts.keyItems.forEach(function (f) { opts.keyTbl[f.key]=f.cmd; });
    return opts; 
  },
  mounted:function() {
    this.metaLoaded = false;
    this.text = '';
    this.progCnt = 0;
    this.showModDialog = this.ismodified = false;
    this.playing = false;
    var v = this.$refs.myvid;
    v.focus();
    this.doLoadFile(this.$route.params.path);
  },
  beforeRouteUpdate:function(to, from, next) {
    this.doLoadFile(to.params.path);
    next();
  },
  beforeRouteLeave:function(to, from, next) {
    var ismod = this.docModified;
    this.nextlink = to;
    if (!ismod)
      next();
    else {
      this.showModDialog = true;
    }
  },
  methods: {
    $pdqBreak:function  $pdqBreak() {debugger;},
    dputs:function() {
    },
    keyRegen:function() {
      var keyTbl = {};
      this.keyItems.forEach(function(f) { keyTbl[f.key]=f.cmd; }); 
      this.keyTbl = keyTbl;
    },
    settingsHidden:function() {
      var v = this.$refs.myvid;
      setTimeout(function () { v.focus(); }, 500);
    },
    CtlOp:function(key) {
      var i, v = this.$refs.myvid;
      switch (key) {
        case 'help': this.showHelp = true; break;
        case 'exitback':
          v.pause();
          var vdur = v.duration, vct = v.currentTime;
          if (this.Position) {
            if (isNaN(v.duration)) {
              vdur = 100;
              vct = this.Position*100;
            } else {
              vct = this.Position * v.duration;
            }
          }
          this.updatePos(vct, vdur);
          this.$router.go(-1);
          break;
        case 'exitup':// TODO: if up is list, just go back
          v.pause();
          this.updatePos(v.currentTime, v.duration);
          var ldir = this.fpath;
          i = ldir.lastIndexOf('/');
          if (i>=0) {
            ldir = ldir.substr(0, i);
            ldir = encodeURIComponent(ldir);
            this.$pdqPush('List/'+ldir);
          }
          break;
        case 'pause': 
          this.playing=(v.paused?true:false);
          if (this.playing) v.play();
          else v.pause();
          break;
        case 'mute':   this.Muted=(v.Muted = !v.Muted); break;
        case 'pplus':  this.PlaybackRate = (v.playbackRate *= 2); break;
        case 'pminus': this.PlaybackRate = (v.playbackRate *= .5); break;
        case 'preset': this.PlaybackRate = (v.playbackRate =  1); break;
        case 'vminus': this.volAdjust(-.05); break;
        case 'vplus':  this.volAdjust(.05); break;
        case 'fminus': if (v.currentTime>=5) v.currentTime-=5; break;
        case 'fplus':  if ((v.currentTime+5)<v.duration) v.currentTime+=5;  break;
        case 'captions': this.update_s_Subtitles(this.subttlSet()); break;
        case 'fullscreen': v.requestFullscreen(); break;
        case 'aspect': 
          var aa = this.aspectOptions, idx = aa.indexOf(this.objFit);
          idx = (idx+1)%aa.length;
          v.style['object-fit'] = this.objFit = aa[idx];
          break;
        case 'info': 
          this.$pdqSend('VideoInfo', {site:this.v_Site, path:this.epath});
          break;
      }
    },
    subttlSet:function(on) {
      var want, v = this.$refs.myvid;
      if (!v || !v.textTracks || !v.textTracks.length) return this.s_Subtitles;
      if (on === undefined) want = (v.textTracks[0].mode=='showing'?'hidden':'showing');
      else want = (on?'showing':'hidden');
      if (v.textTracks[0].mode != want)
        v.textTracks[0].mode = want;
      return (want=='showing'?true:false);
    },
    volAdjust:function(amt) {
      var v = this.$refs.myvid;
      this.Volume = (v.volume + amt);
      if (this.Volume>1) this.Volume = 1;
      else if (this.Volume<0) this.Volume = 0;
      v.volume = this.Volume;
      this.dputs("VOL:", this.Volume);
    },
    Key:function(event) {
      var key = event.key;
      var v = this.$refs.myvid;
      var op = this.keyTbl[key];
      if (op)
        this.CtlOp(op);
    },
    updatePos:function(pos, len) {
      if (!isNaN(len) && len !== null) {
        this.dputs("SEND UpdatePos", len);
        this.$pdqSend('UpdatePos', {duration:len, currentTime:pos, site:this.v_Site, path:this.fpath});
      }
    },
    EV:function(ev) {
      var key = ev.type;
      this.dputs("EV", key);
      var v = this.$refs.myvid;
      if (!v) v = this.vidEl;
      if (!v) return;
      switch (key) {
        case 'pause': case 'play': 
          this.dputs("p",key, v.currentTime,'/', v.duration);
          if (!v) return;
          this.playing = (key==='play');
          this.updatePos(v.currentTime, v.duration);
          this.cursor=(key!='play'?'default':'none');
          this.vidEl=v;
          break;
        case 'loadedmetadata':
          if (this.videoInfo) {
            this.metaLoaded = true;
            this.vidInfoSet(this.videoInfo);
          }
          else this.dputs("MISSED MD");
          break;
        case 'volumechange':
          this.Volume = v.volume;
          break;
        default: console.warn('unknown EV', key);
      }
    },
    vidInfoSet:function(val) {
      var v = this.$refs.myvid;
      this.dputs("SET TIME", val.currentTime);   
      if (val.currentTime !== undefined)
        v.currentTime = val.currentTime;
      if (this.s_Subtitles && !this.subExts)
        this.subttlSet(true);
      //if (this.Autoplay === true)
        //v.play();
    },
    doLoadFile:function(path) {
      if (!path)
        this.fpath = null;
      else {
        this.vsubs = '';
        var spath = path.split('|');
        this.epath = spath[0];
        var sp = this.fpath = decodeURIComponent(this.epath);
        var sbase = sp.slice(0, sp.lastIndexOf('.'));
        var lio = sp.lastIndexOf('/');
        this.fname = (lio>=0?sp.slice(lio+1):sp);
        this.videoInfo = null;
        if (!this.v_Site)
          return;
        if (this.fpath) {
          this.Vurl = this.v_Site + this.fpath;
          this.$pdqSend('LoadVideo', {site:this.v_Site, path:this.fpath});
        }
        if (!this.useSubs)
          return;
        var se = spath.slice(1).filter(function(n) { return n.toLowerCase(); });
        this.subExts = se;
        this.dputs('SEXTS', this.subExts);
        var sel = null;
        if (se.length) {
          var tlang = this.lang;
          if (tlang != '')
            sel = se.find(function(name) { return name == tlang+'.srt'; });
          if (!sel)
            sel = se.find(function(name) { return name == 'srt'; });
        }
        if (sel) {
          this.dputs("Load Captions $pdqSend:",sel);
          var url = sbase+'.'+sel, that = this;
          if (!this.haveCORS)
            this.$pdqSend('LoadCaptions', {site:this.v_Site, path:url});
          else
            Jsish.getUrl(this.v_Site + url, function(d) { that.s_CaptVal = d; });
        }
            
      }
    },
    doIndent:function(event) {
      var nv = IndentSel( event);
      if (nv)
        this.text = nv;
    },
    Progress:function() {
      this.progCnt++;;
    },
    changed:function(event) {
      //this.text2 = event.target.innerHTML.trim();
    },
    doAbort:function() {
      this.ismodified = false;
      this.$router.push(this.nextlink);
    },
    Dlg:function(op) {
      this.showModDialog = false;
      switch (op) {
        case 'save':
          this.saveFile();
        case 'discard':
          this.ismodified = false;
          this.$router.push(this.nextlink);
          break;
        case 'close': break;
        default: console.warn('unknown op: '+op);
      }
    },
    RunInVLC:function() {
      if (this.Vurl == '')
        this.$bvToast.toast('empty url');
      else
        this.$pdqSend('RunInVLC', {site:this.v_Site, path:encodeURI(this.fpath)});
    },
    failLoad:function(e) {
      if (!this.v_Site) return;
      this.$bvToast.toast('Video error: try VLC', { title: 'Video', autoHideDelay: 3000 });
    },
    failTrack:function(e) {
      this.$bvToast.toast('Video track error:', { title: 'Track', autoHideDelay: 3000 });
      //this.RunInVLC();
    },
    sitePush:function() {
      if (!this.v_Site || !this.fpath)
        return;
      this.Vurl = this.v_Site + this.fpath; 
      this.dputs("Vurl", this.Vurl);      
    },
    /*srt2vtt_:function *srt2vtt_(data) {
    
       function convertSrtCue(caption) {
        var cue = "";
        var s = caption.split(/\n/);
        while (s.length > 3) {
          for (var i = 3; i < s.length; i++) {
            s[2] += "\n" + s[i];
          }
          s.splice(3, s.length - 3);
          }
          var line = 0;
          if (!s[0].match(/\d+:\d+:\d+/) && s[1].match(/\d+:\d+:\d+/)) {
          cue += s[0].match(/\w+/) + "\n";
          line += 1;
          }
          if (!s[line].match(/\d+:\d+:\d+/))
          return '';
          var m = s[1].match(/(\d+):(\d+):(\d+)(?:,(\d+))?\s*--?>\s*(\d+):(\d+):(\d+)(?:,(\d+))?/);
          if (!m) return "";
          cue += m[1]+":"+m[2]+":"+m[3]+"."+m[4]+" --> "
            +m[5]+":"+m[6]+":"+m[7]+"."+m[8]+"\n";
          line += 1;
    
          if (s[line])
          cue += s[line] + "\n\n";
          return cue;
      }
      var clst = data.replace(/\r+/g, '').replace(/^\s+|\s+$/g, '').split('\n\n');
      var result = "WEBVTT\n\n";
      for (var i=0; i<clst.length; i++)
        result += convertSrtCue(clst[i]);
      result = unescape(encodeURIComponent(result));
      puts('RES', result);
      return result;
    },*/
      
    srt2vtt:function  srt2vtt(data) {
      function convertSrtCue2(caption) {
        var srtxt = caption.split("\n"),  txt = "WEBVTT\n";
        for (var i=0; i<srtxt.length; i++) {
          if (srtxt[i].match(/[0-9]+:[0-9]+:[0-9]+,[0-9]+\s-->\s[0-9]+:[0-9]+:[0-9]+,[0-9]+/g))
            txt = txt + srtxt[i].replace(/,/g,".") + "\n";
          else
            txt = txt + srtxt[i] + "\n";
        }
      return txt;
      }
      var result = convertSrtCue2(data);
      result = unescape(encodeURIComponent(result));
      puts('RES', result.substr(0,100));
      return result;
    },
  },
  computed: {
    docModified:function() {
      if (this.ismodified)
        return true;
      return false;
    },
    vtype:function() {
      if (!this.fpath) return "";
      var vtl = this.fpath.split('.');
      var vte = vtl[vtl.length-1];
      if (vte == 'mkv') vte = 'mpg';
      return "video/"+vte;
    },
    Poster:function() {
      return "images/loading.jpg";
    },
  },
  watch: {
    s_CaptVal:function  s_CaptVal(val) {
        var cval = this.srt2vtt(val);
        this.vsubs = 'data:text/vtt;base64,'+btoa(cval);
        if (this.s_Subtitles)
        this.subttlSet(true);

    },
    v_Site:function  v_Site(val, old) {
      this.dputs("WATCH SITE", val, old);
      if (val && val != old)
        this.CtlOp('exitback');
        
    },
    s_Subtitles:function  s_Subtitles() {
    },
    s_VideoInfo:function  s_VideoInfo(val) {
      this.dputs("WATCH videoInfo", this.metaLoaded, val);
      if (0 && val === {}) {
        //if (this.autoPlay)
          //this.$refs.myvid.play();
        return;
      }
      if (this.metaLoaded || !val || val.currentTime<=0) return;
      this.videoInfo = val;
      this.vidInfoSet(val);
    },
    PlaybackRate:function() {
      var v = this.$refs.myvid;
      v.playbackRate = this.PlaybackRate;
    },
    text:function(val) {
      if (this.text === '')
        return;
    },
  },
});

"use strict";Pdq.component("video-history",{template:`
  <div>
    <b-card>
    <b-modal v-model="showModDialog" v-on:ok="doApply">Confirm Apply!</b-modal>
   
    <b-container fluid="md">
    
      <b-row>
        <b-col cols="3">
          <b-form-group
            label="Rows"
            label-cols-sm="8"
            label-cols-md="6"
            label-cols-lg="4"
            label-align-sm="right"
            label-size="sm"
          >
          <b-form-select
            v-model="perPage"
            size="sm"
            v-bind:options="pageOptions"
            ></b-form-select>
          </b-form-group>
        </b-col>
        <b-col>
          <b-pagination
            v-model="currentPage"
            v-bind:total-rows="maxRows"
            v-bind:per-page="perPage"
          >
          </b-pagination>
        </b-col>
        <b-col col md="4">
            <b-form-input
              v-model="filter"
              type="search"
              placeholder="Type to Search"
              v-on:keyup.enter="doFilter"
          ></b-form-input>
        </b-col>
      </b-row>
    
      <b-table striped hover v-bind:items="s_historyRows" v-bind:fields="lfields" small bordered head-variant="light"
        class="shadow"
        sort-icon-left
        no-local-sorting
        v-bind:foot-clone="s_historyRows.length>8"
        v-bind:sort-by.sync="sortBy"
        v-bind:sort-desc.sync="sortDesc"
        v-bind:sort-direction="sortDirection"
      >
        <template v-slot:head(rowid)="data">
          <b-form-checkbox  v-model="checkedAll" v-on:change="selectAll">
          </b-form-checkbox>
        </template>
        <template v-slot:cell(rowid)="data">
          <b-form-checkbox  v-model="checkedNames" v-bind:value="data.item.rowid" v-bind:id="''+data.item.rowid">
          </b-form-checkbox>
        </template>
        <template v-slot:cell(path)="data">
          <router-link v-bind:to="'/video/play/'+encodeURIComponent(data.value)">{{ data.value }}</router-link>
        </template>
        <template v-slot:cell(lastTime)="data">
          <span>{{ data.value }}</span>
        </template>
      </b-table>
    
      <b-row class="my-1">
        <b-col cols="3">
          <transition enter-active-class="animated fadeIn" leave-active-class="animated fadeOut" mode="out-in">
            <b-input-group  size="sm" v-if="this.checkedNames.length">
              <b-input-group-append>
                <b-button v-on:click="Apply" v-bind:disabled="bulkAction===null || !this.checkedNames.length">Bulk</b-button>
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
 data:function() {
    return {
      show:false,
      currentPage:1, perPage:5,
      maxRows:0,
      pageOptions:[1, 5, 10, 15, 20, 30, 50, 100],
      filter:'',
      checkedNames:[], checkedAll:false,
      bulkAction:null, filterBy:'', dontshow:false, 
      applyLst:[],
      showModDialog:false,
      bulkOptions:[
          { value: null, text: '' },
          { value: 'Delete', text:'Delete' },
        ],
      lfields: [
        {key:'rowid', label:'', thStyle:'width:0.1em;' },
        {key:'lastTime', label:'Date',  sortable:true, sortDirection: 'desc' },
        {key:'path',   label:'name', sortable:true },
      ],
      sortBy: 'lastTime',
      sortDesc: true,
      sortDirection: 'asc',
    };
  },
  watch: {
   currentPage:function(val) { this.doListHist(); },
   sortDesc:function(val) { this.doListHist(); },
   sortBy:function(val) { this.doListHist(); },
   perPage:function(val) { this.doListHist(); },
   forceList:function(val) { this.doListHist(); },
   filter:function(val) {
      if (!this.filter.length)
        this.doListHist();
    },
  },
 mounted:function() {
    this.showModDialog = false;
    this.doListHist();
  },
  methods: {
   $pdqbreak: function() {debugger;},
   doFilter:function() {
      this.doListHist();
    },
   doListHist:function() {
      if (this.v_Site)
        this.$pdqSend('List', {max:this.perPage, page:this.currentPage,
          filter:this.filter, sortBy:this.sortBy, sortDesc:this.sortDesc, site:this.v_Site});
    },
   Apply:function() {
      var call = [], rows = this.s_historyRows;
      for (var i in rows) {
        var it = rows[i];
        if (this.checkedNames.indexOf(it.rowid)>=0)
          call.push(rows[i].rowid);
      }
      this.applyLst = call;
      this.showModDialog = true;
    },
   doApply:function() {
      this.$pdqSend('Apply', {op:this.bulkAction,rowids:this.applyLst});
    },
   Filter:function() {
    },
   selectAll:function(on) {
      if (!on) {
        this.checkedNames = [];
      } else {
        var call = [], rows = this.s_historyRows;
        for (var i in rows)
          call.push(rows[i].rowid.toString());
        this.checkedNames = call;
      }
    },
   getTitle:function(row) {
      if (!row.timestamp)
        return '';
      return row.timestamp+' UTC: Update=' + row.timeupdated;
    },
  },
});

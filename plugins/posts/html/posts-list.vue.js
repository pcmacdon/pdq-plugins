"use strict";Pdq.component("posts-list",{template:`
  <div>
    <b-card>
      <b-modal v-model="showModDialog" v-on:ok="doApply">Confirm Apply!</b-modal>
      <b-container fluid="md">
        <b-row>
          <b-col cols="3">
            <b-input-group prepend="Rows" v-if="showPerPage">
              <b-form-select v-model="v_t_rowsPerPage" v-bind:options="s_t_rowsPerPageList"/>
            </b-input-group>
          </b-col>
          <b-col>
            <b-pagination v-if="totalRows>v_t_rowsPerPage"
              v-model="currentPage"
              v-bind:total-rows="totalRows"
              v-bind:per-page="v_t_rowsPerPage"
            />
          </b-col>
          <b-col col md="4">
            <b-form-input
              v-model="filter"
              type="search"
              placeholder="Type to Search"
              v-on:keyup.enter="doFilter"
            />
          </b-col>
        </b-row>
  
        <b-table striped hover v-bind:items="rows" v-bind:fields="lfields" small bordered head-variant="light"
          class="shadow"
          sort-icon-left
          no-local-sorting
          v-bind:foot-clone="rows.length>8"
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
          <template v-slot:cell(title)="data">
              <router-link v-bind:to="'/posts/view/'+data.item.rowid">{{ data.value }}</router-link>
          </template>
          <template v-slot:cell(author)="data">
              <router-link v-bind:to="'/admin/users/'+data.value">{{ data.value }}</router-link>
          </template>
          <template v-slot:cell(date)="data">
              <span v-bind:title="getTitle(data.item)">{{ data.value }}</span>
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
  data: function() {
    return {
      rows:[], totalRows:0,
      show:false,
      currentPage:1,
      filter:'',
      checkedNames:[], checkedAll:false,
      bulkAction:null, filterBy:'', dontshow:false, 
      applyLst:[],
      showModDialog:false,
      showPerPage:true,
      bulkOptions:[
          { value: null, text: '' },
          { value: 'Delete', text:'Delete' },
        ],
      lfields: [
        {key:'rowid', label:'', thStyle:'width:0.1em;' },
        {key:'title',   sortable:true },
        {key:'author',  sortable:true },
        {key:'date',  sortable:true, sortDirection: 'desc' },
      ],
      sortBy: 'date',
      sortDesc: false,
      sortDirection: 'asc',
    };
  },
  watch: {
    currentPage:  function(val) { this.doListPost(); },
    sortDesc:     function(val) { this.doListPost(); },
    sortBy:     function(val) { this.doListPost(); },
    v_t_rowsPerPage:    function(val) { this.doListPost(); },
    filter: function(val) {
      if (!this.filter.length)
        this.doListPost();
    },
    s_updated: function(val) {
      if (!val) return;
      this.doListPost();
    },
    t_data: function(val) {
      this.rows = val.rows;
      this.totalRows = val.cnt;
    },
  },
  mounted: function() {
    this.showModDialog = false;
    this.doListPost();
  },
  methods: {
    $pdqBreak:function() {debugger;},
    doFilter: function() {
      this.doListPost();
    },
    doListPost: function() {
      this.$pdqSend('Index', {max:this.v_t_rowsPerPage, page:this.currentPage,
        filter:this.filter, orderby:this.sortBy, orderdesc:this.sortDesc});
    },
    Apply: function() {
      var call = [];
      for (var i in this.rows) {
        var it = this.rows[i];
        if (this.checkedNames.indexOf(it.rowid)>=0)
          call.push(this.rows[i].rowid);
      }
      this.applyLst = call;
      this.showModDialog = true;
    },
    doApply: function() {
      switch (this.bulkAction) {
        case 'Delete':
          this.$pdqSend('Delete', {rowids:this.applyLst});
          break;
      }
    },
    Filter: function() {
    },
    selectAll: function(on) {
      if (!on) {
        this.checkedNames = [];
      } else {
        var call = [];
        for (var i in this.rows)
          call.push(this.rows[i].rowid.toString());
        this.checkedNames = call;
      }
    },
    getTitle: function(row) {
      if (!row.timestamp)
        return '';
      return row.timestamp+' UTC: Update=' + row.timeupdated;
    },
  },
});

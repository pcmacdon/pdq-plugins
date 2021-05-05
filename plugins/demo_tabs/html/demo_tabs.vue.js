"use strict";Pdq.component("demo_tabs",{template:`
  <b-container fluid>
    <b-card no-body>
    <b-tabs ref="mytabs" card v-model="v_tabIndex" v-on:changed="changedTab" v-on:input="inputTab">
      <b-tab title="Welcome" active>
       <b-card class="mx-auto w-75">
        <b-jumbotron bg-variant="info" text-variant="white" border-variant="dark">
        <template v-slot:header>PDQ = Vue + Jsi</template>
      
        <template v-slot:lead>
          <transition enter-active-class="animated fadeIn" mode="in-out"
          v-on:after-enter="ShowLev=true"
          >
            <p v-if="ShowTop">
              Server-side scripting with Websockets & Sqlite
            </p>
          </transition>
        </template>
      
        <hr class="my-4">
      
        <transition enter-active-class="animated bounce" mode="in-out">
          <p v-if="ShowLev">
           Plus low-level access to C.
          </p>
        </transition>
        </b-jumbotron>
      </b-card>
    
      </b-tab>
      <b-tab title="Stuff">
      <b-card>
      
        <div>
          <router-link v-bind:to="'/#'">Home</router-link> /
          <router-link id="XX1" v-bind:to="'/#'">Base</router-link>
          <b-popover target="XX1" triggers="hover" placement="bottom">
            <template v-slot:title>Popover Title</template>
          Hi man
          </b-popover>
        </div>
        <demo_tabs-main-subslot>
          <template #b>Smaller</template>
          <template #a>Bigger</template>
        </demo_tabs-main-subslot>
        <label for="example-datepicker">Choose a date</label>
        <b-form-datepicker id="example-datepicker" v-model="value" class="mb-2"></b-form-datepicker>
        <p>Value: '{{ value }}'</p>
        <b-card title="Card Title"
            style="max-width:20em"
            class="mb-2" outline-variant="danger" inverse>
          <p class="card-text">
          Some quick example text to build on the card title.
          </p>
          <b-button href="#" variant="primary">Go somewhere</b-button>
        </b-card>
        <span>
          <b-button v-b-toggle.logDropdown>Toggle Side</b-button>
          <b-button v-b-toggle.logDropdown>Toggle Side</b-button>
          <b-sidebar id="logDropdown">
            <b-card>
            Hi
            <b-button>Do Something</b-button>
            </b-card>
          </b-sidebar>
        </span>
  
      </b-card>
      </b-tab>
      
      
      <b-tab title="Graph">
      <b-card>
        <button v-on:click="fillData()">Randomize</button>
        <line-chart v-bind:chart-data="datacollection" style="max-width:500px;"/>
      </b-card>
      </b-tab>
   
       <b-tab title="Draggable">
      <b-card>
        <draggable v-model="myArray" v-on:start="drag=true" v-on:end="drag=false">
           <b-card v-for="element in myArray" v-bind:key="element.id">{{element.name}}</b-card>
        </draggable>
        {{myArray}}
       </b-card>
      </b-tab>
      
       <b-tab title="Draggable2">
      <b-container>
      <b-row>
      <b-col>
        <h3>List 1</h3>
        <draggable class="list-group" v-bind:list="list1" group="people" v-on:change="log">
        <div
          class="list-group-item"
          v-for="(element, index) in list1"
          v-bind:key="element.name"
        >
          {{ element.name }} {{ index }}
        </div>
        </draggable>
      </b-col>
    
      <b-col>
        <h3>List 2</h3>
        <draggable class="list-group" v-bind:list="list2" group="people" v-on:change="log">
        <div
          class="list-group-item"
          v-for="(element, index) in list2"
          v-bind:key="element.name"
        >
          {{ element.name }} {{ index }}
        </div>
        </draggable>
      </b-col>
      </b-row>
      </b-container>
      </b-tab>
    </b-tabs>
    </b-card>
    
  </b-container>
`
,
 data:function() {
    // TODO: refactor
    return {
      toastCount:0,
      value:'',
      datacollection: null,
      ShowLev:false, ShowTop:false,
      loadedLC:false,
      drag:false,
      myArray:[
        {name:'Able', order:1, fixed:true},
        {name:'Baker', order:2, fixed:false},
        {name:'Charlie', order:3, fixed:false}
      ],
      list1: [
        { name: "John", id: 1 },
        { name: "Joao", id: 2 },
        { name: "Jean", id: 3 },
        { name: "Gerard", id: 4 }
        ],
      list2: [
        { name: "Juan", id: 5 },
        { name: "Edgard", id: 6 },
        { name: "Johnson", id: 7 }
        ]
    };
  },
 beforeMount:function() {
    if (!this.loadedLC)
      this.loadLineChart();
  },
 mounted:function() {
    this.fillData();
    this.ShowTop=true;
  },
  watch: {
   v_tabIndex:function v_tabIndex(val) {
      if (val) {
        this.ShowTop = this.ShowLev = false;
      } else {
        this.ShowTop = true;
        this.ShowLev = false;
      }
    },
  },
  methods: {
   $pdqbreak: function() {debugger;},
   makeToast:function(append) {
      this.toastCount++;
      this.$bvToast.toast(`This is toast number ${this.toastCount}`, {
        title: 'BootstrapVue Toast',
        autoHideDelay: 10000,
        appendToast: append
      });
    },
   log:function() {
      puts("LOG");
    },
   fillData:function() {
      this.datacollection = {
        labels: [this.getRandomInt(), this.getRandomInt()],
        datasets: [
          {
            label: 'Data One',
            backgroundColor: '#f87979',
            data: [this.getRandomInt(), this.getRandomInt()]
          }, {
            label: 'Data One',
            backgroundColor: '#f87979',
            data: [this.getRandomInt(), this.getRandomInt()]
          }
          ]
        };
    },
   getRandomInt:function() {
      return Math.floor(Math.random() * (50 - 5 + 1)) + 5;
    },
    
   loadLineChart:function() {
      Vue.component('line-chart', {
        extends: VueChartJs.Line,
        mixins: [VueChartJs.mixins.reactiveProp],
        props: ['chart-data', 'options'],
       mounted:function() {
          this.renderChart(this.chartData, this.options);
        }
      });
      this.loadedLC = true;
    },
    changedTab:function(tids) {
      puts('tids', tids);
      this.v_tabTitle = tids[0].title;
    },
    inputTab:function(tid) {
      puts('tid', tid);
      var my = this.$refs.mytabs;
      this.v_tabTitle = my.tabs[tid].title;
    },
  },

  popts: {
    include: [
      "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.7.1/Chart.min.js",
      "https://unpkg.com/vue-chartjs/dist/vue-chartjs.min.js"
    ]
  }
});



Pdq.subcomponent("-top-nav",{template:`
    <b>Demo.{{v_tabTitle}}</b>
`
,
  methods: {
    $pdqbreak: function() {debugger;},
  },

});


Pdq.subcomponent("demo_tabs-main-subslot",{template:`
<div>
    <b>Hello </b>
    <slot name="a"></slot>
    ...plus...
    <slot name="b"></slot>
</div>
`
,
  methods: {
    $pdqbreak: function() {debugger;},
  },
});


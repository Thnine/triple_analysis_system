<template>
  <div id="app">
    <div class="container">
      <div class="left">
        <div class="top">
          <div class="comp-container" style="flex: 0 0 650px;border-right: 3px solid gray;">
            <div class="comp-title">社群信息河流图</div>
            <RiverView :InfoPanel="InfoPanelRef" @exportBrushTimeRange="handleRiverExportBrushTimeRange" ref="RiverView" @exportSelectedRiver="handleExportSelectedRiver" style="width:100%;height:100%;"></RiverView>
          </div>
          <div class="comp-container" style="flex: 1 1 0;">
            <div class="comp-title">社群成员迁移气泡图</div>
            <BubbleChartView :InfoPanel="InfoPanelRef" ref="BubbleChartView"></BubbleChartView>
          </div>
        </div>
        <div class="bottom">
          <div class="comp-container" style=" border-right: 3px solid gray;flex:0 0 650px;display:flex;align-items:center;justify-content:center">
            <div class="comp-title">属性雷达视图</div>
            <RadvizView :InfoPanel="InfoPanelRef" ref="RadvizView" @radar_selected_nodes="radar_selected_nodes" style="width:100%;height:100%;"></RadvizView>
          </div>
          <div class="comp-container" style="flex:1 1 0">
            <div class="comp-title">节点连接图</div>
            <fdView :InfoPanel="InfoPanelRef" ref="fdView" style="width:100%;height:100%" @exportChosenNodes="handleExportChosenNodes"/>
          </div>
        </div>
      </div>
      <div class="right">

        <div class="comp-container">
          <div class="comp-title">阈值</div>
          <ControllerView ref="ControllerView" @drawSeq='drawSeq'></ControllerView>
        </div>
        <div class="comp-container" style="flex:1 1 0;display:flex;flex-direction:column;align-items:stretch;margin-top:5px;">
          <div class="comp-title">大规模行为序列视图</div>
          <div class="search-container">
            <el-autocomplete
              style="width:220px;"
              size="mini"
              placeholder="请输入节点IP"
              v-model="searchText"
              :fetch-suggestions="querySearch">
              <el-button slot="prepend" icon="el-icon-search" ></el-button>
            </el-autocomplete>
            <el-button size="mini" style="margin-left:15px;" type="primary" @click="handleSearchNode">检索</el-button>
            <el-button size="mini" type="danger"  @click="handleClearSearchList">清空</el-button>
          </div>
          <SequenceView @exportBrushIds="handleExportBrushIds" style="flex:1 1 0;margin-top:40px;margin-right:20px;" 
            ref="SequenceView"/>
        </div>
      </div>
    </div>
    <InfoPanel ref="InfoPanel"/>
  </div>
</template>

<script>
import BubbleChartView from './components/BubbleChartView.vue';
import RadvizView from './components/RadvizView.vue';
import ControllerView from './components/ControllerView.vue';
import SequenceView from './components/SequenceView/SequenceView.vue'
import fdView from './components/fdView/fdView.vue'
import RiverView from './components/RiverView.vue';
import InfoPanel from "./components/InfoPanel.vue";

import * as d3 from 'd3';
import Vue from 'vue'
import {Input,Autocomplete,Message} from 'element-ui'

Vue.component(Input.name,Input)
Vue.component(Autocomplete.name,Autocomplete)



export default {
  name: 'App',
  components: {
    RadvizView,
    ControllerView,
    SequenceView,
    fdView,
    BubbleChartView,
    RiverView,
    InfoPanel,
  },
  data(){
    return {
      searchText:"",
      searchSuggestions:[],
      searchList:[],
      nodes:[],//节点信息
      InfoPanelRef:null
    }
  },
  methods:{
    //获取建议
    querySearch(queryString,cb){
      let nodes = this.nodes;
      let results = queryString ? nodes.filter(this.searchFilter(queryString)).map(v=>{return {'value':v.ip}}) : nodes.map(v=>{return {'value':v.ip}});
      cb(results)
    },
    searchFilter(queryString){
      return (v)=>{
        return (v['ip'].toLowerCase().indexOf(queryString.toLowerCase()) === 0);
      }
    },

    /**
     * handle
     */

    //雷达图圈选点
    radar_selected_nodes(ids){
      //网络图高亮
      this.$refs['fdView'].highlightNodes(ids)
      //序列图高亮
      this.$refs['SequenceView'].setHighlight(ids)
    },

    handleExportBrushIds(ids){//序列图刷选
      this.$refs['fdView'].setFilter(ids)
      this.$refs['RadvizView'].set_seq_nodes(ids)
      
    },

    handleExportChosenNodes(ids){
      this.$refs['SequenceView'].setHighlight(ids);//测试接口

      this.$refs['RadvizView'].set_net_nodes(ids)
      
    },
    handleExportSelectedRiver(type){
      this.$refs['BubbleChartView'].typeSwitch(type)
    },

    handleRiverExportBrushTimeRange(timeRange){//RiverView导出时间范围
      //大规模序列视图过滤（仅针对时间排序）
      this.$refs['SequenceView'].setTimeFilter(timeRange);
      //力导引图时间过滤
      this.$refs['fdView'].setTimeFilter(timeRange);
      //雷达图时间过滤
      this.$refs['RadvizView'].setTimeFilter(timeRange);
    },


    handleSearchNode(){//搜索节点在各个视图中的位置（高亮）
      // Message({
      //   type:'success',
      //   message:'已经把目标节点添加到高亮列表中'
      // })
      this.searchList.push(this.searchText);
      this.searchText = "";
      //向节点连接图传递搜索节点
      this.$refs['fdView'].highlightGlobalSearchNodes(this.searchList);
      //向大规模序列视图传递搜索节点
      this.$refs['SequenceView'].highlightGlobalSearchNodes(this.searchList);
      //向雷达图传递搜索节点
      this.$refs['RadvizView'].highlightGlobalSearchNodes(this.searchList);
      //向河流图传递搜索节点
      this.$refs['RiverView'].highlightGlobalSearchNodes(this.searchList);


    },
    handleClearSearchList(){//清空搜索列表，并把这个消息传递给各个视图
      this.searchList.length = 0;
      //向节点连接图传递搜索节点
      this.$refs['fdView'].highlightGlobalSearchNodes(this.searchList);
      //向大规模序列视图传递搜索节点
      this.$refs['SequenceView'].highlightGlobalSearchNodes(this.searchList);
      //向雷达图传递搜索节点
      this.$refs['RadvizView'].highlightGlobalSearchNodes(this.searchList);
        //向河流图传递搜索节点
      this.$refs['RiverView'].highlightGlobalSearchNodes(this.searchList);

    },


    drawSeq(links,nodes){    //接受筛选完的数据，画大规模序列图
      this.$refs['SequenceView'].start(nodes,links);
    },
  },
  mounted(){
      //保存消息框的ref
      this.InfoPanelRef = this.$refs['InfoPanel'] 
      //载入数据
      d3.csv('static/event_class.csv',(err,rawEvent)=>{
        d3.csv('static/communication.csv',(err,rawCom)=>{
          d3.csv('static/ip_info.csv',(err,rawType)=>{
            //初始化
            this.searchText = "";
            this.searchList.length = 0;
            this.searchSuggestions.length = 0;
            //数据格式标准化
            for(let i = 0;i < rawEvent.length;i++){//rawEvent
              for(let key in rawEvent[i]){
                if(key == 'ip'){
                  rawEvent[i][key] = String(rawEvent[i][key])
                }
                else if(key == 'time'){
                  rawEvent[i][key] = String(rawEvent[i][key])
                }
                else{
                  rawEvent[i][key] = parseFloat(rawEvent[i][key])
                }
              }
            }
            for(let i = 0;i < rawCom.length;i++){//rawCom
              for(let key in rawCom[i]){
                if(key == 'source'){
                  rawCom[i][key] = String(rawCom[i][key])
                }
                else if(key == 'time'){
                  rawCom[i][key] = String(rawCom[i][key])
                }
                else if(key == 'target'){
                  rawCom[i][key] = String(rawCom[i][key])
                }
              }
            }
            for(let i = 0;i < rawType.length;i++){//rawType
              for(let key in rawType[i]){
                if(key == 'ip'){
                  rawType[i][key] = String(rawType[i][key])
                }
                else if(key == 'is_ship'){
                  rawType[i][key] = parseInt(rawType[i][key])
                }
                else if(key == 'ship_weight'){
                  rawType[i][key] = parseInt(rawType[i][key])
                }

              }
            }
            //将rawType整理为便于查询的字典
            let nodesInfo = {}
            for(let v of rawType){
              nodesInfo[v.ip] = {
                is_ship:v['is_ship'] == 1,
                weight:v['ship_weight']
              }
            }
            //将rawType中的节点保存
            this.nodes = JSON.parse(JSON.stringify(rawType))

            console.log('rawEvent:',rawEvent)
            console.log('rawCom:',rawCom)
            console.log('rawType:',rawType)

            //气泡图
            let bubble_data = []
            for(let i = 0;i < rawEvent.length;i++){
              let tempData = JSON.parse(JSON.stringify(rawEvent[i]))
              bubble_data.push(tempData)
            }
            this.$refs['BubbleChartView'].set_raw_data(bubble_data)
            
            //河流图
            let river_data = []
            for(let i = 0;i < rawEvent.length;i++){
              let tempData = JSON.parse(JSON.stringify(rawEvent[i]))
              tempData['node'] = tempData['ip']
              delete tempData['ip']
              river_data.push(tempData)
            }
            this.$refs['RiverView'].start(river_data)

            //雷达图
            let radar_data = []
            for(let i = 0;i < rawEvent.length;i++){
              let tempData = JSON.parse(JSON.stringify(rawEvent[i]))
              tempData['id'] = String(i)
              tempData['node'] = tempData['ip']
              delete tempData['ip']
              radar_data.push(tempData)
            }
            this.$refs['RadvizView'].set_raw_data(radar_data)

            //节点连接图
            let fdNodes_data = [] //包括了所有通信数据众的节点和info中节点
            let fdLinks_data = [] //包括了所有的通信数据
            let nodes_color = {};
            let fdNodesSet = new Set();
            for(let l of rawCom){
              fdNodesSet.add(l.source);
              fdNodesSet.add(l.target);
            }
            fdNodes_data = Array.from(fdNodesSet).map(v=>{
              return {
                'id':v,
                'is_ship':nodesInfo[v]['is_ship'],
                'weight':nodesInfo[v]['weight'],
                
              }
            })
            fdLinks_data = JSON.parse(JSON.stringify(rawCom))
            for(let i = 0;i < rawType.length;i++){
              let ip = rawType[i]['ip'];
              let is_ship = rawType[i]['is_ship']
              nodes_color[ip] = is_ship==1 ? '#1f8bd4' : '#b51c1c' //蓝 红 （注意修改fdView里面对应的）
            }
            this.$refs['fdView'].start(fdNodes_data,fdLinks_data,nodes_color)


            //阈值图
            let controlNodes = []
            let controlLinks = []
            let controlNodesSet = new Set();
            for(let l of rawCom){//过滤节点和边
              if(nodesInfo[l.source]['is_ship']){
                controlNodesSet.add(l.source)
              }
              if(nodesInfo[l.target]['is_ship']){
                controlNodesSet.add(l.target)
              }
              if(nodesInfo[l.source]['is_ship'] || nodesInfo[l.target]['is_ship']){
                controlLinks.push({
                  'source':l.source,
                  'target':l.target,
                  'time':l.time
                })
              }
            }
            controlNodes = Array.from(controlNodesSet).map(v=>{
              return {
                'id':v,
                'weight':nodesInfo[v].weight
              }
            })
            this.$refs['ControllerView'].generate_data_controller(controlNodes,controlLinks)

          })
        })
      })
  
  }
}
</script>

<style>

body{
  margin:0px;
}

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  width:100vw;
  height:100vh;
  display: relative;
}

.container{
  width:100%;
  height:100%;
  display:flex;
  align-items:stretch
}

.left{
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  margin-top:10px;
  margin-left:10px;
  margin-bottom:10px;
  border-top: 3px solid gray;
  border-bottom: 3px solid gray;
  border-left: 3px solid gray;
  align-items: stretch;
}
.right{
  flex: 0 0 605px;
  position:relative;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  margin-top:10px;
  margin-right:10px;
  margin-bottom:10px;
  border: 3px solid gray;
}


.top{
  flex: 0 0 310px;
  display: flex;
  align-items: stretch;

}

.bottom{
  border-top: 3px solid gray;
  flex: 1 1 0;
  display: flex;
  align-items: stretch;

}

.comp-title{
  position: absolute;
  left:15px;
  top:15px;
  font-size:20px;
  background-color:#837e7e;
  color:white;
  padding:5px;
  border-radius: 4px;
}

.comp-container{
  position: relative;
}
.search-container{
  position: absolute;
  right:30px;
  top:23px;
  display: flex;
  align-items: center;
}

/* .el-input__inner{
  border: black;
} */

/* .el-input-group__prepend{
  background: #409EFF;
  color:white;
  border:#409EFF
} */
</style>

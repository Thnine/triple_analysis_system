<template>
  <div id="app">
    <div class="container">
      <div class="left">
        <div class="top">
          <div class="comp-container" style="flex: 0 0 650px;">
            <div class="comp-title">社群信息河流图</div>
            <RiverView ref="RiverView" @exportSelectedRiver="handleExportSelectedRiver" style="width:100%;height:100%;"></RiverView>
          </div>
          <div class="comp-container" style="flex: 1 1 0;">
            <div class="comp-title">社群成员迁移气泡图</div>
            <BubbleChartView ref="BubbleChartView"></BubbleChartView>
          </div>
        </div>
        <div class="bottom">
          <div class="comp-container" style=" border-right: 3px solid gray;flex:0 0 650px;display:flex;align-items:center;justify-content:center">
            <div class="comp-title">属性雷达视图</div>
            <RadvizView ref="RadvizView" @radar_selected_nodes="radar_selected_nodes" style="width:100%;height:100%;"></RadvizView>
          </div>
          <div class="comp-container" style="flex:1 1 0">
            <div class="comp-title">节点连接图</div>
            <fdView ref="fdView" style="width:100%;height:100%" @exportChosenNodes="handleExportChosenNodes"/>
          </div>
        </div>
      </div>
      <div class="right">
        <div class="comp-container">
          <div class="comp-title">阈值</div>
          <ControllerView @drawSeq='drawSeq'></ControllerView>
        </div>
        <div class="comp-container" style="flex:1 1 0;display:flex;flex-direction:column;align-items:stretch;margin-top:5px;">
          <div class="comp-title">大规模行为序列视图</div>
          <SequenceView @exportBrushIds="handleExportBrushIds" style="flex:1 1 0;margin-top:40px;margin-right:20px;" 
            ref="SequenceView"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import BubbleChartView from './components/BubbleChartView.vue';
import RadvizView from './components/RadvizView.vue';
import ControllerView from './components/ControllerView.vue';
import SequenceView from './components/SequenceView/SequenceView.vue'
import fdView from './components/fdView/fdView.vue'
import RiverView from './components/RiverView.vue';

import * as d3 from 'd3';

export default {
  name: 'App',
  components: {
    RadvizView,
    ControllerView,
    SequenceView,
    fdView,
    BubbleChartView,
    RiverView
  },
  data(){
    return {

    }
  },
  methods:{
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
    drawSeq(links,nodes){    //接受筛选完的数据，画大规模序列图
      this.$refs['SequenceView'].start(nodes,links);
    },
  },
  mounted(){
    d3.json('static/faker_links（序列）.json',(links)=>{
      d3.json('static/faker_nodes（序列）.json',(nodes)=>{
        d3.json('static/bitcoins_dim_data.json',(coms)=>{
          /**生成一个假的nodes_color数据 */
          let nodes_color = {}
          for(let n of nodes){
            if(Math.random() < 0.1)
              continue;
            if(Math.random() < 0.3){
              nodes_color[n.id] = '#b51c1c'
            }
            else{
              nodes_color[n.id] = '#1f8bd4'
            }
          }
          //网络图
          this.$refs['fdView'].start(nodes,links,nodes_color);

          this.nodes = nodes
          this.links = links
          
          //雷达图
          let radar_data = []
          for(let i = 0;i < coms.length;i++){
            let tempData = JSON.parse(JSON.stringify(coms[i]))
            tempData['id'] = String(i)
            radar_data.push(tempData)
          }
          this.$refs['RadvizView'].set_raw_data(radar_data)

          //气泡图
          let bubble_data = []
          for(let i = 0;i < coms.length;i++){
            let tempData = JSON.parse(JSON.stringify(coms[i]))
            tempData['ip'] = tempData['node']
            delete tempData['node']
            bubble_data.push(tempData)
          }
          this.$refs['BubbleChartView'].set_raw_data(bubble_data)

          //河流图
          let river_data = []
          for(let i = 0;i < coms.length;i++){
            let tempData = JSON.parse(JSON.stringify(coms[i]))
            river_data.push(tempData)
          }
          this.$refs['RiverView'].start(river_data)

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

</style>

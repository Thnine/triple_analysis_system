<template>
    <div style="position:relative">
        <div style="position:absolute;right:20px;top:25px;">


            数据集:
            <el-select v-model="filterFlag" @change="handleFilterFlagChange" size="mini" style="margin-right:20px;width:150px;">
                <el-option :label="'全部数据'" :value="'all'"/>
                <el-option :label="'行为序列筛选'" :value="'filter'"/>
            </el-select>

            <el-switch
                v-model="timeFilterFlag"
                active-text="时间过滤"
                @change="handleTimeFilterFlagChange"
                style="margin-right:20px;">
            </el-switch>

            <el-radio-group v-model="mouseMode" @input="swithMouseMode()" size="mini">
                <el-radio-button label="放缩"></el-radio-button>
                <el-radio-button label="圈选"></el-radio-button>
            </el-radio-group>
        </div>
        <!--悬浮信息版-->
        <InfoPanel :style="InfoPanelStyle" v-show="InfoPanelVisible" ref="infoPanel"/>

        <svg ref="fdView-canvas" style="height:100%;width:100%"></svg>
    </div>
</template>



<script>
import * as d3 from 'd3'
import Vue from 'vue'
import Graph from 'graphology'
import {circular} from 'graphology-layout'
import FA2Layout from 'graphology-layout-forceatlas2/worker';

import lasso from "./d3-lasso"
import InfoPanel from "../InfoPanel.vue";
import {Select,Option,RadioGroup,RadioButton,Switch} from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import forceAtlas2 from 'graphology-layout-forceatlas2'


Vue.component(Select.name,Select)
Vue.component(Option.name,Option)
Vue.component(RadioGroup.name,RadioGroup)
Vue.component(RadioButton.name,RadioButton)
Vue.component(Switch.name,Switch)

export default {
    name:'fdView',
    components:{
        InfoPanel
    },
    data(){
        return {
            //数据项
            nodes:[],//完整的节点数据
            links:[],//完整的边数据
            filter:[],//过滤器
            timeFilter:[0,Infinity],//时间过滤器
            highlightIds:[],//高亮的节点id
            globalSearchIds:[],//全局搜索列表中的Id
            nodes_color:{//节点颜色

            },


            //配置项
            padding:{//内边距
                'top':80,
                'left':40,
                'right':40,
                'bottom':40,
            },
            nodeSize:6,//节点大小
            linkWidth:2,//边宽度
            baseNodeColor: 'black',//基础节点颜色（当nodes_color中没有该节点时）
            nodeExcludeColor:'gray',//节点被排除的颜色
            linkColor:'gray',//边颜色
            linkArrowColor:'#434343',//边箭头的颜色
            linkArrowSize:5,//边箭头大小

            //其他项
            filterFlag:'all',
            timeFilterFlag:true,//是否启用按照时间过滤的模式
            mouseMode:'放缩',
            zoom:null,
            lasso:null,
            swithMouseMode:()=>{return 1},

            //悬浮信息板相关
            InfoPanelVisible:false,
            InfoPanelStyle:{
                top:'0px',
                left:'0px'
            },//信息版的动态style
            
        }
    },
    methods:{
        start(nodes,links,nodes_color={}){
            //需要点数据nodes，格式为[{'id':'id1'},...]；
            //需要边数据links，格式为[{'source':'id1','target':'id15','time':'2020-11-04 04:00'},...],
            //需要节点颜色数据nodes_color，格式为{'id1':'red','id2':'blue',...}
            
            const self = this;

            //初始化
            self.nodes = [];
            self.links = [];
            self.filter = [];
            self.highlightIds = [];
            self.zoom = null;
            self.lasso = null;
            self.filterFlag = 'all';
            self.swithMouseMode = ()=>{return 1};
            self.nodes_color = {};

            self.nodes = JSON.parse(JSON.stringify(nodes))
            self.links = JSON.parse(JSON.stringify(links))
            self.nodes_color = JSON.parse(JSON.stringify(nodes_color))
            
            //绘图
            self.draw();

        },


        draw(){
            const self = this;
            const svg = d3.select(self.$refs['fdView-canvas'])
            const height = svg.node().getBoundingClientRect().height;
            const width = svg.node().getBoundingClientRect().width;

            //清空
            svg.selectAll('*').remove();


            //生成绘图数据以及过滤
            let nodes = JSON.parse(JSON.stringify(self.nodes))
            let links = JSON.parse(JSON.stringify(self.links))
            if(self.filterFlag == 'filter' && self.filter.length > 0){//filter过滤
                let new_nodesSet = new Set()
                let new_links = []
                for(let i = 0;i < nodes.length;i++){
                    let id = nodes[i].id;
                    if(self.filter.indexOf(id) != -1){
                        new_nodesSet.add(id)
                    }
                }
                for(let i = 0;i < links.length;i++){
                    let source = links[i].source;
                    let target = links[i].target;
                    if(self.filter.indexOf(source) != -1 || self.filter.indexOf(target) != -1){
                        new_links.push(links[i]);
                        new_nodesSet.add(source);
                        new_nodesSet.add(target);
                    }
                }
                let new_nodes = nodes.filter((v)=>{
                    return new_nodesSet.has(v.id)
                })

                nodes = new_nodes;
                links = new_links
            }   
            if(self.timeFilterFlag){//timeFilter过滤
                let new_links = links.filter((link)=>{//new links
                    let timestamp = Date.parse(link.time)
                    if(timestamp >= self.timeFilter[0] && timestamp <= self.timeFilter[1]){
                        return true
                    }
                    else{
                        return false
                    }
                })
                let new_nodesSet = new Set() 
                for(let i = 0;i < new_links.length;i++){
                    let source = new_links[i].source;
                    let target = new_links[i].target;
                    new_nodesSet.add(source);
                    new_nodesSet.add(target);
                }
                let new_nodes = nodes.filter((v)=>{
                    return new_nodesSet.has(v.id)
                })

                links = new_links;
                nodes = new_nodes
            }


            /**
             * 布局
             */
            
            function forceDirectedLayout(nodes,links){//经典力导引布局
                let simulation = d3.forceSimulation()
                                    .nodes(nodes)
                let linkForce = d3.forceLink(links).id(d=>d.id)
                simulation.force('charge_force', d3.forceManyBody().strength(-10))
                        .force('center_force', d3.forceCenter(self.padding.left + 0.5 * (width - self.padding.left - self.padding.right),self.padding.top + 0.5 * (height - self.padding.top - self.padding.bottom)))//中心点为原点
                        .force('links', linkForce)
                simulation.stop();
                for(let i = 0;i < 200;i++){
                    simulation.tick();
                }
                return nodes,links
            }

            function fa2Layout(nodes,links){//force atltas 2布局
                let graph = new Graph({'multi':true});
                for(let n of nodes){
                    graph.addNode(n.id,{
                        'x':0,
                        'y':0,
                    })
                }
                for(let l of links){
                    graph.addEdge(l.source,l.target)
                }
                circular.assign(graph,{'dimensions':['x','y']})
                forceAtlas2.assign(graph,{'iterations':200})
                nodes.forEach(v=>{
                    v['x'] = graph.getNodeAttribute(v.id,'x')
                    v['y'] = graph.getNodeAttribute(v.id,'y')
                })
                links.forEach(l=>{
                    l.source = nodes.find(v=>v.id == l.source)
                    l.target = nodes.find(v=>v.id == l.target)
                })
                return nodes,links
            }

            //设定布局
            nodes,links = fa2Layout(nodes,links)
            
            /**
             * 将布局坐标变换为实际的像素坐标
             */

            const maxX = Math.max(...nodes.map(v=>v.x))
            const minX = Math.min(...nodes.map(v=>v.x))
            const maxY = Math.max(...nodes.map(v=>v.y))
            const minY = Math.min(...nodes.map(v=>v.y))
            //变换
            const xScale = d3.scaleLinear()
                .domain([minX,maxX])
                .range([self.padding.left,width - self.padding.right])
            const yScale = d3.scaleLinear()
                .domain([minY,maxY])
                .range([self.padding.top,height - self.padding.bottom])


            /**
             * 开始绘图
             */

            //定义箭头
            svg.append('defs')
                .append('marker')
                .attr('id', `fdView-link-arrow`)
                .attr('markerWidth', self.linkArrowSize)
                .attr('markerHeight', self.linkArrowSize)
                .attr('refX', self.linkArrowSize + self.nodeSize)
                .attr('refY', 0.5 * self.linkArrowSize)
                .attr("markerUnits","userSpaceOnUse")
                .attr('orient', 'auto')
                .append('path')
                .attr('fill', self.linkArrowColor)
                .attr('d', `M 0,0 L ${self.linkArrowSize},${0.5*self.linkArrowSize} L 0,${self.linkArrowSize}`)

            //交互容器

            const plotG = svg.append('g')

            const itRect = plotG.append('rect')
                                .attr('x',0)
                                .attr('y',0)
                                .attr('width',width)
                                .attr('height',height)
                                .attr('fill-opacity',0)

            //边
            const linkPlot = plotG.append('g')
                                .selectAll('*')
                                .data(links)
                                .enter()
                                .append('line')
                                .attr('stroke-width',self.linkWidth)
                                .style('stroke',self.linkColor)
                                .attr('x1',d=>xScale(d.source.x))
                                .attr('x2',d=>xScale(d.target.x))
                                .attr('y1',d=>yScale(d.source.y))
                                .attr('y2',d=>yScale(d.target.y))
                                .attr('marker-end','url(#fdView-link-arrow)')

            //点
            const scatterPlot = plotG.append('g')
                                .selectAll('*')
                                .data(nodes)
                                .enter()
                                .append('circle')
                                .classed('fdView-scatter',true)
                                .attr('r',self.nodeSize)
                                .attr('cx',d=>xScale(d.x))
                                .attr('cy',d=>yScale(d.y))
                                .classed('fdView_global_highlight',(d)=>{
                                    if(self.globalSearchIds.indexOf(d.id) != -1){
                                        return true
                                    }
                                    return false;
                                })
                                .classed('fdView_highlight',(d)=>{
                                    if(self.highlightIds.indexOf(d.id) != -1){
                                        return true
                                    }
                                    return false;
                                })
                                .attr('fill',(d)=>{
                                    if(self.filterFlag == 'filter'){//处于过滤模式
                                        if(self.nodes_color[d.id] == '#b51c1c')
                                            return '#b51c1c'
                                        if(self.filter.indexOf(d.id) != -1){
                                            if(self.nodes_color[d.id] === undefined){
                                                return self.baseNodeColor
                                            }
                                            else{
                                                return self.nodes_color[d.id]
                                            }
                                        }
                                        else{
                                            return self.nodeExcludeColor;
                                        }
                                    }
                                    else{
                                        if(self.nodes_color[d.id] === undefined){
                                            return self.baseNodeColor;
                                        }
                                        else{
                                            return self.nodes_color[d.id]
                                        }
                                    }    
                                })
                                .on('mouseover',(d,i)=>{

                                    let messageData = {};
                                    //id
                                    messageData['ID'] = d.id
                                    //类型
                                    messageData['类型'] = d['is_ship']?'船':'岸'
                                    //权重
                                    messageData['权重'] = d['weight']

                                    self.InfoPanelVisible = true;//显示
                                    self.$refs['infoPanel'].setMessageData(messageData);//更新信息
                                    /**
                                     * 更新位置
                                     */
                                    self.InfoPanelStyle['top'] = `${d3.event.offsetY + 10}px`
                                    self.InfoPanelStyle['left'] = `${d3.event.offsetX + 10}px`

                                })
                                .on('mouseout',(d,i)=>{
                                    self.InfoPanelVisible = false;//显示
                                })
            

            /**
             * 交互
             */
            //定义圈选
            self.ls = lasso()
                        .closePathSelect(true)
                        .closePathDistance(2000)
                        .items(scatterPlot)
                        .targetArea(svg)
                        .on("start",()=>{
                            self.ls.items().classed('fdView_chosen',false);
                        })
                        .on("draw",()=>{
                            self.ls.items().classed('fdView_chosen',false);
                            self.ls.possibleItems().classed('fdView_chosen',true);
                        })
                        .on("end",()=>{
                            self.ls.items().classed('fdView_chosen',false);
                            self.ls.selectedItems().classed('fdView_chosen',true);
                            let chsoenList = []
                            self.ls.selectedItems().each(d=>{
                                chsoenList.push(d.id)
                            })
                            self.exportChosenNodes(chsoenList)
                        })
            //定义zoom
            self.zoom = d3.zoom()
                            .scaleExtent([0.1, 40])
                            .translateExtent([[-10000, -10000], [10000, 10000]])
                            .on("zoom",()=>{
                                linkPlot.attr('transform',d3.event.transform)
                                scatterPlot.attr('transform',d3.event.transform)
                            })


            //绑定交互

            if(self.mouseMode == '放缩'){
                svg.on('.drag',null)
                plotG.call(self.zoom)
            }
            else if(self.mouseMode == '圈选'){
                plotG.on('.zoom',null)
                svg.call(self.ls)
            }

            //设置切换函数
            self.swithMouseMode = ()=>{
                if(self.mouseMode == '放缩'){
                    svg.on('.drag',null)
                    plotG.call(self.zoom)
                }
                else if(self.mouseMode == '圈选'){
                    plotG.on('.zoom',null)
                    svg.call(self.ls)
                }
            }

            

        },

        /**
         * 向外接口
         */

        exportChosenNodes(ids){//导出选择的点的id数组，每次圈选或者点击的时候触发
            const self = this;
            self.$emit('exportChosenNodes',ids)
        },



        /**
         * 向内接口
         */
        highlightNodes(ids){//根据传入的id数组，高亮对应的点
            const self = this;
            
            self.highlightIds = ids;

            const svg =  d3.select(self.$refs['fdView-canvas'])
            const scatterPlot = svg.selectAll('.fdView-scatter');

            scatterPlot.classed('fdView_highlight',(d)=>{
                if(self.highlightIds.indexOf(d.id) != -1)
                    return true
                else
                    return false
            })

        },

        highlightGlobalSearchNodes(ids){//根据传入的全局搜索节点，高亮对应的点
            const self = this;
            
            self.globalSearchIds = ids;

            const svg =  d3.select(self.$refs['fdView-canvas'])
            const scatterPlot = svg.selectAll('.fdView-scatter');

            scatterPlot.classed('fdView_global_highlight',(d)=>{
                if(self.globalSearchIds.indexOf(d.id) != -1)
                    return true
                else
                    return false
            })

        },

        setFilter(ids){//传入过滤id数组
            const self = this;
            self.filter = JSON.parse(JSON.stringify(ids));
            self.draw();
        },
        setTimeFilter(timeRange){//传入过滤的时间范围
            const self = this;
            if(timeRange === null){
                self.timeFilter = [0,Infinity]
            }
            else{
                self.timeFilter = JSON.parse(JSON.stringify(timeRange));
            }
            self.draw();
        },


        /**
         * handle
         */
        handleFilterFlagChange(val){
            const self = this;
            self.draw();
        },
        handleTimeFilterFlagChange(){
            const self = this;
            self.draw();

        }

    },
}
</script>

<style>
  /* lasso样式 */

  .fdView_chosen{
    stroke: black;
    stroke-width: 2px;
  }




  .fdView_highlight{
    stroke: rgb(95, 95, 95);
    stroke-width: 4px;
  }

  .fdView_global_highlight{
    stroke: #ff9900;
    stroke-width: 4px;
  }
  .lasso path{
    fill-opacity: 0.6;
    stroke: #3c78d8;
    stroke-width: 2px;
  }

  .lasso .drawn{
    fill-opacity: 0.05;
  }

  .lasso .loop_close{
    fill: none;
    stroke-dasharray: 4, 4;
  }

  .lasso .origin{
    fill: gray;
    fill-opacity: 0.5;
  }


</style>
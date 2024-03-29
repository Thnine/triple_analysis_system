<template>
  <div>
    <div class="SequenceView-canvas-container">
        <el-switch
            v-model="timeFilterFlag"
            active-text="根据所选时间重排序"
            @change="handleTimeFilterFlagChange"
            style="position:absolute;left:20px;top:60px;">
        </el-switch>
        <svg ref="SequenceView-sketch-canvas" class="SequenceView-sketch-canvas"></svg>
        <svg ref="SequenceView-main-canvas" class="SequenceView-main-canvas"></svg>
    </div>
  </div>
</template>

<script>

import * as d3 from 'd3';
import * as WCluster from "w-cluster"

export default {
    name:'SequenceView',
    data(){
        return {
            //关键数据
            links:[],
            nodes:[],


            //配置数据
                //sketch相关
            sketchPadding:{
                top:60,
                bottom:20,
                left:10,
                right:10,
            },
            minSketchColor:'white',//最小值颜色
            maxSketchColor:'#3c78d8',//最大值颜色
                //主视图相关
            mainPadding:{
                top:60,
                bottom:20,
                left:10,
                right:10,
            },
            timeFilterHeight:20,//过滤标记区域高度
            timeFilterCircleSize:3,//过滤标注点半径
            timeFilterCircleColor:'black',//过滤标注点半径
            highlightWidth:20,//高亮区域宽度
            highlightCircleSize:3,//高亮标注点半径
            highlightCircleColor:'black',//高亮标注点颜色
            minMainColor:'white',//最小值颜色
            maxMainColor:'#3c78d8',//最大值颜色
            mainUnitStrokeWidth:0.5,//序列方块边宽
            mainUnitStrokeColor:'lightgray',//序列方块边颜色
            globalHighlightColor:'black',//全局高亮的颜色
            


            //计算项
            maxTime:0,//最大时间（时间戳）
            minTime:0,//最小时间（时间戳）
            timeInterval:0,//时间间隔（ms）
            //接口项
            highlightList:[],//要高亮的节点id数组
            drawHightLight:()=>{return;},//高亮的重绘函数
            globalSearchIds:[],//全局搜索列表中的Id
            drawGlobalSearchIdsHighLightInSketch:()=>{return;},//在Sketch中高亮全局搜索节点的Id
            drawGlobalSearchIdsHighLightInMain:()=>{return;},//在Main中高亮全局搜索节点的Id
            timeFilterRange:null,//时间过滤范围
            //其他项
            timeFilterFlag:true,

        }
    },
    methods:{
        async makeSeqMat(nodes,links, timePatches,timeInterval){
            const self = this;
            let node_num = nodes.length
            let cnt = 0
            let nodeMap = {}//nodes id -> nodes index 的绑定map
            for(let item of nodes){
                nodeMap[item['id']]=cnt++
            }

            //计算timeList（包含过滤过程）
            let timeList = []
            for(let time = self.minTime;time <= self.maxTime;time += self.timeInterval){
                if( !self.timeFilterFlag  || self.timeFilterRange == null || (time >= self.timeFilterRange[0] && time <= self.timeFilterRange[1])){
                    timeList.push(time)
                }
            }
            if(timeList.length == 0){
                return self.nodes
            }

            let mat = new Array(node_num).fill(0).map(() => new Array(timeList.length).fill(0.0001 * Math.random()));

            for(let l of links){
                let source = nodeMap[l['source']], target = nodeMap[l['target']], time = Date.parse(l['time'])
                let timeIndex = timeList.indexOf(time)
                if(source !== undefined)
                    mat[source][timeIndex]++;
                if(target !== undefined)
                    mat[target][timeIndex]++;
            }
            
            let resMat = await WCluster.PCA(mat, { nCompNIPALS: 1 })
            let tmp = 0
            for(let i=0;i<resMat.length;i++){//resMat[i][1]保存了节点在nodes中的原本的index
                resMat[i].push(tmp++)
            }
            resMat = resMat.sort((a,b)=>(b[0]-a[0]))
            let sorted_nodes = []
            for(let i=0;i<resMat.length;i++){
                sorted_nodes.push(self.nodes[resMat[i][1]])
            }
            return sorted_nodes;

        },

        async start(nodes,links,timeInterval=undefined){ 
            //nodes:[{'id':'id1',...},...] 
            //links:[{'source':'id1','target':'id2','time':'2020-11-04 04:00:00',...}] 必须是 时间间隔的数据，时间间隔不得低于1s
            //timeInterval:5000 (ms)
            //如果不主动传入时间间隔，那么会自动计算，其值为边时间中的最小间隔(//TODO 有时间可以按照最大公约数去做优化)
            const self = this;
            //初始化
            self.links = []
            self.nodes = []
            self.maxTime = 0;
            self.minTime = 0;
            self.timeInterval = 0;
            self.drawHightLight = ()=>{return;}
            self.highlightList = [];
            self.drawGlobalSearchIdsHighLightInSketch = ()=>{return;}
            self.drawGlobalSearchIdsHighLightInMain = ()=>{return;}


            self.links = JSON.parse(JSON.stringify(links))
            self.nodes = JSON.parse(JSON.stringify(nodes))



            //计算时间相关数据
            let timeSet = new Set();//提取时间
            for(let link of self.links){
                timeSet.add(Date.parse(link['time']))
            }
            let timeSortedArray = Array.from(timeSet).sort((a,b)=>a-b)
            self.minTime = timeSortedArray[0]//最小时间
            self.maxTime = timeSortedArray[timeSortedArray.length-1]//最大时间
            if(timeInterval === undefined){//自动计算时间间隔
                timeInterval = Infinity;
                for(let i = 1;i < timeSortedArray.length;i++){
                    if(timeInterval > timeSortedArray[i] - timeSortedArray[i-1]){
                        timeInterval = timeSortedArray[i] - timeSortedArray[i-1]
                    }
                } 
            }
            self.timeInterval = timeInterval


            //给nodes排序
            await self.makeSeqMat(self.nodes,self.links,(self.maxTime-self.minTime)/self.timeInterval+1,self.timeInterval).then(res=>{
                self.nodes = res
            })


            //整理数据绘制sketch //注意sketechData中元素的顺序即由上而下绘制的顺序，注意和nodes保持一致
            let SketchDataMap = {}
            let SketchData = []
            for(let n of self.nodes){ 
                SketchDataMap[n.id] = {
                    'id':n.id,
                    'value':0
                }
            }
            for(let l of self.links){
                if(SketchDataMap[l['source']] !== undefined)
                    SketchDataMap[l['source']].value++;
                if(SketchDataMap[l['target']] !== undefined)
                    SketchDataMap[l['target']].value++;
            }
            for(let n of self.nodes){
                SketchData.push(SketchDataMap[n.id])
            }
            self.drawSketchPlot(SketchData)
                        
        },

        reDraw(){ //使用当前的数据重绘
            const self = this;
            if(self.nodes !== undefined && self.links !== undefined && self.nodes !== null && self.links !== null && self.nodes.length != 0){
                self.start(JSON.parse(JSON.stringify(self.nodes)),JSON.parse(JSON.stringify(self.links)),JSON.parse(JSON.stringify(self.timeInterval)))
            }
        },

        setTimeFilter(timeRange){ //按时间范围进行节点排序
            const self = this;
            self.timeFilterRange = JSON.parse(JSON.stringify(timeRange));
            self.reDraw();
        },

        drawSketchPlot(data){
            // data为绘制sketch的数据，其格式为[{'id':'id1','value':4},...]

            const self = this;
            const sketchSVG = d3.select(self.$refs['SequenceView-sketch-canvas'])

            //清空
            sketchSVG.selectAll('*').remove();

            //计算项
            const height = sketchSVG.node().getBoundingClientRect().height;
            const width = sketchSVG.node().getBoundingClientRect().width;

            const plotHeight = height - self.sketchPadding.top - self.sketchPadding.bottom;
            const plotWidth = width - self.sketchPadding.left - self.sketchPadding.right;

            const unitHeight = plotHeight / data.length;
            const unitWidth = plotWidth;

            //定义颜色scale
            let maxValue = Math.max(...data.map(v=>v.value))
            const colorScale = d3.scaleLinear()
                                 .domain([0, maxValue])
                                 .range([self.minSketchColor, self.maxSketchColor])
            
            //绘图
            const rects = sketchSVG.append('g')
                    .selectAll('*')
                    .data(data)
                    .enter()
                    .append('rect')
                    .attr('x',(d,i)=>{
                        return self.sketchPadding.left;
                    })
                    .attr('y',(d,i)=>{
                        return self.sketchPadding.top + i * unitHeight;
                    })
                    .attr('width',unitWidth)
                    .attr('height',unitHeight)
                    .attr('fill',d=>colorScale(d.value))

            //全局搜索节点的高亮函数（sketch）
            self.drawGlobalSearchIdsHighLightInSketch = ()=>{
                rects.each(function(d,i){
                    if(self.globalSearchIds.indexOf(d.id) != -1){
                        d3.select(this).attr('stroke',self.globalHighlightColor).attr('stroke-width',2)
                    }
                    else{
                        d3.select(this).attr('stroke',null).attr('stroke-width',null)
                    }
                })
            }
            self.drawGlobalSearchIdsHighLightInSketch();


            //绑定brush
            const brush = d3.brushY()
                            .extent([[self.sketchPadding.left,self.sketchPadding.top],[width-self.sketchPadding.right,height - self.sketchPadding.bottom]])
                            .on("end",()=>{
                                if(d3.event.selection===null)
                                    return;
                                //求取刷选索引
                                let brushTop = d3.event.selection[0]
                                let brushBottom = d3.event.selection[1]
                                let brushStartIndex = Math.ceil(1.0 * (brushTop - self.sketchPadding.top) / unitHeight)
                                let brushEndIndex = Math.floor(1.0 * (brushBottom - self.sketchPadding.top) / unitHeight) - 1
                                //计算绘图数据
                                let timeList = []
                                for(let time = self.minTime;time<=self.maxTime;time += self.timeInterval){
                                    timeList.push(time)    
                                }
                                let mainData = []
                                for(let i = brushStartIndex;i <= brushEndIndex;i++){
                                    let row = {'id':self.nodes[i].id,'value':[]}
                                    for(let t of timeList){
                                        row['value'].push(0)
                                    }
                                    mainData.push(row)
                                }
                                for(let l of self.links){
                                    let time_index = timeList.indexOf(Date.parse(l['time']))
                                    let sourceRow = mainData.find(v=>v.id == l['source'])
                                    let targetRow = mainData.find(v=>v.id == l['target'])
                                    if(sourceRow !== undefined){
                                        sourceRow['value'][time_index]++;
                                    }
                                    if(targetRow !== undefined){
                                        targetRow['value'][time_index]++;
                                    }
                                }
                                //绘图
                                self.drawMainPlot(mainData)
                            })    
            const brushPlot = sketchSVG.append('g').call(brush)

            //清空mainPlot
            const mainSVG = d3.select(self.$refs['SequenceView-main-canvas'])
            mainSVG.selectAll('*').remove();

        },

        drawMainPlot(data){

            const self = this;
            const mainSVG = d3.select(self.$refs['SequenceView-main-canvas'])

            //清空
            mainSVG.selectAll('*').remove();

            const height = mainSVG.node().getBoundingClientRect().height;
            const width = mainSVG.node().getBoundingClientRect().width;

            //计算项目
            let timeList = [] //所有时间的列表（不考虑时间过滤）
            for(let time = self.minTime;time<=self.maxTime;time += self.timeInterval){
                timeList.push(time)    
            }       

            const mainPlotHeight = height - self.mainPadding.top - self.mainPadding.bottom - self.timeFilterHeight;
            const mainPlotwidth = width - self.mainPadding.left - self.mainPadding.right - self.highlightWidth;

            const unitHeight = mainPlotHeight / data.length;
            const unitWidth = mainPlotwidth / timeList.length;

            //定义颜色scale
            let maxValue = 0;
            for(let i = 0;i < data.length;i++){
                for(let j = 0;j < timeList.length;j++){
                    if(data[i]['value'][j] > maxValue){
                        maxValue = data[i]['value'][j]
                    }
                }
            }
            const colorScale = d3.scaleLinear()
                                 .domain([0, maxValue])
                                 .range([self.minMainColor, self.maxMainColor])

            //struct
            const mainPlot = mainSVG.append('g')
            const highlightPlot = mainSVG.append('g')
            const timeAxisPlot = mainSVG.append('g')
            const timeFilterPlot = mainSVG.append('g')
            const globalSearchHighLightPlot = mainSVG.append('g')
            const brushPlot = mainSVG.append('g')


            //绘制主序列视图
            mainPlot
                .selectAll('*')
                .data(data)
                .enter()
                .append('g')
                .classed('seq-main-row',true)
                .attr('transform',(d,i)=>`translate(${0},${self.mainPadding.top + self.timeFilterHeight + i * unitHeight})`)
                .selectAll('*')
                .data(d=>d['value'])
                .enter()
                .append('rect')
                .attr('transform',(d,i)=>`translate(${self.mainPadding.left + self.highlightWidth + i * unitWidth},${0})`)
                .attr('width',unitWidth)
                .attr('height',unitHeight)
                .attr('x',0)
                .attr('y',0)
                .attr('fill',d=>colorScale(d))
                .attr('stroke',self.mainUnitStrokeColor)
                .attr('stroke-width',self.mainUnitStrokeWidth)
                
            //绘制高亮图
            self.drawHightLight = ()=>{
                //清空
                highlightPlot.selectAll('*').remove();
                //绘图
                let ids = data.map(v=>v.id)
                for(let highligh_id of self.highlightList){
                    let index = ids.indexOf(highligh_id)
                    if(index != -1){
                        highlightPlot.append('circle')
                                    .attr('cx',self.mainPadding.left + 0.5 * self.highlightWidth)
                                    .attr('cy',self.mainPadding.top + self.timeFilterHeight + index * unitHeight + 0.5 * unitHeight)
                                    .attr('r',self.highlightCircleSize)
                                    .attr('fill',self.highlightCircleColor)
                    }
                }
            }
            self.drawHightLight();

            //全局搜索节点的高亮函数（main）
            self.drawGlobalSearchIdsHighLightInMain = ()=>{
                globalSearchHighLightPlot.selectAll('*').remove();//清空
                mainPlot.selectAll('.seq-main-row').each(function(d,i){
                    if(self.globalSearchIds.indexOf(d.id) != -1){
                        globalSearchHighLightPlot.append('rect')
                                             .attr('x',0)
                                             .attr('y',0)
                                             .attr('transform',(d)=>`translate(${self.mainPadding.left + self.highlightWidth},${self.mainPadding.top + self.timeFilterHeight + i * unitHeight})`)
                                             .attr('width',mainPlotwidth)
                                             .attr('height',unitHeight)
                                             .attr('fill-opacity',0)
                                             .attr('stroke',self.globalHighlightColor)
                                             .attr('stroke-width',2)
                    }
                })
            }
            self.drawGlobalSearchIdsHighLightInMain();


            //绘制坐标轴 TODO 这个是写死的
            for(let i = 0;i < timeList.length;i++){//tick
                timeAxisPlot.append('line')
                            .attr('x1',self.mainPadding.left + self.highlightWidth + i * unitWidth + 0.5 * unitWidth)
                            .attr('y1',self.mainPadding.top + self.timeFilterHeight)
                            .attr('x2',self.mainPadding.left + self.highlightWidth + i * unitWidth + 0.5 * unitWidth)
                            .attr('y2',self.mainPadding.top + self.timeFilterHeight - 5)
                            .attr('stroke','#434343')
                            .attr('stroke-width',0.5)
            }

            timeFilterPlot.selectAll('*').remove()
            for(let i = 0;i < timeList.length;i++){
                if(!self.timeFilterFlag || self.timeFilterRange===null || (timeList[i] >= self.timeFilterRange[0] && timeList[i] <= self.timeFilterRange[1])){
                    timeFilterPlot.append('circle')
                                  .attr('r',self.timeFilterCircleSize)
                                  .attr('fill',self.timeFilterCircleColor)
                                  .attr('cx',self.mainPadding.left + self.highlightWidth + i * unitWidth + 0.5 * unitWidth)
                                  .attr('cy',self.mainPadding.top + 0.5 * self.timeFilterHeight)
                }
            }


            timeAxisPlot.append('text')//起始日期文本
                        // .attr('text-anchor','middle')
                        .attr('dominant-baseline','auto')
                        // .attr('x',self.mainPadding.left + self.highlightWidth + 0.5 * unitWidth)
                        .attr('x',self.mainPadding.left + self.highlightWidth)
                        .attr('y',self.mainPadding.top + self.timeFilterHeight - 20)
                        .style('font-size',12)
                        .text(()=>{
                            function formatNumber(n){
                                n = n.toString();
                                return n[1] ? n: '0' + n 
                            }
                            let date = new Date(timeList[0])
                            return date.getFullYear() + '-' + formatNumber(date.getMonth()+1) + '-' + formatNumber(date.getDate()) + ' ' + formatNumber(date.getHours()) + ':' + formatNumber(date.getMinutes()) + ':' + formatNumber(date.getSeconds()) 
                        })
            timeAxisPlot.append('text')//结尾日期文本
                        // .attr('text-anchor','middle')
                        .attr('text-anchor','end')
                        .attr('dominant-baseline','auto')
                        // .attr('x',self.mainPadding.left + self.highlightWidth + timeList.length * unitWidth - 0.5 * unitWidth)
                        .attr('x',self.mainPadding.left + self.highlightWidth + (timeList.length) * unitWidth)
                        .attr('y',self.mainPadding.top + self.timeFilterHeight - 20)
                        .style('font-size',12)
                        .text(()=>{
                            function formatNumber(n){
                                n = n.toString();
                                return n[1] ? n: '0' + n 
                            }
                            let date = new Date(timeList[timeList.length-1])
                            return date.getFullYear() + '-' + formatNumber(date.getMonth()+1) + '-' + formatNumber(date.getDate()) + ' ' + formatNumber(date.getHours()) + ':' + formatNumber(date.getMinutes()) + ':' + formatNumber(date.getSeconds()) 
                        })
            
            //brush
            const brush = d3.brushY()
                            .extent([[self.mainPadding.left + self.highlightWidth,self.mainPadding.top],[width-self.mainPadding.right,height - self.mainPadding.bottom]])
                            .on("end",()=>{
                                if(d3.event.selection===null)
                                    return;
                                //求取刷选索引
                                let brushTop = d3.event.selection[0]
                                let brushBottom = d3.event.selection[1]
                                let brushStartIndex = Math.ceil(1.0 * (brushTop - self.mainPadding.top) / unitHeight);
                                let brushEndIndex = Math.floor(1.0 * (brushBottom - self.mainPadding.top) / unitHeight) - 1;
                                let toExport = []
                                for(let i = brushStartIndex;i <= brushEndIndex;i++){
                                    toExport.push(data[i].id)
                                }
                                self.exportBrushIds(toExport)

                            })
            brushPlot.call(brush)
                        

        },

        /**
         * 对内接口
         */
        setHighlight(ids){
            const self = this;
            self.highlightList = JSON.parse(JSON.stringify(ids))
            self.drawHightLight();
        },

        highlightGlobalSearchNodes(ids){//根据传入的全局搜索节点，高亮对应的点
            const self = this;
            self.globalSearchIds = JSON.parse(JSON.stringify(ids))
            self.drawGlobalSearchIdsHighLightInSketch();
            self.drawGlobalSearchIdsHighLightInMain();
        },
        handleTimeFilterFlagChange(){//时间筛选开关发生切换
            const self = this;
            self.reDraw()
        },

        /**
         * 向外接口
         */
        exportBrushIds(ids){
            this.$emit('exportBrushIds',ids)
        }

    },
    mounted(){

    }
}
</script>

<style>
.SequenceView-canvas-container{
    width:100%;
    height: 100%;
    display: flex;
    flex-direction: row;
    align-items: stretch;
    display:flex;
}

.SequenceView-sketch-canvas{
    flex: 0 0 80px;
}

.SequenceView-main-canvas{
    flex: 1 1 0;
}

</style>
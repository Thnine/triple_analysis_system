<template>
  <div>
    <svg ref="RiverCanvas" style="width:100%;height:100%"></svg>
  </div>
</template>

<script>

import * as d3 from 'd3'
import Vue from 'vue'

export default {
    name:'RiverView',
    data(){
        return {

          /**
           * 数据项
           */
          rawData:[],//传入的原始数据
          drawData:{},//绘图数据
          /**
           * 配置项
           */
          padding:{//河流内边距（不考虑坐标轴）
            top:70,
            bottom:45,
            left:17,
            right:10,
          },
          // colorList : ['#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00', '#ffff33', '#a65628', '#f781bf', '#999999', '#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00', '#ffff33', '#a65628', '#f781bf', '#999999', '#8dd3c7', '#ffffb3', '#bebada', '#fb8072', '#80b1d3', '#fdb462', '#b3de69', '#fccde5', '#d9d9d9', '#bc80bd', '#ccebc5', '#ffed6f'],
          colorList:[
            "#327DB4",
            "#4C281A",
            "#E74863",
            "#E1B89D",
            "#A8ADB8",
            "#62C0D1",
            "#035E2F",
            "#003969",
            "#9F6358",
            "#F7A1AC",
            "#FD9E43",
            "#032D2F",
            "#F8D18B",
            "#542A42",
          ],
          tickSize:12,//两侧时间文本的大小
          

          /**
           * 其他数据
           */
          attr_keys:[],
          maxTime:0,//最大时间
          minTime:0,//最小时间
          timeSortedArray:[],//排序后的时间列表
          timeInterval:0,

          //全局搜索高亮
          globalSearchIds:[],//全局搜索列表中的Id
          drawGlobalSearchIdsHighLight:()=>{return;},//高亮全局搜索节点的Id的bar

  
        }
    },
    methods:{
        
        start(data){

            

            /**
             * data：[{'node':'192.0.0.1','time':'2020-11-04 00:00:00','attr_1':1,'attr_2':0,...}]
             * 要求每个node在每个time只会出现一次
             */


            const self = this;

            /**
             * 初始化
             */
            self.rawData = [];
            self.attr_keys = [];
             
            /**
             * 整理数据
             */
            //rawData
            self.rawData = JSON.parse(JSON.stringify(data))
            //attr_keys
            for(let key in self.rawData[0]){
              if(key != 'node' && key != 'time'){
                self.attr_keys.push(key)
              }
            }
            // //color
            // for(let i = 0;i < self.attr_keys.length;i++){
            //   self.colorList.push(d3.interpolateRainbow(1.0 * i / self.attr_keys.length))
            // }
            //抽取时间
            let timeSet = new Set();//提取时间
            for(let v of self.rawData){
                timeSet.add(Date.parse(v['time']))
            }
            let timeSortedArray = Array.from(timeSet).sort((a,b)=>a-b)
            let timeInterval = Infinity;
            for(let i = 1;i < timeSortedArray.length;i++){
              if(timeInterval > timeSortedArray[i] - timeSortedArray[i-1]){
                timeInterval = timeSortedArray[i] - timeSortedArray[i-1]
              }
            }
            self.minTime = timeSortedArray[0]//最小时间
            self.maxTime = timeSortedArray[timeSortedArray.length-1]//最大时间
            self.timeInterval = timeInterval
            self.timeSortedArray = [];
            for(let t = self.minTime;t <= self.maxTime;t+=self.timeInterval){
              self.timeSortedArray.push(t)
            }
            //生成绘图数据
            let drawData = {}
            for(let attr of self.attr_keys){//初始化
              drawData[attr] = self.timeSortedArray.map(v=>0)
            }
            for(let v of self.rawData){
              //值最大的属性为type
              let type = self.attr_keys[0]
              let max = v[type]
              for(let attr of self.attr_keys){
                if(v[attr] > max){
                  type = attr;
                  max = v[attr]
                }
              }

              drawData[type][self.timeSortedArray.indexOf(Date.parse(v['time']))]++;
            }
            self.drawData = drawData

            /**
             * 绘图
             */
            self.draw()


        },


        draw(){
            const self = this;

            const svg = d3.select(self.$refs['RiverCanvas']);
            const width = svg.node().getBoundingClientRect().width - self.padding.left - self.padding.right;
            const height = svg.node().getBoundingClientRect().height - self.padding.top - self.padding.bottom;

            //清空
            svg.selectAll('*').remove();

            //计算在各个时刻时的节点规模
            let sizeByTime = []
            for(let i = 0;i < self.timeSortedArray.length;i++){
              let sum = 0;
              self.attr_keys.forEach(attr=>sum+=self.drawData[attr][i])
              sizeByTime.push(sum)
            }
            let maxSize = Math.max(...sizeByTime)//最大节点规模
            let unitLength = maxSize == 0 ? 0 : (1.0 * height / maxSize)  //单个节点所占的河流宽度
            
            //计算河流的纵向位置数据（仅根据height，不考虑padding）
            let yPosData = {}
            for(let attr of self.attr_keys){//初始化
              yPosData[attr] = self.timeSortedArray.map(v=>[0,0])//第一项是上边缘y坐标，第二项是下边缘y坐标
            }
            for(let i = 0;i < self.timeSortedArray.length;i++){
              let sortedList = self.attr_keys.map(v=>{
                return {
                  'type':v,
                  'size':self.drawData[v][i],
                }
              }).sort((a,b)=>b.size-a.size)
              let gap = (height - sizeByTime[i] * unitLength) / self.attr_keys.length;

              //按顺序
              let accmLength = gap;//累计长度

              for(let v of sortedList){//沿y轴自上而下遍历
                yPosData[v.type][i] = [accmLength,accmLength + v.size * unitLength]
                accmLength += (v.size * unitLength + gap)
              }

              
            }

            //比例尺（仅根据width，不考虑padding）
            const xScale = d3.scaleLinear().domain([self.minTime,self.maxTime]).range([0,width]);

            //绘图
            for(let attr of self.attr_keys){//绘制bar

              svg.append('g')
                 .selectAll('*')
                 .data(yPosData[attr])
                 .enter()
                 .append('line')
                 .attr('stroke','black')
                 .attr('stroke-width',4)
                 .attr('x1',(d,i)=>self.padding.left + xScale(self.timeSortedArray[i]))
                 .attr('y1',(d)=>self.padding.top + d[0])
                 .attr('x2',(d,i)=>self.padding.left + xScale(self.timeSortedArray[i]))
                 .attr('y2',(d)=>self.padding.top + d[1])

            }
            for(let i = 0;i < self.attr_keys.length;i++){//绘制河流
              let attr = self.attr_keys[i];
              svg.append('g')
                .selectAll('*')
                .data(yPosData[attr])
                .enter()
                .append('path')
                .attr('d',(d,j)=>{
                  const area = d3.area()
                                 .x(d=>self.padding.left + d.x)
                                 .y0(d=>self.padding.top + d.y0)
                                 .y1(d=>self.padding.top + d.y1)
                                 .curve(d3.curveMonotoneX)
                  let data = self.timeSortedArray.map((v,k)=>{
                    return {
                      'x':xScale(v),
                      'y0':yPosData[attr][k][0],
                      'y1':yPosData[attr][k][1],
                    }
                  })
                  return area(data)
                })
                .attr('fill',self.colorList[i])
                .attr('fill-opacity',0.1)
                .style('cursor','pointer')
                .on('click',()=>{
                  self.exportSelectedRiver(self.attr_keys[i])
                  
                })
                
            }
            
            // //绘制底线
            // svg.append('line')
            //   .attr('stroke','black')
            //   .attr('stroke-width',2)
            //   .attr('x1',self.padding.left)
            //   .attr('y1',self.padding.top + height + 2)
            //   .attr('x2',self.padding.left + width)
            //   .attr('y2',self.padding.top + height + 2)

            //绘制两侧ticks
            svg.append('text') //起始时间文本
               .attr('dominant-baseline','hanging')
               .attr('text-anchor','start')
               .style('font-size',self.tickSize)
               .attr('x',self.padding.left + xScale(self.timeSortedArray[0]))
               .attr('y',self.padding.top + height + 6)
               .text(()=>{
                   function formatNumber(n){
                       n = n.toString();
                       return n[1] ? n: '0' + n 
                   }
                   let date = new Date(self.timeSortedArray[0])
                   return date.getFullYear() + '-' + formatNumber(date.getMonth()+1) + '-' + formatNumber(date.getDate()) + ' ' + formatNumber(date.getHours()) + ':' + formatNumber(date.getMinutes()) + ':' + formatNumber(date.getSeconds()) 
               })
            svg.append('text') //结尾时间文本
               .attr('dominant-baseline','hanging')
               .attr('text-anchor','end')
               .style('font-size',self.tickSize)
               .attr('x',self.padding.left + xScale(self.timeSortedArray[self.timeSortedArray.length-1]))
               .attr('y',self.padding.top + height + 6)
               .text(()=>{
                   function formatNumber(n){
                       n = n.toString();
                       return n[1] ? n: '0' + n 
                   }
                   let date = new Date(self.timeSortedArray[self.timeSortedArray.length-1])
                   return date.getFullYear() + '-' + formatNumber(date.getMonth()+1) + '-' + formatNumber(date.getDate()) + ' ' + formatNumber(date.getHours()) + ':' + formatNumber(date.getMinutes()) + ':' + formatNumber(date.getSeconds()) 
               })


            //高亮函数
            const highlightPlot = svg.append('g')
            self.drawGlobalSearchIdsHighLight = ()=>{
              
              highlightPlot.selectAll('*').remove();

              if(self.globalSearchIds.length == 0){//如果没有所有id
                return ;
              }
              else{
                let targetId = self.globalSearchIds[self.globalSearchIds.length - 1];//取搜索id序列最新的id作为搜索id
                let filterData = self.rawData.filter(v=>v.node == targetId);
                let highlightData = filterData.map(v=>{
                  let time_index = self.timeSortedArray.indexOf(Date.parse(v.time))
                  let type = self.attr_keys[0]
                  for(let attr of self.attr_keys){
                    if(v[attr] > v[type])
                      type = attr
                  }
                  return {
                    'id':targetId,
                    'type':type,
                    'time_index':time_index
                  }
                })

                highlightPlot.selectAll('*')
                             .data(highlightData)
                             .enter()
                             .append('line')
                             .attr('stroke','#ff9900')
                             .attr('stroke-width',4) 
                             .attr('x1',(d)=>self.padding.left + xScale(self.timeSortedArray[d.time_index]))
                             .attr('y1',(d)=>self.padding.top + yPosData[d.type][d.time_index][0])
                             .attr('x2',(d)=>self.padding.left + xScale(self.timeSortedArray[d.time_index]))
                             .attr('y2',(d)=>self.padding.top + yPosData[d.type][d.time_index][1])

              }
              
            }
            self.drawGlobalSearchIdsHighLight();


            //刷选时间交互
            const brushPlot = svg.append('g')
            const brush = d3.brushX()
                            .extent([[self.padding.left,self.padding.top],[self.padding.left + width,self.padding.top + height]])
                            .on("end",()=>{
                                if(d3.event.selection === null){
                                  this.exportBrushTimeRange(null)
                                }
                                else{
                                  let brushLeft = d3.event.selection[0] - self.padding.left
                                  let brushRight = d3.event.selection[1] - self.padding.left
                                  let leftTimeStamp = xScale.invert(brushLeft)
                                  let rightTimeStamp = xScale.invert(brushRight)
                                  this.exportBrushTimeRange([leftTimeStamp,rightTimeStamp]);
                                }

                              
                            })
            brushPlot.call(brush)




        },

        
        highlightGlobalSearchNodes(ids){
          this.globalSearchIds = JSON.parse(JSON.stringify(ids));
          this.drawGlobalSearchIdsHighLight();
        },

        exportSelectedRiver(type){ //导出被选择的River
          const self = this;
          self.$emit('exportSelectedRiver',type)
        },

        exportBrushTimeRange(timeRange){//导出刷选的时间范围(timeStamp)
          const self = this;
          self.$emit('exportBrushTimeRange',timeRange)
        }

    },

}
</script>

<style>

</style>
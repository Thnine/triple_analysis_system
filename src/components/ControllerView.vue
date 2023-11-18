<template>
    <div class="view" style="width:605px;height: 70px;position:relative">
        <div style="position:absolute;right:10px;top:20px">
            <el-button type="primary" size="mini" @click="selectNodes">筛选</el-button>
            <el-button type="warming" size="mini" @click="clear">清空</el-button>
        </div>
        <svg id="svg3" width=600 height=70 style="">
            <rect stroke="black" stroke-width="0.5" fill="white" transform="translate(80,20)" style="position: absolute; width: 180px; height:50px;top: 3px;left: 50px;"></rect>
            <rect stroke="black" stroke-width="0.5" fill="white" transform="translate(265,20)" style="position: absolute; width: 180px; height:50px;top: 3px;left: 50px;"></rect>
            <text font-size="0.8em" transform="translate(82,35)">通信天数</text>
            <text font-size="0.8em" transform="translate(267,35)">权值</text>
        </svg>
    </div>
</template>
  
<script>
import * as d3 from 'd3'
import Vue from 'vue'
import { Button } from 'element-ui'

Vue.component(Button.name, Button);

export default {
    data(){
        return{
            radio_label : 0,
            margin_days : { top: 5, right: 180, bottom: 950, left: 90 },
            margin_weight : { top: 5, right: 0, bottom: 950, left: 275 },
            rects_height : 40,//直方图最大高度
            rects_weight : 160,//直方图整体宽度
            nodes : [],    //所有点 
            links : [],    //所有边
            max_time : 0,
            max_weight : 0,
            min_weight : 0,
        }
    },

    methods:{
        //获取控制面板所用的数据
        generate_data_controller(nodes,links){

                nodes = JSON.parse(JSON.stringify(nodes))
                links = JSON.parse(JSON.stringify(links))
                this.nodes = nodes;
                this.links = links;
                //ip -> index
                let ht = {};for(let i = 0;i < nodes.length; i ++)ht[nodes[i]['id']] = i
                for(let node of this.nodes){
                    node['time'] = 0        //通信天数
                    node['exist_days'] = []
                }

                //计算每个点的通信天数
                for(let link of this.links){
                    let source = link.source, target = link.target
                    let source_idx = ht[source], target_idx = ht[target];
                    if(source_idx === undefined || target_idx === undefined)continue;
                    this.nodes[source_idx].exist_days.push(link.time)
                    this.nodes[target_idx].exist_days.push(link.time) 
                }
                let min_time = this.links.length,max_time = -1
                for(let node of this.nodes){
                    let time = new Set(node.exist_days).size
                    node.time = time
                    min_time = Math.min(min_time,time);
                    max_time = Math.max(max_time,time)
                }

                //计算每个点的权值
                let maxWeight = Math.max(...this.nodes.map(v=>v.weight))
                let minWeight = Math.min(...this.nodes.map(v=>v.weight))

                this.max_time = max_time;
                this.max_weight = maxWeight;
                this.min_weight = minWeight;
                this.drawController(this.nodes,min_time,max_time)
        },
        drawController(data,min_time,max_time){

            const self = this;
            /**
             * 天数筛选
             */

            //天数筛选面板
            let svg = d3.select('#svg3')
            let ctr_days = svg.append('g').attr('class','ctr_days')
            .attr('transform',`translate(${this.margin_days.left},${this.margin_weight.top})`)

            //日期比例尺
            let date_scale = d3.scaleLinear().domain([min_time,max_time]).range([0,this.rects_weight])
           

            //滑动小球
            let slider_circle = ctr_days
            .append("circle")
            .attr("class", "slider_circle")
            .attr("fill", "steelblue")
            .attr("r", 2)
            .attr('cx',this.rects_weight)
            .attr('cy',this.rects_height + 2)
            .datum(max_time)          

            //日期ticks    
            let date_ticks = date_scale.ticks(max_time - min_time + 1)
            ctr_days.selectAll('.date_ticks').data(date_ticks).enter()
            .append('text').attr('class','date_ticks')
            .attr('x',function(d){
                return date_scale(d)
            })
            .attr('y',this.rects_height + 15)
            .attr("font-size", "16px").attr("fill", "steelblue")
            .attr("font-weight", "bold")
            .attr('opacity',0)
            .text(function (d) {
            return parseFloat(d)
            })

            //矩形
            let gap = 2
            let rects_height_real = this.rects_height - gap
            let y_scale = d3.scaleLinear().domain([0,data.length]).range([0,rects_height_real])
            let data_rects = [];for(let i = 0;i < max_time - min_time + 1; i ++)data_rects[i] = {nodes_num : 0,days : i + min_time}
            for(let i = 0; i < data.length; i ++){
                let days = data[i].time
                data_rects[days - min_time].nodes_num ++
            }
            let rect_width = this.rects_weight / (max_time - min_time + 1)
            ctr_days.selectAll('.date_rect').data(data_rects).enter()
            .append('rect')
            .attr('class','date_rect')
            .attr('x',function(d,i){
                return i * rect_width
            })
            .attr('y',function(d){
                return rects_height_real - y_scale(d.nodes_num)
            })
            .attr('width',rect_width)
            .attr('height',function(d){
                return y_scale(d.nodes_num)
            })
            .attr('fill','steelblue')
            .attr('opacity',0.15)

            //滑动事件
            function change_days(x){
                if(x > 160 || x < 0)return
                slider_circle.attr('cx',x)
                //高亮滑动选中的日期
                let date_selected = Math.round(date_scale.invert(x))
                d3.selectAll('.date_ticks').attr('opacity',function(d){
                    if(date_selected === d){
                        d3.select('.slider_circle').datum(d)
                        return 1
                    }
                    else return 0
                })
                //高亮时间
                d3.selectAll('.date_rect').attr('opacity',function(d){
                    if(date_selected <= d.days)return 1
                    else return 0.15
                })
            }

            //日期滑动线
            ctr_days.append('line').attr('class','slider_line')
                                    .attr('x1',0).attr('y1',this.rects_height)
                                    .attr('x2',this.rects_weight).attr('y2',this.rects_height)
                                    .attr('stroke','grey')
                                    .attr('stroke-width',5)
                                    .style('cursor','pointer')
                                    .call(d3.drag().on('drag',function(){
                                        change_days(d3.event.x)
                                    }))    

            /**
             * 权值筛选
             */

            //权值筛选面板
            let ctr_weight = svg.append('g').attr('class','ctr_weight')
                                            .attr('transform',`translate(${this.margin_weight.left},${this.margin_weight.top})`)

            //权值比例尺(假设权值和的区间为[1,10000])
            let weight_scale = d3.scaleLinear().domain([this.min_weight,this.max_weight]).range([0,this.rects_weight])
            

            //权值ticks
            let weight_ticks = weight_scale.ticks(5) //每个tick对应一个矩形的左下角
            let weight_tick_interval = weight_ticks[1] - weight_ticks[0]
            while(weight_ticks[0] > this.min_weight){ //解决ticks不完全包括weight范围的问题 - 左侧 
                weight_ticks.unshift(weight_ticks[0] - weight_tick_interval)
            }
            while(weight_ticks[weight_ticks.length-1] + weight_tick_interval < this.max_weight){ //解决ticks不完全包括weight范围的问题 - 右侧
                weight_ticks.push(weight_ticks[weight_ticks.length-1] + weight_tick_interval)
            }
            weight_scale = d3.scaleLinear().domain([weight_ticks[0],weight_ticks[weight_ticks.length-1] + weight_tick_interval]).range([0,this.rects_weight])

            //滑动小球
            let slider_circle_weight = ctr_weight
                                        .append("circle")
                                        .attr("class", "slider_circle_weight")
                                        .attr("fill", "steelblue")
                                        .attr("r", 2)
                                        .attr('cx',this.rects_weight)
                                        .attr('cy',this.rects_height + 2)
                                        .datum(weight_ticks[weight_ticks.length-1] + weight_tick_interval)//绑定的数据决定了最后筛选的指标


            //滑块文本
            ctr_weight.selectAll('.weight_ticks')
                        .data(weight_ticks)
                        .enter()
                        .append('text').attr('class','weight_ticks')
                        .attr('x',function(d){
                            return weight_scale(d)              
                        })
                        .attr('y',this.rects_height + 15)
                        .attr("font-size", "16px").attr("fill", "steelblue")
                        .attr("font-weight", "bold")
                        .attr('opacity',0)
                        .text(function (d) {
                            return parseFloat(d)
                        })

            //矩形
            let data_rects_weight = [];
            for(let i = 0; i < weight_ticks.length; i ++)data_rects_weight[i]={num : 0,weight : weight_ticks[i]}//weight为方块左侧权重
            for(let i = 0; i < data.length; i ++){
                let weight = data[i].weight
                let idx = Math.floor(1.0 * (weight - weight_ticks[0]) / weight_tick_interval)
                data_rects_weight[idx].num++;
            }
            let weight_scale_y = d3.scaleLinear().domain([0,data.length]).range([0,rects_height_real])
            let rect_width_weight = this.rects_weight / weight_ticks.length;
            ctr_weight.selectAll('.weight_rect')
                      .data(data_rects_weight)
                      .enter()
                      .append('rect').attr('class','weight_rect')
                      .attr('x',function(d,i){
                          return i * rect_width_weight
                      })
                      .attr('y',function(d){
                          return rects_height_real - weight_scale_y(d.num)
                      })
                      .attr('width',rect_width_weight)
                      .attr('height',function(d){
                          return weight_scale_y(d.num)
                      })
                      .attr('fill','steelblue')
                      .attr('opacity',0.15)


            //权值滑动线
            ctr_weight.append('line').attr('class','slider_line_weight')
                                     .attr('x1',0).attr('y1',this.rects_height)
                                     .attr('x2',this.rects_weight).attr('y2',this.rects_height)
                                     .attr('stroke','grey')
                                     .attr('stroke-width',5)
                                     .style('cursor','pointer')
                                     .call(d3.drag().on('drag',function(){
                                         change_weight(d3.event.x)
                                     }))

            //滑动事件
            function change_weight(x){
                if(x > self.rects_weight || x < 0)return
                slider_circle_weight.attr('cx',x)
            
                //高亮滑动选中的权值和
                let weight_selected = Math.round(weight_scale.invert(x))

                d3.select('.slider_circle_weight').datum(weight_selected)

                d3.selectAll('.weight_ticks').attr('opacity',function(d){
                    // if(d === weight_selected){
                    //     d3.select('.slider_circle_weight').datum(d)
                    //     return 1
                    // }
                    if(d >= weight_selected && d - weight_tick_interval < weight_selected){
                        // d3.select('.slider_circle_weight').datum(d)
                        return 1
                    }
                    else return 0
                })
                d3.selectAll('.weight_rect').attr('opacity',function(d){
                    if(weight_selected <= d.weight)return 1
                    else return 0.15
                })
            }
        },
        selectNodes(){
            let days = d3.select('.slider_circle').datum()
            let weight = d3.select('.slider_circle_weight').datum()

            //筛选
            let nodes = JSON.parse(JSON.stringify(this.nodes))
            let links = JSON.parse(JSON.stringify(this.links))


            let nodes_selected = [],links_selected = []
            let ht = {};for(let node of nodes)ht[node.id] = 0
            for(let node of nodes){
                if(node.time >= days && node.weight >= weight){
                    nodes_selected.push(node)
                    ht[node.id] = 1
                }
            }
            for(let link of links){
                let source = link.source,target = link.target
                if(ht[source] === 1 || ht[target] === 1)links_selected.push(link)
            }
            this.$emit('drawSeq',links_selected,nodes_selected)
        },
        clear(){
            d3.select('.slider_circle').datum(this.max_time).attr('cx',this.rects_weight)
            d3.select('.slider_circle_weight').datum(this.max_weight).attr('cx',this.rects_weight)
            d3.selectAll('.date_ticks').attr('opacity',0)
            d3.selectAll('.date_rect').attr('opacity',0.1)
            d3.selectAll('.weight_ticks').attr('opacity',0)
            d3.selectAll('.weight_rect').attr('opacity',0.1)
        },
    }
}
</script>

<style scoped>
/* .controller-view{
    display: flex;
    width:600px;
    height: 100px;
} */
</style>
  
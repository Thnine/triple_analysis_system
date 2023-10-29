<template>
    <div class="radviz-view">

        <div style="display:flex;position:absolute;right:20px;top:25px;">
            数据集：
            <el-select size="mini" style="width: 170px;margin-right:20px;" v-model="value" placeholder="请选择">
                    <el-option
                    v-for="item in options"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value">
                    </el-option>
            </el-select>
            <el-button size="mini" type="primary" @click="exportSeleted">圈选导出</el-button>
        </div>


        
        <div class="radviz-canvas">
            <svg id="radviz-svg" style="width:100%;height:100%;"></svg>
            <!--悬浮信息版-->
            <InfoPanel :style="InfoPanelStyle" v-show="InfoPanelVisible" ref="infoPanel"/>
        </div>
        
    </div>
</template>

<script>
import lasso from "@/lib/d3-lasso";
import InfoPanel from "./InfoPanel.vue";
import * as d3 from "d3";
import Vue from "vue";
import { Select,Option,Button } from "element-ui";

Vue.component(Select.name, Select);
Vue.component(Option.name, Option);
Vue.component(Button.name, Button);

var mylasso = lasso;
export default {
    name: "RadvizView",
    components:{InfoPanel},
    data: function () {
        return {
            //信息板相关
            InfoPanelVisible:false,
            InfoPanelStyle:{
                top:'0px',
                left:'0px'
            },//信息版的动态style

            //预定义颜色列表
            colorList : [
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
                "#ff7f00",
                "#24a221",
                "#d8241f",
                "#9564bf",
                "#8d5649",
                "#e574c3",
                "#7f7f7f",
                "#bcbf00",
                "#00bed1",
                "#fb9a99",
                "#ffff99",
                "#b15928",
                "#fb9a99",
                "#b2df8a",
            ],
            //动态属性名
            attrName:{},
            //动态属性名对应颜色字典
            attrColor:{},
            //基于node聚合结果的百分比
            aggregatePercent:{},
            //node聚合结果
            newData:{},
            //输入数据
            Data:[
                {"id": "0", "node": "238.103.29.241", "time": "2023-09-21 00:00:00", "attr_0": 0, "attr_1": 0, "attr_2": 0, "attr_3": 9.56218651138595, "attr_4": 0, "attr_5": 5.966521018056097, "attr_6": 0, "attr_7": 0, "attr_8": 0, "attr_9": 0, "attr_10": 0, "attr_11": 2.055553380512558, "attr_12": 0, "attr_13": 4.657096513034372, "attr_14": 9.837651048084641, "attr_15": 9.158556075592006, "attr_16": 9.717660772291145, "attr_17": 3.035579956028852, "attr_18": 4.330988990440886, "attr_19": 0, "attr_20": 5.929435955792148, "attr_21": 1.8587247949595276, "attr_22": 3.0692302440259898, "attr_23": 0.8143816977305307}, 
                {"id": "1", "node": "59.180.146.243", "time": "2023-09-02 00:00:00", "attr_0": 0, "attr_1": 0, "attr_2": 0, "attr_3": 0, "attr_4": 0, "attr_5": 5.580977879421724, "attr_6": 0, "attr_7": 0, "attr_8": 3.836884360187377, "attr_9": 0, "attr_10": 4.0999822732473, "attr_11": 1.2932375677836894, "attr_12": 2.7152406798454054, "attr_13": 3.9315468792080885, "attr_14": 0, "attr_15": 0, "attr_16": 2.8626181749204394, "attr_17": 7.932111177732141, "attr_18": 8.420848396757595, "attr_19": 0.12639855724374427, "attr_20": 3.1204121279813544, "attr_21": 0.2835719853276486, "attr_22": 8.838561234867669, "attr_23": 9.304053695951076}, 
                {"id": "2", "node": "169.76.131.141", "time": "2023-09-08 00:00:00", "attr_0": 0, "attr_1": 0, "attr_2": 0, "attr_3": 0, "attr_4": 0, "attr_5": 0, "attr_6": 7.558999656579822, "attr_7": 8.216863336221252, "attr_8": 6.88822739917957, "attr_9": 0, "attr_10": 0, "attr_11": 2.302691664817268, "attr_12": 0, "attr_13": 2.7829147997185375, "attr_14": 0, "attr_15": 0.9658692360806431, "attr_16": 3.2486593029106148, "attr_17": 3.181826107798069, "attr_18": 2.4854341574686725, "attr_19": 8.210032694468683, "attr_20": 2.0321570178788373, "attr_21": 9.650744413331045, "attr_22": 1.658946999642994, "attr_23": 7.870103448491248}, 
                {"id": "3", "node": "210.115.149.80", "time": "2023-09-26 00:00:00", "attr_0": 0, "attr_1": 0, "attr_2": 0, "attr_3": 0, "attr_4": 0, "attr_5": 0, "attr_6": 0, "attr_7": 9.216970572807027, "attr_8": 2.082845392055922, "attr_9": 2.043498323566917, "attr_10": 6.9335785274666595, "attr_11": 8.404637071747901, "attr_12": 0, "attr_13": 6.939188041712501, "attr_14": 0, "attr_15": 0, "attr_16": 0.596734305458203, "attr_17": 5.3806971027421024, "attr_18": 0, "attr_19": 8.63878107521439, "attr_20": 0, "attr_21": 7.76731628868602, "attr_22": 8.244655709431974, "attr_23": 5.077388504260742},
                {"id": "4", "node": "210.115.149.80", "time": "2023-09-26 00:00:00", "attr_0": 0, "attr_1": 0, "attr_2": 0, "attr_3": 0, "attr_4": 0, "attr_5": 0, "attr_6": 0, "attr_7": 9.216970572807027, "attr_8": 2.082845392055922, "attr_9": 2.043498323566917, "attr_10": 6.9335785274666595, "attr_11": 8.404637071747901, "attr_12": 0, "attr_13": 6.939188041712501, "attr_14": 0, "attr_15": 0, "attr_16": 0.596734305458203, "attr_17": 5.3806971027421024, "attr_18": 0, "attr_19": 8.63878107521439, "attr_20": 0, "attr_21": 7.76731628868602, "attr_22": 8.244655709431974, "attr_23": 4.077388504260742}
            ],
            Data2:[
                {"id": "0", "node": "238.103.29.241", "time": "2023-09-21 00:00:00", "attr_0": 0, "attr_1": 0, "attr_2": 0, "attr_3": 9.56218651138595, "attr_4": 0, "attr_5": 5.966521018056097, "attr_6": 0, "attr_7": 0, "attr_8": 0, "attr_9": 0, "attr_10": 0, "attr_11": 2.055553380512558, "attr_12": 0, "attr_13": 4.657096513034372, "attr_14": 9.837651048084641, "attr_15": 9.158556075592006, "attr_16": 9.717660772291145, "attr_17": 3.035579956028852, "attr_18": 4.330988990440886, "attr_19": 0, "attr_20": 5.929435955792148, "attr_21": 1.8587247949595276, "attr_22": 3.0692302440259898, "attr_23": 0.8143816977305307}, 
                {"id": "1", "node": "59.180.146.243", "time": "2023-09-02 00:00:00", "attr_0": 0, "attr_1": 0, "attr_2": 0, "attr_3": 0, "attr_4": 0, "attr_5": 5.580977879421724, "attr_6": 0, "attr_7": 0, "attr_8": 3.836884360187377, "attr_9": 0, "attr_10": 4.0999822732473, "attr_11": 1.2932375677836894, "attr_12": 2.7152406798454054, "attr_13": 3.9315468792080885, "attr_14": 0, "attr_15": 0, "attr_16": 2.8626181749204394, "attr_17": 7.932111177732141, "attr_18": 8.420848396757595, "attr_19": 0.12639855724374427, "attr_20": 3.1204121279813544, "attr_21": 0.2835719853276486, "attr_22": 8.838561234867669, "attr_23": 9.304053695951076}, 
            ],
            options: [{
                        value: '0',
                        label: '全部数据'
                    },{
                        value: '1',
                        label: '网络结构图圈选数据'
                    },{
                        value: '2',
                        label: '大规模序列视图刷选数据'
                    },
                ],
            value:"0",
            data_source : -1,
            
            rawData:[],
            realRawData:[],
            net_filter_data:[],
            seq_filter_data:[],

        }
    },
    mounted(){
    },
    computed:{
    },
    watch:{
        value:{
            handler(val){
                if(val=="0"){
                    this.data_source = 0
                    this.rawData = this.realRawData;
                    this.pipeline();
                }else if(val=="1"){
                    this.data_source = 1;
                    this.rawData = this.net_filter_data;
                    this.pipeline();
                }else if(val=="2"){
                    this.data_source = 2;
                    this.rawData = this.seq_filter_data;
                    this.pipeline();
                }
            }
        },
    },
    methods:{
        set_raw_data(node_radar){
            this.realRawData = JSON.parse(JSON.stringify(node_radar))
            this.rawData = node_radar
            this.net_filter_data = []
            this.seq_filter_data = []
            this.initRadviz();
            this.pipeline();
        },
        set_seq_nodes(seq_ids){//序列图刷选
            //seq_nodes：nodes的序列 序列图刷选出来的

            let data = []//过滤数据
            for(let i = 0;i < this.realRawData.length;i++){
                let tempData = JSON.parse(JSON.stringify(this.realRawData[i]))
                if(seq_ids.indexOf(tempData.node) != -1){
                    data.push(tempData)
                }
            }
            this.seq_filter_data = data;
            if(this.value == '2'){
                this.rawData = this.seq_filter_data
                this.pipeline()
            }

        },
        set_net_nodes(net_ids){//节点连接图圈选
            //net_nodes：nodes的序列，节点连接图圈选出来的

            let data = []//过滤数据
            for(let i = 0;i < this.realRawData.length;i++){
                let tempData = JSON.parse(JSON.stringify(this.realRawData[i]))
                if(net_ids.indexOf(tempData.node) != -1){
                    data.push(tempData)
                }
            }
            this.net_filter_data = data;
            if(this.value == '1'){
                this.rawData = this.net_filter_data
                this.pipeline()
            }
        },

        initRadviz:function(){
            this.svg = d3.select("#radviz-svg");
            this.width = this.svg.node().getBoundingClientRect().width;
            this.height = this.svg.node().getBoundingClientRect().height;
            this.svg.attr("width", this.width).attr("height", this.height); 
            this.radviz_g = this.svg.append("g").attr("id","radviz_g")
            this.rect_g = this.svg.append("g")
            // this.tooltip = d3.select(".radviz-view")
            //         .append("div")
            //         .style("border","1px solid black")
            //         .style("opacity",0)
            //         .style("background-color","white")
            //         .style("position","absolute");
        },
        pipeline:function(){
            this.processRawData()    //处理原始数据，基于node进行聚合
            this.processAttrData()   //统计属性级别的数据
            this.bindColor()         //为获得的属性进行颜色绑定
            this.dataGenerate()      //计算glyph、arc坐标
            this.drawRadviz();       //绘制radviz
            this.callLassoMode()     //允许圈选
        },
        bindColor:function(){
            let i=0;
            
            for(let key in this.attrName){
                if(i<this.colorList.length)this.attrColor[key]=this.colorList[i]
                else this.attrColor[key]="#cccccc"
                i++;
            }
        },
        processRawData:function(){
            let rawData = this.rawData
            let midData = {}
            for(let i=0;i<rawData.length;i++){
                //按ip聚合
                if(midData.hasOwnProperty(rawData[i]['node'])){
                    midData[rawData[i]['node']].push(rawData[i])
                }else{
                    midData[rawData[i]['node']]=[]
                    midData[rawData[i]['node']].push(rawData[i])
                }
            }
            let i=0
            this.newData = []
            for(let key in midData){
                let tmp={"index":i,"node":key,"attrs":{}}
                let single_node_list = midData[key]
                for(let i=0;i<single_node_list.length;i++){
                    let single_record = single_node_list[i]
                    for(let subkey in single_record){
                        if(subkey!=="id" && subkey !== "time" && subkey !== "node"){   //聚合后id和time没有意义
                            if(tmp["attrs"].hasOwnProperty(subkey)){
                                tmp["attrs"][subkey] += single_record[subkey]
                            }else{
                                tmp["attrs"][subkey] = single_record[subkey]
                            }
                            if(!this.attrName.hasOwnProperty(subkey))this.attrName[subkey]=1
                        }
                    }
                }
                this.newData.push(tmp)
                i++
            }

            this.aggregatePercent = []
            for(let i=0;i<this.newData.length;i++){
                let sum=0
                for(let key in this.newData[i]["attrs"]){
                    sum+=this.newData[i]["attrs"][key]
                }
                let tmp = this.deepClone(this.newData[i])
                for(let key in this.newData[i]["attrs"]){
                    tmp["attrs"][key]/=sum
                    tmp["attrs"][key]*=100
                    tmp["attrs"][key].toFixed(2)
                }
                this.aggregatePercent.push(tmp)
            }
        },
        processAttrData:function(){
            let vue_this = this
            let attr_nums = this.attrName
            //统计原始结果的非零百分比和累计和
            this.notZeroPercent = {}
            this.totalSum = {}
            // let totalSumMax = -1
            let totalSumSum = 0


            for(let key in this.attrName){
                let sum=0
                let oneCnt=0
                for(let i=0;i<this.rawData.length;i++){
                    sum += this.rawData[i][key]
                    if(this.rawData[i][key]>0)oneCnt+=1
                }
                this.notZeroPercent[key]=oneCnt/this.rawData.length
                this.totalSum[key]=sum
                // totalSumMax = Math.max(sum,totalSumMax)
                totalSumSum += sum

            }
            let odata = [this.notZeroPercent,this.totalSum]

            let pool2amount = {}
            for (let key in this.attrName) {
                if(this.attrName[key]==0)continue;
                pool2amount[key] = [0, 0]
            }
            //统计聚合结果中属性的非零比例
            for (let j in odata[0]) {
                pool2amount[j][0] = odata[0][j]
                pool2amount[j][1] = odata[1][j]
            }
            
            let attrs = []
            for (let key in pool2amount) {
                let temp = {}
                temp["pool"] = key
                temp["velocity"] = pool2amount[key][0]   //外环是非0比例
                temp["range"] = pool2amount[key][1]      //内环是聚合属性归一化
                attrs.push(temp)
            }
            this.amountMap = d3.scaleLinear().range([0, 1])
            this.userMap = d3.scaleLinear().range([0, 1])

            //数值映射，如果定义域范围改变，需要修改这个
            this.amountMap.domain([
                0,
                1          //非0百分比的定义域本身为0-1
            ])
            this.userMap.domain([
                0,
                // totalSumMax  //累计和的定义域本身为0-max
                totalSumSum
            ])
            this.influenceData = {}
            this.total = 0
            for (let i = 0; i < attrs.length; i++) {
                this.influenceData[attrs[i]["pool"]] = attrs[i]
                this.total += attrs[i]["velocity"]
            }        
        },
        Attractor:function(name, x, y, arc) {
            this.name = name
            this.x = x
            this.y = y
            this.arc = arc
        },
        generateCoord:function(attractions, width, height){
            this.attractions = attractions
            this.totalAttractorForce = function () {
                var temp = this.attractions
                    .map(function (a) {
                    return a.force
                    })
                    .reduce(function (a, b) {
                    return a + b
                    })
                if (temp == 0) return 1
                return temp
            }
            this.coordinateX = function () {
                return (
                    this.attractions
                    .map(function (a) {return a.force * (a.attractor.x - width / 2)})
                    .reduce(function (a, b) {return a + b}) 
                    / this.totalAttractorForce() + width / 2
                )
            }
            this.coordinateY = function () {
                return (
                    this.attractions
                    .map(function (a) {return a.force * (a.attractor.y - height / 2)})
                    .reduce(function (a, b) {return a + b}) 
                    / this.totalAttractorForce() +height / 2
                )
            }
            this.coordinates = [this.coordinateX(), this.coordinateY()]
        },
        dataGenerate:function(){
            let attrName = this.attrName
            let data = this.newData
            let width = this.width
            let height = this.height
            let r = width / 2 - 70
            let borderR = width / 2 - 60

            this.attractors = []
            this.datapoints = []
            this.arcData = []
            this.arcData2 = []
            this.baseData = [[], [], []]
            this.scale = 1
            
            let attrList = []
            for(let key in this.attrName)if(this.attrName[key]==1)attrList.push(key)
            let length = attrList.length

            let i=0;
            for (let key in attrName) {
                if(attrName[key]==0)continue;
                let tmp = new this.Attractor(
                        attrName[key],
                        width / 2 + r * Math.cos((2 * Math.PI * i) / length + Math.PI / 2),
                        height / 2 - r * Math.sin((2 * Math.PI * i) / length + Math.PI / 2),
                        i
                    )
                this.attractors.push(tmp   )
                var rangeArc = (2 *(170 / 180) *Math.PI *this.userMap(this.influenceData[key]["range"])) / length
                this.arcData.push({
                    startAngle: 2 * Math.PI -(2 * Math.PI * i) / length +rangeArc -((170 / 180) * Math.PI) / length,
                    endAngle: 2 * Math.PI -(2 * Math.PI * i) / length - ((170 / 180) * Math.PI) / length,
                    innerRadius: borderR,
                    outerRadius: borderR + 10,
                    fill: this.pool2color(key),
                })
                rangeArc =(2 *(170 / 180) *Math.PI *this.amountMap(this.influenceData[key]["velocity"])) /length
                this.arcData2.push({
                    startAngle: 2 * Math.PI -(2 * Math.PI * i) / length +rangeArc -((170 / 180) * Math.PI) / length,
                    endAngle: 2 * Math.PI -(2 * Math.PI * i) / length - ((170 / 180) * Math.PI) / length,
                    innerRadius: borderR + 15,
                    outerRadius: borderR + 25,
                    fill: this.pool2color(key),
                })


                this.baseData[0].push({
                    startAngle:2 * Math.PI -(2 * Math.PI * i) / length +(2 * (170 / 180) * Math.PI) / length -((170 / 180) * Math.PI) / length,
                    endAngle:2 * Math.PI -(2 * Math.PI * i) / length -((170 / 180) * Math.PI) / length,
                    innerRadius: borderR,
                    outerRadius: borderR + 10,
                    fill: this.pool2color(key),
                })

                this.baseData[1].push({
                    startAngle:2 * Math.PI -(2 * Math.PI * i) / length +(2 * (170 / 180) * Math.PI) / length -((170 / 180) * Math.PI) / length,
                    endAngle:2 * Math.PI -(2 * Math.PI * i) / length -((170 / 180) * Math.PI) / length,
                    innerRadius: borderR + 15,
                    outerRadius: borderR + 25,
                    fill: this.pool2color(key),
                })
                i++;
            }

            for (i = 0; i < data.length; i++) {
                var prop = []
                let j=0;
                for (let key in attrName) {
                    if(attrName[key]==0)continue;
                    var forceTemp = 0
                    if (data[i]['attrs'].hasOwnProperty(key))forceTemp = data[i]['attrs'][key]
                    prop.push({ attractor: this.attractors[j], force: forceTemp, node:data[i]["node"]})
                    j++;
                }
                this.datapoints.push(
                    new this.generateCoord(prop, this.width, this.height)
                )
            }
        },
        pool2color:function (pool, satuation) {
            let color = "";
            if(this.attrColor.hasOwnProperty(pool))color = this.attrColor[pool]
            else color = "#cccccc"

            if (satuation == null) {
                return color
            } else {
                let hslValue = rgbToHsl(hexToRgb(color))
                let rgbValue = hslToRgb(
                        hslValue[0],
                        satuation * hslValue[1],
                        1 - (1 - hslValue[2]) * satuation
                    )
                return "rgb(" + rgbValue.join(",") + ")"
            }
        },
        drawRadviz:function(){
            this.radviz_g.selectAll('g').remove()
            this.drawArc();
            this.drawSubPie();
            this.drawColorRect();
        },
        drawArc:function(){
            let vue_this = this
            let fillOpacity = 0.5
            let width = this.width
            let height = this.height
            let baseData = this.baseData
            let arcData = this.arcData
            let arcData2 = this.arcData2
            let svg = this.radviz_g
            let arc = d3.arc()

            // baseData[1] = []//change1

            svg.selectAll(".circleBase")
                .data(baseData)
                .enter()
                .append("g")
                .attr("class", "circleBase")
                .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
           svg.selectAll(".circleBase").data(baseData).exit().remove()

            svg.selectAll(".circleBase")
                .data(baseData)
                .selectAll(".arcBase")
                .data(function (d) {
                    return d
                })
                .enter()
                .append("path")
                .attr("class", "arcBase")

            svg.selectAll(".circleBase")
                .data(baseData)
                .selectAll(".arcBase")
                .data(function (d) {
                    return d
                })
                .exit()
                .remove()

            svg.append("g")
                .selectAll(".attractors")
                .data(arcData)
                .enter()
                .append("path")
                .attr("class", "attractors")

            svg.selectAll(".attractors").data(arcData).exit().remove()
            svg.selectAll(".attractors")
                .data(arcData)
                .attr("class", "attractors")
                .attr("id",function(d,i){
                    return "attractors_"+i;
                })
                .style("fill", function (d) {
                    return d.fill
                })
                .attr("opacity", fillOpacity)
                .attr("stroke-width", 0)
                .attr("stroke", "black")
                .attr("d", arc)
                .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")



                svg.selectAll(".circleBase")
                .data(baseData)
                .selectAll(".arcBase")
                .data(function (d) {
                    return d
                })
                .attr("d", arc)
                .attr("fill", "#ffffff")
                .attr("opacity", 1)
                .attr("stroke", function (d, i) {
                    return arcData2[i].fill
                })
                .attr("stroke-width", 2)
            // change2
            svg.append("g")
                .selectAll(".attractors2")
                .data(arcData2)
                .enter()
                .append("path")
                .attr("class", "attractors2")

            svg.selectAll(".attractors2").data(arcData2).exit().remove()
            svg.selectAll(".attractors2")
                .data(arcData2)
                .attr("class", "attractors2")
                .style("fill", function (d) {
                    return d.fill
                })
                .attr("opacity", fillOpacity)
                .attr("stroke-width", 0)
                .attr("stroke", "black")
                .attr("d", arc)
                .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
                
        },
        drawSubPie:function(){
            let vue_this = this;
            let scale = this.scale
            let svg = this.radviz_g
            let datapoints = this.datapoints

            var points = svg.append('g')
                .selectAll(".points")
                .data(datapoints)
                .enter()
                .append("g")
                .attr("class", "points")
                .attr("opacity", 1)

            let attrList = []
            for(let key in this.attrName)if(this.attrName[key]==1)attrList.push(key)

            points = svg.selectAll(".points").data(datapoints).exit().remove()
            points = svg.selectAll(".points").data(datapoints)
            .attr('id',function(d,i){
                return "points_"+i
            })
            points.selectAll('path').remove()
            var arcs = points
            .selectAll(".arcs")
            .data(function (d) {
                let temp = []
                for (let i=0;i<attrList.length;i++)
                temp.push(d["attractions"][i]["force"])
                let res = d3.pie()(temp)
                    .map(function (t) {
                        t["amount"] = d.amount
                        return t
                    })
                return res;
            })
            .enter()
            .append("path")
            .attr("class", "arcs")
            
            
            arcs = points
                .selectAll(".arcs")
                .data(function (d) {
                    let temp = []
                    for (let i=0;i<attrList.length;i++)
                    temp.push(d["attractions"][i]["force"])
                    let res = d3.pie()(temp)
                        .map(function (t) {
                            t["amount"] = d.amount
                            return t
                        })
                    return res
                })
                .attr(
                    "d",d3.arc().innerRadius(0).outerRadius(10 * scale)
                )
                .attr("fill", function (d, i) {
                    return vue_this.pool2color(attrList[i])
                })
                .attr("opacity", function(d,i){
                    return 0.7;
                })

            points.on("mouseover", function (e,d) {
                let selection = vue_this.svg.selectAll('.points').nodes()
                let i = selection.indexOf(this)


                console.log(vue_this.print(i))

                vue_this.InfoPanelVisible = true;//显示
                vue_this.$refs['infoPanel'].setMessageData(vue_this.print(i));//更新信息
                /**
                 * 更新位置
                 */
                vue_this.InfoPanelStyle['top'] = `${d3.event.offsetY + 10}px`
                vue_this.InfoPanelStyle['left'] = `${d3.event.offsetX + 10}px`

                // vue_this.tooltip
                //     .style("left",(d3.event.offsetX+15)+"px")
                //     .style("top",(d3.event.offsetY-15)+"px")
                //     .style("opacity",1)
                //     .style("font-size","15px")
                //     .html(vue_this.print(i))
            })
            .on("mouseout", function (d) {
                vue_this.InfoPanelVisible = false;//显示

                // vue_this.tooltip.style("opacity","0")
                // .style("left",0)
                // .style("top",0)
                // .html("")
            })
            .attr("transform", function (d) {
                return "translate(" + d.coordinateX() + "," + d.coordinateY() + ")"
            })
        },
        drawColorRect:function(){
            let vue_this = this
            let fadedOpacity = 0.3
            let fillOpacity = 0.7
            let width = this.width
            let attrName = this.attrName
            let attrList = []
            for(let key in attrName)attrList.push(key)
            let length = attrList.length
            let rect_g = this.rect_g

            var poolTag = rect_g
                .selectAll(".poolTag")
                .data(attrList)
            poolTag
                .enter()
                .append("g")
                .attr("class", "poolTag")
                .attr("id", function (d) {
                    return "rect_" + d
                })
                // .attr("transform", function (d, i) {
                //     return ("translate(" +(width / length * i ) +"," +0 +")")
                // })
                .attr("transform", function (d, i) {
                    return ("translate(" +(25 * i + 10) +"," +0 +")")
                })
                .attr("opacity", function (d) {
                    return fillOpacity
                })
                .on("click", function (d,e) {
                    let name = this.id.slice(5)
                    vue_this.update(name)
                    if (vue_this.attrName[name] == 0){
                        d3.select(this).attr("opacity",fadedOpacity)
                    }else{
                        d3.select(this).attr("opacity",fillOpacity)
                    }  
                })
                .append("rect")
                .attr("class", "tagBase")
                .attr("x", 0)
                .attr("y", 0)
                .attr("height", 20)
                .attr("width", 20)
                .attr("fill", function (d) {
                    return vue_this.pool2color(d)
                })
                .attr("opacity", function (d) {
                    return 1
                })
                .attr("stroke","black")
        },
        update:function (pool) {
            this.attrName[pool] = 1 - this.attrName[pool]
            this.dataGenerate()
            this.drawRadviz();
        },
        print:function(index){

            let message = {}
            message.node = this.newData[index]['node']
            for(let key in this.attrName){
                message[key + "累计"] = this.newData[index]["attrs"][key].toFixed(2) + ""
            }
            return message


            // let res = ""
            // let node = "node:"+this.newData[index]['node']

            // res = node + "<br>"
            // let i=0
            // for(let key in this.attrName){
            //     res += "" + key + ":" + this.newData[index]["attrs"][key].toFixed(2)+"  "
            //     if((i+1)%4==0)res+="<br>"
            //     i++
            // }
            // return res
        },
        callLassoMode:function(){
            let svg = this.svg

            var lasso = mylasso()
            .closePathSelect(true)
            .closePathDistance(100)
            .targetArea(svg)

            lasso = this.callPointsLassoMode(svg,lasso)
            svg.call(lasso)

        },
        callPointsLassoMode: function(svg,lasso){
            let vue_this = this
            var lasso_start = function() {
                lasso.items()
                    .attr("opacity",0.75) // reset size
            };

            var lasso_draw = function() {
                // Style the possible dots
                lasso.possibleItems()
                    .attr("opacity",1)

                // Style the not possible dot
                lasso.notPossibleItems()
                    .attr("opacity",0.75)
            };

            var lasso_end = function() {
                // Reset the color of all dots
                lasso.items()
                    .attr("opacity",0.75)

                // Style the selected dots
                lasso.selectedItems()
                    .attr("opacity",1)
                    
                let selected = lasso.selectedItems()._groups[0]
                vue_this.lasso_ids=[]
                for(let i=0;i<selected.length;i++){
                    let index = parseInt(selected[i].id.slice(7))
                    vue_this.lasso_ids.push(vue_this.newData[index]['node'])
                }
            };
            //targetArea必须是svg，call的也必须是svg
            lasso.items(svg.selectAll(".points"))
                .on("start",lasso_start)
                .on("draw",lasso_draw)
                .on("end",lasso_end);

            return lasso
        },
        //使用递归的方式实现数组、对象的深拷贝
        deepClone:function deepClone(obj){
            let objClone = Array.isArray(obj) ? [] : {};
            if (obj && typeof obj === "object") {
                for (var key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        //判断ojb子元素是否为对象，如果是，递归复制
                        if (obj[key] && typeof obj[key] === "object") {
                            objClone[key] = deepClone(obj[key]);
                        } else {
                            //如果不是，简单复制
                            objClone[key] = obj[key];
                        }
                    }
                }
            }
            return objClone;
        }, 
        heightlight:function(node_list){
            let heightlight_items = this.newData.filter((item, i, arr) => {
                return node_list.indexOf(item.node)!=-1
            })
            let svg = this.svg
            svg.selectAll(".points").attr("opacity",0.25)
            for(let i=0;i<heightlight_items.length;i++){
                svg.select("#points_"+heightlight_items[i].index).attr("opacity",1)
            }
        },
        exportSeleted:function(){
            this.$emit('radar_selected_nodes',this.lasso_ids)
        }
    },   
}
</script>

<style scoped lang='less'>
.radviz-view{
    display: flex;
    flex-direction: column;
    position: relative;
    align-items: stretch;
}
.radviz-canvas{
    position: relative;
    margin-left:60px;
    margin-right:60px;
    margin-top:70px;
    margin-bottom:10px;
    flex: 1 1 0;
    display: flex;

}



</style>


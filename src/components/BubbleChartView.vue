<template>
    <div>
      <div class="view">
        <svg id="svg0" width="700" height="270"></svg>
      </div>
    </div>
</template>

<script>
import * as d3 from "d3";
import * as chroma from "@/lib/chroma.min.js";

export default {

  props:['InfoPanel'],

  data() {
    return {
      testData: [
        { id: 1, ip: "192.168.1.1", time: "2020-19-20 10:00", attr1: 0.12, attr2: 0.02, attr3: 0.31, attr4: 0.76, attr5: 0.37, weight_ip: 2 },
        { id: 2, ip: "192.168.1.2", time: "2020-19-20 10:00", attr1: 0.32, attr2: 0.02, attr3: 0.41, attr4: 0.63, attr5: 0.25, weight_ip: 1 },
        { id: 3, ip: "192.168.1.3", time: "2020-19-20 10:00", attr1: 0.22, attr2: 0.92, attr3: 0.51, attr4: 0.42, attr5: 0.56, weight_ip: 3 },
        { id: 4, ip: "192.168.1.4", time: "2020-19-20 10:00", attr1: 0.52, attr2: 0.02, attr3: 0.61, attr4: 0.52, attr5: 0.47, weight_ip: 4 },
        { id: 5, ip: "192.168.1.5", time: "2020-19-20 10:00", attr1: 0.62, attr2: 0.02, attr3: 0.71, attr4: 0.85, attr5: 0.52, weight_ip: 5 },
        { id: 6, ip: "192.168.1.1", time: "2020-19-20 11:00", attr1: 0.72, attr2: 0.12, attr3: 0.81, attr4: 0.31, attr5: 0.34, weight_ip: 1 },
        { id: 7, ip: "192.168.1.2", time: "2020-19-20 11:00", attr1: 0.32, attr2: 0.52, attr3: 0.91, attr4: 0.15, attr5: 0.25, weight_ip: 2 },
        { id: 8, ip: "192.168.1.3", time: "2020-19-20 11:00", attr1: 0.12, attr2: 0.52, attr3: 0.13, attr4: 0.36, attr5: 0.63, weight_ip: 2 },
        { id: 9, ip: "192.168.1.4", time: "2020-19-20 11:00", attr1: 0.22, attr2: 0.52, attr3: 0.14, attr4: 0.25, attr5: 0.56, weight_ip: 3 },
        { id: 10, ip: "192.168.1.5", time: "2020-19-20 11:00", attr1: 0.62, attr2: 0.42, attr3: 0.12, attr4: 0.56, attr5: 0.22, weight_ip: 2 },
        { id: 11, ip: "192.168.1.1", time: "2020-19-20 12:00", attr1: 0.72, attr2: 0.92, attr3: 0.14, attr4: 0.63, attr5: 0.72, weight_ip: 2 },
        { id: 12, ip: "192.168.1.2", time: "2020-19-20 12:00", attr1: 0.42, attr2: 0.82, attr3: 0.16, attr4: 0.14, attr5: 0.82, weight_ip: 1 },
        { id: 13, ip: "192.168.1.3", time: "2020-19-20 12:00", attr1: 0.12, attr2: 0.62, attr3: 0.17, attr4: 0.71, attr5: 0.92, weight_ip: 1 },
        { id: 14, ip: "192.168.1.4", time: "2020-19-20 12:00", attr1: 0.12, attr2: 0.62, attr3: 0.18, attr4: 0.61, attr5: 0.22, weight_ip: 3 },
        { id: 15, ip: "192.168.1.5", time: "2020-19-20 12:00", attr1: 0.22, attr2: 0.22, attr3: 0.32, attr4: 0.14, attr5: 0.32, weight_ip: 4 },
        { id: 16, ip: "192.168.1.1", time: "2020-19-20 13:00", attr1: 0.32, attr2: 0.62, attr3: 0.43, attr4: 0.23, attr5: 0.42, weight_ip: 1 },
        { id: 17, ip: "192.168.1.2", time: "2020-19-20 13:00", attr1: 0.22, attr2: 0.62, attr3: 0.25, attr4: 0.43, attr5: 0.52, weight_ip: 1 },
        { id: 18, ip: "192.168.1.3", time: "2020-19-20 13:00", attr1: 0.12, attr2: 0.62, attr3: 0.45, attr4: 0.53, attr5: 0.42, weight_ip: 2 },
        { id: 19, ip: "192.168.1.4", time: "2020-19-20 13:00", attr1: 0.12, attr2: 0.62, attr3: 0.25, attr4: 0.36, attr5: 0.42, weight_ip: 3 },
        { id: 20, ip: "192.168.1.5", time: "2020-19-20 13:00", attr1: 0.22, attr2: 0.12, attr3: 0.27, attr4: 0.37, attr5: 0.22, weight_ip: 4 },
        { id: 21, ip: "192.168.1.1", time: "2020-19-20 14:00", attr1: 0.12, attr2: 0.62, attr3: 0.56, attr4: 0.26, attr5: 0.12, weight_ip: 3 },
        { id: 22, ip: "192.168.1.2", time: "2020-19-20 14:00", attr1: 0.22, attr2: 0.62, attr3: 0.23, attr4: 0.72, attr5: 0.72, weight_ip: 1 },
        { id: 23, ip: "192.168.1.3", time: "2020-19-20 14:00", attr1: 0.32, attr2: 0.62, attr3: 0.25, attr4: 0.37, attr5: 0.22, weight_ip: 2 },
        { id: 24, ip: "192.168.1.4", time: "2020-19-20 14:00", attr1: 0.42, attr2: 0.62, attr3: 0.28, attr4: 0.48, attr5: 0.32, weight_ip: 3 },
        { id: 25, ip: "192.168.1.5", time: "2020-19-20 14:00", attr1: 0.52, attr2: 0.62, attr3: 0.29, attr4: 0.58, attr5: 0.42, weight_ip: 4 },
        { id: 26, ip: "192.168.1.1", time: "2020-19-20 15:00", attr1: 0.52, attr2: 0.26, attr3: 0.30, attr4: 0.67, attr5: 0.12, weight_ip: 1 },
        { id: 27, ip: "192.168.1.2", time: "2020-19-20 15:00", attr1: 0.42, attr2: 0.35, attr3: 0.31, attr4: 0.78, attr5: 0.32, weight_ip: 1 },
        { id: 28, ip: "192.168.1.3", time: "2020-19-20 15:00", attr1: 0.32, attr2: 0.54, attr3: 0.32, attr4: 0.89, attr5: 0.42, weight_ip: 2 },
        { id: 29, ip: "192.168.1.4", time: "2020-19-20 15:00", attr1: 0.22, attr2: 0.62, attr3: 0.33, attr4: 0.69, attr5: 0.52, weight_ip: 1 },
        { id: 30, ip: "192.168.1.5", time: "2020-19-20 15:00", attr1: 0.12, attr2: 0.26, attr3: 0.34, attr4: 0.36, attr5: 0.62, weight_ip: 3 },
        { id: 31, ip: "192.168.1.1", time: "2020-19-20 16:00", attr1: 0.12, attr2: 0.52, attr3: 0.61, attr4: 0.26, attr5: 0.72, weight_ip: 4 },
        { id: 32, ip: "192.168.1.2", time: "2020-19-20 16:00", attr1: 0.62, attr2: 0.35, attr3: 0.69, attr4: 0.36, attr5: 0.12, weight_ip: 4 },
        { id: 33, ip: "192.168.1.3", time: "2020-19-20 16:00", attr1: 0.72, attr2: 0.43, attr3: 0.62, attr4: 0.36, attr5: 0.22, weight_ip: 1 },
        { id: 34, ip: "192.168.1.4", time: "2020-19-20 16:00", attr1: 0.82, attr2: 0.62, attr3: 0.62, attr4: 0.47, attr5: 0.32, weight_ip: 3 },
        { id: 35, ip: "192.168.1.5", time: "2020-19-20 16:00", attr1: 0.22, attr2: 0.18, attr3: 0.15, attr4: 0.36, attr5: 0.42, weight_ip: 1 },
        { id: 36, ip: "192.168.1.1", time: "2020-19-20 17:00", attr1: 0.92, attr2: 0.12, attr3: 0.12, attr4: 0.47, attr5: 0.52, weight_ip: 3 },
        { id: 37, ip: "192.168.1.2", time: "2020-19-20 17:00", attr1: 0.72, attr2: 0.23, attr3: 0.12, attr4: 0.67, attr5: 0.62, weight_ip: 3 },
        { id: 38, ip: "192.168.1.3", time: "2020-19-20 17:00", attr1: 0.22, attr2: 0.34, attr3: 0.61, attr4: 0.25, attr5: 0.12, weight_ip: 2 },
        { id: 39, ip: "192.168.1.4", time: "2020-19-20 17:00", attr1: 0.52, attr2: 0.45, attr3: 0.71, attr4: 0.36, attr5: 0.22, weight_ip: 2},
        { id: 40, ip: "192.168.1.5", time: "2020-19-20 17:00", attr1: 0.32, attr2: 0.56, attr3: 0.81, attr4: 0.27, attr5: 0.32, weight_ip: 2 },
        { id: 41, ip: "192.168.1.1", time: "2020-19-20 18:00", attr1: 0.12, attr2: 0.91, attr3: 0.52, attr4: 0.28, attr5: 0.42, weight_ip: 2 },
        { id: 42, ip: "192.168.1.2", time: "2020-19-20 18:00", attr1: 0.62, attr2: 0.81, attr3: 0.62, attr4: 0.28, attr5: 0.72, weight_ip: 1 },
        { id: 43, ip: "192.168.1.3", time: "2020-19-20 18:00", attr1: 0.62, attr2: 0.71, attr3: 0.72, attr4: 0.36, attr5: 0.12, weight_ip: 1 },
        { id: 44, ip: "192.168.1.4", time: "2020-19-20 18:00", attr1: 0.22, attr2: 0.61, attr3: 0.82, attr4: 0.56, attr5: 0.82, weight_ip: 4 },
        { id: 45, ip: "192.168.1.5", time: "2020-19-20 18:00", attr1: 0.92, attr2: 0.51, attr3: 0.26, attr4: 0.23, attr5: 0.62, weight_ip: 2 },
        { id: 46, ip: "192.168.1.1", time: "2020-19-20 19:00", attr1: 0.02, attr2: 0.41, attr3: 0.37, attr4: 0.34, attr5: 0.15, weight_ip: 3 },
        { id: 47, ip: "192.168.1.2", time: "2020-19-20 19:00", attr1: 0.02, attr2: 0.31, attr3: 0.67, attr4: 0.45, attr5: 0.15, weight_ip: 3 },
        { id: 48, ip: "192.168.1.3", time: "2020-19-20 19:00", attr1: 0.12, attr2: 0.32, attr3: 0.89, attr4: 0.56, attr5: 0.12, weight_ip: 4 },
        { id: 49, ip: "192.168.1.4", time: "2020-19-20 19:00", attr1: 0.12, attr2: 0.42, attr3: 0.67, attr4: 0.67, attr5: 0.41, weight_ip: 3 },
        { id: 50, ip: "192.168.1.5", time: "2020-19-20 19:00", attr1: 0.42, attr2: 0.51, attr3: 0.37, attr4: 0.36, attr5: 0.15, weight_ip: 3 },
        { id: 51, ip: "192.168.1.1", time: "2020-19-20 20:00", attr1: 0.52, attr2: 0.12, attr3: 0.43, attr4: 0.27, attr5: 0.23, weight_ip: 4 },
        { id: 52, ip: "192.168.1.2", time: "2020-19-20 20:00", attr1: 0.42, attr2: 0.21, attr3: 0.58, attr4: 0.27, attr5: 0.34, weight_ip: 4 },
        { id: 53, ip: "192.168.1.3", time: "2020-19-20 20:00", attr1: 0.32, attr2: 0.23, attr3: 0.72, attr4: 0.35, attr5: 0.45, weight_ip: 5 },
        { id: 54, ip: "192.168.1.4", time: "2020-19-20 20:00", attr1: 0.22, attr2: 0.32, attr3: 0.82, attr4: 0.56, attr5: 0.51, weight_ip: 1 },
        { id: 55, ip: "192.168.1.5", time: "2020-19-20 20:00", attr1: 0.12, attr2: 0.34, attr3: 0.92, attr4: 0.36, attr5: 0.12, weight_ip: 2 },
        { id: 56, ip: "192.168.1.1", time: "2020-19-20 21:00", attr1: 0.92, attr2: 0.42, attr3: 0.12, attr4: 0.27, attr5: 0.13, weight_ip: 1 },
        { id: 57, ip: "192.168.1.2", time: "2020-19-20 21:00", attr1: 0.82, attr2: 0.25, attr3: 0.22, attr4: 0.34, attr5: 0.41, weight_ip: 2 },
        { id: 58, ip: "192.168.1.3", time: "2020-19-20 21:00", attr1: 0.12, attr2: 0.22, attr3: 0.32, attr4: 0.67, attr5: 0.51, weight_ip: 2 },
        { id: 59, ip: "192.168.1.4", time: "2020-19-20 21:00", attr1: 0.22, attr2: 0.11, attr3: 0.42, attr4: 0.26, attr5: 0.61, weight_ip: 4 },
        { id: 60, ip: "192.168.1.5", time: "2020-19-20 21:00", attr1: 0.42, attr2: 0.22, attr3: 0.52, attr4: 0.37, attr5: 0.89, weight_ip: 2 },

        
      ],
      brushTime: [],
      // time_list: [],
      type_select: -1,
      attr_keys:[],//数据项的键值
      raw_time_list:[],//原始的时间列表
      switch_callback:(type)=>{}//切换的回调函数
    };
  },

  // mounted(){
  //   this.freshButton()
  // },

  methods: {
    set_raw_data(testData){

      //要求不能超过14种社群
      //要求ip在某一个时刻只能出现在一个社群
      
      this.testData = testData

      //计算attr_keys
      this.attr_keys = [];
      for(let key in testData[0]){
        if(key != 'id' && key != 'ip' && key != 'time')
          this.attr_keys.push(key)
      }

      //计算原始时间列表
      let timeSet = new Set();//提取时间
      for(let v of testData){
          timeSet.add(Date.parse(v['time']))
      }
      let timestampSortedArray = Array.from(timeSet).sort((a,b)=>a-b)
      this.raw_time_list = timestampSortedArray.map(v=>{
        function formatNumber(n){
            n = n.toString();
            return n[1] ? n: '0' + n 
        }
        let date = new Date(v)
        return date.getFullYear() + '-' + formatNumber(date.getMonth()+1) + '-' + formatNumber(date.getDate()) + ' ' + formatNumber(date.getHours()) + ':' + formatNumber(date.getMinutes()) + ':' + formatNumber(date.getSeconds()) 
      })

      this.drawBubbleChart(this.testData);
    },

    typeSwitch(type){
      this.switch_callback(type)
    },


    Data2Stanard(test_data){ //整理原始的概率数据为type数据{node,type,time}
      let data = []
      
      for (let i = 0; i < test_data.length; ++i) {
        let data_line = test_data[i]
        let attr_list = this.attr_keys.map(key=>data_line[key])
        data.push({node: data_line["ip"], time: data_line["time"], type: this.attr_keys[attr_list.indexOf(Math.max(...attr_list))]})
      }
      return data
    },


    changeSelect(select) {
      this.type_select = select
    },

    getTypeSlect() {
      return this.type_select
    },

    importDateButton() {
      alert("开始：" + this.brushTime[0] + "\n" + "结束：" + this.brushTime[1])
    },

    time2Integer(original_data) { //把data的字符串time改造成从0开始的整数，并且返回一个排序后的time_list
      let data = JSON.parse(JSON.stringify(original_data))
      let strtime_list = Array.from(new Set(data.map(v=>v.time))).sort((a,b)=>Date.parse(a) - Date.parse(b))



      for(let i = 0;i < data.length;i++){
        data[i].time = strtime_list.indexOf(data[i].time)
      }

      return [data, strtime_list]
    },

    getInOutHopsDataForType(Data, type_select) {

      let retlist = this.time2Integer(Data)

      let data = retlist[0]
      let strTimeList = retlist[1]
      

      //  {column_x: 8, column_y: '43', correlationIn: 1, correlationOut: 3, correlationHops: 0, row: 8}
      let corr = []
      let type_list = this.getTypeList(data)


      for (var t = 1; t < strTimeList.length; ++t) { //从1开始
        
        let sumIn = 0;
        let sumOut = 0;

        for (var i = 0; i < type_list.length; ++i) {
          if (type_list[i] === type_select) continue
          var time_slot = t//当前时间
          var type_name = type_list[i]//当前遍历的类别
          var row = i + 1//当前行号（从1开始）
          var correlationIn = 0 //迁入数
          var correlationOut = 0 //迁出数
          //统计某个时间上，某类type的迁入迁出数

          let afterSetSelect = new Set(data.filter((v)=>v['time']==t && v['type']==type_select).map(v=>v.node))
          let beforeSetSelect = new Set(data.filter((v)=>v['time']==t-1 && v['type']==type_select).map(v=>v.node))
          let afterSetCur = new Set(data.filter((v)=>v['time']==t && v['type']==type_list[i]).map(v=>v.node))
          let beforeSetCur = new Set(data.filter((v)=>v['time']==t-1 && v['type']==type_list[i]).map(v=>v.node))

          //计算迁入
          for(let n of Array.from(afterSetSelect)){
            if(beforeSetCur.has(n)){
              correlationIn++;
            }
          }
          //计算迁出
          for(let n of Array.from(beforeSetSelect)){
            if(afterSetCur.has(n)){
              correlationOut++;
            }
          }

          sumIn += correlationIn;
          sumOut += correlationOut;

          var correlationHops = correlationIn - correlationOut > 0 ? (correlationIn - correlationOut) : (-(correlationIn - correlationOut));
          corr.push({"column": time_slot, "column_x": time_slot, "column_y": type_name, "correlationIn": correlationIn, "correlationOut": correlationOut, "correlationHops": correlationHops, "row": row})
        }

      }
      return corr
    },

    getColorForType (type, type_list) {
      let colorList = [
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
      ]

      var type_name = type
      var type_index = type_list.indexOf(type_name)
      var color = ""
      if (type_index !== -1) {
        color = colorList[type_index % colorList.length]
      } else { 
        color = "#cccccc"
      }
      return color
    },

    getNodeList(data) {
      var node_list = []
      for (var i = 0; i < data.length; ++i) {
        if (node_list.includes(data[i]["node"]) === false) {
          node_list.push(data[i]["node"])
        }
      }
      return node_list
    },

    getTypeList(data) {
      var type_list = []
      // for (var i = 0; i < data.length; ++i) {
      //   if (type_list.includes(data[i]["type"]) === false) {
      //     type_list.push(data[i]["type"])
      //   }
      // }
      type_list = JSON.parse(JSON.stringify(this.attr_keys))
      return type_list
    },

    poolInit(data, type_list, type_select) {

      this.type_select = type_select
      this.matrixTrans(data, type_select, type_list)
    },

    matrixTrans(data, type_select, type_list) {

      const self = this;

      let colorList = [
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
      ]

      var hopColor = ["steelblue", "tomato", "#66c2a5"] //迁入 迁出 差值
      // var hopColor = ["steelblue", "tomato", "purple"] //迁入 迁出 差值
      d3.select("body").append("div").attr("class", "tip").style("display", "none")
      var margin = { top: 50, bottom: 20, left: 100, right: 30 }
      var svg = d3.select("#svg0")
      svg.select("#trans").remove()
      var g = svg
        .append("g")
        .attr("transform", "translate(" + margin.left + ", " + margin.top + ")")
        .attr("id", "trans")

      let corr = this.getInOutHopsDataForType(data, type_select)
      

      var extent = [
        d3.min(
          corr.map(function (d) {
            return d3.min([d.correlationIn, d.correlationOut, d.correlationHops])
          })
        ),
        d3.max(
          corr.map(function (d) {
            return d3.max([d.correlationIn, d.correlationOut, d.correlationHops])
          })
        ),
      ]
      
      // var rows = d3.max(corr, function (d) {
      //   return d.row
      // })
      var rows = self.attr_keys.length
      var columns = d3.max(corr, function (d) {
        return d.column
      })

      var width = svg.attr("width") - margin.left - margin.right
      var height = svg.attr("height") - margin.top - margin.bottom

      var padding = 0

      var x = d3
        .scaleBand()
        .range([0, width])
        .paddingInner(padding)
        .domain(d3.range(1, columns + 1))

      var y = d3
        .scaleBand()
        .range([0, height - 20])
        .paddingInner(padding)
        .domain(d3.range(1, rows + 1))
      
      var c = chroma
        .scale(["red", "white", "blue"])
        .domain([-extent[1], 0, extent[1]])
      var w = d3
        .scaleLinear()
        .range([0, x.bandwidth() - 2])
        .domain([0, d3.max(extent)])


      var x_axis = d3.axisBottom(x).tickFormat(function (d, i) {
        // return this.time_list[i + 1]
        // return i+1
        return ""
      })
      var y_axis = d3.axisLeft(y).tickFormat(function (d, i) {
        return ""
      })
      y_axis.tickSize(width + 20)

      x_axis.tickSize(height - 5)
      const x_axis_g = g.append("g")
        .attr("id", "xaxis")
        .attr("class", "axis axis--major")
        .call(x_axis)

      const y_axis_g = g.append("g")
        .attr("class", "y axis")
        .attr("id", "yaxis")
        .call(y_axis)
        .attr("transform", "translate(" + width + ", 0)")

      //添加信息框

      x_axis_g.selectAll('line')
        .attr('stroke-width',2)
        .on('mouseover',(d,i)=>{
          console.log(this.raw_time_list)
          console.log(i)
          let messageData = {}
          messageData['时间'] = `${this.raw_time_list[i]} 至 ${this.raw_time_list[i+1]}`
          this.InfoPanel.show()//显示
          this.InfoPanel.setMessageData(messageData);//更新信息
          /**
           * 更新位置
           */
          this.InfoPanel.setPos(d3.event.clientY + 10,d3.event.clientX + 10)

        })
        .on('mouseout',(d,i)=>{
          this.InfoPanel.hidden();
        })


      //添加两侧tick
      svg.selectAll('.start-tick').remove()
      svg.selectAll('.end-tick').remove()
      svg.append('text')
         .classed('start-tick',true)
         .text(this.raw_time_list[0])
         .attr('dominant-baseline','hanging')
         .attr('text-anchor','start')
         .style('font-size',12)
         .attr('x',margin.left)
         .attr('y',margin.top + height)
      svg.append('text')
         .classed('end-tick',true)
         .text(this.raw_time_list[self.raw_time_list.length - 1])
         .attr('dominant-baseline','hanging')
         .attr('text-anchor','end')
         .style('font-size',12)
         .attr('x',margin.left + width)
         .attr('y',margin.top + height)

      svg
        .select("#yaxis")
        .selectAll(".tick>line")
        .attr("stroke", function (d, i) {
          if (i < colorList.length) return colorList[i]
          else return "#cccccc"
        })
        .attr("stroke-opacity", 0.4)

      svg.select("#xaxis").selectAll(".tick>line").attr("stroke-opacity", 0.4)
      

      // //移动typetag
      const typeTag = svg.selectAll('.typeTag')
      typeTag.attr("transform", function (d, i) {
          return `translate(${0},${(y(i+1) + y.bandwidth() / 2) + margin.top - 7.5})`
      })

      const typeTagText = typeTag.select('text')
                                  .attr('fill',(d)=>{
                                    if(d==this.type_select){
                                      return '#c17606'
                                    }
                                    return 'black'
                                  })

      var glf = g
        .selectAll(".glyph")
        .data(corr, function (d) {
          return d.column_a + d.column_b
        })
        .enter()
        .append("g")
        .attr("class", "glyph")
        .attr("transform", function (d) {
          return (
            "translate(" +
            (x(d.column) + x.bandwidth() / 2) +
            "," +
            (y(d.row) + y.bandwidth() / 2) +
            ")"
          )
        })

      
      //计算最大半径
      let maxRadius = Math.min(y.step() * 0.5, x.step() * 0.5)
      let maxCount = 0;
      for(let attr of this.attr_keys){
        let tempCorr = this.getInOutHopsDataForType(data, attr)
        for(let v of tempCorr){
          maxCount = Math.max(maxCount,...tempCorr.map(v=>v.correlationIn),...tempCorr.map(v=>v.correlationOut))
        }
      }


      glf //迁入
        .append("path")
        .attr("d", function (d) {
          var a = d3
            .arc()
            .innerRadius(0)
            // .outerRadius(w(d.correlationIn) * 0.15)
            .outerRadius(1.0 * d.correlationIn / maxCount * maxRadius)
            .startAngle(-Math.PI / 2)
            .endAngle(Math.PI / 2)
          return a(d)
        })
        .attr("fill", hopColor[0])
        .attr("opacity", function (d) {
          return 0.7
        })

      glf //迁出
        .append("path")
        .attr("d", function (d) {
          var a = d3
            .arc()
            .innerRadius(0)
            // .outerRadius(w(d.correlationOut) * 0.15)
            .outerRadius(1.0 * d.correlationOut / maxCount * maxRadius)
            .startAngle(Math.PI / 2)
            .endAngle((3 * Math.PI) / 2)
          return a(d)
        })
        .attr("fill", hopColor[1])
        .attr("opacity", function (d) {
          return 0.7
        })

      glf //差值
        .append("circle")
        .attr("r", function (d) {
          // return w(d.correlationHops) * 0.05
          return (1.0 * d.correlationHops / maxCount * maxRadius) * 0.5
        })
        .attr("fill", hopColor[2])
        // .attr('stroke','white')
        // .attr('stroke-width',1)
        .attr("opacity", 1)

      // d3.select("#trans")
      //   .call( d3.brushX().on("end", brush))       // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
    
      // let changeBrushTime = this.changeBrushTime

      // function brush() {
      //   const pos = d3.brushSelection(this);
      //   let offset = g.select(".glyph").attr("transform")
      //   offset = parseFloat(offset.slice(9).substr(1, offset.indexOf(",") - 1))
      //   let left_x = pos[0] - offset
      //   let right_x = pos[1] - offset
      //   let left_index = 0
      //   let right_index = 0
      //   for (var d = 1; d <= columns; ++d) {
      //     if ((x(d) < left_x && x(d + 1) > left_x)) {
      //       left_index = d + 1
      //     } else if ((right_x > x(d) && x(d + 1) > right_x) || (right_x > x(d) && (d + 1) > columns)) {
      //       right_index = d
      //     } else if (left_x < x(1)) {
      //       left_index = 1
      //     }
      //   }
      //   changeBrushTime(left_index, right_index)
      // }
    
    },

    // changeBrushTime(start, end) {
    //   this.brushTime = [this.time_list[start], this.time_list[end]]
    // },

    

    drawBubbleChart(data) {

      data = this.Data2Stanard(data)//概率->type
      var svg = d3.select("#svg0");
      var margin = { top: 40, left: 15, bottom: 15, right: 50 };
      var width = svg.attr("width") - margin.left - margin.right;
      var height = svg.attr("height") - margin.top - margin.bottom;
      let type_list = this.getTypeList(data) //即属性列表attr_keys

      let fillOpacity = 0.5
      let fadedOpacity = 0.3
      let highlightOpacity = 0.7

      let colorList = [
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
      ]

      var textHeight = height / (colorList.length + 2)
      var textInitiSize = 15
      var textFocusSize = 10

      let type_select = -1
      if (this.type_select === -1) {
        type_select = -1
      } else {
        type_select = this.type_select
      }

      let getColorForType = this.getColorForType //返回指定type的color
      let poolInit = this.poolInit //画图函数

      svg.selectAll(".typeTag").remove()
      svg
        .selectAll(".typeTag")
        .data(type_list)
        .enter()
        .append("g")
        .attr("class", "typeTag")
        .attr("id", function (d) {
          return "type" + d
        })
        .attr("transform", function (d, i) {
          return "translate(10," + (textHeight * i + 50) + ")"
        })
        .style('cursor','pointer')
        .on("click", function (d) {
          if (type_select == d) {
            type_select = d
          } else {
            type_select = d
            poolInit(JSON.parse(JSON.stringify(data)), type_list, type_select)
          }
        })
        .append("rect")
        .attr("class", "typeBase")
        .attr("id", function (d) {
          return "base" + d
        })
        .attr("x", 2)
        .attr("y", 2)
        .attr("height", textHeight - 4)
        .attr("width", textHeight - 4)
        .attr("fill", function (d) {
          return getColorForType(d, type_list)
        })
        .attr("opacity", 1)
      svg
        .selectAll(".typeTag")
        .append("text")
        .text(function (d) {
          return d
        })
        .attr("x", 15)
        .attr("y", textHeight - 2)
        .attr("text-anchor", "start")
        .style("font-size", textInitiSize)
        .attr("fill", function (d) {
          return "#000000"
        })
        .attr("font-style", "italic")
        .style("font-size", "0.8em")
      
      //绑定切换函数
      this.switch_callback = (_type)=>{

        if (type_select == _type) {
            type_select = _type
          } else {
            type_select = _type
            poolInit(JSON.parse(JSON.stringify(data)), type_list, type_select)
          }
      }

      this.switch_callback(type_list[0])

    },  
  },
};
</script>

<style scoped>
.container-fluid {
  padding-right: 15px;
  padding-left: 15px;
  margin-right: auto;
  margin-left: auto;
}

.view {
  border-color: #cccccc;
  margin-left: 1px;
  margin-bottom: 1px;
  margin-right: 1px;
  margin-top: 20px;
  background-color: white;
  border-radius: 0px;
}

.form-control:focus {
  border-color: #66afe9;
  outline: 0;
  -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075),
    0 0 8px rgba(102, 175, 233, 0.6);
  box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075),
    0 0 8px rgba(102, 175, 233, 0.6);
}

.form-control::-moz-placeholder {
  color: #999;
  opacity: 1;
}

.form-control:-ms-input-placeholder {
  color: #999;
}

.form-control::-webkit-input-placeholder {
  color: #999;
}

.form-control::-ms-expand {
  background-color: transparent;
  border: 0;
}

.form-control[disabled],
.form-control[readonly],
fieldset[disabled] .form-control {
  background-color: #eee;
  opacity: 1;
}

.form-control[disabled],
fieldset[disabled] .form-control {
  cursor: not-allowed;
}

.noScroll {
}

.list-group {
  padding-left: 0;
  margin-bottom: 20px;
}

.btn {
  display: inline-block;
  padding: 6px 12px;
  margin-bottom: 0;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.42857143;
  text-align: center;
  white-space: nowrap;
  vertical-align: middle;
  -ms-touch-action: manipulation;
  touch-action: manipulation;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  background-image: none;
  border: 1px solid transparent;
  border-radius: 4px;
}

.btn.active.focus,
.btn.active:focus,
.btn.focus,
.btn:active.focus,
.btn:active:focus,
.btn:focus {
  outline: 5px auto -webkit-focus-ring-color;
  outline-offset: -2px;
}

.btn.focus,
.btn:focus,
.btn:hover {
  color: #333;
  text-decoration: none;
}

.btn.active,
.btn:active {
  background-image: none;
  outline: 0;
  -webkit-box-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
  box-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
}

.btn.disabled,
.btn[disabled],
fieldset[disabled] .btn {
  cursor: not-allowed;
  filter: alpha(opacity=65);
  -webkit-box-shadow: none;
  box-shadow: none;
  opacity: 0.65;
}

.btn-primary {
  color: #fff;
  background-color: #337ab7;
  border-color: #2e6da4;
}

.btn-primary.focus,
.btn-primary:focus {
  color: #fff;
  background-color: #286090;
  border-color: #122b40;
}

.btn-primary:hover {
  color: #fff;
  background-color: #286090;
  border-color: #204d74;
}

.btn-primary.active,
.btn-primary:active,
.open > .dropdown-toggle.btn-primary {
  color: #fff;
  background-color: #286090;
  border-color: #204d74;
}

.btn-primary.active.focus,
.btn-primary.active:focus,
.btn-primary.active:hover,
.btn-primary:active.focus,
.btn-primary:active:focus,
.btn-primary:active:hover,
.open > .dropdown-toggle.btn-primary.focus,
.open > .dropdown-toggle.btn-primary:focus,
.open > .dropdown-toggle.btn-primary:hover {
  color: #fff;
  background-color: #204d74;
  border-color: #122b40;
}

.btn-primary.active,
.btn-primary:active,
.open > .dropdown-toggle.btn-primary {
  background-image: none;
}

.btn-primary.disabled.focus,
.btn-primary.disabled:focus,
.btn-primary.disabled:hover,
.btn-primary[disabled].focus,
.btn-primary[disabled]:focus,
.btn-primary[disabled]:hover,
fieldset[disabled] .btn-primary.focus,
fieldset[disabled] .btn-primary:focus,
fieldset[disabled] .btn-primary:hover {
  background-color: #337ab7;
  border-color: #2e6da4;
}

.btn-primary .badge {
  color: #337ab7;
  background-color: #fff;
}

.btn-xs {
  padding: 1px 5px;
  font-size: 12px;
  line-height: 1.5;
  border-radius: 3px;
}

.tooltip {
  position: absolute;
  z-index: 1070;
  display: block;
  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: 1.42857143;
  text-align: left;
  text-align: start;
  text-decoration: none;
  text-shadow: none;
  text-transform: none;
  letter-spacing: normal;
  word-break: normal;
  word-spacing: normal;
  word-wrap: normal;
  white-space: normal;
  filter: alpha(opacity=0);
  opacity: 0;
  line-break: auto;
}

.tooltip.in {
  filter: alpha(opacity=90);
  opacity: 0.9;
}

.tooltip.top {
  padding: 5px 0;
  margin-top: -3px;
}

.tooltip.right {
  padding: 0 5px;
  margin-left: 3px;
}

.tooltip.bottom {
  padding: 5px 0;
  margin-top: 3px;
}

.tooltip.left {
  padding: 0 5px;
  margin-left: -3px;
}

.tooltip-inner {
  max-width: 200px;
  padding: 3px 8px;
  color: #fff;
  text-align: center;
  background-color: #000;
  border-radius: 4px;
}

.tooltip-arrow {
  position: absolute;
  width: 0;
  height: 0;
  border-color: transparent;
  border-style: solid;
}

.tooltip.top .tooltip-arrow {
  bottom: 0;
  left: 50%;
  margin-left: -5px;
  border-width: 5px 5px 0;
  border-top-color: #000;
}

.tooltip.top-left .tooltip-arrow {
  right: 5px;
  bottom: 0;
  margin-bottom: -5px;
  border-width: 5px 5px 0;
  border-top-color: #000;
}

.tooltip.top-right .tooltip-arrow {
  bottom: 0;
  left: 5px;
  margin-bottom: -5px;
  border-width: 5px 5px 0;
  border-top-color: #000;
}

.tooltip.right .tooltip-arrow {
  top: 50%;
  left: 0;
  margin-top: -5px;
  border-width: 5px 5px 5px 0;
  border-right-color: #000;
}

.tooltip.left .tooltip-arrow {
  top: 50%;
  right: 0;
  margin-top: -5px;
  border-width: 5px 0 5px 5px;
  border-left-color: #000;
}

.tooltip.bottom .tooltip-arrow {
  top: 0;
  left: 50%;
  margin-left: -5px;
  border-width: 0 5px 5px;
  border-bottom-color: #000;
}

.tooltip.bottom-left .tooltip-arrow {
  top: 0;
  right: 5px;
  margin-top: -5px;
  border-width: 0 5px 5px;
  border-bottom-color: #000;
}

.tooltip.bottom-right .tooltip-arrow {
  top: 0;
  left: 5px;
  margin-top: -5px;
  border-width: 0 5px 5px;
  border-bottom-color: #000;
}
</style>
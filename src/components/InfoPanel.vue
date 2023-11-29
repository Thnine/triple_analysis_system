<template>
  <div v-show="showFlag" class="info-panel-container" :style=InfoPanelStyle>

    <div style="background-color:rgba(0,0,0,0.7);padding:10px;">
      <div v-for="(m,index) in messageData" :key="index" style="display:flex;align-items:center">
        <b style="color:white">{{m[0]}}：</b><a style="color:white">{{m[1]}}</a>
      </div>
    </div>

  </div>
</template>



<script>

export default {
  name: 'InfoPanel',
  data () {
    return {
      /**
       * messageData:
       * [
       *    ['attr1',attr1],
       *    ['attr2',attr2],
       *    ...
       * ]
       * 
       */
      messageData:[//用于显示的message数据

      ],

      showFlag:false,
      InfoPanelStyle:{

      },
    }
  },

  methods:{
    setMessageData(message){
      // message = {
      //   'a':'asa',
      //   'b':'vvv'
      // }
      this.messageData.length = 0;
      for(let key in message){
        this.messageData.push([key,message[key]])
      }
    },
    show(){
      this.showFlag = true
    },
    hidden(){
      this.showFlag = false
    },
    setPos(top,left){
      this.InfoPanelStyle['top'] = `${top}px`
      this.InfoPanelStyle['left'] = `${left}px`
    }
  }

}
</script>



<style scoped>
  .info-panel-container{
    position:absolute;
  }

</style>
<template>
  <div ref="info-panel-container" class="info-panel-container">

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
    }
  },

  methods:{
    setMessageData(message){
      this.messageData.length = 0;
      for(let key in message){
        this.messageData.push([key,message[key]])
      }
    },
  }

}
</script>



<style scoped>
  .info-panel-container{
    position:absolute;
  }

</style>
let config = require('./config.json');
let momentTz = require('moment-timezone');
const firebase = require('../db');
const firestore = firebase.firestore();
class DataCache {
    constructor() {
      this.getData = this.getData.bind(this);
    }
    isCacheExpired() {
      // return (this.fetchDate.getTime() + this.millisecondsToLive) < new Date().getTime();
    }
    async getData(date,tz) {
      const events = await firestore.collection('events');
        let snapshot = await events
        .get();
         let data = snapshot.docs.map((doc) => ({
            ...doc.data(),
          }));
          let eventsMap = {};
          data.forEach(element => {
            eventsMap[element["datetime"]]  = element.duration;
          });

          let {startTime,endTime,duration,timezone} = config;
          let freeSolts = {};
          let currentTime =  momentTz.tz(startTime,timezone);
          let currentDuration
          endTime = momentTz.tz(endTime,timezone);

          while(currentTime < endTime){
              currentTime = momentTz.tz(currentTime,timezone);

              currentDuration = eventsMap[currentTime.format()] || 30;

              if(!eventsMap[currentTime.format()]){
                freeSolts[currentTime.format()] = timezone;
              }
              currentTime = currentTime.add(duration * (Math.ceil(currentDuration/30)),"minutes"); 
          }
        
          return {slots : freeSolts, events: eventsMap} ;

   
    }
    resetCache() {
    //  this.fetchDate = new Date(0);
    }
  }


  module.exports = new DataCache();
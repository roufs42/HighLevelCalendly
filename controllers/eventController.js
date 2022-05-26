const firebase = require('../db');
const event = require('../models/event');
const firestore = firebase.firestore();
let moment = require('moment');
let momentTz = require('moment-timezone');

let cache = require('../lib/cache');
let config = require('../lib/config.json');
let slots,events;

(async()=>{
    let data = await cache.getData();
    slots = data.slots;
    events = data.events;
})();  

const isValid =  (datetime,timezone = config.timezone,duration)=>{
        let valid = true;
        let currentDuration = 0;
    
        while(currentDuration < duration){
            datetime = momentTz.tz(datetime,timezone).format();
            if(!slots[datetime]){
                valid = false;
                break;
            }
            datetime = moment(datetime).add(config.duration,'minutes');
            currentDuration = currentDuration + config.duration;
        }
        return valid
};
const isValidDate = (date)=>{
    if(!date)
        return false;
    return moment(new Date(date)).isValid();
}

const addEvent = async (req, res, next) => {
    try {
        const data = req.body;
        let datetime = data.datetime;
        let duration = data.duration;
        let timezone = config.timezone;
        if(!momentTz.tz.zone(timezone)){
            res.status(422).send('Invalid timezone in config file');  
        }else if(!isValidDate(datetime)){
            res.status(422).send('Input date is Invalid');  
        }else if(Number.isNaN(duration)){
            res.status(422).send('Input number for duration');
        }else{
            let slotsArr = Object.keys(slots);
            let startTime =  momentTz.tz(slotsArr[0],timezone).utc();
            let endTime = momentTz.tz(slotsArr[slotsArr.length-1],timezone).utc();
            let utcTime = momentTz.tz(datetime,timezone).utc();
    
            if(!(utcTime.isSameOrAfter(startTime) && utcTime.isSameOrBefore(endTime))){
                res.status(422).send('DateTime is not in the range of Freeslots');
            }else if(isValid(datetime , data.timezone,duration)){
                data.datetime = momentTz.tz(datetime,timezone).format();
                await firestore.collection('events').doc().set(data);
                let cachedData = await cache.getData();
                slots = cachedData.slots;
                events = cachedData.events;
                res.send('Appointment created successfully');
            }else{
                res.status(422).send('No slot is available for the given time');
            }
        }


    } catch (error) {
        res.status(422).send(error.message);
    }
}

const getAllEvents = async (req, res, next) => {
    try {
        let startTime = req.query.startDate;
        let endTime = req.query.endDate;
        if(!isValidDate(startTime) || !isValidDate(endTime)){
            res.status(422).send('Input date is Invalid');  
        }else{
            let timezone = req.query.timezone || config.timezone;
            let eventsArr = Object.keys(events)
            
            if(startTime && endTime){
                startTime =  moment.tz(startTime,timezone);
                endTime = moment.tz(endTime,timezone);
                let currentTime
                eventsArr = eventsArr.sort((a,b)=>{return new Date(a) - new Date(b)})
                eventsArr = eventsArr.filter((ev)=>{
                     currentTime =  moment.tz(ev,timezone);
                     return (currentTime.isSameOrAfter(startTime) && currentTime.isSameOrBefore(endTime))
                })
              
                eventsArr = eventsArr.map((ev)=>{
                     return moment.tz(ev,timezone).format('MMMM Do YYYY, h:mm:ss a');
               })
                
            }
            res.send(eventsArr)
        }
            
    
    } catch (error) {
        res.status(400).send(error.message);
    }
}



const getFreeSlots = async (req, res, next) => {
    try {
        let timezone = ((req.query) || {}).timezone || config.timezone;
        let date = ((req.query) || {}).date;
        let slotsArr = Object.keys(slots);
       
        //check if given timezone is valid or not
        if(!momentTz.tz.zone(timezone)){
            res.status(422).send('Given Timezone is Invalid');
        }else if(date && !isValidDate(date)){
            res.status(422).send('Input date is Invalid');  
        }else{
            
            if(date){
                slotsArr = slotsArr.filter((slot)=>{
                    return momentTz.tz(slot,timezone).format('YYYY DD MM') == moment(date).format('YYYY DD MM')
                });
            }

            slotsArr = slotsArr.map((slot)=>{
                return momentTz.tz(slot,timezone).format('MMMM Do YYYY h:mm:ss a');
            })
        
            res.send(slotsArr);
        }



    } catch (error) {
        res.status(400).send(error.message);
    }
}

module.exports = {
    addEvent,
    getAllEvents,
    getFreeSlots
}
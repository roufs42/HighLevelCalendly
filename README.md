# Appointment Booking App

A simple app to create events for given time period.



## To Run

To run this app

```bash
  npm install
  npm start
```

## Environment Variables

If you want to configure the Dates, Duration and Timezone, you will need to change the following variables in lib/config.json file

`startTime`

`endTime`

`duration`

`timezone`


## API Reference

#### Get all events for given range of dates

```http
  GET /api/events
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `startDate` | `date` | **Format**. YYYY-MM-DD |
| `endDate` | `date` | **Format**. YYYY-MM-DD |

#### Get freeslots for any given date

```http
  GET /api/freeslots
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `date`      | `date` | **Format**. YYYY-MM-DD |
| `timezone`      | `string` | **Example**. Asia/Kolkata |


#### Create an event for the given date with duration

```http
  POST /api/event
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `datetime`      | `datetime` | **Format**. ISO String(2022-10-21T18:00:00-07:00) or Any Valid Datetime Format| 
| `duration`      | `number` | **Example**. 30 |





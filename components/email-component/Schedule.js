import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

export default function CalendarGfg({ takedateInfo, dateInfo, schedule: propdate }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedHours, setSelectedHours] = useState(dateInfo?.hours || 0);
  const [selectedMinutes, setSelectedMinutes] = useState(dateInfo?.minutes || 0);
  const [selectedSeconds, setSelectedSeconds] = useState(dateInfo?.seconds || 0);
  const [error, setError] = useState('');

  useEffect(() => {
    if (propdate) {
      const data = JSON.parse(propdate);
      setSelectedHours(data.hours);
      setSelectedMinutes(data.minutes);
      setSelectedSeconds(data.seconds);
    }
  }, [propdate]);

  const updateTime = () => {
    setCurrentTime(new Date());
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  useEffect(() => {
    const intervalId = setInterval(updateTime, 1000);
    return () => clearInterval(intervalId);
  }, []);

  const sendEmailAtCurrentTime = () => {
    const currentDateTimeUTC = new Date();
  
    // Define arrays to map month and day numbers to their names
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
    const currentDateTimeInfo = {
      day: days[currentDateTimeUTC.getUTCDay()],      // Get the name of the day
      month: months[currentDateTimeUTC.getUTCMonth()], // Get the name of the month
      date: currentDateTimeUTC.getUTCDate(),
      hours: currentDateTimeUTC.getUTCHours(),
      minutes: currentDateTimeUTC.getUTCMinutes()+2,
      seconds: currentDateTimeUTC.getUTCSeconds(),
    };
  
    setSelectedHours(currentDateTimeInfo.hours);
    setSelectedMinutes(currentDateTimeInfo.minutes);
    setSelectedSeconds(currentDateTimeInfo.seconds);
  
    takedateInfo(currentDateTimeInfo);
  };
  

  const submitDate = () => {
    // Create a UTC Date object directly from the selected date and UTC time parts
    if (selectedHours === 0 && selectedMinutes === 0 && selectedSeconds === 0) {
      sendEmailAtCurrentTime();
    }
    else {
      const selectedDateTimeUTC = new Date(Date.UTC(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        selectedHours,
        selectedMinutes,
        selectedSeconds
      ));

      // Get the current UTC time for comparison
      const currentUTC = new Date();

      // Check if the selected UTC date and time are in the past compared to current UTC time
      if (selectedDateTimeUTC < currentUTC) {
        setError('Cannot schedule time in the past.');
        setTimeout(() => {
          setError('');
        }, 2000);
        return;
      }

      // Format the selected date info in UTC
      const selectedDateInfoUTC = {
        day: selectedDateTimeUTC.getUTCDay(),
        month: selectedDateTimeUTC.getUTCMonth(),
        date: selectedDateTimeUTC.getUTCDate(),
        hours: selectedDateTimeUTC.getUTCHours(),
        minutes: selectedDateTimeUTC.getUTCMinutes(),
        seconds: selectedDateTimeUTC.getUTCSeconds(),
      };

      setError('');
      takedateInfo(selectedDateInfoUTC);
    }
  };


  const hourOptions = Array.from({ length: 24 }, (_, i) => i);
  const minuteOptions = Array.from({ length: 60 }, (_, i) => i);
  const secondOptions = Array.from({ length: 60 }, (_, i) => i);

  return (
    <div className="mt-5 space-y-4">
      <div className="flex space-x-4">
        <div>
          <label>Select Hour:</label>
          <select
            value={selectedHours}
            onChange={(e) => setSelectedHours(Number(e.target.value))}
          >
            {hourOptions.map((hour) => (
              <option key={hour} value={hour}>
                {hour}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Select Minute:</label>
          <select
            value={selectedMinutes}
            onChange={(e) => setSelectedMinutes(Number(e.target.value))}
          >
            {minuteOptions.map((minute) => (
              <option key={minute} value={minute}>
                {minute}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Select Second:</label>
          <select
            value={selectedSeconds}
            onChange={(e) => setSelectedSeconds(Number(e.target.value))}
          >
            {secondOptions.map((second) => (
              <option key={second} value={second}>
                {second}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <Calendar
          onChange={handleDateChange}
          value={selectedDate}
          minDate={new Date()}
        />
      </div>

      <strong>Current Time:</strong>
      <div>{currentTime.toLocaleTimeString()}</div>

      <div>
        <button onClick={submitDate}>Set Schedule</button>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
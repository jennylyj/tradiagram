import React, { useState, useEffect } from 'react';
import styles from '../Sidebar.module.css';

const CalendarSection = ({ currentDate, onDateSelect }) => {
  const [availableDates, setAvailableDates] = useState([]);
  const [viewDate, setViewDate] = useState(new Date());

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/index.json`)
      .then(res => res.json())
      .then(data => setAvailableDates(data))
      .catch(err => console.error('Failed to fetch index.json', err));
  }, []);

  // Parse currentDate (YYYYMMDD) to Date object for initial view
  useEffect(() => {
    if (currentDate && currentDate.length === 8) {
      const year = parseInt(currentDate.substring(0, 4));
      const month = parseInt(currentDate.substring(4, 6)) - 1;
      const day = parseInt(currentDate.substring(6, 8));
      setViewDate(new Date(year, month, day));
    }
  }, [currentDate]);

  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const prevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const days = [];

  // Fill empty slots for previous month
  const firstDay = firstDayOfMonth(year, month);
  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} className={styles.day}></div>);
  }

  // Fill days of current month
  const numDays = daysInMonth(year, month);
  for (let d = 1; d <= numDays; d++) {
    const dateStr = `${year}${String(month + 1).padStart(2, '0')}${String(d).padStart(2, '0')}`;
    const hasData = availableDates.includes(dateStr);
    const isSelected = dateStr === currentDate;

    days.push(
      <div
        key={d}
        className={`${styles.day} ${hasData ? styles.hasData : ''} ${isSelected ? styles.selectedDay : ''}`}
        onClick={() => hasData && onDateSelect(dateStr)}
      >
        {d}
      </div>
    );
  }

  const monthNames = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];

  return (
    <div className={styles.calendarContainer}>
      <div className={styles.calendarHeader}>
        <button onClick={prevMonth}>&lt;</button>
        <span>{year}年 {monthNames[month]}</span>
        <button onClick={nextMonth}>&gt;</button>
      </div>
      <div className={styles.calendarGrid}>
        {['日', '一', '二', '三', '四', '五', '六'].map(d => (
          <div key={d} className={styles.weekday}>{d}</div>
        ))}
        {days}
      </div>
    </div>
  );
};

export default CalendarSection;

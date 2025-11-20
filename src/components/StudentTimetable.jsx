import React, { useState, useEffect } from 'react';
import timetableService from '../services/timetableService';
import { Calendar, Clock, MapPin, User } from 'lucide-react';
import './StudentTimetable.css';

const StudentTimetable = () => {
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState('all');

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    fetchTimetable();
  }, []);

  const fetchTimetable = async () => {
    try {
      const data = await timetableService.getStudentTimetable();
      setTimetable(data);
    } catch (error) {
      console.error('Error fetching timetable:', error);
    } finally {
      setLoading(false);
    }
  };

  const groupByDay = () => {
    const grouped = {};
    days.forEach(day => {
      grouped[day] = timetable.filter(entry => entry.day === day);
    });
    return grouped;
  };

  const groupedTimetable = groupByDay();
  const displayDays = selectedDay === 'all' ? days : [selectedDay];

  if (loading) {
    return <div className="loading">Loading timetable...</div>;
  }

  return (
    <div className="student-timetable">
      <div className="timetable-header">
        <h2>My Timetable</h2>
        <div className="day-filter">
          <button
            className={selectedDay === 'all' ? 'active' : ''}
            onClick={() => setSelectedDay('all')}
          >
            All Days
          </button>
          {days.map(day => (
            <button
              key={day}
              className={selectedDay === day ? 'active' : ''}
              onClick={() => setSelectedDay(day)}
            >
              {day.substring(0, 3)}
            </button>
          ))}
        </div>
      </div>

      <div className="timetable-content">
        {displayDays.map(day => (
          <div key={day} className="day-section">
            <h3 className="day-title">{day}</h3>
            {groupedTimetable[day]?.length > 0 ? (
              <div className="classes-grid">
                {groupedTimetable[day].map((entry, index) => (
                  <div key={index} className="class-card">
                    <div className="class-subject">{entry.subject}</div>
                    <div className="class-details">
                      <div className="detail-item">
                        <Clock size={16} />
                        <span>{entry.startTime} - {entry.endTime}</span>
                      </div>
                      <div className="detail-item">
                        <MapPin size={16} />
                        <span>{entry.location}</span>
                      </div>
                      <div className="detail-item">
                        <User size={16} />
                        <span>{entry.teacher?.name || 'TBA'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-classes">No classes scheduled</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentTimetable;

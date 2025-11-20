import React, { useState, useEffect } from 'react';
import timetableService from '../services/timetableService';
import { Calendar, Clock, MapPin, BookOpen, AlertTriangle } from 'lucide-react';
import { toast } from 'react-toastify';
import './TeacherTimetable.css';

const TeacherTimetable = () => {
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkOverlap, setCheckOverlap] = useState({
    day: 'Monday',
    startTime: '',
    endTime: ''
  });
  const [overlapResult, setOverlapResult] = useState(null);
  const [checking, setChecking] = useState(false);

  // For reassignment modal
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [selectedClassForReassign, setSelectedClassForReassign] = useState(null);
  const [teacherList, setTeacherList] = useState([]);
  const [newTeacherId, setNewTeacherId] = useState('');
  const [mergeType, setMergeType] = useState('replace');

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    fetchTimetable();
  }, []);

  const fetchTimetable = async () => {
    try {
      const data = await timetableService.getTeacherTimetable();
      setTimetable(data);
    } catch (error) {
      console.error('Error fetching timetable:', error);
      toast.error('Failed to fetch timetable');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOverlap = async () => {
    if (!checkOverlap.startTime || !checkOverlap.endTime) {
      toast.warning('Please fill all fields');
      return;
    }

    setChecking(true);
    try {
      const result = await timetableService.checkOverlap(checkOverlap);
      setOverlapResult(result);

      if (result.hasOverlap) {
        toast.warning('Schedule overlap detected!');
      } else {
        toast.success("No overlap found! You're good to go.");
      }
    } catch (error) {
      console.error('Error checking overlap:', error);
      toast.error('Failed to check overlap');
    } finally {
      setChecking(false);
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

  const openReassignModal = async (entry) => {
    setSelectedClassForReassign(entry);
    try {
      const teachers = await timetableService.getAllTeachers();
      setTeacherList(teachers);
      setNewTeacherId('');
      setMergeType('replace');
      setShowReassignModal(true);
    } catch (error) {
      console.error('Failed to fetch teachers', error);
      toast.error('Failed to fetch teachers');
    }
  };

  const handleReassignSubmit = async () => {
    if (!newTeacherId) {
      toast.warning('Select a teacher');
      return;
    }
    try {
      await timetableService.reassignClass({
        timetableId: selectedClassForReassign._id,
        newTeacherId,
        mergeType
      });
      toast.success('Class reassigned!');
      setShowReassignModal(false);
      fetchTimetable();
    } catch (error) {
      console.error('Reassign failed', error);
      toast.error(error.response?.data?.message || 'Reassign failed');
    }
  };

  if (loading) {
    return <div className="loading">Loading schedule...</div>;
  }

  return (
    <div className="teacher-timetable">
      <div className="timetable-section">
        <h2>My Teaching Schedule</h2>
        <div className="timetable-grid">
          {days.map(day => (
            <div key={day} className="day-column">
              <h3 className="day-header">{day}</h3>
              <div className="classes-list">
                {groupedTimetable[day]?.length > 0 ? (
                  groupedTimetable[day].map((entry, index) => (
                    <div key={index} className="teacher-class-card">
                      <div className="class-time">
                        <Clock size={16} />
                        {entry.startTime} - {entry.endTime}
                      </div>
                      <div className="class-info">
                        <div className="info-row">
                          <BookOpen size={16} />
                          <strong>{entry.subject}</strong>
                        </div>
                        <div className="info-row">
                          <span className="class-badge">{entry.class}</span>
                        </div>
                        <div className="info-row">
                          <MapPin size={14} />
                          <span>{entry.location}</span>
                        </div>
                      </div>
                      <div style={{ marginTop: '8px' }}>
                        <button
                          className="reassign-btn"
                          onClick={() => openReassignModal(entry)}
                          aria-label={`Reassign ${entry.subject} ${entry.class}`}
                        >
                          Reassign
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-classes">No classes</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="overlap-checker">
        <div className="checker-header">
          <AlertTriangle size={24} />
          <div>
            <h3>Schedule Overlap Checker</h3>
            <p>Check if a new class time conflicts with your existing schedule</p>
          </div>
        </div>

        <div className="overlap-form">
          <div className="form-row">
            <div className="form-field">
              <label>Day</label>
              <select
                value={checkOverlap.day}
                onChange={(e) => setCheckOverlap({ ...checkOverlap, day: e.target.value })}
              >
                {days.map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label>Start Time</label>
              <input
                type="time"
                value={checkOverlap.startTime}
                onChange={(e) => setCheckOverlap({ ...checkOverlap, startTime: e.target.value })}
              />
            </div>

            <div className="form-field">
              <label>End Time</label>
              <input
                type="time"
                value={checkOverlap.endTime}
                onChange={(e) => setCheckOverlap({ ...checkOverlap, endTime: e.target.value })}
              />
            </div>
          </div>

          <button className="check-btn" onClick={handleCheckOverlap} disabled={checking}>
            {checking ? 'Checking...' : 'Check for Overlaps'}
          </button>
        </div>

      </div>

      {showReassignModal && selectedClassForReassign && (
        <div className="modal-overlay" onClick={() => setShowReassignModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                Reassign Class: {selectedClassForReassign.subject} ({selectedClassForReassign.class})
              </div>
              <button
                className="btn-close"
                aria-label="Close"
                onClick={() => setShowReassignModal(false)}
              >
                &times;
              </button>
            </div>

            <div className="modal-body">
              <label htmlFor="reassignTeacher">Select Teacher</label>
              <select
                id="reassignTeacher"
                className="modal-select"
                value={newTeacherId}
                onChange={e => setNewTeacherId(e.target.value)}
              >
                <option value="">-- Select --</option>
                {teacherList.map(tch => (
                  <option key={tch._id} value={tch._id}>{tch.name}</option>
                ))}
              </select>

              <div className="radio-group" role="radiogroup" aria-label="Merge type">
                <label className="radio-option">
                  <input
                    type="radio"
                    name="mergeType"
                    value="replace"
                    checked={mergeType === 'replace'}
                    onChange={() => setMergeType('replace')}
                  />
                  Replace Teacher
                </label>

                <label className="radio-option">
                  <input
                    type="radio"
                    name="mergeType"
                    value="merge"
                    checked={mergeType === 'merge'}
                    onChange={() => setMergeType('merge')}
                  />
                  Merge Classes
                </label>
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowReassignModal(false)}>Cancel</button>
              <button
                className="btn-confirm"
                onClick={handleReassignSubmit}
                disabled={!newTeacherId}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherTimetable;

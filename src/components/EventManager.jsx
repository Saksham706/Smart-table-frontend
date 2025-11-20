import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Plus,
  Search,
  Edit2,
  Trash2,
  Users,
  Clock,
  MapPin,
  X
} from 'lucide-react';
import { toast } from 'react-toastify';
import './EventManager.css';

const API_URL =  import.meta.env.VITE_API_URL
const EventManager = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSchool, setFilterSchool] = useState('all');

  // PARTICIPANTS UI STATE
  const [participantsModalOpen, setParticipantsModalOpen] = useState(false);
  const [selectedEventForParticipants, setSelectedEventForParticipants] = useState(null);
  const [participantFilter, setParticipantFilter] = useState('All'); // All | Student | Teacher | Other
  const [searchParticipant, setSearchParticipant] = useState('');
  const [removingId, setRemovingId] = useState(null);

  const [formData, setFormData] = useState({
    schoolName: 'SOET',
    eventName: '',
    eventStartDate: '',
    eventEndDate: '',
    preferredUpdateFrequency: 'One-time',
    eventDuration: 'Full day',
    levelOfEvents: 'Inter-University',
    naacRequirement: '',
    sdgGoals: [],
    sdgOutcomes: '',
    schoolEventType: 'Inter-University',
    categorization: '',
    organizersFacultyIncharge: [{ name: '', employeeId: '' }],
    modeOfEvent: 'Offline',
    targetGroup: '',
    objective: '',
    methodology: '',
    evaluation: '',
    expectedOutcome: '',
    toolsAndProcesses: '',
    registrationLink: '',
    registrationDeadline: '',
    maxParticipants: '',
    status: 'Upcoming'
  });

  const schools = ['SOET', 'SOMC', 'SOLS', 'SOBS'];
  const eventLevels = ['Inter-University', 'State', 'National', 'International'];
  const eventTypes = [
    'Inter-University',
    'Intra-University',
    'Conference',
    'Symposium',
    'Workshop',
    'Seminar',
    'Hackathon',
    'Competition',
    'FDP',
    'Other'
  ];
  const sdgOptions = [
    'SDG 1', 'SDG 2', 'SDG 3', 'SDG 4', 'SDG 5',
    'SDG 6', 'SDG 7', 'SDG 8', 'SDG 9', 'SDG 10',
    'SDG 11', 'SDG 12', 'SDG 13', 'SDG 14', 'SDG 15',
    'SDG 16', 'SDG 17'
  ];

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [events, searchQuery, filterStatus, filterSchool]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/events`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setEvents(data.events);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load events');
      setLoading(false);
    }
  };

  const filterEvents = () => {
    let filtered = [...events];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(event =>
        String(event.eventName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(event.objective || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(event => event.status === filterStatus);
    }

    // School filter
    if (filterSchool !== 'all') {
      filtered = filtered.filter(event => event.schoolName === filterSchool);
    }

    setFilteredEvents(filtered);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      if (name === 'sdgGoals') {
        setFormData(prev => ({
          ...prev,
          sdgGoals: checked
            ? [...prev.sdgGoals, value]
            : prev.sdgGoals.filter(g => g !== value)
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleOrganizerChange = (index, field, value) => {
    const updatedOrganizers = [...formData.organizersFacultyIncharge];
    updatedOrganizers[index][field] = value;
    setFormData(prev => ({
      ...prev,
      organizersFacultyIncharge: updatedOrganizers
    }));
  };

  const addOrganizer = () => {
    setFormData(prev => ({
      ...prev,
      organizersFacultyIncharge: [
        ...prev.organizersFacultyIncharge,
        { name: '', employeeId: '' }
      ]
    }));
  };

  const removeOrganizer = (index) => {
    setFormData(prev => ({
      ...prev,
      organizersFacultyIncharge: prev.organizersFacultyIncharge.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const url = editingEvent
        ? `${API_URL}/api/events/${editingEvent._id}`
        : `${API_URL}/api/events`;

      const method = editingEvent ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        fetchEvents();
        closeModal();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to save event');
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setFormData({
      schoolName: event.schoolName,
      eventName: event.eventName,
      eventStartDate: event.eventStartDate ? event.eventStartDate.split('T')[0] : '',
      eventEndDate: event.eventEndDate ? event.eventEndDate.split('T')[0] : '',
      preferredUpdateFrequency: event.preferredUpdateFrequency || 'One-time',
      eventDuration: event.eventDuration,
      levelOfEvents: event.levelOfEvents,
      naacRequirement: event.naacRequirement || '',
      sdgGoals: event.sdgGoals || [],
      sdgOutcomes: event.sdgOutcomes || '',
      schoolEventType: event.schoolEventType,
      categorization: event.categorization || '',
      organizersFacultyIncharge: event.organizersFacultyIncharge && event.organizersFacultyIncharge.length > 0
        ? event.organizersFacultyIncharge
        : [{ name: '', employeeId: '' }],
      modeOfEvent: event.modeOfEvent,
      targetGroup: event.targetGroup || '',
      objective: event.objective,
      methodology: event.methodology || '',
      evaluation: event.evaluation || '',
      expectedOutcome: event.expectedOutcome || '',
      toolsAndProcesses: event.toolsAndProcesses || '',
      registrationLink: event.registrationLink || '',
      registrationDeadline: event.registrationDeadline ? event.registrationDeadline.split('T')[0] : '',
      maxParticipants: event.maxParticipants || '',
      status: event.status
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;

    try {
      const response = await fetch(`${API_URL}/api/events/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        fetchEvents();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to delete event');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingEvent(null);
    setFormData({
      schoolName: 'SOET',
      eventName: '',
      eventStartDate: '',
      eventEndDate: '',
      preferredUpdateFrequency: 'One-time',
      eventDuration: 'Full day',
      levelOfEvents: 'Inter-University',
      naacRequirement: '',
      sdgGoals: [],
      sdgOutcomes: '',
      schoolEventType: 'Inter-University',
      categorization: '',
      organizersFacultyIncharge: [{ name: '', employeeId: '' }],
      modeOfEvent: 'Offline',
      targetGroup: '',
      objective: '',
      methodology: '',
      evaluation: '',
      expectedOutcome: '',
      toolsAndProcesses: '',
      registrationLink: '',
      registrationDeadline: '',
      maxParticipants: '',
      status: 'Upcoming'
    });
  };

  /* ==========================
     PARTICIPANTS HELPERS
     ========================== */

  // Try to infer role if backend doesn't provide explicit role:
  const inferRole = (p) => {
    if (!p) return 'Other';
    if (p.role) return p.role;
    if (p.studentId || p.class) return 'Student';
    if (p.employeeId) return 'Teacher';
    if (p.userId && typeof p.userId === 'object') {
      if (p.userId.studentId || p.userId.class) return 'Student';
      if (p.userId.employeeId) return 'Teacher';
    }
    return 'Other';
  };

  // Normalize participant structure to a consistent shape
  const normalizeParticipant = (p) => {
    const id = p?._id || (p?.userId && (p.userId._id || p.userId)) || null;
    const name = p?.name || (p.userId && p.userId.name) || '';
    const email = p?.email || (p.userId && p.userId.email) || '';
    const className = p?.class || (p.userId && p.userId.class) || ''; // include class
    const role = inferRole(p);
    const registeredAt = p?.registeredAt ? new Date(p.registeredAt) : null;
    return { id, name, email, className, role, registeredAt, raw: p };
  };

  const openParticipants = (event) => {
    setSelectedEventForParticipants(event);
    setParticipantFilter('All');
    setSearchParticipant('');
    setParticipantsModalOpen(true);
  };

  const closeParticipants = () => {
    setParticipantsModalOpen(false);
    setSelectedEventForParticipants(null);
    setRemovingId(null);
  };

  const filteredParticipants = () => {
    if (!selectedEventForParticipants) return [];
    const parts = selectedEventForParticipants.participants || [];
    const normalized = parts.map(normalizeParticipant);

    return normalized.filter(p => {
      if (participantFilter !== 'All' && p.role !== participantFilter) return false;
      if (searchParticipant) {
        const q = searchParticipant.toLowerCase();
        return String(p.name || '').toLowerCase().includes(q) ||
               String(p.email || '').toLowerCase().includes(q) ||
               String(p.id || '').toLowerCase().includes(q) ||
               String(p.className || '').toLowerCase().includes(q);
      }
      return true;
    });
  };

  const removeParticipant = async (participant) => {
    if (!selectedEventForParticipants || !participant?.id) return;
    if (!window.confirm(`Unregister ${participant.name || participant.id}?`)) return;

    try {
      setRemovingId(participant.id);
      const token = localStorage.getItem('token');

      const res = await fetch(`${API_URL}/api/events/${selectedEventForParticipants._id}/unregister`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ participantId: participant.id })
      });
      const data = await res.json();

      if (data?.success) {
        toast.success('Participant removed');

        // Optimistic: remove from selected event participants
        setSelectedEventForParticipants(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            participants: (prev.participants || []).filter(p => {
              const pId = p?._id || (p.userId && (p.userId._id || p.userId));
              return String(pId) !== String(participant.id);
            })
          };
        });

        // Also update master events list so UI counts update
        setEvents(prev => prev.map(ev => {
          if (String(ev._id) !== String(selectedEventForParticipants._id)) return ev;
          return {
            ...ev,
            participants: (ev.participants || []).filter(p => {
              const pId = p?._id || (p.userId && (p.userId._id || p.userId));
              return String(pId) !== String(participant.id);
            })
          };
        }));

      } else {
        toast.error(data?.message || 'Failed to remove participant');
      }
    } catch (err) {
      console.error('removeParticipant err', err);
      toast.error('Error removing participant');
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) {
    return <div className="em-loading">Loading events...</div>;
  }

  return (
    <div className="em-main-container">
      {/* Header */}
      <div className="em-header-bar">
        <div>
          <h1>Manage Events</h1>
          <p>Create and manage university events</p>
        </div>
        <button className="em-btn-create" onClick={() => setShowModal(true)}>
          <Plus size={20} />
          Create Event
        </button>
      </div>

      {/* Filters */}
      <div className="em-filter-row">
        <div className="em-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="em-filter-select"
        >
          <option value="all">All Status</option>
          <option value="Upcoming">Upcoming</option>
          <option value="Ongoing">Ongoing</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>

        <select
          value={filterSchool}
          onChange={(e) => setFilterSchool(e.target.value)}
          className="em-filter-select"
        >
          <option value="all">All Schools</option>
          {schools.map(school => (
            <option key={school} value={school}>{school}</option>
          ))}
        </select>
      </div>

      {/* Events Grid */}
      <div className="em-events-list">
        {filteredEvents.length === 0 ? (
          <div className="em-no-events">
            <Calendar size={48} />
            <p>No events found</p>
          </div>
        ) : (
          filteredEvents.map(event => (
            <div key={event._id} className="em-card">
              <div className="em-card-header">
                <span className={`em-card-status ${String(event.status).toLowerCase()}`}>
                  {event.status}
                </span>
                <div className="em-actions">
                  <button onClick={() => handleEdit(event)} className="em-btn-icon" title="Edit">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(event._id)} className="em-btn-icon" title="Delete">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <h3 className="em-title">{event.eventName}</h3>
              <p className="em-school">{event.schoolName}</p>

              <div className="em-meta">
                <div className="em-meta-item">
                  <Calendar size={14} />
                  <span>{new Date(event.eventStartDate).toLocaleDateString()}</span>
                </div>
                <div className="em-meta-item">
                  <MapPin size={14} />
                  <span>{event.modeOfEvent}</span>
                </div>
                <div className="em-meta-item">
                  <Users size={14} />
                  <span>{event.participants?.length || 0} registered</span>
                </div>
              </div>

              <p className="em-objective">{String(event.objective || '').substring(0, 100)}...</p>

              <div className="em-tags">
                <span className="em-tag">{event.levelOfEvents}</span>
                <span className="em-tag">{event.schoolEventType}</span>
              </div>

              {/* NEW: View Participants button */}
              <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                <button
                  className="em-btn-participants"
                  onClick={() => openParticipants(event)}
                  title="View Participants"
                >
                  <Users size={14} /> View Participants
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal (Create/Edit) */}
      {showModal && (
        <div className="em-modal-overlay" onClick={closeModal}>
          <div className="em-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="em-modal-header">
              <h2>{editingEvent ? 'Edit Event' : 'Create New Event'}</h2>
              <button onClick={closeModal} className="em-btn-close">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="em-form">
              {/* Basic Information */}
              <div className="em-section">
                <h3>Basic Information</h3>

                <div className="em-row">
                  <div className="em-group">
                    <label>School Name *</label>
                    <select
                      name="schoolName"
                      value={formData.schoolName}
                      onChange={handleChange}
                      required
                    >
                      {schools.map(school => (
                        <option key={school} value={school}>{school}</option>
                      ))}
                    </select>
                  </div>

                  <div className="em-group">
                    <label>Event Name *</label>
                    <input
                      type="text"
                      name="eventName"
                      value={formData.eventName}
                      onChange={handleChange}
                      placeholder="e.g., Deep Data Science Hackathon"
                      required
                    />
                  </div>
                </div>

                <div className="em-row">
                  <div className="em-group">
                    <label>Start Date *</label>
                    <input
                      type="date"
                      name="eventStartDate"
                      value={formData.eventStartDate}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="em-group">
                    <label>End Date *</label>
                    <input
                      type="date"
                      name="eventEndDate"
                      value={formData.eventEndDate}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="em-row">
                  <div className="em-group">
                    <label>Event Duration *</label>
                    <select
                      name="eventDuration"
                      value={formData.eventDuration}
                      onChange={handleChange}
                      required
                    >
                      <option value="Full day">Full day</option>
                      <option value="Half day">Half day</option>
                      <option value="1-2 Hrs">1-2 Hrs</option>
                      <option value="2-3 Hrs">2-3 Hrs</option>
                      <option value="3-4 Hrs">3-4 Hrs</option>
                    </select>
                  </div>

                  <div className="em-group">
                    <label>Level of Event *</label>
                    <select
                      name="levelOfEvents"
                      value={formData.levelOfEvents}
                      onChange={handleChange}
                      required
                    >
                      {eventLevels.map(level => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Event Type & Classification */}
              <div className="em-section">
                <h3>Event Classification</h3>

                <div className="em-row">
                  <div className="em-group">
                    <label>Event Type *</label>
                    <select
                      name="schoolEventType"
                      value={formData.schoolEventType}
                      onChange={handleChange}
                      required
                    >
                      {eventTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div className="em-group">
                    <label>Mode of Event *</label>
                    <select
                      name="modeOfEvent"
                      value={formData.modeOfEvent}
                      onChange={handleChange}
                      required
                    >
                      <option value="Online">Online</option>
                      <option value="Offline">Offline</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>
                </div>

                <div className="em-row">
                  <div className="em-group">
                    <label>NAAC Requirement</label>
                    <input
                      type="text"
                      name="naacRequirement"
                      value={formData.naacRequirement}
                      onChange={handleChange}
                      placeholder="e.g., 5.3.3, 6.3.3"
                    />
                  </div>

                  <div className="em-group">
                    <label>Categorization</label>
                    <input
                      type="text"
                      name="categorization"
                      value={formData.categorization}
                      onChange={handleChange}
                      placeholder="e.g., hack-a-thon, symposium"
                    />
                  </div>
                </div>
              </div>

              {/* SDG Goals */}
              <div className="em-section">
                <h3>SDG Goals</h3>
                <div className="em-sdg-grid">
                  {sdgOptions.map(sdg => (
                    <label key={sdg} className="em-checkbox-label">
                      <input
                        type="checkbox"
                        name="sdgGoals"
                        value={sdg}
                        checked={formData.sdgGoals.includes(sdg)}
                        onChange={handleChange}
                      />
                      {sdg}
                    </label>
                  ))}
                </div>

                <div className="em-group">
                  <label>SDG Outcomes</label>
                  <textarea
                    name="sdgOutcomes"
                    value={formData.sdgOutcomes}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Describe expected SDG outcomes..."
                  />
                </div>
              </div>

              {/* Organizers */}
              <div className="em-section">
                <h3>Organizers (Faculty In-charge)</h3>
                {formData.organizersFacultyIncharge.map((organizer, index) => (
                  <div key={index} className="em-organizer">
                    <div className="em-group">
                      <input
                        type="text"
                        placeholder="Faculty Name"
                        value={organizer.name}
                        onChange={(e) => handleOrganizerChange(index, 'name', e.target.value)}
                      />
                    </div>
                    <div className="em-group">
                      <input
                        type="text"
                        placeholder="Employee ID"
                        value={organizer.employeeId}
                        onChange={(e) => handleOrganizerChange(index, 'employeeId', e.target.value)}
                      />
                    </div>
                    {formData.organizersFacultyIncharge.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeOrganizer(index)}
                        className="em-btn-remove"
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={addOrganizer} className="em-btn-add">
                  + Add Another Organizer
                </button>
              </div>

              {/* Details */}
              <div className="em-section">
                <h3>Event Details</h3>

                <div className="em-group">
                  <label>Target Group</label>
                  <input
                    type="text"
                    name="targetGroup"
                    value={formData.targetGroup}
                    onChange={handleChange}
                    placeholder="e.g., Engineering students"
                  />
                </div>

                <div className="em-group">
                  <label>Objective *</label>
                  <textarea
                    name="objective"
                    value={formData.objective}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Describe the main objective of this event..."
                    required
                  />
                </div>

                <div className="em-group">
                  <label>Methodology</label>
                  <textarea
                    name="methodology"
                    value={formData.methodology}
                    onChange={handleChange}
                    rows="3"
                    placeholder="How will the event be conducted..."
                  />
                </div>

                <div className="em-group">
                  <label>Evaluation</label>
                  <textarea
                    name="evaluation"
                    value={formData.evaluation}
                    onChange={handleChange}
                    rows="3"
                    placeholder="How will participants be evaluated..."
                  />
                </div>

                <div className="em-group">
                  <label>Expected Outcome</label>
                  <textarea
                    name="expectedOutcome"
                    value={formData.expectedOutcome}
                    onChange={handleChange}
                    rows="3"
                    placeholder="What outcomes do you expect..."
                  />
                </div>

                <div className="em-group">
                  <label>Tools & Processes</label>
                  <textarea
                    name="toolsAndProcesses"
                    value={formData.toolsAndProcesses}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Tools, technologies, or processes involved..."
                  />
                </div>
              </div>

              {/* Registration */}
              <div className="em-section">
                <h3>Registration</h3>

                <div className="em-group">
                  <label>Registration Link</label>
                  <input
                    type="url"
                    name="registrationLink"
                    value={formData.registrationLink}
                    onChange={handleChange}
                    placeholder="https://..."
                  />
                </div>

                <div className="em-row">
                  <div className="em-group">
                    <label>Registration Deadline</label>
                    <input
                      type="date"
                      name="registrationDeadline"
                      value={formData.registrationDeadline}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="em-group">
                    <label>Max Participants</label>
                    <input
                      type="number"
                      name="maxParticipants"
                      value={formData.maxParticipants}
                      onChange={handleChange}
                      placeholder="e.g., 100"
                    />
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="em-section">
                <h3>Status</h3>
                <div className="em-group">
                  <label>Event Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="Upcoming">Upcoming</option>
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="em-actions-row">
                <button type="button" onClick={closeModal} className="em-btn-cancel">
                  Cancel
                </button>
                <button type="submit" className="em-btn-submit">
                  {editingEvent ? 'Update Event' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PARTICIPANTS MODAL */}
      {participantsModalOpen && selectedEventForParticipants && (
        <div className="em-part-modal-backdrop" onClick={closeParticipants}>
          <div className="em-part-modal" onClick={(e) => e.stopPropagation()}>
            <div className="em-part-header">
              <div>
                <h3>{selectedEventForParticipants.eventName}</h3>
                <div className="em-small">{selectedEventForParticipants.schoolName} • {new Date(selectedEventForParticipants.eventStartDate).toLocaleDateString()}</div>
              </div>
              <button className="em-btn-close" onClick={closeParticipants}><X size={18} /></button>
            </div>

            <div className="em-part-controls">
              <div className="em-part-filters">
                <button className={`em-part-filter ${participantFilter === 'All' ? 'active' : ''}`} onClick={() => setParticipantFilter('All')}>All</button>
                <button className={`em-part-filter ${participantFilter === 'Student' ? 'active' : ''}`} onClick={() => setParticipantFilter('Student')}>Students</button>
                <button className={`em-part-filter ${participantFilter === 'Teacher' ? 'active' : ''}`} onClick={() => setParticipantFilter('Teacher')}>Teachers</button>
                <button className={`em-part-filter ${participantFilter === 'Other' ? 'active' : ''}`} onClick={() => setParticipantFilter('Other')}>Other</button>
              </div>

              <div className="em-part-search">
                <Search size={14} />
                <input placeholder="Search by name, email, id or class..." value={searchParticipant} onChange={(e) => setSearchParticipant(e.target.value)} />
              </div>
            </div>

            <div className="em-part-list">
              {filteredParticipants().length === 0 ? (
                <div className="em-empty-part">No participants found</div>
              ) : (
                filteredParticipants().map(p => (
                  <div className="em-part-row" key={p.id || Math.random()}>
                    <div className="em-part-left">
                      <div className="em-avatar">{(p.name || p.id || '').charAt(0).toUpperCase()}</div>
                      <div>
                        <div className="em-name">{p.name || 'Unknown'}</div>
                        <div className="em-meta-small">
                          {p.email || p.id}
                          {p.className ? ` • ${p.className}` : ''}
                        </div>
                      </div>
                    </div>

                    <div className="em-part-right">
                      <div className="em-role">{p.role}</div>
                      <button className="em-remove" onClick={() => removeParticipant(p)} disabled={removingId === p.id}>
                        {removingId === p.id ? 'Removing...' : <Trash2 size={14} />}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="em-part-foot">
              <button className="em-btn-cancel" onClick={closeParticipants}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventManager;

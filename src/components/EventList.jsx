import React, { useState, useEffect } from 'react';
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Search,
  Loader,
  X,
  CheckCircle,
  Link as LinkIcon,
  Copy
} from 'lucide-react';
import { toast } from 'react-toastify';
import './EventList.css';

const API_URL =  import.meta.env.VITE_API_URL

const EventList = () => {
  const [events, setEvents] = useState([]); // all events
  const [myEvents, setMyEvents] = useState([]); // events the current user is registered in (server source)
  const [filteredEvents, setFilteredEvents] = useState([]); // what to render in grid
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'registered' | 'upcoming'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [registrationStatus, setRegistrationStatus] = useState({});
  const [myEventsCount, setMyEventsCount] = useState(0);

  // helper to read current userId (string)
  const getCurrentUserId = () =>
    typeof window !== 'undefined' ? localStorage.getItem('userId') : null;

  // tolerant check for participant id (works with ObjectId, populated user, or plain string)
  const extractParticipantId = (p) => {
    if (!p) return null;
    if (p.userId && typeof p.userId === 'object' && typeof p.userId.toString === 'function') {
      return p.userId.toString();
    }
    if (p.userId && typeof p.userId === 'string') return p.userId;
    if (p.userId && (p.userId._id || p.userId.id)) return p.userId._id || p.userId.id;
    if (p.studentId) return p.studentId;
    if (p._id) return p._id;
    if (typeof p === 'string') return p;
    return null;
  };

  // Build registration map robustly
  const buildRegistrationMap = (evts = []) => {
    const currentUserId = getCurrentUserId();
    const statuses = {};
    evts.forEach((event) => {
      const isRegistered = (event.participants || []).some((p) => {
        const pid = extractParticipantId(p);
        return String(pid) === String(currentUserId);
      });
      statuses[event._id] = !!isRegistered;
    });
    return statuses;
  };

  useEffect(() => {
    // initial fetch both lists
    fetchEvents();
    fetchMyEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // when data or tab/search changes compute what we should render
    filterEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events, myEvents, activeTab, searchQuery, registrationStatus]);

  // FETCH ALL EVENTS
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/events`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });

      const text = await response.text();
      let data;
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = { rawText: text };
      }

      if (response.ok && data?.success) {
        const evts = data.events || [];
        setEvents(evts);
        setRegistrationStatus(buildRegistrationMap(evts));
      } else {
        setEvents([]);
        setRegistrationStatus({});
        console.warn('fetchEvents did not return success:', data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
      setLoading(false);
    }
  };

  // Fetch my-events (server-side single-source-of-truth)
  const fetchMyEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/events/my-events`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      const text = await res.text();
      let data;
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = { rawText: text };
      }

      if (res.ok && data?.success) {
        const myEvts = data.events || [];
        setMyEvents(myEvts);
        setMyEventsCount(data.count ?? myEvts.length);
      } else {
        setMyEvents([]);
        setMyEventsCount(0);
        console.warn('fetchMyEvents did not return success:', data);
      }
    } catch (err) {
      console.error('Failed to fetch my-events:', err);
      setMyEvents([]);
      setMyEventsCount(0);
    }
  };

  // FILTER EVENTS -> choose source depending on active tab
  const filterEvents = () => {
    let baseList = [];

    if (activeTab === 'registered') {
      // Use server-provided myEvents as the source of truth for registered tab
      baseList = [...myEvents];
    } else if (activeTab === 'upcoming') {
      baseList = events.filter(
        (event) => new Date(event.eventStartDate) > new Date() && event.status === 'Upcoming'
      );
    } else {
      baseList = [...events];
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      baseList = baseList.filter(
        (event) =>
          String(event.eventName || '').toLowerCase().includes(q) ||
          String(event.schoolName || '').toLowerCase().includes(q) ||
          String(event.objective || '').toLowerCase().includes(q)
      );
    }

    setFilteredEvents(baseList);
  };

  // Helper: locally add current user to event.participants (used for optimistic update)
  const addLocalParticipant = (eventId) => {
    const currentUserId = getCurrentUserId();
    const name = localStorage.getItem('userName') || '';
    const email = localStorage.getItem('userEmail') || '';
    const studentId = localStorage.getItem('userStudentId') || '';

    // update events list
    setEvents((prev) =>
      prev.map((ev) =>
        ev._id === eventId
          ? {
              ...ev,
              participants: [
                ...(ev.participants || []),
                {
                  userId: currentUserId,
                  name,
                  email,
                  studentId,
                  registeredAt: new Date()
                }
              ]
            }
          : ev
      )
    );

    // also update myEvents (so registered tab shows immediately)
    setMyEvents((prev) =>
      // avoid duplicates if already present
      prev.some((e) => e._id === eventId)
        ? prev
        : [
            ...prev,
            // try to copy the event from events list if exists, otherwise make minimal placeholder
            (events.find((e) => e._id === eventId) || {
              _id: eventId,
              eventName: 'Registered Event',
              schoolName: '',
              eventStartDate: new Date(),
              eventDuration: '',
              modeOfEvent: '',
              participants: [
                {
                  userId: currentUserId,
                  name,
                  email,
                  studentId,
                  registeredAt: new Date()
                }
              ],
              status: 'Upcoming',
              objective: ''
            })
          ]
    );

    setRegistrationStatus((prev) => ({ ...prev, [eventId]: true }));
    setMyEventsCount((c) => (typeof c === 'number' ? c + 1 : 1));
  };

  // Helper: locally remove current user from event.participants
  const removeLocalParticipant = (eventId) => {
    const currentUserId = getCurrentUserId();

    setEvents((prev) =>
      prev.map((ev) =>
        ev._id === eventId
          ? {
              ...ev,
              participants: (ev.participants || []).filter((p) => {
                const pid = extractParticipantId(p);
                return String(pid) !== String(currentUserId);
              })
            }
          : ev
      )
    );

    setMyEvents((prev) => prev.filter((e) => e._id !== eventId));
    setRegistrationStatus((prev) => ({ ...prev, [eventId]: false }));
    setMyEventsCount((c) => (typeof c === 'number' ? Math.max(0, c - 1) : 0));
  };

  // REGISTER FOR EVENT (defensive)
  const handleRegister = async (eventId) => {
    try {
      const token = localStorage.getItem('token');
      const url = `${API_URL}/api/events/${eventId}/register`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
        // NOTE: your backend uses req.user so no body is required
      });

      const text = await response.text();
      let data;
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = { rawText: text };
      }

      console.debug('Register response:', response.status, data);

      if (response.ok && data?.success) {
        toast.success(data?.message || 'Registered for event successfully!');

        // if backend returned updated event, replace it in both lists
        if (data.event) {
          setEvents((prev) => prev.map((ev) => (ev._id === data.event._id ? data.event : ev)));
          setMyEvents((prev) => (prev.some((e) => e._id === data.event._id) ? prev : [...prev, data.event]));
          setRegistrationStatus((prev) => ({ ...prev, [data.event._id]: true }));
        } else {
          // optimistic add
          addLocalParticipant(eventId);
        }

        setActiveTab('registered');
        setSelectedEvent(null);

        // refresh server state for accurate populated fields / counts
        fetchEvents();
        fetchMyEvents();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      // Non-2xx: inspect message for "already registered"
      const serverMsg = (data?.message || data?.error || data?.rawText || '').toString();

      if (/already registered|already/i.test(serverMsg)) {
        toast.info('You are already registered for this event.');
        addLocalParticipant(eventId);
        setActiveTab('registered');
        setSelectedEvent(null);
        fetchEvents();
        fetchMyEvents();
        return;
      }

      // other errors
      toast.error(serverMsg || `Registration failed (${response.status})`);
      console.warn('Registration failed details:', { status: response.status, body: data });
    } catch (error) {
      console.error('Error registering:', error);
      toast.error('Error registering for event');
    }
  };

  // UNREGISTER FROM EVENT
  const handleUnregister = async (eventId) => {
    if (!window.confirm('Are you sure you want to unregister from this event?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/events/${eventId}/unregister`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });

      const text = await response.text();
      let data;
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = { rawText: text };
      }

      if (response.ok && data?.success) {
        toast.success('Unregistered from event');

        if (data.event) {
          setEvents((prev) => prev.map((ev) => (ev._id === data.event._id ? data.event : ev)));
          setMyEvents((prev) => prev.filter((e) => e._id !== data.event._id));
          setRegistrationStatus((prev) => ({ ...prev, [data.event._id]: false }));
        } else {
          removeLocalParticipant(eventId);
        }

        fetchEvents();
        fetchMyEvents();
      } else {
        const serverMsg = (data?.message || data?.error || data?.rawText || '').toString();
        toast.error(serverMsg || `Unregister failed (${response.status})`);
        console.warn('Unregister failed:', { status: response.status, body: data });
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error unregistering from event');
    }
  };

  // OPEN EXTERNAL REGISTRATION LINK
  const openRegistrationLink = (link, eventName) => {
    if (!link) return;
    try {
      // Basic validation
      const url = new URL(link);
      if (!['http:', 'https:'].includes(url.protocol)) {
        toast.error('Invalid registration link');
        return;
      }
      window.open(link, '_blank', 'noopener,noreferrer');
      toast.info(`Opening registration link for "${eventName}"`);
    } catch (err) {
      console.error('Invalid registration link', err);
      toast.error('Invalid registration link');
    }
  };

  // COPY REGISTRATION LINK
  const copyRegistrationLink = async (link) => {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      toast.success('Link copied to clipboard');
    } catch (err) {
      console.error('Copy failed', err);
      toast.info('Unable to copy automatically. Select and copy the link manually.');
    }
  };

  // FORMAT DATE
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString || '';
    }
  };

  // GET STATUS COLOR (CSS class)
  const getStatusColor = (status) => {
    switch (status) {
      case 'Upcoming':
        return 'evt-badge-upcoming';
      case 'Ongoing':
        return 'evt-badge-ongoing';
      case 'Completed':
        return 'evt-badge-completed';
      case 'Cancelled':
        return 'evt-badge-cancelled';
      default:
        return 'evt-badge-upcoming';
    }
  };

  if (loading) {
    return (
      <div className="evt-hub-wrapper">
        <div className="evt-loading-container">
          <Loader size={48} className="evt-spinner-icon" />
          <p>Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="evt-hub-wrapper">
      {/* Header */}
      <div className="evt-hub-header">
        <div className="evt-header-content">
          <h1 className="evt-main-title">Events & Updates</h1>
          <p className="evt-subtitle">Discover and register for university events</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="evt-nav-tabs">
        <button
          className={`evt-tab-button ${activeTab === 'all' ? 'evt-tab-active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All Events
          <span className="evt-badge-count">{events.length}</span>
        </button>

        <button
          className={`evt-tab-button ${activeTab === 'registered' ? 'evt-tab-active' : ''}`}
          onClick={() => setActiveTab('registered')}
        >
          My Events
          <span className="evt-badge-count">{myEventsCount}</span>
        </button>

        <button
          className={`evt-tab-button ${activeTab === 'upcoming' ? 'evt-tab-active' : ''}`}
          onClick={() => setActiveTab('upcoming')}
        >
          Upcoming
          <span className="evt-badge-count">
            {events.filter((e) => new Date(e.eventStartDate) > new Date()).length}
          </span>
        </button>
      </div>

      {/* Search */}
      <div className="evt-search-zone">
        <div className="evt-search-input-wrapper">
          <Search size={20} className="evt-search-icon" />
          <input
            type="text"
            className="evt-search-field"
            placeholder="Search events by name, school, or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Events List */}
      <div className="evt-grid-container">
        {filteredEvents.length === 0 ? (
          <div className="evt-empty-state">
            <Calendar size={64} className="evt-empty-icon" />
            <h3 className="evt-empty-title">No events found</h3>
            <p className="evt-empty-text">
              {activeTab === 'registered'
                ? "You haven't registered for any events yet."
                : 'No events match your search.'}
            </p>
          </div>
        ) : (
          filteredEvents.map((event) => (
            <div key={event._id} className="evt-card">
              <div className="evt-card-upper">
                <div className="evt-card-body">
                  <div className="evt-title-row">
                    <h3 className="evt-card-title">{event.eventName}</h3>
                    <span className={`evt-status-badge ${getStatusColor(event.status)}`}>
                      {event.status}
                    </span>
                  </div>

                  <p className="evt-school-name">{event.schoolName}</p>

                  <div className="evt-meta-items">
                    <div className="evt-meta-chip">
                      <Calendar size={16} />
                      <span>{formatDate(event.eventStartDate)}</span>
                    </div>
                    <div className="evt-meta-chip">
                      <Clock size={16} />
                      <span>{event.eventDuration}</span>
                    </div>
                    <div className="evt-meta-chip">
                      <MapPin size={16} />
                      <span>{event.modeOfEvent}</span>
                    </div>
                    <div className="evt-meta-chip">
                      <Users size={16} />
                      <span>{event.participants?.length || 0} registered</span>
                    </div>
                  </div>

                  <p
                    className="evt-description-preview"
                    onClick={() => setSelectedEvent(event)}
                    style={{ cursor: 'pointer' }}
                  >
                    {String(event.objective || '').substring(0, 150)}...
                    <span className="evt-view-more-link">View More</span>
                  </p>

                  <div className="evt-tag-container">
                    <span className="evt-label-tag">{event.levelOfEvents}</span>
                    <span className="evt-label-tag">{event.schoolEventType}</span>
                    {event.sdgGoals?.length > 0 && (
                      <span className="evt-sdg-tag">🌍 SDG: {event.sdgGoals.join(', ')}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="evt-card-action-zone">
                {/* External registration link button */}
                {event.registrationLink && (
                  <button
                    className="evt-btn-external"
                    onClick={() => openRegistrationLink(event.registrationLink, event.eventName)}
                    title="Open external registration"
                    style={{
                      padding: '8px 12px',
                      borderRadius: 8,
                      background: 'transparent',
                      border: '1px solid rgba(123,97,255,0.14)',
                      color: '#7b61ff',
                      display: 'inline-flex',
                      gap: 8,
                      alignItems: 'center'
                    }}
                  >
                    <LinkIcon size={14} />
                    Registration Link
                  </button>
                )}

                {/* Internal register/unregister */}
                {registrationStatus[event._id] ? (
                  <>
                    <div className="evt-registered-indicator">
                      <CheckCircle size={16} />
                      You're Registered
                    </div>
                    <button className="evt-btn-unregister" onClick={() => handleUnregister(event._id)}>
                      Unregister
                    </button>
                  </>
                ) : (
                  <button
                    className="evt-btn-register"
                    onClick={() => handleRegister(event._id)}
                    disabled={event.status === 'Cancelled'}
                  >
                    {event.status === 'Cancelled' ? 'Cancelled' : 'Register Now'}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal - VIEW FULL EVENT DETAILS */}
      {selectedEvent && (
        <div className="evt-modal-backdrop" onClick={() => setSelectedEvent(null)}>
          <div className="evt-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="evt-modal-top">
              <h2 className="evt-modal-heading">{selectedEvent.eventName}</h2>
              <button
                className="evt-modal-close-btn"
                onClick={() => setSelectedEvent(null)}
                aria-label="Close"
              >
                <X size={24} />
              </button>
            </div>

            <div className="evt-modal-content">
              <div className="evt-modal-section">
                <h3 className="evt-section-title">School</h3>
                <p className="evt-section-text">{selectedEvent.schoolName}</p>
              </div>

              <div className="evt-modal-section">
                <h3 className="evt-section-title">Status</h3>
                <span className={`evt-status-badge ${getStatusColor(selectedEvent.status)}`}>
                  {selectedEvent.status}
                </span>
              </div>

              <div className="evt-modal-section">
                <h3 className="evt-section-title">Event Details</h3>
                <div className="evt-details-layout">
                  <div className="evt-detail-cell">
                    <Calendar size={16} />
                    <div>
                      <strong>Date:</strong> {formatDate(selectedEvent.eventStartDate)}
                    </div>
                  </div>
                  <div className="evt-detail-cell">
                    <Clock size={16} />
                    <div>
                      <strong>Duration:</strong> {selectedEvent.eventDuration}
                    </div>
                  </div>
                  <div className="evt-detail-cell">
                    <MapPin size={16} />
                    <div>
                      <strong>Mode:</strong> {selectedEvent.modeOfEvent}
                    </div>
                  </div>
                  <div className="evt-detail-cell">
                    <Users size={16} />
                    <div>
                      <strong>Participants:</strong> {selectedEvent.participants?.length || 0}
                    </div>
                  </div>
                </div>
              </div>

              <div className="evt-modal-section">
                <h3 className="evt-section-title">Objective</h3>
                <p className="evt-full-description">{selectedEvent.objective}</p>
              </div>

              {selectedEvent.sdgGoals?.length > 0 && (
                <div className="evt-modal-section">
                  <h3 className="evt-section-title">SDG Goals</h3>
                  <div className="evt-tag-container">
                    {selectedEvent.sdgGoals.map((goal, idx) => (
                      <span key={idx} className="evt-sdg-tag">
                        🌍 {goal}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="evt-modal-section">
                <h3 className="evt-section-title">Event Type</h3>
                <div className="evt-tag-container">
                  <span className="evt-label-tag">{selectedEvent.levelOfEvents}</span>
                  <span className="evt-label-tag">{selectedEvent.schoolEventType}</span>
                </div>
              </div>

              {/* Registration link display in modal */}
              {selectedEvent.registrationLink && (
                <div className="evt-modal-section">
                  <h3 className="evt-section-title">Registration Link</h3>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <a
                      href={selectedEvent.registrationLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => toast.info('Opening registration link')}
                      style={{
                        textDecoration: 'none',
                        padding: '8px 10px',
                        borderRadius: 8,
                        border: '1px solid rgba(123,97,255,0.14)',
                        display: 'inline-flex',
                        gap: 8,
                        alignItems: 'center',
                        color: '#7b61ff'
                      }}
                    >
                      <LinkIcon size={14} /> Open Registration Link
                    </a>

                    <button
                      onClick={() => copyRegistrationLink(selectedEvent.registrationLink)}
                      title="Copy link"
                      style={{
                        padding: '8px 10px',
                        borderRadius: 8,
                        border: '1px solid rgba(255,255,255,0.06)',
                        background: 'transparent',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6
                      }}
                    >
                      <Copy size={14} /> Copy
                    </button>
                  </div>
                  <div style={{ marginTop: 8, color: '#bfbfd3', fontSize: 13 }}>
                    {selectedEvent.registrationLink}
                  </div>
                </div>
              )}
            </div>

            <div className="evt-modal-footer">
              {registrationStatus[selectedEvent._id] ? (
                <button
                  className="evt-btn-unregister"
                  onClick={() => {
                    handleUnregister(selectedEvent._id);
                    setSelectedEvent(null);
                  }}
                >
                  Unregister
                </button>
              ) : (
                <button
                  className="evt-btn-register"
                  onClick={() => {
                    handleRegister(selectedEvent._id);
                    setSelectedEvent(null);
                  }}
                  disabled={selectedEvent.status === 'Cancelled'}
                >
                  {selectedEvent.status === 'Cancelled' ? 'Cancelled' : 'Register Now'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventList;

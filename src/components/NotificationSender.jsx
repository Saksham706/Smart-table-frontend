import React, { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { Send, Mail, MessageSquare, Users, Paperclip } from 'lucide-react';
import './NotificationSender.css';

const API_URL = import.meta.env.VITE_API_URL;

const NotificationSender = () => {
  const { user } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    targetClass: '',
    type: 'general',
    attachment: null
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, attachment: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.message || !formData.targetClass) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication token missing');

      const form = new FormData();
      form.append('title', formData.title);
      form.append('message', formData.message);
      form.append('type', formData.type);
      form.append('targetClass', formData.targetClass);
      form.append('sentByName', user?.name);

      if (formData.attachment) {
        form.append('attachment', formData.attachment);
      }

      const response = await fetch(`${API_URL}/api/notifications/sends`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: form
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to send');

      toast.success('Notification sent successfully!');
      setFormData({
        title: '',
        message: '',
        targetClass: '',
        type: 'general',
        attachment: null
      });

    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="notification-sender-container">
      <div className="sender-card">
        <div className="sender-header">
          <Mail size={32} />
          <h1>Send Notification</h1>
          <p>Send custom notifications to your class with attachments</p>
        </div>

        <form className="sender-form" onSubmit={handleSubmit}>
          {/* Title */}
          <div className="form-group">
            <label>
              <MessageSquare size={18} /> Notification Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Mid-term Exam Notice"
              required
            />
          </div>

          {/* Message */}
          <div className="form-group">
            <label>
              <MessageSquare size={18} /> Message *
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Enter notification message here..."
              rows={6}
              required
            ></textarea>
          </div>

          {/* Class + Type */}
          <div className="form-row">
            <div className="form-group">
              <label>
                <Users size={18} /> Target Class *
              </label>
              <input
                type="text"
                name="targetClass"
                value={formData.targetClass}
                onChange={handleChange}
                placeholder="e.g. CSE-4A"
                required
              />
            </div>

            <div className="form-group">
              <label>
                <Mail size={18} /> Notification Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
              >
                <option value="general">General</option>
                <option value="assignment">Assignment</option>
                <option value="announcement">Announcement</option>
                <option value="exam">Exam</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* File Upload */}
          <div className="form-group">
            <label>
              <Paperclip size={18} /> Attachment (PDF)
            </label>
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
            />
          </div>

          {/* Submit */}
          <button type="submit" className="send-btn" disabled={loading}>
            <Send size={20} />
            <span>{loading ? 'Sending...' : 'Send Notification'}</span>
          </button>
        </form>

        <div className="info-box">
          <h3>📢 Info</h3>
          <ul>
            <li>Attachment must be PDF (max 5 MB)</li>
            <li>Email will be sent to all students automatically</li>
            <li>Notification appears instantly for students</li>
            <li>Students can download attached file</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NotificationSender;

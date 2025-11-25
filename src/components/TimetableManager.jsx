import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import timetableService from "../services/timetableService";
import { Plus, Edit2, Trash2, Download, Printer, Search, Grid3x3, Building2 } from "lucide-react";
import { toast } from "react-toastify";
import jsPDF from "jspdf";
import krmuLogo from "../assets/logo.png";
import "./TimetableManager.css";

const TimetableManager = () => {
  const { user } = useContext(AuthContext);
  const [timetables, setTimetables] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewFormat, setViewFormat] = useState("grid"); // 'grid', 'table', 'room-wise'
  const [selectedClass, setSelectedClass] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrganization, setSelectedOrganization] = useState("class"); // 'class' or 'room'
  
  const [formData, setFormData] = useState({
    class: "",
    courseCode: "",
    group: "A",
    subject: "",
    teacher: "",
    day: "Monday",
    startTime: "",
    endTime: "",
    location: "",
    semester: "Fall 2025",
  });

  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const timeSlots = [
    "09:10-10:00",
    "10:05-10:55",
    "11:00-11:50",
    "11:50-12:40",
    "12:40-13:30",
    "13:30-14:20",
    "14:20-15:10",
    "15:10-16:00",
  ];

  useEffect(() => {
    fetchTimetables();
    fetchTeachers();
  }, []);

  const fetchTimetables = async () => {
    try {
      setLoading(true);
      const data = await timetableService.getAllTimetables();
      // expecting array of timetables (with populated teacher that includes employeeId)
      setTimetables(data);
    } catch (error) {
      console.error("Error fetching timetables:", error);
      toast.error("Failed to load timetables");
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const data = await timetableService.getAllTeachers();
      setTeachers(data || []);
    } catch (error) {
      console.error("Error fetching teachers:", error);
      toast.error("Failed to load teachers");
    }
  };

  // ✅ SEARCH FILTER (added courseCode, group and employeeId to search)
  const filteredTimetables = timetables.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      (item.class || "").toLowerCase().includes(query) ||
      (item.subject || "").toLowerCase().includes(query) ||
      (item.courseCode || "").toLowerCase().includes(query) ||
      (item.group || "").toLowerCase().includes(query) ||
      (item.teacher?.name || "").toLowerCase().includes(query) ||
      (item.teacher?.employeeId || "").toLowerCase().includes(query) ||
      (item.location || "").toLowerCase().includes(query) ||
      (item.day || "").toLowerCase().includes(query)
    );
  });

  const classes = [...new Set(filteredTimetables.map((t) => t.class))].sort();
  const rooms = [...new Set(filteredTimetables.map((t) => t.location))].sort();

  const getCellData = (key, value, day, timeSlot) => {
    return filteredTimetables.find(
      (t) =>
        t[key] === value &&
        t.day === day &&
        `${t.startTime}-${t.endTime}` === timeSlot
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setFormData({
      class: item.class || "",
      courseCode: item.courseCode || "",
      group: item.group || "A",
      subject: item.subject || "",
      teacher: item.teacher?._id || item.teacher || "",
      day: item.day || "Monday",
      startTime: item.startTime || "",
      endTime: item.endTime || "",
      location: item.location || "",
      semester: item.semester || "Fall 2025",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await timetableService.updateTimetable(editingId, formData);
        toast.success("Timetable updated successfully!");
        setEditingId(null);
      } else {
        await timetableService.createTimetable(formData);
        toast.success("Timetable created successfully!");
      }
      setShowModal(false);
      fetchTimetables();
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save timetable");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      try {
        await timetableService.deleteTimetable(id);
        toast.success("Deleted successfully!");
        fetchTimetables();
      } catch (error) {
        toast.error("Failed to delete");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      class: "",
      courseCode: "",
      group: "A",
      subject: "",
      teacher: "",
      day: "Monday",
      startTime: "",
      endTime: "",
      location: "",
      semester: "Fall 2025",
    });
    setEditingId(null);
  };

  // helper: get employeeId for currently selected teacher in the form
  const currentTeacherEmployeeId = () => {
    if (!formData.teacher) return "";
    const t = teachers.find((x) => String(x._id) === String(formData.teacher));
    return t?.employeeId || "";
  };

  // ✅ ENHANCED PDF EXPORT - updated to include courseCode & employeeId
  const exportToPDF = (format = "class") => {
    try {
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 12;
      const availableWidth = pageWidth - 2 * margin;
      const timeColWidth = 18;
      const dayColWidth = (availableWidth - timeColWidth) / days.length;
      const rowHeight = 14;
      const headerHeight = 12;

      const itemsToExport = format === "class" 
        ? (selectedClass === "all" ? classes : [selectedClass])
        : (selectedOrganization === "class" ? classes : rooms);

      itemsToExport.forEach((item, index) => {
        if (index > 0) {
          doc.addPage();
        }

        let yPosition = 12;

        // Add logo
        try {
          const logoWidth = 12;
          const logoHeight = 12;
          doc.addImage(
            krmuLogo,
            "PNG",
            pageWidth / 2 - logoWidth / 2,
            yPosition,
            logoWidth,
            logoHeight
          );
          yPosition += 15;
        } catch (logoError) {
          console.warn("Logo not found");
          yPosition += 5;
        }

        // University header
        doc.setFontSize(13);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 0, 0);
        doc.text("UnivSync", pageWidth / 2, yPosition, {
          align: "center",
        });
        yPosition += 4;

        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.text("location ", pageWidth / 2, yPosition, {
          align: "center",
        });
        yPosition += 7;

        // Title
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        const title = format === "class" 
          ? `${item} - Timetable (${formData.semester})`
          : `Room ${item} - Timetable (${formData.semester})`;
        doc.text(title, pageWidth / 2, yPosition, { align: "center" });
        yPosition += 8;

        // Draw table header
        doc.setFillColor(102, 126, 234);
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.setLineWidth(0.5);

        let xPosition = margin;

        // Time column header
        doc.rect(xPosition, yPosition, timeColWidth, headerHeight, "F");
        doc.setDrawColor(70, 100, 200);
        doc.rect(xPosition, yPosition, timeColWidth, headerHeight);
        doc.text("Time", xPosition + timeColWidth / 2, yPosition + headerHeight / 2 + 1.5, {
          align: "center",
          valign: "middle",
        });
        xPosition += timeColWidth;

        // Day headers
        days.forEach((day) => {
          doc.setFillColor(102, 126, 234);
          doc.rect(xPosition, yPosition, dayColWidth, headerHeight, "F");
          doc.setDrawColor(70, 100, 200);
          doc.rect(xPosition, yPosition, dayColWidth, headerHeight);
          doc.setTextColor(255, 255, 255);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(7.5);
          doc.text(day, xPosition + dayColWidth / 2, yPosition + headerHeight / 2 + 1.5, {
            align: "center",
            valign: "middle",
            maxWidth: dayColWidth - 1,
          });
          xPosition += dayColWidth;
        });

        yPosition += headerHeight;

        // Draw table rows
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(6.5);
        doc.setFont("helvetica", "normal");

        timeSlots.forEach((slot) => {
          xPosition = margin;

          // Time cell
          doc.setFillColor(230, 230, 240);
          doc.rect(xPosition, yPosition, timeColWidth, rowHeight, "F");
          doc.setDrawColor(150, 150, 180);
          doc.setLineWidth(0.4);
          doc.rect(xPosition, yPosition, timeColWidth, rowHeight);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(6.5);
          doc.setTextColor(0, 0, 0);
          doc.text(slot, xPosition + timeColWidth / 2, yPosition + rowHeight / 2 + 1, {
            align: "center",
            valign: "middle",
          });
          doc.setFont("helvetica", "normal");
          xPosition += timeColWidth;

          // Data cells
          days.forEach((day) => {
            const key = format === "class" ? "class" : "location";
            const cell = getCellData(key, item, day, slot);

            if (cell) {
              doc.setFillColor(189, 215, 238);
            } else {
              doc.setFillColor(255, 255, 255);
            }

            doc.rect(xPosition, yPosition, dayColWidth, rowHeight, "F");
            doc.setDrawColor(150, 150, 180);
            doc.setLineWidth(0.4);
            doc.rect(xPosition, yPosition, dayColWidth, rowHeight);

            if (cell) {
              const subject = cell.subject || "";
              const teacherName = cell.teacher?.name || "TBA";
              const teacherEmployeeId = cell.teacher?.employeeId || "";
              const location = cell.location || "";
              const cellClass = cell.class || "";
              const courseCode = cell.courseCode || "";
              const group = cell.group || "";

              const textX = xPosition + 1;
              const textWidth = dayColWidth - 2;

              doc.setFont("helvetica", "bold");
              doc.setFontSize(6);
              doc.text(subject + (courseCode ? ` (${courseCode})` : ""), textX, yPosition + 2, { maxWidth: textWidth });

              doc.setFont("helvetica", "normal");
              doc.setFontSize(5.5);
              const secondLine = format === "class" ? `${teacherEmployeeId ? teacherEmployeeId + " — " : ""}${teacherName}` : `${cellClass} ${group ? "- Group " + group : ""}`;
              doc.text(secondLine, textX, yPosition + 5.5, { maxWidth: textWidth });

              doc.setFont("helvetica", "normal");
              doc.setFontSize(5);
              const thirdLine = format === "class" ? location : teacherName;
              doc.text(thirdLine, textX, yPosition + 8.5, { maxWidth: textWidth });
            }

            xPosition += dayColWidth;
          });

          yPosition += rowHeight;
        });
      });

      const filename = format === "class" 
        ? `${selectedClass}_Timetable_${selectedOrganization}.pdf`
        : `${selectedOrganization}_Timetable.pdf`;
      doc.save(filename);
      toast.success("✅ PDF exported successfully!");
    } catch (error) {
      console.error("PDF Export Error:", error);
      toast.error("Failed to export PDF: " + error.message);
    }
  };

  if (loading) {
    return (
      <div className="timetable-container">
        <p>Loading timetables...</p>
      </div>
    );
  }

  return (
    <div className="timetable-container">
      <div className="timetable-header">
        <div>
          <h1>Manage Timetables</h1>
          <p>Create and manage class schedules</p>
        </div>
        <div className="header-actions">
          {/* ✅ SEARCH BAR */}
          <div className="search-wrapper">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search by class, subject, course, group, teacher, room, day..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          {/* ✅ ORGANIZATION TOGGLE */}
          <div className="org-toggle">
            <button
              id="Class-Wise"
              className={`toggle-btn ${selectedOrganization === "class" ? "active" : ""}`}
              onClick={() => setSelectedOrganization("class")}
            >
              <Grid3x3 size={16} />
              Class-Wise
            </button>
            <button 
              id="Room-Wise"
              className={`toggle-btn ${selectedOrganization === "room" ? "active" : ""}`}
              onClick={() => setSelectedOrganization("room")}
            >
              <Building2 size={16} />
              Room-Wise
            </button>
          </div>

          {selectedOrganization === "class" && (
            <select
              className="class-filter"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="all">All Classes</option>
              {classes.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          )}

          <button
            className="btn-view"
            onClick={() => {
              const views = ["grid", "table"];
              const currentIndex = views.indexOf(viewFormat);
              setViewFormat(views[(currentIndex + 1) % views.length]);
            }}
          >
            {viewFormat === "grid" ? "List View" : "Grid View"}
          </button>

          <button
            className="btn-export"
            onClick={() => exportToPDF(selectedOrganization)}
          >
            <Download size={18} />
            Export PDF
          </button>

          <button className="btn-print" onClick={() => window.print()}>
            <Printer size={18} />
            Print
          </button>

          <button className="btn-create" onClick={() => setShowModal(true)}>
            <Plus size={20} />
            Add New
          </button>
        </div>
      </div>

      {filteredTimetables.length === 0 ? (
        <div className="no-timetables">
          <p>No timetables found</p>
        </div>
      ) : (
        <>
          {viewFormat === "grid" ? (
            <div className="timetable-grids printable-area">
              {selectedOrganization === "class"
                ? (selectedClass === "all" ? classes : [selectedClass]).map(
                    (className) => (
                      <div key={className} className="class-timetable-grid">
                        <div className="class-header">
                          <h2>{className}</h2>
                          <span className="semester-badge">
                            {formData.semester}
                          </span>
                        </div>

                        <table className="krmu-grid-table">
                          <thead>
                            <tr>
                              <th className="time-header">Time / Day</th>
                              {days.map((day) => (
                                <th key={day}>{day}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {timeSlots.map((slot) => (
                              <tr key={slot}>
                                <td className="time-cell">{slot}</td>
                                {days.map((day) => {
                                  const cell = getCellData(
                                    "class",
                                    className,
                                    day,
                                    slot
                                  );
                                  return (
                                    <td
                                      key={day}
                                      className={
                                        cell ? "filled-cell" : "empty-cell"
                                      }
                                    >
                                      {cell ? (
                                        <div className="cell-content">
                                          <div className="subject">
                                            {cell.subject}
                                            {cell.courseCode ? <span className="coursecode"> ({cell.courseCode})</span> : null}
                                          </div>
                                          <div className="faculty">
                                            {cell.teacher?.employeeId
                                              ? `${cell.teacher.employeeId} — ${cell.teacher.name}`
                                              : (cell.teacher?.name || "TBA")}
                                            {cell.group ? <span className="group-badge"> Group {cell.group}</span> : null}
                                          </div>
                                          <div className="location">
                                            {cell.location}
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="empty-slot">-</div>
                                      )}
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )
                  )
                : rooms.map((room) => (
                    <div key={room} className="class-timetable-grid">
                      <div className="class-header">
                        <h2>Room {room}</h2>
                        <span className="semester-badge">
                          {formData.semester}
                        </span>
                      </div>

                      <table className="krmu-grid-table">
                        <thead>
                          <tr>
                            <th className="time-header">Time / Day</th>
                            {days.map((day) => (
                              <th key={day}>{day}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {timeSlots.map((slot) => (
                            <tr key={slot}>
                              <td className="time-cell">{slot}</td>
                              {days.map((day) => {
                                const cell = getCellData(
                                  "location",
                                  room,
                                  day,
                                  slot
                                );
                                return (
                                  <td
                                    key={day}
                                    className={
                                      cell ? "filled-cell" : "empty-cell"
                                    }
                                  >
                                    {cell ? (
                                      <div className="cell-content">
                                        <div className="subject">
                                          {cell.subject}
                                          {cell.courseCode ? <span className="coursecode"> ({cell.courseCode})</span> : null}
                                        </div>
                                        <div className="faculty">
                                          {cell.class} - {cell.group ? `Group ${cell.group} • ` : ""}
                                          {cell.teacher?.employeeId ? `${cell.teacher.employeeId} — ${cell.teacher.name}` : (cell.teacher?.name || "TBA")}
                                        </div>
                                        <div className="location">
                                          {cell.day}
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="empty-slot">-</div>
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
            </div>
          ) : (
            <div className="timetable-list">
              <table className="list-table">
                <thead>
                  <tr>
                    <th>Class</th>
                    <th>Course</th>
                    <th>Group</th>
                    <th>Subject</th>
                    <th>Teacher</th>
                    <th>Day</th>
                    <th>Time</th>
                    <th>Room</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTimetables.map((item) => (
                    <tr key={item._id}>
                      <td><span className="class-badge">{item.class}</span></td>
                      <td>{item.courseCode || "-"}</td>
                      <td>{item.group || "-"}</td>
                      <td><strong>{item.subject}</strong></td>
                      <td>{item.teacher?.employeeId ? `${item.teacher.employeeId} — ${item.teacher.name}` : (item.teacher?.name || "TBA")}</td>
                      <td>{item.day}</td>
                      <td>{item.startTime} - {item.endTime}</td>
                      <td>{item.location}</td>
                      <td>
                        <button className="btn-edit-small" onClick={() => handleEdit(item)} title="Edit">
                          <Edit2 size={16} />
                        </button>
                        <button className="btn-delete-small" onClick={() => handleDelete(item._id)}>
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {showModal && (
        <div
          className="modal-overlay"
          onClick={() => {
            setShowModal(false);
            setEditingId(null);
          }}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {editingId ? "Edit Timetable Entry" : "Add New Timetable Entry"}
              </h2>
              <button
                className="btn-close"
                onClick={() => {
                  setShowModal(false);
                  setEditingId(null);
                }}
              >
                ✕
              </button>
            </div>

            <form className="timetable-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Class *</label>
                  <input
                    type="text"
                    name="class"
                    value={formData.class}
                    onChange={handleChange}
                    placeholder="e.g., B.TechVII"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Course Code *</label>
                  <input
                    type="text"
                    name="courseCode"
                    value={formData.courseCode}
                    onChange={handleChange}
                    placeholder="e.g., CS401"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Group</label>
                  <input
                    type="text"
                    name="group"
                    value={formData.group}
                    onChange={handleChange}
                    placeholder="e.g., A"
                  />
                </div>

                <div className="form-group">
                  <label>Subject *</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="e.g., Machine Learning"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Teacher (Employee ID — Name) (Optional)</label>
                <select name="teacher" value={formData.teacher} onChange={handleChange}>
                  <option value="">-- Unassigned --</option>
                  {teachers.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.employeeId ? `${t.employeeId} — ${t.name}` : t.name}
                    </option>
                  ))}
                </select>
                <small className="note">Selecting a teacher sends the teacher <strong>_id</strong> to the backend; UI shows employeeId for humans.</small>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Selected Employee ID</label>
                  <input type="text" value={currentTeacherEmployeeId()} disabled />
                </div>

                <div className="form-group">
                  <label>Day *</label>
                  <select
                    name="day"
                    value={formData.day}
                    onChange={handleChange}
                    required
                  >
                    {days.map((day) => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Semester</label>
                  <input
                    type="text"
                    name="semester"
                    value={formData.semester}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Start Time *</label>
                  <input
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>End Time *</label>
                  <input
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Room/Location *</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g., C-003"
                  required
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => {
                    setShowModal(false);
                    setEditingId(null);
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  {editingId ? "Update Timetable" : "Create Timetable"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimetableManager;

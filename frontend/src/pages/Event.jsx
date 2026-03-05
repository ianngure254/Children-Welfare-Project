import React, { useEffect, useState } from 'react';
import { IoCalendar, IoLocation, IoTime, IoPeople, IoTicket } from 'react-icons/io5';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
        const res = await fetch(`${API}/events?status=published`);
        const payload = await res.json().catch(() => ({}));
        const list = Array.isArray(payload) ? payload : (payload?.data || []);
        setEvents(list);
      } catch (error) {
        console.error('Failed to load events:', error);
        setEvents([]);
      }
    };

    loadEvents();
  }, []);

  const categories = [
    { value: 'all', label: 'All Events' },
    { value: 'religious', label: 'Religious' },
    { value: 'community', label: 'Community' },
    { value: 'fundraising', label: 'Fundraising' },
    { value: 'cultural', label: 'Cultural' },
    { value: 'academic', label: 'Academic' },
    { value: 'sports', label: 'Sports' },
    { value: 'graduation', label: 'Graduation' },
    { value: 'other', label: 'Other' }
  ];

  const categoryColors = {
    religious: 'bg-purple-500',
    community: 'bg-orange-500',
    fundraising: 'bg-green-500',
    cultural: 'bg-yellow-500',
    academic: 'bg-blue-500',
    sports: 'bg-red-500',
    graduation: 'bg-indigo-500',
    other: 'bg-gray-500'
  };

  const filteredEvents = selectedCategory === 'all' 
    ? events 
    : events.filter(event => event.category === selectedCategory);

  const formatDate = (dateString) => {
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const formatFee = (fee) => {
    if (!fee) return 'Free';
    return `KES ${fee}`;
  };

  const formatTimeRange = (startTime, endTime) => {
    if (!startTime && !endTime) return 'TBA';
    if (startTime && endTime) return `${startTime} - ${endTime}`;
    return startTime || endTime;
  };

  const handleRegister = (eventId) => {
    alert(`Registration for event ${eventId} would open here. This would connect to your registration system.`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Events & Programs
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Connect, grow, and serve alongside our vibrant community through these enriching events and programs
          </p>
          
          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map(category => (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`px-4 py-2 rounded-full font-medium transition-colors ${
                  selectedCategory === category.value
                    ? 'bg-orange-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredEvents.map((event) => (
            <div key={event._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
              {/* Event Header with Color */}
              <div className={`h-2 ${categoryColors[event.category] || 'bg-gray-400'}`}></div>
              
              <div className="p-6">
                {/* Event Title and Category */}
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {event.title}
                  </h3>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium text-white ${categoryColors[event.category] || 'bg-gray-400'}`}>
                    {event.category}
                  </span>
                </div>

                {/* Event Description */}
                <p className="text-gray-600 mb-6 line-clamp-3">
                  {event.description}
                </p>

                {/* Event Details */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-gray-700">
                    <IoCalendar className="mr-3 text-orange-500" />
                    <span className="text-sm font-medium">{formatDate(event.startDate)}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <IoTime className="mr-3 text-orange-500" />
                    <span className="text-sm font-medium">{formatTimeRange(event.startTime, event.endTime)}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <IoLocation className="mr-3 text-orange-500" />
                    <span className="text-sm font-medium">{event.location?.venue || 'TBA'}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <IoPeople className="mr-3 text-orange-500" />
                    <span className="text-sm font-medium">
                      {(event.registration?.currentAttendees || 0)}/{event.registration?.maxAttendees || '∞'} attending
                    </span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <IoTicket className="mr-3 text-orange-500" />
                    <span className="text-sm font-bold text-green-600">{formatFee(event.registration?.fee)}</span>
                  </div>
                </div>

                {/* Registration Button */}
                <button
                  onClick={() => handleRegister(event._id)}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300 flex items-center justify-center"
                >
                  <IoTicket className="mr-2" />
                  Register Now
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No events found in this category.</p>
          </div>
        )}

        {/* View All Events CTA */}
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Don't Miss Out!
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Stay updated with all our upcoming events. Subscribe to our newsletter for the latest announcements.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg transition-colors">
              View All Events
            </button>
           
          </div>
        </div>
      </div>
    </div>
  );
};

export default Events;

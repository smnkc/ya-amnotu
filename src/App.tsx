import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { format, formatDistanceToNow, isSameDay, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Calendar, Clock, Trash2, Edit2, Plus, Search } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

interface Event {
  id: string;
  title: string;
  date: string;
}

function App() {
  const [events, setEvents] = useState<Event[]>([]);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  
  // Filter states
  const [searchText, setSearchText] = useState('');
  const [filterDate, setFilterDate] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error('Lütfen bir olay giriniz');
      return;
    }

    const newEvent = {
      id: crypto.randomUUID(),
      title: title.trim(),
      date,
    };

    setEvents(prev => [...prev, newEvent]);
    setTitle('');
    toast.success('Olay başarıyla eklendi');
  };

  const handleDelete = (id: string) => {
    setEvents(prev => prev.filter(event => event.id !== id));
    toast.success('Olay silindi');
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setTitle(event.title);
    setDate(event.date);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;

    setEvents(prev =>
      prev.map(event =>
        event.id === editingEvent.id
          ? { ...event, title, date }
          : event
      )
    );

    setEditingEvent(null);
    setTitle('');
    setDate(format(new Date(), 'yyyy-MM-dd'));
    toast.success('Olay güncellendi');
  };

  const clearFilters = () => {
    setSearchText('');
    setFilterDate('');
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchText.toLowerCase());
    
    let matchesDate = true;
    if (filterDate) {
      matchesDate = isSameDay(parseISO(event.date), parseISO(filterDate));
    }

    return matchesSearch && matchesDate;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl p-6 mb-8">
          <h1 className="text-3xl font-bold text-white mb-6 flex items-center">
            <Clock className="mr-2" /> Yaşam Olayları
          </h1>
          
          <form onSubmit={editingEvent ? handleUpdate : handleSubmit} className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Olayı giriniz..."
                  className="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
                />
              </div>
              <div className="flex-1">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-white/50"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-2 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-opacity-90 transition-colors flex items-center"
              >
                {editingEvent ? (
                  <>
                    <Edit2 className="w-4 h-4 mr-2" />
                    Güncelle
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Ekle
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Filtering Section */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/70" />
                <input
                  type="text"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Olay ara..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
                />
              </div>
            </div>
            <div className="flex gap-4 md:w-1/3">
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="flex-1 px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-white/20 text-white rounded-lg font-semibold hover:bg-white/30 transition-colors whitespace-nowrap"
              >
                Temizle
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-lg hover:transform hover:scale-105 transition-all duration-300"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-white">{event.title}</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(event)}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(event.id)}
                    className="text-white/80 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-white/80 flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  {format(new Date(event.date), 'd MMMM yyyy', { locale: tr })}
                </p>
                <p className="text-white/80">
                  {formatDistanceToNow(new Date(event.date), { 
                    addSuffix: true,
                    locale: tr 
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Toaster position="top-right" />
    </div>
  );
}

export default App;
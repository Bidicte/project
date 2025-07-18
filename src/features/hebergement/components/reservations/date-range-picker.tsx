import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface DateRange {
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
}

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  placeholder?: string;
  minDate?: string;
  maxDate?: string;
  disabled?: boolean;
  error?: string;
  includeTime?: boolean;
  tarifType?: 'nuitee' | 'passage';
}

export default function DateRangePicker({
  value,
  onChange,
  placeholder = "Sélectionner une période",
  minDate,
  maxDate,
  disabled = false,
  error,
  includeTime = false,
  tarifType = 'nuitee'
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectingStart, setSelectingStart] = useState(true);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Jours du mois précédent pour compléter la première semaine
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({
        date: prevDate,
        isCurrentMonth: false,
        isToday: false,
        dateString: prevDate.toISOString().split('T')[0]
      });
    }

    // Jours du mois actuel
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day);
      const today = new Date();
      days.push({
        date: currentDate,
        isCurrentMonth: true,
        isToday: currentDate.toDateString() === today.toDateString(),
        dateString: currentDate.toISOString().split('T')[0]
      });
    }

    // Jours du mois suivant pour compléter la dernière semaine
    const remainingDays = 42 - days.length; // 6 semaines × 7 jours
    for (let day = 1; day <= remainingDays; day++) {
      const nextDate = new Date(year, month + 1, day);
      days.push({
        date: nextDate,
        isCurrentMonth: false,
        isToday: false,
        dateString: nextDate.toISOString().split('T')[0]
      });
    }

    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const handleDateClick = (dateString: string) => {
    if (disabled) return;

    const defaultStartTime = tarifType === 'passage' ? '06:00' : '15:00';
    const defaultEndTime = tarifType === 'passage' ? '18:00' : '11:00';

    if (selectingStart) {
      onChange({
        startDate: dateString,
        endDate: '',
        startTime: includeTime ? (value.startTime || defaultStartTime) : undefined,
        endTime: includeTime ? (value.endTime || defaultEndTime) : undefined
      });
      setSelectingStart(false);
    } else {
      const startDate = new Date(value.startDate);
      const endDate = new Date(dateString);
      
      if (endDate < startDate) {
        // Si la date de fin est antérieure au début, on inverse
        onChange({
          startDate: dateString,
          endDate: value.startDate,
          startTime: includeTime ? (value.startTime || defaultStartTime) : undefined,
          endTime: includeTime ? (value.endTime || defaultEndTime) : undefined
        });
      } else {
        onChange({
          startDate: value.startDate,
          endDate: dateString,
          startTime: includeTime ? (value.startTime || defaultStartTime) : undefined,
          endTime: includeTime ? (value.endTime || defaultEndTime) : undefined
        });
      }
      setSelectingStart(true);
      setIsOpen(false);
    }
  };

  const isDateInRange = (dateString: string) => {
    if (!value.startDate || !value.endDate) return false;
    const date = new Date(dateString);
    const start = new Date(value.startDate);
    const end = new Date(value.endDate);
    return date >= start && date <= end;
  };

  const isDateRangeStart = (dateString: string) => {
    return value.startDate === dateString;
  };

  const isDateRangeEnd = (dateString: string) => {
    return value.endDate === dateString;
  };

  const isDateDisabled = (dateString: string) => {
    const date = new Date(dateString);
    
    // Permettre les dates passées pour plus de flexibilité (reprises, etc.)
    if (minDate && date < new Date(minDate)) return true;
    if (maxDate && date > new Date(maxDate)) return true;
    
    return false;
  };

  const clearDates = () => {
    onChange({ 
      startDate: '', 
      endDate: '',
      startTime: undefined,
      endTime: undefined
    });
    setSelectingStart(true);
  };

  const getDisplayText = () => {
    if (!value.startDate && !value.endDate) {
      return placeholder;
    }
    if (value.startDate && !value.endDate) {
      const timeText = includeTime && value.startTime ? ` ${value.startTime}` : '';
      return `${formatDate(value.startDate)}${timeText} - ...`;
    }
    if (value.startDate && value.endDate) {
      const startTimeText = includeTime && value.startTime ? ` ${value.startTime}` : '';
      const endTimeText = includeTime && value.endTime ? ` ${value.endTime}` : '';
      return `${formatDate(value.startDate)}${startTimeText} - ${formatDate(value.endDate)}${endTimeText}`;
    }
    return placeholder;
  };

  const getNightsCount = () => {
    if (!value.startDate || !value.endDate) return 0;
    const start = new Date(value.startDate);
    const end = new Date(value.endDate);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const calculateTotalDuration = () => {
    if (!value.startDate || !value.endDate || !value.startTime || !value.endTime) {
      return { nights: getNightsCount(), hours: 0 };
    }
    
    const startDateTime = new Date(`${value.startDate}T${value.startTime}:00`);
    const endDateTime = new Date(`${value.endDate}T${value.endTime}:00`);
    
    const diffMilliseconds = endDateTime.getTime() - startDateTime.getTime();
    const diffHours = diffMilliseconds / (1000 * 60 * 60);
    
    return {
      nights: getNightsCount(),
      hours: Math.round(diffHours * 100) / 100
    };
  };

  const days = getDaysInMonth(currentMonth);
  const monthYear = currentMonth.toLocaleDateString('fr-FR', { 
    month: 'long', 
    year: 'numeric' 
  });

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full flex items-center justify-between px-4 py-3 bg-white border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
          error ? 'border-red-500' : 'border-gray-300'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-400'}`}
      >
        <div className="flex items-center">
          <Calendar className="w-5 h-5 text-gray-400 mr-3" />
          <span className={`${value.startDate || value.endDate ? 'text-gray-900' : 'text-gray-500'}`}>
            {getDisplayText()}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          {(value.startDate || value.endDate) && (
            <>
              <span className="text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded">
                {(() => {
                  const duration = calculateTotalDuration();
                  if (tarifType === 'passage') {
                    return `${duration.hours}h`;
                  } else {
                    return `${duration.nights} nuitée${duration.nights > 1 ? 's' : ''}`;
                  }
                })()}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  clearDates();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </button>

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}

      {isOpen && (
        <div className="absolute z-20 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 w-80">
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={() => navigateMonth('prev')}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h3 className="font-semibold text-gray-900 capitalize">{monthYear}</h3>
            <button
              type="button"
              onClick={() => navigateMonth('next')}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map(day => (
              <div key={day} className="p-2 text-center text-xs font-medium text-gray-500">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => {
              const isDisabled = isDateDisabled(day.dateString);
              const isInRange = isDateInRange(day.dateString);
              const isStart = isDateRangeStart(day.dateString);
              const isEnd = isDateRangeEnd(day.dateString);
              
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleDateClick(day.dateString)}
                  disabled={isDisabled}
                  className={`
                    p-2 text-sm rounded-lg transition-colors
                    ${!day.isCurrentMonth ? 'text-gray-300' : ''}
                    ${isDisabled ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-blue-50'}
                    ${day.isToday && day.isCurrentMonth ? 'bg-blue-100 text-blue-600 font-semibold' : ''}
                    ${isStart || isEnd ? 'bg-blue-600 text-white font-semibold' : ''}
                    ${isInRange && !isStart && !isEnd ? 'bg-blue-100 text-blue-800' : ''}
                  `}
                >
                  {day.date.getDate()}
                </button>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              {selectingStart ? (
                <p>Sélectionnez la date d'arrivée</p>
              ) : (
                <p>Sélectionnez la date de départ</p>
              )}
            </div>
            {value.startDate && value.endDate && (
              <div className="mt-2 text-sm">
                <p className="text-gray-700">
                  <span className="font-medium">Période :</span> {formatDate(value.startDate)} - {formatDate(value.endDate)}
                </p>
                <p className="text-blue-600">
                  {(() => {
                    const duration = calculateTotalDuration();
                    if (tarifType === 'passage') {
                      return <span className="font-medium">{duration.hours}h</span>;
                    } else {
                      return <span className="font-medium">{duration.nights} nuitée{duration.nights > 1 ? 's' : ''}</span>;
                    }
                  })()}
                </p>
              </div>
            )}

            {/* Contrôles d'heures pour les passages */}
            {includeTime && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Heure {tarifType === 'passage' ? 'de début' : 'd\'arrivée'}
                    </label>
                    <input
                      type="time"
                      value={value.startTime || ''}
                      onChange={(e) => onChange({
                        ...value,
                        startTime: e.target.value
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Heure {tarifType === 'passage' ? 'de fin' : 'de départ'}
                    </label>
                    <input
                      type="time"
                      value={value.endTime || ''}
                      onChange={(e) => onChange({
                        ...value,
                        endTime: e.target.value
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                {tarifType === 'passage' && value.startTime && value.endTime && (
                  <div className="mt-2 text-sm text-purple-600">
                    <span className="font-medium">
                      Durée: {calculateTotalDuration().hours}h
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mt-4 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={clearDates}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
            >
              Effacer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PersonalityAwareAnimation } from '../animations/PersonalityAwareAnimations';
import { personalityPresets } from '../sofia-firefly/PersonalityPresets';

interface TimeSlot {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  available: boolean;
  type: 'initial_consultation' | 'follow_up' | 'document_review' | 'urgent';
  duration: number; // minutes
  price: number;
}

interface Attorney {
  id: string;
  name: string;
  specialty: string[];
  hourlyRate: number;
  timezone: string;
  availability: TimeSlot[];
  averageRating: number;
  profilePhoto?: string;
  languages: string[];
}

interface BookingDetails {
  consultationType: 'initial_consultation' | 'follow_up' | 'document_review' | 'urgent';
  topic: string;
  description: string;
  documents: File[];
  preferredLanguage: string;
  urgent: boolean;
  clientInfo: {
    name: string;
    email: string;
    phone: string;
    timezone: string;
  };
}

interface Consultation {
  id: string;
  attorneyId: string;
  clientId: string;
  timeSlot: TimeSlot;
  bookingDetails: BookingDetails;
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'rescheduled';
  meetingLink?: string;
  preparationMaterials?: string[];
  followUpRequired?: boolean;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  cancellationReason?: string;
  rescheduledFrom?: string;
}

const CONSULTATION_TYPES = {
  initial_consultation: {
    name: 'Initial Consultation',
    description: 'First meeting to discuss your estate planning needs',
    duration: 60,
    basePrice: 150
  },
  follow_up: {
    name: 'Follow-up Session',
    description: 'Continue working on your estate plan',
    duration: 45,
    basePrice: 120
  },
  document_review: {
    name: 'Document Review',
    description: 'Review and discuss specific legal documents',
    duration: 30,
    basePrice: 100
  },
  urgent: {
    name: 'Urgent Consultation',
    description: 'Emergency consultation for time-sensitive matters',
    duration: 30,
    basePrice: 200
  }
};

export const ConsultationBookingSystem: React.FC = () => {
  const [selectedAttorney, setSelectedAttorney] = useState<Attorney | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [bookingDetails, setBookingDetails] = useState<Partial<BookingDetails>>({
    consultationType: 'initial_consultation',
    preferredLanguage: 'English',
    urgent: false,
    documents: [],
    clientInfo: {
      name: '',
      email: '',
      phone: '',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    }
  });
  const [currentStep, setCurrentStep] = useState<'attorney' | 'time' | 'details' | 'payment' | 'confirmation'>('attorney');
  const [attorneys, setAttorneys] = useState<Attorney[]>([]);
  const [loading, setLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);

  useEffect(() => {
    loadAttorneys();
  }, []);

  useEffect(() => {
    if (selectedAttorney) {
      loadAvailableSlots(selectedAttorney.id);
    }
  }, [selectedAttorney, bookingDetails.consultationType]);

  const loadAttorneys = async () => {
    setLoading(true);
    try {
      // Mock data - in real implementation, fetch from backend
      const mockAttorneys: Attorney[] = [
        {
          id: '1',
          name: 'Dr. Anna Nováková',
          specialty: ['Estate Planning', 'Family Law', 'Inheritance'],
          hourlyRate: 150,
          timezone: 'Europe/Bratislava',
          averageRating: 4.8,
          languages: ['Slovak', 'Czech', 'English'],
          availability: []
        },
        {
          id: '2',
          name: 'JUDr. Peter Kováč',
          specialty: ['Tax Law', 'Corporate Law', 'Estate Planning'],
          hourlyRate: 180,
          timezone: 'Europe/Bratislava',
          averageRating: 4.9,
          languages: ['Slovak', 'English', 'German'],
          availability: []
        }
      ];

      setAttorneys(mockAttorneys);
    } catch (error) {
      console.error('Failed to load attorneys:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableSlots = async (attorneyId: string) => {
    try {
      // Generate mock available time slots for the next 14 days
      const slots: TimeSlot[] = [];
      const today = new Date();
      const consultationType = bookingDetails.consultationType || 'initial_consultation';
      const typeConfig = CONSULTATION_TYPES[consultationType];

      for (let i = 1; i <= 14; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);

        // Skip weekends for non-urgent consultations
        if (consultationType !== 'urgent' && (date.getDay() === 0 || date.getDay() === 6)) {
          continue;
        }

        // Generate time slots for each day
        const timeSlots = consultationType === 'urgent'
          ? ['09:00', '11:00', '14:00', '16:00', '18:00'] // More flexible for urgent
          : ['09:00', '10:30', '14:00', '15:30'];

        timeSlots.forEach((startTime, index) => {
          const endTime = calculateEndTime(startTime, typeConfig.duration);
          const slot: TimeSlot = {
            id: `${attorneyId}-${date.toISOString().split('T')[0]}-${startTime}`,
            date: new Date(date),
            startTime,
            endTime,
            available: Math.random() > 0.3, // 70% chance of being available
            type: consultationType,
            duration: typeConfig.duration,
            price: typeConfig.basePrice
          };
          slots.push(slot);
        });
      }

      setAvailableSlots(slots.filter(slot => slot.available));
    } catch (error) {
      console.error('Failed to load available slots:', error);
    }
  };

  const calculateEndTime = (startTime: string, duration: number): string => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const start = new Date();
    start.setHours(hours || 0, minutes || 0, 0, 0);
    start.setMinutes(start.getMinutes() + (duration || 0));
    return `${start.getHours().toString().padStart(2, '0')}:${start.getMinutes().toString().padStart(2, '0')}`;
  };

  const formatTimeSlot = (slot: TimeSlot): string => {
    const date = slot.date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
    return `${date} at ${slot.startTime} - ${slot.endTime}`;
  };

  const calculateTotalPrice = (): number => {
    if (!selectedTimeSlot || !selectedAttorney) return 0;

    let basePrice = selectedTimeSlot.price;

    // Add urgency surcharge
    if (bookingDetails.urgent) {
      basePrice *= 1.5;
    }

    return basePrice;
  };

  const handleFileUpload = (files: FileList | null) => {
    if (files) {
      const fileArray = Array.from(files);
      setBookingDetails(prev => ({
        ...prev,
        documents: [...(prev.documents || []), ...fileArray]
      }));
    }
  };

  const removeDocument = (index: number) => {
    setBookingDetails(prev => ({
      ...prev,
      documents: prev.documents?.filter((_, i) => i !== index) || []
    }));
  };

  const validateStep = (): boolean => {
    switch (currentStep) {
      case 'attorney':
        return !!selectedAttorney;
      case 'time':
        return !!selectedTimeSlot;
      case 'details':
        return !!(
          bookingDetails.topic &&
          bookingDetails.description &&
          bookingDetails.clientInfo?.name &&
          bookingDetails.clientInfo?.email &&
          bookingDetails.clientInfo?.phone
        );
      case 'payment':
        return true; // Payment validation would be handled by payment provider
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!validateStep()) return;

    const steps: typeof currentStep[] = ['attorney', 'time', 'details', 'payment', 'confirmation'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      const nextStep = steps[currentIndex + 1];
      if (nextStep) {
        setCurrentStep(nextStep);
      }
    }
  };

  const handlePrevious = () => {
    const steps: typeof currentStep[] = ['attorney', 'time', 'details', 'payment', 'confirmation'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      const prevStep = steps[currentIndex - 1];
      if (prevStep) {
        setCurrentStep(prevStep);
      }
    }
  };

  const handleBookConsultation = async () => {
    if (!selectedAttorney || !selectedTimeSlot || !bookingDetails.topic) return;

    try {
      setLoading(true);

      const consultation: Consultation = {
        id: `consultation-${Date.now()}`,
        attorneyId: selectedAttorney.id,
        clientId: 'current-user', // Would be actual user ID
        timeSlot: selectedTimeSlot,
        bookingDetails: bookingDetails as BookingDetails,
        status: 'scheduled',
        paymentStatus: 'pending'
      };

      // In real implementation, this would call the backend API
      console.log('Booking consultation:', consultation);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      setCurrentStep('confirmation');
    } catch (error) {
      console.error('Failed to book consultation:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderAttorneySelection = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Choose Your Attorney</h2>
      <div className="grid gap-4">
        {attorneys.map(attorney => (
          <motion.div
            key={attorney.id}
            layout
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              selectedAttorney?.id === attorney.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setSelectedAttorney(attorney)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="font-semibold text-gray-600">
                    {attorney.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{attorney.name}</h3>
                  <p className="text-sm text-gray-600">{attorney.specialty.join(', ')}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map(star => (
                        <svg
                          key={star}
                          className={`w-3 h-3 ${
                            star <= attorney.averageRating ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">
                      {attorney.averageRating}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">${attorney.hourlyRate}/hr</p>
                <p className="text-xs text-gray-500">{attorney.languages.join(', ')}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderTimeSelection = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Select Consultation Type & Time</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {Object.entries(CONSULTATION_TYPES).map(([key, type]) => (
          <div
            key={key}
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              bookingDetails.consultationType === key
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setBookingDetails(prev => ({ ...prev, consultationType: key as any }))}
          >
            <h3 className="font-medium text-gray-900">{type.name}</h3>
            <p className="text-sm text-gray-600 mb-2">{type.description}</p>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">{type.duration} minutes</span>
              <span className="font-semibold text-gray-900">${type.basePrice}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <h3 className="font-medium text-gray-900">Available Time Slots</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
          {availableSlots.map(slot => (
            <motion.div
              key={slot.id}
              layout
              className={`border rounded-lg p-3 cursor-pointer transition-all ${
                selectedTimeSlot?.id === slot.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedTimeSlot(slot)}
            >
              <p className="font-medium text-sm text-gray-900">
                {slot.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </p>
              <p className="text-sm text-gray-600">{slot.startTime} - {slot.endTime}</p>
              <p className="text-xs text-gray-500">{slot.duration} min • ${slot.price}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderBookingDetails = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Consultation Details</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Topic / Subject
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Estate planning for young family"
              value={bookingDetails.topic || ''}
              onChange={(e) => setBookingDetails(prev => ({ ...prev, topic: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Please describe your situation and what you'd like to discuss..."
              value={bookingDetails.description || ''}
              onChange={(e) => setBookingDetails(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Preferred Language
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={bookingDetails.preferredLanguage || 'English'}
              onChange={(e) => setBookingDetails(prev => ({ ...prev, preferredLanguage: e.target.value }))}
            >
              {selectedAttorney?.languages.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Name
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={bookingDetails.clientInfo?.name || ''}
              onChange={(e) => setBookingDetails(prev => ({
                ...prev,
                clientInfo: { ...prev.clientInfo!, name: e.target.value }
              }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={bookingDetails.clientInfo?.email || ''}
              onChange={(e) => setBookingDetails(prev => ({
                ...prev,
                clientInfo: { ...prev.clientInfo!, email: e.target.value }
              }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={bookingDetails.clientInfo?.phone || ''}
              onChange={(e) => setBookingDetails(prev => ({
                ...prev,
                clientInfo: { ...prev.clientInfo!, phone: e.target.value }
              }))}
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Upload Documents (Optional)
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input
            type="file"
            multiple
            className="hidden"
            id="document-upload"
            accept=".pdf,.doc,.docx,.txt"
            onChange={(e) => handleFileUpload(e.target.files)}
          />
          <label htmlFor="document-upload" className="cursor-pointer">
            <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-sm text-gray-600">Click to upload documents or drag and drop</p>
            <p className="text-xs text-gray-500">PDF, DOC, DOCX, TXT up to 10MB each</p>
          </label>
        </div>

        {bookingDetails.documents && bookingDetails.documents.length > 0 && (
          <div className="mt-4 space-y-2">
            {bookingDetails.documents.map((file, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                <span className="text-sm text-gray-700">{file.name}</span>
                <button
                  onClick={() => removeDocument(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="urgent"
          checked={bookingDetails.urgent || false}
          onChange={(e) => setBookingDetails(prev => ({ ...prev, urgent: e.target.checked }))}
        />
        <label htmlFor="urgent" className="text-sm text-gray-700">
          This is an urgent consultation (+50% surcharge)
        </label>
      </div>
    </div>
  );

  const renderPayment = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Payment & Confirmation</h2>

      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-4">Booking Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Attorney:</span>
            <span>{selectedAttorney?.name}</span>
          </div>
          <div className="flex justify-between">
            <span>Date & Time:</span>
            <span>{selectedTimeSlot && formatTimeSlot(selectedTimeSlot)}</span>
          </div>
          <div className="flex justify-between">
            <span>Consultation Type:</span>
            <span>{bookingDetails.consultationType && CONSULTATION_TYPES[bookingDetails.consultationType].name}</span>
          </div>
          <div className="flex justify-between">
            <span>Duration:</span>
            <span>{selectedTimeSlot?.duration} minutes</span>
          </div>
          {bookingDetails.urgent && (
            <div className="flex justify-between text-orange-600">
              <span>Urgent Surcharge (50%):</span>
              <span>+${selectedTimeSlot ? Math.round(selectedTimeSlot.price * 0.5) : 0}</span>
            </div>
          )}
          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between font-semibold">
              <span>Total:</span>
              <span>${calculateTotalPrice()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="border rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-4">Payment Method</h4>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <input type="radio" id="card" name="payment" defaultChecked />
            <label htmlFor="card" className="flex items-center space-x-2">
              <span>Credit/Debit Card</span>
              <div className="flex space-x-1">
                <div className="w-6 h-4 bg-blue-600 rounded text-white text-xs flex items-center justify-center">V</div>
                <div className="w-6 h-4 bg-red-600 rounded text-white text-xs flex items-center justify-center">M</div>
              </div>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
            <input
              type="text"
              placeholder="Card Number"
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="MM/YY"
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Cardholder Name"
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="CVC"
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="text-xs text-gray-600">
        <p>• Payment will be processed securely through our payment provider</p>
        <p>• You can cancel up to 24 hours before the consultation for a full refund</p>
        <p>• Meeting link will be sent to your email after payment confirmation</p>
      </div>
    </div>
  );

  const renderConfirmation = () => (
    <div className="text-center space-y-6">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Consultation Booked!</h2>
        <p className="text-gray-600">Your consultation has been successfully scheduled.</p>
      </div>

      <div className="bg-blue-50 rounded-lg p-4 text-left">
        <h3 className="font-medium text-gray-900 mb-2">What's Next?</h3>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• Confirmation email sent to {bookingDetails.clientInfo?.email}</li>
          <li>• Meeting link will be provided 24 hours before consultation</li>
          <li>• Attorney will review any uploaded documents beforehand</li>
          <li>• You can reschedule up to 24 hours in advance</li>
        </ul>
      </div>

      <div className="flex space-x-4 justify-center">
        <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          View My Consultations
        </button>
        <button
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          onClick={() => {
            setCurrentStep('attorney');
            setSelectedAttorney(null);
            setSelectedTimeSlot(null);
            setBookingDetails({
              consultationType: 'initial_consultation',
              preferredLanguage: 'English',
              urgent: false,
              documents: [],
              clientInfo: {
                name: '',
                email: '',
                phone: '',
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
              }
            });
          }}
        >
          Book Another
        </button>
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 'attorney':
        return renderAttorneySelection();
      case 'time':
        return renderTimeSelection();
      case 'details':
        return renderBookingDetails();
      case 'payment':
        return renderPayment();
      case 'confirmation':
        return renderConfirmation();
      default:
        return null;
    }
  };

  const getStepNumber = () => {
    const steps = ['attorney', 'time', 'details', 'payment', 'confirmation'];
    return steps.indexOf(currentStep) + 1;
  };

  return (
    <PersonalityAwareAnimation personality={personalityPresets.supportive}>
      <div className="max-w-4xl mx-auto p-6">
        {currentStep !== 'confirmation' && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-900">Book a Consultation</h1>
              <div className="text-sm text-gray-600">
                Step {getStepNumber()} of 5
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {['attorney', 'time', 'details', 'payment', 'confirmation'].map((step, index) => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                    index < getStepNumber() - 1
                      ? 'bg-green-600 text-white'
                      : index === getStepNumber() - 1
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {index < getStepNumber() - 1 ? '✓' : index + 1}
                  </div>
                  {index < 4 && (
                    <div className={`w-12 h-1 mx-2 ${
                      index < getStepNumber() - 1 ? 'bg-green-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>

        {currentStep !== 'confirmation' && (
          <div className="flex justify-between mt-8">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 'attorney'}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {currentStep === 'payment' ? (
              <button
                onClick={handleBookConsultation}
                disabled={!validateStep() || loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {loading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                <span>Book & Pay ${calculateTotalPrice()}</span>
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={!validateStep()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            )}
          </div>
        )}
      </div>
    </PersonalityAwareAnimation>
  );
};

export default ConsultationBookingSystem;
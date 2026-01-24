import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCalendar, FaClock, FaHome, FaMapMarkerAlt, FaCreditCard } from 'react-icons/fa';

const ServiceBooking = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [bookingData, setBookingData] = useState({
    serviceType: '',
    serviceDate: '',
    serviceTime: '',
    address: '',
    specialInstructions: '',
    paymentMethod: 'credit_card'
  });

  const services = [
    { id: 'plumbing', name: 'Plumbing', price: 89 },
    { id: 'electrical', name: 'Electrical', price: 99 },
    { id: 'cleaning', name: 'Cleaning', price: 129 },
    { id: 'snow_removal', name: 'Snow Removal', price: 49 },
    { id: 'painting', name: 'Painting', price: 199 },
    { id: 'appliance_repair', name: 'Appliance Repair', price: 79 }
  ];

  const timeSlots = [
    '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleServiceSelect = (serviceId) => {
    const service = services.find(s => s.id === serviceId);
    setBookingData(prev => ({
      ...prev,
      serviceType: serviceId,
      serviceName: service?.name,
      price: service?.price
    }));
    setStep(2);
  };

  const handleDateSelect = (date) => {
    setBookingData(prev => ({
      ...prev,
      serviceDate: date
    }));
    setStep(3);
  };

  const handleTimeSelect = (time) => {
    setBookingData(prev => ({
      ...prev,
      serviceTime: time
    }));
    setStep(4);
  };

  const handleSubmitBooking = () => {
    // Mock booking submission
    console.log('Booking submitted:', bookingData);
    alert('Service booked successfully!');
    navigate('/dashboard');
  };

  return (
    <div className="service-booking-page">
      <div className="booking-container">
        <div className="booking-header">
          <h1>Book a Service</h1>
          <div className="booking-steps">
            <div className={`step ${step >= 1 ? 'active' : ''}`}>
              <div className="step-number">1</div>
              <div className="step-label">Service</div>
            </div>
            <div className={`step ${step >= 2 ? 'active' : ''}`}>
              <div className="step-number">2</div>
              <div className="step-label">Date</div>
            </div>
            <div className={`step ${step >= 3 ? 'active' : ''}`}>
              <div className="step-number">3</div>
              <div className="step-label">Time</div>
            </div>
            <div className={`step ${step >= 4 ? 'active' : ''}`}>
              <div className="step-number">4</div>
              <div className="step-label">Confirm</div>
            </div>
          </div>
        </div>

        <div className="booking-content">
          {step === 1 && (
            <div className="booking-step">
              <h2><FaHome /> Select Service Type</h2>
              <div className="service-grid">
                {services.map((service) => (
                  <div
                    key={service.id}
                    className={`service-option ${bookingData.serviceType === service.id ? 'selected' : ''}`}
                    onClick={() => handleServiceSelect(service.id)}
                  >
                    <h4>{service.name}</h4>
                    <p className="price">${service.price}</p>
                    <p className="description">Professional {service.name.toLowerCase()} service</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="booking-step">
              <h2><FaCalendar /> Select Date</h2>
              <div className="date-picker">
                {/* Simple date input for now */}
                <input
                  type="date"
                  name="serviceDate"
                  value={bookingData.serviceDate}
                  onChange={handleInputChange}
                  className="form-control"
                  min={new Date().toISOString().split('T')[0]}
                />
                <button 
                  className="btn btn-primary"
                  onClick={() => bookingData.serviceDate && setStep(3)}
                >
                  Next: Select Time
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="booking-step">
              <h2><FaClock /> Select Time</h2>
              <div className="time-grid">
                {timeSlots.map((time) => (
                  <button
                    key={time}
                    className={`time-slot ${bookingData.serviceTime === time ? 'selected' : ''}`}
                    onClick={() => handleTimeSelect(time)}
                  >
                    {time}
                  </button>
                ))}
              </div>
              <div className="booking-actions">
                <button className="btn btn-outline" onClick={() => setStep(2)}>
                  Back
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={() => bookingData.serviceTime && setStep(4)}
                >
                  Next: Confirm Details
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="booking-step">
              <h2><FaCreditCard /> Confirm Booking</h2>
              
              <div className="booking-summary">
                <h3>Booking Summary</h3>
                <div className="summary-item">
                  <strong>Service:</strong> {services.find(s => s.id === bookingData.serviceType)?.name}
                </div>
                <div className="summary-item">
                  <strong>Date:</strong> {bookingData.serviceDate}
                </div>
                <div className="summary-item">
                  <strong>Time:</strong> {bookingData.serviceTime}
                </div>
                <div className="summary-item">
                  <strong>Price:</strong> ${services.find(s => s.id === bookingData.serviceType)?.price}
                </div>
                <div className="summary-total">
                  <strong>Total:</strong> ${services.find(s => s.id === bookingData.serviceType)?.price}
                </div>
              </div>

              <div className="form-group">
                <label><FaMapMarkerAlt /> Service Address</label>
                <textarea
                  name="address"
                  value={bookingData.address}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="Enter the service address"
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Special Instructions</label>
                <textarea
                  name="specialInstructions"
                  value={bookingData.specialInstructions}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="Any special instructions for the provider"
                  rows="3"
                />
              </div>

              <div className="booking-actions">
                <button className="btn btn-outline" onClick={() => setStep(3)}>
                  Back
                </button>
                <button className="btn btn-primary" onClick={handleSubmitBooking}>
                  Confirm & Book
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceBooking;
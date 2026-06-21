import React, { useState } from 'react';
import { X, Send, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import notificationService from '../services/notificationService';
import './ContactModal.css';

const ContactModal = ({ freelancer, onClose }) => {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) return;
    
    setSending(true);
    try {
      await notificationService.sendNotification({
        userId: freelancer.id,
        senderId: user.id,
        message: message
      });
      
      window.dispatchEvent(new CustomEvent('new-notification', { 
        detail: { message: `Message sent to ${freelancer.name}!` } 
      }));
      onClose();
    } catch (err) {
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="contact-modal animate-slide-up">
        <div className="modal-header">
          <h3>Contact {freelancer.name}</h3>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>
        
        <div className="modal-body">
          <div className="freelancer-mini-profile">
            <div className="mini-avatar">
              {freelancer.name[0].toUpperCase()}
            </div>
            <div>
              <p className="mini-name">{freelancer.name}</p>
              <p className="mini-role">{freelancer.role || 'Professional Freelancer'}</p>
            </div>
          </div>
          
          <div className="message-field">
            <label>Your Message</label>
            <textarea 
              value={message} 
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Hi ${freelancer.name.split(' ')[0]}, I'm interested in working with you...`}
              rows="5"
            ></textarea>
          </div>
        </div>
        
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button 
            className="btn btn-primary flex-center gap-2" 
            onClick={handleSend}
            disabled={!message.trim() || sending}
          >
            {sending ? 'Sending...' : <><Send size={18} /> Send Message</>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContactModal;

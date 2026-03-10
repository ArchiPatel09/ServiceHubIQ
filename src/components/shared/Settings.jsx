import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  FaBell,
  FaLock,
  FaLanguage,
  FaMoon,
  FaSun,
  FaSave,
  FaPalette,
  FaEnvelope,
  FaSms,
  FaUserLock,
  FaCreditCard
} from 'react-icons/fa';

const Settings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('notifications');
  const [settings, setSettings] = useState({
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
    bookingReminders: true,
    promotionalEmails: true,
    showProfile: true,
    allowMessages: true,
    shareActivity: false,
    darkMode: false,
    theme: 'blue',
    fontSize: 'medium',
    language: 'en',
    currency: 'CAD',
    timezone: 'America/Toronto',
    autoPay: false,
    savePaymentMethods: true,
    jobNotifications: true,
    autoAcceptJobs: false,
    availabilityStatus: 'available'
  });

  const themes = [
    { id: 'blue', name: 'Blue', color: '#3b82f6' },
    { id: 'green', name: 'Green', color: '#10b981' },
    { id: 'orange', name: 'Orange', color: '#f59e0b' },
    { id: 'red', name: 'Red', color: '#ef4444' }
  ];

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'French' },
    { code: 'es', name: 'Spanish' },
    { code: 'zh', name: 'Chinese' }
  ];

  const currencies = [
    { code: 'CAD', name: 'Canadian Dollar', symbol: '$' },
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: 'EUR' }
  ];

  const handleSettingChange = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    localStorage.setItem('user_settings', JSON.stringify(settings));
    alert('Settings saved successfully!');
  };

  const handleReset = () => {
    setSettings({
      pushNotifications: true,
      emailNotifications: true,
      smsNotifications: false,
      bookingReminders: true,
      promotionalEmails: true,
      showProfile: true,
      allowMessages: true,
      shareActivity: false,
      darkMode: false,
      theme: 'blue',
      fontSize: 'medium',
      language: 'en',
      currency: 'CAD',
      timezone: 'America/Toronto',
      autoPay: false,
      savePaymentMethods: true,
      jobNotifications: true,
      autoAcceptJobs: false,
      availabilityStatus: 'available'
    });
    alert('Settings reset to default!');
  };

  const tabs = [
    { id: 'notifications', label: 'Notifications', icon: <FaBell /> },
    { id: 'privacy', label: 'Privacy', icon: <FaLock /> },
    { id: 'appearance', label: 'Appearance', icon: <FaPalette /> },
    { id: 'account', label: 'Account', icon: <FaUserLock /> }
  ];

  if (user?.role === 'customer' || user?.role === 'provider') {
    tabs.push({ id: 'payment', label: 'Payment', icon: <FaCreditCard /> });
  }

  if (user?.role === 'provider') {
    tabs.push({ id: 'jobs', label: 'Job Settings', icon: <FaBell /> });
  }

  const SettingSwitch = ({ label, description, checked, onChange, icon }) => (
    <div className="setting-item">
      <div className="setting-info">
        <div className="setting-icon">{icon}</div>
        <div>
          <h4>{label}</h4>
          <p>{description}</p>
        </div>
      </div>
      <label className="switch">
        <input type="checkbox" checked={checked} onChange={onChange} />
        <span className="slider"></span>
      </label>
    </div>
  );

  const SettingSelect = ({ label, value, options, onChange, icon }) => (
    <div className="setting-item">
      <div className="setting-info">
        <div className="setting-icon">{icon}</div>
        <div>
          <h4>{label}</h4>
        </div>
      </div>
      <select value={value} onChange={onChange} className="setting-select">
        {options.map((option) => (
          <option key={option.code || option.id} value={option.code || option.id}>
            {option.name}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>Settings</h1>
        <p>Customize your ServiceHubIQ experience</p>
      </div>

      <div className="settings-container">
        <div className="settings-sidebar">
          <nav className="settings-nav">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`settings-nav-item ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>

          <div className="settings-actions-sidebar">
            <button className="btn btn-primary" onClick={handleSave}>
              <FaSave /> Save Changes
            </button>
            <button className="btn btn-outline" onClick={handleReset}>
              Reset to Default
            </button>
          </div>
        </div>

        <div className="settings-content">
          {activeTab === 'notifications' && (
            <div className="settings-tab">
              <h2><FaBell /> Notifications</h2>

              <SettingSwitch
                label="Push Notifications"
                description="Receive push notifications for bookings and updates"
                checked={settings.pushNotifications}
                onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
                icon={<FaBell />}
              />

              <SettingSwitch
                label="Email Notifications"
                description="Get service confirmations and updates via email"
                checked={settings.emailNotifications}
                onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                icon={<FaEnvelope />}
              />

              <SettingSwitch
                label="SMS Notifications"
                description="Receive service reminders via SMS"
                checked={settings.smsNotifications}
                onChange={(e) => handleSettingChange('smsNotifications', e.target.checked)}
                icon={<FaSms />}
              />

              <SettingSwitch
                label="Booking Reminders"
                description="Get reminders before scheduled services"
                checked={settings.bookingReminders}
                onChange={(e) => handleSettingChange('bookingReminders', e.target.checked)}
                icon={<FaBell />}
              />

              <SettingSwitch
                label="Promotional Emails"
                description="Receive newsletters and promotional offers"
                checked={settings.promotionalEmails}
                onChange={(e) => handleSettingChange('promotionalEmails', e.target.checked)}
                icon={<FaEnvelope />}
              />
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="settings-tab">
              <h2><FaLock /> Privacy & Security</h2>

              <SettingSwitch
                label="Show Profile"
                description="Allow other users to see your profile"
                checked={settings.showProfile}
                onChange={(e) => handleSettingChange('showProfile', e.target.checked)}
                icon={<FaUserLock />}
              />

              <SettingSwitch
                label="Allow Messages"
                description="Allow other users to send you messages"
                checked={settings.allowMessages}
                onChange={(e) => handleSettingChange('allowMessages', e.target.checked)}
                icon={<FaEnvelope />}
              />

              <SettingSwitch
                label="Share Activity"
                description="Share your service activity with the community"
                checked={settings.shareActivity}
                onChange={(e) => handleSettingChange('shareActivity', e.target.checked)}
                icon={<FaUserLock />}
              />

              <div className="privacy-note">
                <h4>Privacy Note</h4>
                <p>
                  Your personal information is protected and will never be shared
                  with third parties without your consent. Review our
                  <a href="/privacy-policy"> Privacy Policy</a> for more details.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="settings-tab">
              <h2><FaPalette /> Appearance</h2>

              <SettingSwitch
                label="Dark Mode"
                description="Switch between light and dark theme"
                checked={settings.darkMode}
                onChange={(e) => handleSettingChange('darkMode', e.target.checked)}
                icon={settings.darkMode ? <FaMoon /> : <FaSun />}
              />

              <div className="theme-section">
                <h4>Theme Color</h4>
                <div className="theme-grid">
                  {themes.map((theme) => (
                    <div
                      key={theme.id}
                      className={`theme-option ${settings.theme === theme.id ? 'selected' : ''}`}
                      onClick={() => handleSettingChange('theme', theme.id)}
                    >
                      <div className="theme-color" style={{ backgroundColor: theme.color }}></div>
                      <div className="theme-name">{theme.name}</div>
                    </div>
                  ))}
                </div>
              </div>

              <SettingSelect
                label="Font Size"
                value={settings.fontSize}
                options={[
                  { id: 'small', name: 'Small' },
                  { id: 'medium', name: 'Medium' },
                  { id: 'large', name: 'Large' },
                  { id: 'xlarge', name: 'Extra Large' }
                ]}
                onChange={(e) => handleSettingChange('fontSize', e.target.value)}
                icon={<FaPalette />}
              />
            </div>
          )}

          {activeTab === 'account' && (
            <div className="settings-tab">
              <h2><FaUserLock /> Account Settings</h2>

              <SettingSelect
                label="Language"
                value={settings.language}
                options={languages}
                onChange={(e) => handleSettingChange('language', e.target.value)}
                icon={<FaLanguage />}
              />

              <SettingSelect
                label="Currency"
                value={settings.currency}
                options={currencies}
                onChange={(e) => handleSettingChange('currency', e.target.value)}
                icon={<FaCreditCard />}
              />

              <SettingSelect
                label="Timezone"
                value={settings.timezone}
                options={[
                  { code: 'America/Toronto', name: 'Eastern Time (Toronto)' },
                  { code: 'America/Vancouver', name: 'Pacific Time (Vancouver)' },
                  { code: 'America/Edmonton', name: 'Mountain Time (Edmonton)' },
                  { code: 'America/Winnipeg', name: 'Central Time (Winnipeg)' }
                ]}
                onChange={(e) => handleSettingChange('timezone', e.target.value)}
                icon={<FaBell />}
              />
            </div>
          )}

          {(activeTab === 'payment' && (user?.role === 'customer' || user?.role === 'provider')) && (
            <div className="settings-tab">
              <h2><FaCreditCard /> Payment Settings</h2>

              <SettingSwitch
                label="Auto-pay"
                description="Automatically pay for completed services"
                checked={settings.autoPay}
                onChange={(e) => handleSettingChange('autoPay', e.target.checked)}
                icon={<FaCreditCard />}
              />

              <SettingSwitch
                label="Save Payment Methods"
                description="Securely save your payment methods for future use"
                checked={settings.savePaymentMethods}
                onChange={(e) => handleSettingChange('savePaymentMethods', e.target.checked)}
                icon={<FaLock />}
              />
            </div>
          )}

          {(activeTab === 'jobs' && user?.role === 'provider') && (
            <div className="settings-tab">
              <h2>Job Settings</h2>

              <SettingSwitch
                label="Job Notifications"
                description="Get notified about new job opportunities"
                checked={settings.jobNotifications}
                onChange={(e) => handleSettingChange('jobNotifications', e.target.checked)}
                icon={<FaBell />}
              />

              <SettingSwitch
                label="Auto-accept Jobs"
                description="Automatically accept jobs in your preferred categories"
                checked={settings.autoAcceptJobs}
                onChange={(e) => handleSettingChange('autoAcceptJobs', e.target.checked)}
                icon={<FaBell />}
              />

              <SettingSelect
                label="Availability Status"
                value={settings.availabilityStatus}
                options={[
                  { code: 'available', name: 'Available for Jobs' },
                  { code: 'busy', name: 'Busy (Limited Availability)' },
                  { code: 'unavailable', name: 'Unavailable' }
                ]}
                onChange={(e) => handleSettingChange('availabilityStatus', e.target.value)}
                icon={<FaBell />}
              />

              <div className="provider-note">
                <h4>Job Preferences</h4>
                <p>These settings help us match you with the right jobs based on your availability and preferences.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;

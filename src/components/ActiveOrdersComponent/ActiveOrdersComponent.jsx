'use client';

import { useState, useRef, useEffect } from 'react';
import "./ActiveOrdersComponent.scss";

const ActiveOrdersComponent = ({
  className = "",
  headerSelector = ".header",
  activeHeaderClass = "header--orders-active",
  apiUrl = "/api/orders/active"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [savedEmail, setSavedEmail] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  // Завантажуємо збережений email при монтуванні
  useEffect(() => {
    const storedEmail = localStorage.getItem('userEmail');
    if (storedEmail) {
      setSavedEmail(storedEmail);
      setEmail(storedEmail);
    }
  }, []);

  // Управління класом хедера
  useEffect(() => {
    const headerElement = document.querySelector(headerSelector);

    if (headerElement) {
      if (isOpen) {
        headerElement.classList.add(activeHeaderClass);
        document.body.classList.add('orders-modal-open');
      } else {
        headerElement.classList.remove(activeHeaderClass);
        document.body.classList.remove('orders-modal-open');
      }
    }

    return () => {
      if (headerElement) {
        headerElement.classList.remove(activeHeaderClass);
      }
      document.body.classList.remove('orders-modal-open');
    };
  }, [isOpen, headerSelector, activeHeaderClass]);

  // Фокус на інпуті
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Закриття при Escape
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen]);

  // Автоматично завантажуємо замовлення якщо є збережений email
  useEffect(() => {
    if (isOpen && savedEmail) {
      fetchOrders(savedEmail);
    }
  }, [isOpen, savedEmail]);

  const fetchOrders = async (emailToFetch) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${apiUrl}?email=${encodeURIComponent(emailToFetch)}`);
      
      // Перевіряємо чи response є JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error('Server vrátil neplatný formát odpovede');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Chyba pri načítaní objednávok');
      }

      setOrders(data.data.orders || []);
      setSavedEmail(emailToFetch);
      localStorage.setItem('userEmail', emailToFetch);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message || 'Nepodarilo sa načítať objednávky');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOrdersClick = () => {
    setIsOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedEmail = email.trim();

    if (trimmedEmail && isValidEmail(trimmedEmail)) {
      fetchOrders(trimmedEmail);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setError(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleClose();
    }
  };

  const handleInputChange = (e) => {
    setEmail(e.target.value);
    setError(null);
  };

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const getStatusLabel = (status) => {
    const statusLabels = {
      pending: 'Čaká sa',
      paid: 'Zaplatené',
      shipped: 'Odoslané',
      delivered: 'Doručené',
      cancelled: 'Zrušené'
    };
    return statusLabels[status] || status;
  };

  const getStatusClass = (status) => {
    return `order-status--${status}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('sk-SK', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('sk-SK', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  return (
    <div className={`active-orders-component ${className}`}>
      {!isOpen ? (
        <button
          onClick={handleOrdersClick}
          className="orders-btn"
          aria-label="Moje objednávky"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="30"
            height="30"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
        </button>
      ) : (
        <div className="orders__wrapper">
          <div
            className="orders-component_blur"
            onClick={handleClose}
          />
          
          <div className="orders-modal">
            <div className="orders-modal__header">
              <h2 className="orders-modal__title">Moje objednávky</h2>
              <button
                type="button"
                onClick={handleClose}
                className="orders-close"
                aria-label="Zavrieť"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="m18 6-12 12" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="orders-form">
              <div className="orders-input-wrapper">
                <input
                  ref={inputRef}
                  type="email"
                  value={email}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Zadajte váš email..."
                  className="orders-input"
                  required
                />
                <button
                  type="submit"
                  className="orders-submit"
                  disabled={!email.trim() || !isValidEmail(email.trim())}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                  Hľadať
                </button>
              </div>
            </form>

            <div className="orders-content">
              {loading && (
                <div className="orders-loading">
                  <div className="spinner"></div>
                  <p>Načítavam objednávky...</p>
                </div>
              )}

              {error && (
                <div className="orders-error">
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <p>{error}</p>
                </div>
              )}

              {!loading && !error && orders.length === 0 && savedEmail && (
                <div className="orders-empty">
                  <svg
                    width="64"
                    height="64"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <path d="M16 10a4 4 0 0 1-8 0" />
                  </svg>
                  <p>Nenašli sa žiadne aktívne objednávky</p>
                </div>
              )}

              {!loading && !error && orders.length > 0 && (
                <div className="orders-list">
                  {orders.map((order) => (
                    <div key={order._id} className="order-card">
                      <div className="order-card__header">
                        <div className="order-card__number">
                          <span className="order-label">Objednávka:</span>
                          <span className="order-value">
                            {order.order?.orderNo || order.orderNumber}
                          </span>
                        </div>
                        <div className={`order-status ${getStatusClass(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </div>
                      </div>

                      <div className="order-card__info">
                        <div className="order-info-item">
                          <span className="order-label">Dátum:</span>
                          <span className="order-value">
                            {formatDate(order.createdAt)}
                          </span>
                        </div>
                        <div className="order-info-item">
                          <span className="order-label">Celková suma:</span>
                          <span className="order-value order-value--price">
                            {formatPrice(order.basePayment.amountValue)}
                          </span>
                        </div>
                      </div>

                      {order.order?.orderItems && order.order.orderItems.length > 0 && (
                        <div className="order-card__items">
                          <div className="order-items-header">Položky:</div>
                          <ul className="order-items-list">
                            {order.order.orderItems.map((item, index) => (
                              <li key={index} className="order-item">
                                <span className="order-item__name">
                                  {item.itemDetail?.itemDetailSK?.itemName || 'Produkt'}
                                </span>
                                <span className="order-item__quantity">
                                  {item.quantity}× {formatPrice(item.totalItemPrice / item.quantity)}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="order-card__contact">
                        <div className="order-contact-item">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                          {order.userData.firstName} {order.userData.lastName}
                        </div>
                        <div className="order-contact-item">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                          </svg>
                          {order.userData.phone}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiveOrdersComponent;
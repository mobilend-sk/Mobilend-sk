'use client';

import { useState, useRef, useEffect } from 'react';
import "./SearchComponent.scss"
import CatalogList from '@/pages/CatalogPage/CatalogList/CatalogList';

const SearchComponent = ({
  onSearch,
  placeholder = "Введіть пошуковий запит...",
  initialValue = "",
  className = "",
  autoFocus = true,
  headerSelector = ".header", // Селектор для хедера
  activeHeaderClass = "header--search-active" // Клас для активного стану
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState(initialValue);
  const inputRef = useRef(null);

  // Встановлюємо початкове значення
  useEffect(() => {
    setSearchValue(initialValue);
  }, [initialValue]);

  // Управління класом хедера при відкритті/закритті форми
  useEffect(() => {
    const headerElement = document.querySelector(headerSelector);
    
    if (headerElement) {
      if (isOpen) {
        headerElement.classList.add(activeHeaderClass);
        // Опціонально: додати клас до body для блокування скролла
        document.body.classList.add('search-modal-open');
      } else {
        headerElement.classList.remove(activeHeaderClass);
        document.body.classList.remove('search-modal-open');
      }
    }

    // Cleanup при розмонтуванні компонента
    return () => {
      if (headerElement) {
        headerElement.classList.remove(activeHeaderClass);
      }
      document.body.classList.remove('search-modal-open');
    };
  }, [isOpen, headerSelector, activeHeaderClass]);

  // Фокус на інпуті коли відкривається форма
  useEffect(() => {
    if (isOpen && inputRef.current && autoFocus) {
      inputRef.current.focus();
    }
  }, [isOpen, autoFocus]);

  // Закриття при кліку Escape
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

  const handleSearchClick = () => {
    setIsOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedValue = searchValue.trim();
    if (trimmedValue && onSearch) {
      onSearch(trimmedValue);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setSearchValue('');
    // Викликаємо onSearch з пустим значенням при закритті
    if (onSearch) {
      onSearch('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleClose();
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);

    // Опціонально: викликати onSearch при кожній зміні (для живого пошуку)
    if (onSearch) {
      onSearch(value);
    }
  };

  return (
    <div className={`search-component ${className}`}>
      {!isOpen ? (
        <button
          onClick={handleSearchClick}
          className="search-btn"
          aria-label="Відкрити пошук"
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
        </button>
      ) : (
        <div className="search__wrapper">
          <form onSubmit={handleSubmit} className="search-form">
            <div className="search-input-wrapper">
              <input
                ref={inputRef}
                type="text"
                value={searchValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className="search-input"
              />
              <button
                type="submit"
                className="search-submit"
                disabled={!searchValue.trim()}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="search-close"
                aria-label="Закрити пошук"
              >
                <svg
                  width="16"
                  height="16"
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
          </form>
          <div className="searh-results__wrapper">
            <CatalogList
              showFilters={false}
              initialSearchTerm={searchValue}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchComponent;
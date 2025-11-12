/**
 * Validation and Error Handling Utilities
 * Comprehensive validation system for TV Show Guide application
 */

// Custom Error Classes
class ShowValidationError extends Error {
  constructor(message, field, code, value = null) {
    super(message);
    this.name = 'ShowValidationError';
    this.field = field;
    this.code = code;
    this.value = value;
  }
}

class ShowOperationError extends Error {
  constructor(message, operation, code, context = null) {
    super(message);
    this.name = 'ShowOperationError';
    this.operation = operation;
    this.code = code;
    this.context = context;
  }
}

// Validation Rules and Constants
const VALIDATION_RULES = {
  TITLE: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 100,
    REQUIRED: true
  },
  SEASON: {
    MIN_VALUE: 1,
    MAX_VALUE: 50,
    REQUIRED: false
  },
  EPISODES: {
    MIN_VALUE: 1,
    MAX_VALUE: 100,
    REQUIRED: false
  },
  DATE_FORMAT: /^\d{4}-\d{2}-\d{2}$/,
  PLATFORMS: ['hulu', 'peacock', 'paramount'],
  NETWORKS: ['ABC', 'NBC', 'CBS', 'FOX'],
  DAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
};

// Error codes for internationalization and debugging
const ERROR_CODES = {
  VALIDATION: {
    REQUIRED_FIELD: 'REQUIRED_FIELD',
    INVALID_TYPE: 'INVALID_TYPE',
    OUT_OF_RANGE: 'OUT_OF_RANGE',
    INVALID_FORMAT: 'INVALID_FORMAT',
    INVALID_ENUM_VALUE: 'INVALID_ENUM_VALUE',
    DATE_LOGIC_ERROR: 'DATE_LOGIC_ERROR'
  },
  OPERATION: {
    SAVE_FAILED: 'SAVE_FAILED',
    LOAD_FAILED: 'LOAD_FAILED',
    IMPORT_FAILED: 'IMPORT_FAILED',
    EXPORT_FAILED: 'EXPORT_FAILED',
    NETWORK_ERROR: 'NETWORK_ERROR',
    STORAGE_QUOTA_EXCEEDED: 'STORAGE_QUOTA_EXCEEDED'
  }
};

// Core Validation Functions
const validators = {
  /**
   * Validates a complete show object
   * @param {Object} show - Show object to validate
   * @returns {Object} Validation result with isValid flag and errors array
   */
  validateShow(show) {
    const errors = [];
    
    try {
      // Check if show is an object
      if (!show || typeof show !== 'object') {
        errors.push(new ShowValidationError(
          'Show data must be an object',
          'show',
          ERROR_CODES.VALIDATION.INVALID_TYPE,
          show
        ));
        return { isValid: false, errors };
      }

      // Validate title
      const titleValidation = this.validateTitle(show.t);
      if (!titleValidation.isValid) {
        errors.push(...titleValidation.errors);
      }

      // Validate platform
      const platformValidation = this.validatePlatform(show.c);
      if (!platformValidation.isValid) {
        errors.push(...platformValidation.errors);
      }

      // Validate network
      const networkValidation = this.validateNetwork(show.net);
      if (!networkValidation.isValid) {
        errors.push(...networkValidation.errors);
      }

      // Validate air day (optional)
      if (show.air !== undefined && show.air !== null && show.air !== '') {
        const airDayValidation = this.validateAirDay(show.air);
        if (!airDayValidation.isValid) {
          errors.push(...airDayValidation.errors);
        }
      }

      // Validate season (optional)
      if (show.s !== undefined && show.s !== null && show.s !== '') {
        const seasonValidation = this.validateSeason(show.s);
        if (!seasonValidation.isValid) {
          errors.push(...seasonValidation.errors);
        }
      }

      // Validate episodes (optional)
      if (show.eps !== undefined && show.eps !== null && show.eps !== '') {
        const episodesValidation = this.validateEpisodes(show.eps);
        if (!episodesValidation.isValid) {
          errors.push(...episodesValidation.errors);
        }
      }

      // Validate start date (optional)
      if (show.start) {
        const startDateValidation = this.validateDate(show.start, 'start');
        if (!startDateValidation.isValid) {
          errors.push(...startDateValidation.errors);
        }
      }

      // Validate end date (optional)
      if (show.end) {
        const endDateValidation = this.validateDate(show.end, 'end');
        if (!endDateValidation.isValid) {
          errors.push(...endDateValidation.errors);
        }
      }

      // Validate date logic (start must be before end)
      if (show.start && show.end) {
        const dateLogicValidation = this.validateDateLogic(show.start, show.end);
        if (!dateLogicValidation.isValid) {
          errors.push(...dateLogicValidation.errors);
        }
      }

      // Validate returning status
      if (show.ret !== undefined) {
        const returningValidation = this.validateReturning(show.ret);
        if (!returningValidation.isValid) {
          errors.push(...returningValidation.errors);
        }
      }

    } catch (error) {
      errors.push(new ShowValidationError(
        `Unexpected error during validation: ${error.message}`,
        'validation',
        ERROR_CODES.VALIDATION.INVALID_TYPE,
        show
      ));
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Validates show title
   */
  validateTitle(title) {
    const errors = [];

    if (title === undefined || title === null) {
      errors.push(new ShowValidationError(
        'Title is required',
        'title',
        ERROR_CODES.VALIDATION.REQUIRED_FIELD,
        title
      ));
    } else if (typeof title !== 'string') {
      errors.push(new ShowValidationError(
        'Title must be a string',
        'title',
        ERROR_CODES.VALIDATION.INVALID_TYPE,
        title
      ));
    } else {
      const trimmedTitle = title.trim();
      if (trimmedTitle.length < VALIDATION_RULES.TITLE.MIN_LENGTH) {
        errors.push(new ShowValidationError(
          `Title must be at least ${VALIDATION_RULES.TITLE.MIN_LENGTH} character long`,
          'title',
          ERROR_CODES.VALIDATION.OUT_OF_RANGE,
          title
        ));
      }
      if (trimmedTitle.length > VALIDATION_RULES.TITLE.MAX_LENGTH) {
        errors.push(new ShowValidationError(
          `Title must be no more than ${VALIDATION_RULES.TITLE.MAX_LENGTH} characters long`,
          'title',
          ERROR_CODES.VALIDATION.OUT_OF_RANGE,
          title
        ));
      }
    }

    return { isValid: errors.length === 0, errors };
  },

  /**
   * Validates platform
   */
  validatePlatform(platform) {
    const errors = [];

    if (!platform) {
      errors.push(new ShowValidationError(
        'Platform is required',
        'platform',
        ERROR_CODES.VALIDATION.REQUIRED_FIELD,
        platform
      ));
    } else if (!VALIDATION_RULES.PLATFORMS.includes(platform)) {
      errors.push(new ShowValidationError(
        `Platform must be one of: ${VALIDATION_RULES.PLATFORMS.join(', ')}`,
        'platform',
        ERROR_CODES.VALIDATION.INVALID_ENUM_VALUE,
        platform
      ));
    }

    return { isValid: errors.length === 0, errors };
  },

  /**
   * Validates network
   */
  validateNetwork(network) {
    const errors = [];

    if (!network) {
      errors.push(new ShowValidationError(
        'Network is required',
        'network',
        ERROR_CODES.VALIDATION.REQUIRED_FIELD,
        network
      ));
    } else if (!VALIDATION_RULES.NETWORKS.includes(network)) {
      errors.push(new ShowValidationError(
        `Network must be one of: ${VALIDATION_RULES.NETWORKS.join(', ')}`,
        'network',
        ERROR_CODES.VALIDATION.INVALID_ENUM_VALUE,
        network
      ));
    }

    return { isValid: errors.length === 0, errors };
  },

  /**
   * Validates air day
   */
  validateAirDay(airDay) {
    const errors = [];

    if (airDay && !VALIDATION_RULES.DAYS.includes(airDay)) {
      errors.push(new ShowValidationError(
        `Air day must be one of: ${VALIDATION_RULES.DAYS.join(', ')}`,
        'airDay',
        ERROR_CODES.VALIDATION.INVALID_ENUM_VALUE,
        airDay
      ));
    }

    return { isValid: errors.length === 0, errors };
  },

  /**
   * Validates season number
   */
  validateSeason(season) {
    const errors = [];

    if (season !== null && season !== undefined && season !== '') {
      const seasonNum = typeof season === 'string' ? parseInt(season, 10) : season;
      
      if (isNaN(seasonNum) || !Number.isInteger(seasonNum)) {
        errors.push(new ShowValidationError(
          'Season must be a whole number',
          'season',
          ERROR_CODES.VALIDATION.INVALID_TYPE,
          season
        ));
      } else if (seasonNum < VALIDATION_RULES.SEASON.MIN_VALUE || seasonNum > VALIDATION_RULES.SEASON.MAX_VALUE) {
        errors.push(new ShowValidationError(
          `Season must be between ${VALIDATION_RULES.SEASON.MIN_VALUE} and ${VALIDATION_RULES.SEASON.MAX_VALUE}`,
          'season',
          ERROR_CODES.VALIDATION.OUT_OF_RANGE,
          season
        ));
      }
    }

    return { isValid: errors.length === 0, errors };
  },

  /**
   * Validates episode count
   */
  validateEpisodes(episodes) {
    const errors = [];

    if (episodes !== null && episodes !== undefined && episodes !== '') {
      const episodeNum = typeof episodes === 'string' ? parseInt(episodes, 10) : episodes;
      
      if (isNaN(episodeNum) || !Number.isInteger(episodeNum)) {
        errors.push(new ShowValidationError(
          'Episode count must be a whole number',
          'episodes',
          ERROR_CODES.VALIDATION.INVALID_TYPE,
          episodes
        ));
      } else if (episodeNum < VALIDATION_RULES.EPISODES.MIN_VALUE || episodeNum > VALIDATION_RULES.EPISODES.MAX_VALUE) {
        errors.push(new ShowValidationError(
          `Episode count must be between ${VALIDATION_RULES.EPISODES.MIN_VALUE} and ${VALIDATION_RULES.EPISODES.MAX_VALUE}`,
          'episodes',
          ERROR_CODES.VALIDATION.OUT_OF_RANGE,
          episodes
        ));
      }
    }

    return { isValid: errors.length === 0, errors };
  },

  /**
   * Validates date format and value
   */
  validateDate(date, fieldName = 'date') {
    const errors = [];

    if (typeof date !== 'string') {
      errors.push(new ShowValidationError(
        `${fieldName} must be a string in YYYY-MM-DD format`,
        fieldName,
        ERROR_CODES.VALIDATION.INVALID_TYPE,
        date
      ));
      return { isValid: false, errors };
    }

    if (!VALIDATION_RULES.DATE_FORMAT.test(date)) {
      errors.push(new ShowValidationError(
        `${fieldName} must be in YYYY-MM-DD format`,
        fieldName,
        ERROR_CODES.VALIDATION.INVALID_FORMAT,
        date
      ));
      return { isValid: false, errors };
    }

    const dateObj = new Date(date + 'T00:00:00');
    if (isNaN(dateObj.getTime())) {
      errors.push(new ShowValidationError(
        `${fieldName} is not a valid date`,
        fieldName,
        ERROR_CODES.VALIDATION.INVALID_FORMAT,
        date
      ));
    }

    // Check for reasonable date range (1900 to 2100)
    const year = dateObj.getFullYear();
    if (year < 1900 || year > 2100) {
      errors.push(new ShowValidationError(
        `${fieldName} year must be between 1900 and 2100`,
        fieldName,
        ERROR_CODES.VALIDATION.OUT_OF_RANGE,
        date
      ));
    }

    return { isValid: errors.length === 0, errors };
  },

  /**
   * Validates date logic (start before end)
   */
  validateDateLogic(startDate, endDate) {
    const errors = [];

    try {
      const start = new Date(startDate + 'T00:00:00');
      const end = new Date(endDate + 'T00:00:00');

      if (start >= end) {
        errors.push(new ShowValidationError(
          'Start date must be before end date',
          'dateLogic',
          ERROR_CODES.VALIDATION.DATE_LOGIC_ERROR,
          { start: startDate, end: endDate }
        ));
      }
    } catch (error) {
      errors.push(new ShowValidationError(
        'Error comparing start and end dates',
        'dateLogic',
        ERROR_CODES.VALIDATION.DATE_LOGIC_ERROR,
        { start: startDate, end: endDate }
      ));
    }

    return { isValid: errors.length === 0, errors };
  },

  /**
   * Validates returning status
   */
  validateReturning(returning) {
    const errors = [];

    if (returning !== undefined && typeof returning !== 'boolean') {
      errors.push(new ShowValidationError(
        'Returning status must be true or false',
        'returning',
        ERROR_CODES.VALIDATION.INVALID_TYPE,
        returning
      ));
    }

    return { isValid: errors.length === 0, errors };
  },

  /**
   * Validates show ID
   */
  validateShowId(id) {
    const errors = [];

    if (id === undefined || id === null) {
      errors.push(new ShowValidationError(
        'Show ID is required',
        'id',
        ERROR_CODES.VALIDATION.REQUIRED_FIELD,
        id
      ));
    } else {
      const idNum = typeof id === 'string' ? parseInt(id, 10) : id;
      if (isNaN(idNum) || !Number.isInteger(idNum) || idNum <= 0) {
        errors.push(new ShowValidationError(
          'Show ID must be a positive integer',
          'id',
          ERROR_CODES.VALIDATION.INVALID_TYPE,
          id
        ));
      }
    }

    return { isValid: errors.length === 0, errors };
  },

  /**
   * Validates JSON import data
   */
  validateImportData(data) {
    const errors = [];

    if (!data) {
      errors.push(new ShowValidationError(
        'Import data is required',
        'importData',
        ERROR_CODES.VALIDATION.REQUIRED_FIELD,
        data
      ));
      return { isValid: false, errors };
    }

    if (typeof data !== 'object') {
      errors.push(new ShowValidationError(
        'Import data must be an object',
        'importData',
        ERROR_CODES.VALIDATION.INVALID_TYPE,
        data
      ));
      return { isValid: false, errors };
    }

    // Validate each show in the import data
    Object.entries(data).forEach(([id, show]) => {
      const idValidation = this.validateShowId(id);
      if (!idValidation.isValid) {
        errors.push(...idValidation.errors.map(err => 
          new ShowValidationError(
            `Show ID "${id}": ${err.message}`,
            'importData',
            err.code,
            { id, show }
          )
        ));
      }

      const showValidation = this.validateShow(show);
      if (!showValidation.isValid) {
        errors.push(...showValidation.errors.map(err => 
          new ShowValidationError(
            `Show "${id}" ${err.field}: ${err.message}`,
            'importData',
            err.code,
            { id, show, originalError: err }
          )
        ));
      }
    });

    return { isValid: errors.length === 0, errors };
  }
};

// Error Handler Class
class ErrorHandler {
  constructor() {
    this.errorLog = [];
    this.maxLogSize = 100;
  }

  /**
   * Logs an error and optionally displays it to the user
   */
  handleError(error, showToUser = true, context = null) {
    // Log the error
    const errorEntry = {
      timestamp: new Date().toISOString(),
      error: error,
      context: context,
      stack: error.stack
    };

    this.errorLog.unshift(errorEntry);
    
    // Keep log size manageable
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(0, this.maxLogSize);
    }

    // Console logging for debugging
    console.error('Error occurred:', error);
    if (context) {
      console.error('Context:', context);
    }

    // Show to user if requested
    if (showToUser) {
      this.displayErrorToUser(error, context);
    }

    return errorEntry;
  }

  /**
   * Displays error to user in a user-friendly way
   */
  displayErrorToUser(error, context = null) {
    let message = this.getUserFriendlyMessage(error);
    
    if (context) {
      message += `\n\nContext: ${JSON.stringify(context, null, 2)}`;
    }

    // Try to show in a notification area first, fall back to alert
    const notification = this.showNotification(message, 'error');
    if (!notification) {
      alert(message);
    }
  }

  /**
   * Converts technical errors to user-friendly messages
   */
  getUserFriendlyMessage(error) {
    if (error instanceof ShowValidationError) {
      return `Validation Error: ${error.message}`;
    }
    
    if (error instanceof ShowOperationError) {
      switch (error.code) {
        case ERROR_CODES.OPERATION.SAVE_FAILED:
          return 'Failed to save your changes. Please try again.';
        case ERROR_CODES.OPERATION.LOAD_FAILED:
          return 'Failed to load show data. Some information may be missing.';
        case ERROR_CODES.OPERATION.IMPORT_FAILED:
          return 'Failed to import data. Please check the file format and try again.';
        case ERROR_CODES.OPERATION.EXPORT_FAILED:
          return 'Failed to export data. Please try again.';
        case ERROR_CODES.OPERATION.STORAGE_QUOTA_EXCEEDED:
          return 'Storage space is full. Please clear some data and try again.';
        default:
          return `Operation failed: ${error.message}`;
      }
    }

    // Generic error
    return `An error occurred: ${error.message}`;
  }

  /**
   * Shows a notification to the user
   * Returns true if notification was shown, false if not supported
   */
  showNotification(message, type = 'info') {
    // Try to find a notification container
    let container = document.getElementById('notifications');
    
    if (!container) {
      // Create notification container if it doesn't exist
      container = document.createElement('div');
      container.id = 'notifications';
      container.className = 'notifications-container';
      container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        max-width: 400px;
      `;
      document.body.appendChild(container);
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    notification.style.cssText = `
      background: ${type === 'error' ? '#fee' : type === 'success' ? '#efe' : '#eef'};
      border: 1px solid ${type === 'error' ? '#f99' : type === 'success' ? '#9f9' : '#99f'};
      border-radius: 4px;
      padding: 12px;
      margin-bottom: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      position: relative;
      word-wrap: break-word;
    `;

    // Create close button
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '&times;';
    closeBtn.style.cssText = `
      position: absolute;
      top: 4px;
      right: 8px;
      background: none;
      border: none;
      font-size: 18px;
      cursor: pointer;
      color: #666;
    `;
    closeBtn.onclick = () => notification.remove();

    // Set message
    const messageEl = document.createElement('div');
    messageEl.style.paddingRight = '20px';
    messageEl.textContent = message;

    notification.appendChild(messageEl);
    notification.appendChild(closeBtn);
    container.appendChild(notification);

    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 10000);

    return true;
  }

  /**
   * Gets recent errors for debugging
   */
  getRecentErrors(count = 10) {
    return this.errorLog.slice(0, count);
  }

  /**
   * Clears the error log
   */
  clearErrorLog() {
    this.errorLog = [];
  }
}

// Utility functions for safe operations
const safeOperations = {
  /**
   * Safely executes a function and handles any errors
   */
  async safeAsync(fn, fallback = null, errorHandler = null) {
    try {
      return await fn();
    } catch (error) {
      if (errorHandler) {
        errorHandler.handleError(error, true);
      } else {
        console.error('Safe async operation failed:', error);
      }
      return fallback;
    }
  },

  /**
   * Safely executes a synchronous function
   */
  safe(fn, fallback = null, errorHandler = null) {
    try {
      return fn();
    } catch (error) {
      if (errorHandler) {
        errorHandler.handleError(error, true);
      } else {
        console.error('Safe operation failed:', error);
      }
      return fallback;
    }
  },

  /**
   * Safely parses JSON with validation
   */
  safeJsonParse(jsonString, errorHandler = null) {
    try {
      if (!jsonString || typeof jsonString !== 'string') {
        throw new Error('Invalid JSON string provided');
      }
      
      const parsed = JSON.parse(jsonString);
      return { success: true, data: parsed, error: null };
    } catch (error) {
      const operationError = new ShowOperationError(
        `JSON parsing failed: ${error.message}`,
        'jsonParse',
        ERROR_CODES.OPERATION.IMPORT_FAILED,
        { jsonString: jsonString?.substring(0, 100) + '...' }
      );
      
      if (errorHandler) {
        errorHandler.handleError(operationError, true);
      }
      
      return { success: false, data: null, error: operationError };
    }
  },

  /**
   * Safely accesses localStorage with quota checking
   */
  safeLocalStorage: {
    getItem(key, errorHandler = null) {
      try {
        return localStorage.getItem(key);
      } catch (error) {
        const operationError = new ShowOperationError(
          `Failed to read from localStorage: ${error.message}`,
          'localStorage.getItem',
          ERROR_CODES.OPERATION.LOAD_FAILED,
          { key }
        );
        
        if (errorHandler) {
          errorHandler.handleError(operationError, true);
        }
        
        return null;
      }
    },

    setItem(key, value, errorHandler = null) {
      try {
        localStorage.setItem(key, value);
        return true;
      } catch (error) {
        let errorCode = ERROR_CODES.OPERATION.SAVE_FAILED;
        if (error.name === 'QuotaExceededError') {
          errorCode = ERROR_CODES.OPERATION.STORAGE_QUOTA_EXCEEDED;
        }
        
        const operationError = new ShowOperationError(
          `Failed to save to localStorage: ${error.message}`,
          'localStorage.setItem',
          errorCode,
          { key, valueLength: value?.length }
        );
        
        if (errorHandler) {
          errorHandler.handleError(operationError, true);
        }
        
        return false;
      }
    },

    removeItem(key, errorHandler = null) {
      try {
        localStorage.removeItem(key);
        return true;
      } catch (error) {
        const operationError = new ShowOperationError(
          `Failed to remove from localStorage: ${error.message}`,
          'localStorage.removeItem',
          ERROR_CODES.OPERATION.SAVE_FAILED,
          { key }
        );
        
        if (errorHandler) {
          errorHandler.handleError(operationError, true);
        }
        
        return false;
      }
    }
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    validators,
    ErrorHandler,
    safeOperations,
    ShowValidationError,
    ShowOperationError,
    ERROR_CODES,
    VALIDATION_RULES
  };
}

// Global assignment for browser use
if (typeof window !== 'undefined') {
  window.ShowValidation = {
    validators,
    ErrorHandler,
    safeOperations,
    ShowValidationError,
    ShowOperationError,
    ERROR_CODES,
    VALIDATION_RULES
  };
}
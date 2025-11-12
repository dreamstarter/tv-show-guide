# Error Handling & Validation System

## Overview

The TV Show Guide application now includes a comprehensive error handling and validation system that provides:

- **Data validation** for all user inputs and imported data
- **User-friendly error messages** with helpful guidance
- **Graceful error recovery** to prevent application crashes
- **Visual notifications** for success, error, and warning states
- **Detailed logging** for debugging purposes

## 🛡️ Validation Features

### Show Data Validation

The system validates all aspects of show data:

#### Required Fields
- **Title**: Must be a non-empty string (1-100 characters)
- **Platform**: Must be one of: `hulu`, `peacock`, `paramount`
- **Network**: Must be one of: `ABC`, `NBC`, `CBS`, `FOX`

#### Optional Fields with Validation
- **Season**: Integer between 1 and 50
- **Episodes**: Integer between 1 and 100  
- **Start/End Dates**: Valid dates in YYYY-MM-DD format (1900-2100)
- **Air Day**: Must be a valid day of the week
- **Returning Status**: Must be true or false

#### Business Logic Validation
- **Date Logic**: Start date must be before end date
- **Data Consistency**: Cross-field validation for related data

### Input Validation Examples

```javascript
// Valid show data
const validShow = {
  t: 'Grey\'s Anatomy',
  c: 'hulu',
  net: 'ABC',
  s: 21,
  start: '2025-01-15',
  end: '2025-05-15',
  eps: 22,
  air: 'Thursday',
  ret: true
};

// Invalid show data (will trigger validation errors)
const invalidShow = {
  t: '', // ❌ Empty title
  c: 'netflix', // ❌ Invalid platform
  net: 'CW', // ❌ Invalid network
  s: 0, // ❌ Season must be >= 1
  start: '2025-13-01', // ❌ Invalid date
  eps: -5, // ❌ Episodes must be positive
  air: 'Funday', // ❌ Invalid day
  ret: 'yes' // ❌ Must be boolean
};
```

## 🚨 Error Handling Features

### Error Types

The system defines specific error types for different scenarios:

#### ShowValidationError
Used for data validation issues:
```javascript
new ShowValidationError(
  'Title must be at least 1 character long',
  'title',
  ERROR_CODES.VALIDATION.OUT_OF_RANGE,
  ''
);
```

#### ShowOperationError
Used for operation failures:
```javascript
new ShowOperationError(
  'Failed to save data to localStorage',
  'save',
  ERROR_CODES.OPERATION.SAVE_FAILED,
  { key: 'showsSeasonData' }
);
```

### Error Codes

Standardized error codes for consistent handling:

```javascript
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
    STORAGE_QUOTA_EXCEEDED: 'STORAGE_QUOTA_EXCEEDED'
  }
};
```

## 📢 User Feedback System

### Visual Notifications

The system provides real-time feedback through elegant notifications:

#### Success Notifications (Green)
- Data saved successfully
- Import completed
- Export completed

#### Error Notifications (Red)
- Validation failures
- Save/load errors
- Import/export failures

#### Warning Notifications (Yellow)
- Data imported with warnings
- Non-critical issues

#### Info Notifications (Blue)
- General information
- Tips and guidance

### Notification Features
- **Auto-dismissal**: Notifications disappear after 10 seconds
- **Manual close**: Click the × button to dismiss
- **Non-blocking**: Don't interrupt user workflow
- **Responsive**: Work well on mobile devices

## 🔧 Implementation Examples

### Basic Validation
```javascript
// Validate a show before saving
const validation = ShowValidation.validators.validateShow(showData);
if (!validation.isValid) {
  console.log('Validation errors:', validation.errors);
  return;
}
```

### Safe Operations
```javascript
// Safe localStorage operations
const success = ShowValidation.safeOperations.safeLocalStorage.setItem(
  'myKey', 
  'myValue', 
  errorHandler
);

// Safe JSON parsing
const result = ShowValidation.safeOperations.safeJsonParse(jsonString, errorHandler);
if (result.success) {
  console.log('Parsed data:', result.data);
} else {
  console.log('Parse failed:', result.error);
}
```

### Error Handling
```javascript
// Handle errors with user notification
try {
  // Some operation that might fail
  dangerousOperation();
} catch (error) {
  errorHandler.handleError(error, true, 'Operation context');
}
```

## 🎯 User Experience Improvements

### Form Validation
- **Real-time feedback**: Input validation as you type
- **Visual indicators**: Red borders for invalid inputs, green for valid
- **Helpful tooltips**: Guidance for field requirements

### Import/Export Safety
- **File type validation**: Ensures JSON files only
- **Content validation**: Checks data structure and values
- **Rollback capability**: Invalid imports don't corrupt existing data
- **Progress feedback**: Clear success/failure messages

### Editor Safety
- **Batch validation**: All changes validated before saving
- **Field-level feedback**: Specific error messages for each field
- **Data preservation**: Invalid changes don't overwrite good data

## 🐛 Debugging Features

### Error Logging
```javascript
// View recent errors
const recentErrors = errorHandler.getRecentErrors(5);
console.table(recentErrors);

// Clear error log
errorHandler.clearErrorLog();
```

### Validation Testing
```javascript
// Test individual validation functions
const titleResult = ShowValidation.validators.validateTitle('Test Show');
const dateResult = ShowValidation.validators.validateDate('2025-01-01');
const showResult = ShowValidation.validators.validateShow(showData);
```

## 📱 Mobile Considerations

The error handling system is designed to work well on mobile devices:

- **Touch-friendly notifications**: Large close buttons
- **Readable text**: Appropriate font sizes
- **Responsive positioning**: Notifications adapt to screen size
- **Gesture support**: Swipe to dismiss (future enhancement)

## 🔒 Security Considerations

### Input Sanitization
- All user inputs are validated and sanitized
- XSS prevention through proper escaping
- JSON parsing safety with error recovery

### Data Integrity
- Validation prevents corrupted data from being saved
- Backup/restore capabilities for data recovery
- Version checking for import compatibility

## 🎨 Styling Integration

The validation system includes CSS for visual feedback:

```css
/* Form validation styles */
input:invalid {
  border-color: #f99;
  box-shadow: 0 0 0 1px rgba(255, 153, 153, 0.3);
}

input:valid {
  border-color: #9f9;
  box-shadow: 0 0 0 1px rgba(153, 255, 153, 0.3);
}

/* Notification styles */
.notification--error {
  background: #fee;
  border: 1px solid #f99;
  color: #c33;
}
```

## 🧪 Testing

### Manual Testing Steps

1. **Invalid Data Entry**:
   - Try entering invalid dates in the editor
   - Enter text in number fields
   - Leave required fields empty

2. **Import Testing**:
   - Try importing invalid JSON
   - Import data with missing required fields
   - Import data with invalid values

3. **Date Logic Testing**:
   - Set end date before start date
   - Enter invalid date formats
   - Try dates outside valid range

4. **Storage Testing**:
   - Fill localStorage quota (difficult to test)
   - Disable localStorage and try to save
   - Clear localStorage and reload page

### Automated Testing
Run the test file in browser console:
```javascript
// Load the test file and run
// This will validate various scenarios automatically
```

## 🚀 Future Enhancements

### Planned Improvements
1. **Field-level validation feedback** in the editor
2. **Undo/redo functionality** for data changes
3. **Data conflict resolution** for concurrent edits
4. **Batch import validation** with detailed reports
5. **Custom validation rules** for power users
6. **Offline validation** for PWA functionality

### Advanced Features
- **Schema migration** for data format changes
- **Data backup/restore** with validation
- **Import templates** with pre-validation
- **Validation rule customization** per user
- **Accessibility improvements** for screen readers

---

## Quick Reference

### Key Functions
- `ShowValidation.validators.validateShow(show)` - Validate complete show
- `errorHandler.handleError(error, showToUser, context)` - Handle errors
- `ShowValidation.safeOperations.safeJsonParse(json)` - Safe JSON parsing
- `ShowValidation.safeOperations.safeLocalStorage.setItem()` - Safe storage

### Error Codes
- `REQUIRED_FIELD` - Missing required data
- `INVALID_TYPE` - Wrong data type
- `OUT_OF_RANGE` - Value outside valid range
- `INVALID_FORMAT` - Wrong format (dates, etc.)
- `SAVE_FAILED` - Storage operation failed
- `IMPORT_FAILED` - Import operation failed

### Notification Types
- `success` - Green notifications for successful operations
- `error` - Red notifications for failures
- `warning` - Yellow notifications for warnings
- `info` - Blue notifications for information

The error handling and validation system makes the TV Show Guide more reliable, user-friendly, and maintainable while providing a solid foundation for future enhancements.
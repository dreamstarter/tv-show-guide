/**
 * TV Show Guide Application
 * Manages TV show data with season information, streaming platforms, and weekly scheduling
 */

// Configuration and Constants
const CONFIG = {
  EPISODE_DEFAULTS: { ABC: 18, NBC: 22, CBS: 20, FOX: 13 },
  DAY_ORDER: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  PLATFORMS: ['hulu', 'peacock', 'paramount'],
  STORAGE_KEY: 'showsSeasonData'
};

// Preloaded season data with premiere dates and cancellations
const PRELOAD_SEASON_DATA = {
  // Season 2 premieres
  "15": { "s": 2, "start": "2025-09-16", "air": "Tuesday", "ret": true },
  "8": { "s": 2, "start": "2025-09-23", "air": "Tuesday", "ret": true },
  "4": { "s": 2, "start": "2025-09-22", "air": "Monday", "ret": true },
  
  // NBC Law & Order block
  "17": { "s": 25, "start": "2025-09-25", "air": "Thursday", "ret": true },
  "18": { "s": 5, "start": "2025-09-25", "air": "Thursday", "ret": true },
  "19": { "s": 27, "start": "2025-09-25", "air": "Thursday", "ret": true },
  
  // One Chicago block
  "5": { "s": 14, "start": "2025-10-01", "air": "Wednesday", "ret": true },
  "6": { "s": 11, "start": "2025-10-01", "air": "Wednesday", "ret": true },
  "7": { "s": 13, "start": "2025-10-01", "air": "Wednesday", "ret": true },
  
  // ABC Thursday block
  "1": { "s": 9, "start": "2025-10-09", "air": "Thursday", "ret": true },
  "3": { "s": 1, "start": "2025-10-09", "air": "Thursday", "ret": true },
  "13": { "s": 22, "start": "2025-10-09", "air": "Thursday", "ret": true },
  
  // Other premieres
  "27": { "s": 2, "start": "2025-10-01", "air": "Wednesday", "ret": true },
  "20": { "s": 2, "start": "2025-10-12", "air": "Thursday", "ret": true },
  "9": { "s": 3, "start": "2025-10-16", "air": "Thursday", "ret": true },
  "31": { "s": 2, "start": "2025-10-13", "air": "Monday", "ret": true },
  "21": { "s": 2, "start": "2025-09-23", "air": "Tuesday", "ret": true },
  "10": { "s": 4, "start": "2025-10-17", "air": "Friday", "ret": true },
  "30": { "s": 3, "start": "2025-10-19", "air": "Sunday", "ret": true },
  
  // Midseason / TBD
  "2": { "ret": true, "air": "Tuesday" },
  "32": { "ret": true, "air": "Tuesday" },
  
  // Cancelled/ended shows
  "12": { "ret": false }, "28": { "ret": false }, "22": { "ret": false },
  "25": { "ret": false }, "24": { "ret": false }, "11": { "ret": false },
  "16": { "ret": false }, "23": { "ret": false }, "26": { "ret": false },
  "29": { "ret": false }
};

// Show database
const shows = {
  1: { t: '911', c: 'hulu', net: 'ABC', s: null, start: '', end: '', eps: null, air: 'Thursday', ret: true },
  2: { t: '911 Lonestar', c: 'hulu', net: 'FOX', s: null, start: '', end: '', eps: null, air: 'Tuesday', ret: true },
  3: { t: '911 Nashville', c: 'hulu', net: 'ABC', s: null, start: '', end: '', eps: null, air: 'Thursday', ret: true },
  4: { t: 'Brilliant Minds', c: 'peacock', net: 'NBC', s: null, start: '', end: '', eps: null, air: 'Monday', ret: true },
  5: { t: 'Chicago Fire', c: 'peacock', net: 'NBC', s: null, start: '', end: '', eps: null, air: 'Wednesday', ret: true },
  6: { t: 'Chicago Med', c: 'peacock', net: 'NBC', s: null, start: '', end: '', eps: null, air: 'Wednesday', ret: true },
  7: { t: 'Chicago PD', c: 'peacock', net: 'NBC', s: null, start: '', end: '', eps: null, air: 'Wednesday', ret: true },
  8: { t: 'Doc', c: 'hulu', net: 'FOX', s: null, start: '', end: '', eps: null, air: 'Tuesday', ret: true },
  9: { t: 'Elsbeth', c: 'paramount', net: 'CBS', s: null, start: '', end: '', eps: null, air: 'Thursday', ret: true },
  10: { t: 'Fire Country', c: 'paramount', net: 'CBS', s: null, start: '', end: '', eps: null, air: 'Friday', ret: true },
  11: { t: 'Found', c: 'peacock', net: 'NBC', s: null, start: '', end: '', eps: null, air: 'Wednesday', ret: false },
  12: { t: 'The Good Doctor', c: 'hulu', net: 'ABC', s: null, start: '', end: '', eps: null, air: 'Tuesday', ret: false },
  13: { t: "Grey's Anatomy", c: 'hulu', net: 'ABC', s: null, start: '', end: '', eps: null, air: 'Thursday', ret: true },
  14: { t: 'High County', c: 'hulu', net: 'FOX', s: null, start: '', end: '', eps: null, air: 'Thursday', ret: true },
  15: { t: 'High Potential', c: 'hulu', net: 'ABC', s: null, start: '', end: '', eps: null, air: 'Tuesday', ret: true },
  16: { t: 'The Irrational', c: 'peacock', net: 'NBC', s: null, start: '', end: '', eps: null, air: 'Wednesday', ret: false },
  17: { t: 'Law & Order', c: 'peacock', net: 'NBC', s: null, start: '', end: '', eps: null, air: 'Thursday', ret: true },
  18: { t: 'L&O: Organized Crime', c: 'peacock', net: 'NBC', s: null, start: '', end: '', eps: null, air: 'Thursday', ret: true },
  19: { t: 'L&O: SVU', c: 'peacock', net: 'NBC', s: null, start: '', end: '', eps: null, air: 'Thursday', ret: true },
  20: { t: 'Matlock', c: 'paramount', net: 'CBS', s: null, start: '', end: '', eps: null, air: 'Thursday', ret: true },
  21: { t: 'Murder in a Small Town', c: 'hulu', net: 'FOX', s: null, start: '', end: '', eps: null, air: 'Tuesday', ret: true },
  22: { t: 'New Amsterdam', c: 'peacock', net: 'NBC', s: null, start: '', end: '', eps: null, air: 'Tuesday', ret: false },
  23: { t: 'The Cleaning Lady', c: 'hulu', net: 'FOX', s: null, start: '', end: '', eps: null, air: 'Friday', ret: false },
  24: { t: 'The Conners', c: 'peacock', net: 'ABC', s: null, start: '', end: '', eps: null, air: 'Friday', ret: false },
  25: { t: 'The Resident', c: 'hulu', net: 'FOX', s: null, start: '', end: '', eps: null, air: 'Tuesday', ret: false },
  26: { t: 'Rescue: Hi Surf', c: 'hulu', net: 'FOX', s: null, start: '', end: '', eps: null, air: 'Monday', ret: false },
  27: { t: 'Shifting Gears', c: 'hulu', net: 'ABC', s: null, start: '', end: '', eps: null, air: 'Wednesday', ret: true },
  28: { t: 'Station 19', c: 'hulu', net: 'ABC', s: null, start: '', end: '', eps: null, air: 'Thursday', ret: false },
  29: { t: 'SWAT', c: 'paramount', net: 'CBS', s: null, start: '', end: '', eps: null, air: 'Friday', ret: false },
  30: { t: 'Tracker', c: 'paramount', net: 'CBS', s: null, start: '', end: '', eps: null, air: 'Sunday', ret: true },
  31: { t: 'Watson', c: 'paramount', net: 'CBS', s: null, start: '', end: '', eps: null, air: 'Monday', ret: true },
  32: { t: 'Will Trent', c: 'hulu', net: 'ABC', s: null, start: '', end: '', eps: null, air: 'Tuesday', ret: true }
};

// State management
let weekOffset = 0; // weeks relative to current week

// Utility Functions
const utils = {
  createElement: (tagName, className, content) => {
    const element = document.createElement(tagName);
    if (className) element.className = className;
    if (content) element.textContent = content;
    return element;
  },

  pad: (n) => (n < 10 ? '0' : '') + n,

  formatDate: (d) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  },

  startOfWeek: (d) => {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    const dow = x.getDay();
    x.setDate(x.getDate() - dow); // Sunday
    return x;
  },

  span: (text, className) => `<span class="${className}">${text}</span>`,

  getSelectedPlatforms: () => {
    const platforms = new Set();
    CONFIG.PLATFORMS.forEach(platform => {
      if (document.getElementById(`pf-${platform}`)?.checked) {
        platforms.add(platform);
      }
    });
    return platforms;
  }
};

// Data processing functions
const dataProcessing = {
  effectiveEpisodes: (show) => {
    try {
      if (show && typeof show.eps === 'number' && show.eps > 0) return show.eps;
      
      const useEstimates = document.getElementById('use-estimates')?.checked;
      if (!useEstimates) return null;
      
      const netFlags = {
        ABC: document.getElementById('est-abc')?.checked,
        NBC: document.getElementById('est-nbc')?.checked,
        CBS: document.getElementById('est-cbs')?.checked,
        FOX: document.getElementById('est-fox')?.checked
      };
      
      const net = show?.net;
      if (net && netFlags[net] && CONFIG.EPISODE_DEFAULTS[net]) {
        return CONFIG.EPISODE_DEFAULTS[net];
      }
      return null;
    } catch (error) {
      console.warn('Error calculating effective episodes:', error);
      return null;
    }
  },

  endDateFor: (show) => {
    try {
      if (show && show.end) return show.end;
      const eps = dataProcessing.effectiveEpisodes(show);
      if (!show || !show.start || !eps) return '';
      
      // Validate start date
      const startDateValidation = ShowValidation.validators.validateDate(show.start, 'start date');
      if (!startDateValidation.isValid) {
        console.warn(`Invalid start date for show: ${startDateValidation.errors.map(e => e.message).join(', ')}`);
        return '';
      }
      
      const start = new Date(show.start + 'T00:00:00');
      const last = new Date(start);
      last.setDate(start.getDate() + (eps - 1) * 7);
      return `${last.getFullYear()}-${utils.pad(last.getMonth() + 1)}-${utils.pad(last.getDate())}`;
    } catch (error) {
      console.warn('Error calculating end date:', error);
      return '';
    }
  },

  episodeForDate: (show, date) => {
    try {
      const eps = dataProcessing.effectiveEpisodes(show);
      if (!show || !show.start || !eps || !show.s) return '';
      
      // Validate start date
      const startDateValidation = ShowValidation.validators.validateDate(show.start, 'start date');
      if (!startDateValidation.isValid) {
        return '';
      }
      
      // Validate season
      const seasonValidation = ShowValidation.validators.validateSeason(show.s);
      if (!seasonValidation.isValid) {
        return '';
      }
      
      const start = new Date(show.start + 'T00:00:00');
      if (date < start) return '';
      
      const diffDays = Math.floor((date - start) / (1000 * 60 * 60 * 24));
      const weeks = Math.floor(diffDays / 7);
      const ep = weeks + 1;
      
      if (ep < 1 || ep > eps) return '';
      return `S${utils.pad(show.s)}E${utils.pad(ep)}`;
    } catch (error) {
      console.warn('Error calculating episode for date:', error);
      return '';
    }
  },

  byDay: () => {
    try {
      const dayMap = {};
      CONFIG.DAY_ORDER.forEach(day => dayMap[day] = []);
      
      Object.keys(shows).forEach(k => {
        const show = shows[k];
        if (show.air && dayMap[show.air]) {
          // Validate air day
          const airDayValidation = ShowValidation.validators.validateAirDay(show.air);
          if (airDayValidation.isValid) {
            dayMap[show.air].push(parseInt(k));
          } else {
            console.warn(`Invalid air day for show ${k}: ${show.air}`);
          }
        }
      });
      return dayMap;
    } catch (error) {
      console.warn('Error organizing shows by day:', error);
      return {};
    }
  },

  currentWeekStart: () => {
    try {
      const base = utils.startOfWeek(new Date());
      const d = new Date(base);
      d.setDate(base.getDate() + weekOffset * 7);
      return d;
    } catch (error) {
      console.warn('Error calculating current week start:', error);
      return new Date(); // Fallback to current date
    }
  }
};

// Persistence functions
const persistence = {
  load: () => {
    const raw = ShowValidation.safeOperations.safeLocalStorage.getItem(CONFIG.STORAGE_KEY, errorHandler);
    if (!raw) return;
    
    const parseResult = ShowValidation.safeOperations.safeJsonParse(raw, errorHandler);
    if (!parseResult.success) {
      errorHandler.handleError(
        new ShowValidation.ShowOperationError(
          'Failed to parse saved show data',
          'load',
          ShowValidation.ERROR_CODES.OPERATION.LOAD_FAILED
        ),
        true
      );
      return;
    }
    
    const data = parseResult.data;
    
    // Validate imported data
    const validation = ShowValidation.validators.validateImportData(data);
    if (!validation.isValid) {
      errorHandler.handleError(
        new ShowValidation.ShowOperationError(
          `Saved data validation failed: ${validation.errors.map(e => e.message).join(', ')}`,
          'load',
          ShowValidation.ERROR_CODES.OPERATION.LOAD_FAILED,
          { validationErrors: validation.errors }
        ),
        true
      );
      return;
    }
    
    // Apply valid data
    Object.keys(data).forEach(k => {
      if (shows[k]) Object.assign(shows[k], data[k]);
    });
    
    errorHandler.showNotification('Show data loaded successfully', 'success');
  },

  save: () => {
    try {
      const out = {};
      Object.keys(shows).forEach(k => {
        const show = shows[k];
        
        // Validate show data before saving
        const validation = ShowValidation.validators.validateShow(show);
        if (!validation.isValid) {
          console.warn(`Skipping invalid show ${k}:`, validation.errors);
          return;
        }
        
        const { s, start, end, eps, air, ret } = show;
        out[k] = { s, start, end, eps, air, ret };
      });
      
      const jsonData = JSON.stringify(out);
      const saveSuccess = ShowValidation.safeOperations.safeLocalStorage.setItem(CONFIG.STORAGE_KEY, jsonData, errorHandler);
      
      if (saveSuccess) {
        errorHandler.showNotification('Changes saved successfully', 'success');
      }
    } catch (error) {
      errorHandler.handleError(
        new ShowValidation.ShowOperationError(
          'Failed to prepare data for saving',
          'save',
          ShowValidation.ERROR_CODES.OPERATION.SAVE_FAILED
        ),
        true
      );
    }
  },

  applyPreload: (data) => {
    if (!data) return;
    
    const validation = ShowValidation.validators.validateImportData(data);
    if (!validation.isValid) {
      errorHandler.handleError(
        new ShowValidation.ShowOperationError(
          `Preload data validation failed: ${validation.errors.map(e => e.message).join(', ')}`,
          'applyPreload',
          ShowValidation.ERROR_CODES.OPERATION.LOAD_FAILED,
          { validationErrors: validation.errors }
        ),
        false // Don't show to user for preload issues
      );
      return;
    }
    
    Object.keys(data).forEach(k => {
      if (shows[k]) Object.assign(shows[k], data[k]);
    });
  }
};

// Rendering functions
const rendering = {
  legend: () => {
    try {
      const table = document.getElementById('legendTable');
      if (!table) {
        throw new Error('Legend table element not found');
      }
      
      const includeNonRet = document.getElementById('show-nonret')?.checked ?? false;
      const nums = Object.keys(shows)
        .map(k => parseInt(k))
        .filter(n => !isNaN(n))
        .sort((a, b) => a - b)
        .filter(n => includeNonRet || shows[n].ret !== false);

      let rows = '';
      for (let i = 0; i < nums.length; i += 4) {
        const cells = nums.slice(i, i + 4).map(n => {
          const s = shows[n];
          if (!s) return '<td>Invalid show</td>';
          
          const endDate = dataProcessing.endDateFor(s);
          const dateInfo = s.start ? `S${s.s || '?'}: ${s.start}${endDate ? ' – ' + endDate : ''}` : 'Season dates: TBD';
          const statusClass = s.ret ? '' : 'ended';
          
          return `<td>
            ${utils.span(n, s.c)} 
            <span class="${statusClass}">${s.t}</span>
            <span class="meta">${dateInfo}</span>
          </td>`;
        }).join('');
        rows += `<tr>${cells}</tr>`;
      }
      table.innerHTML = rows;
    } catch (error) {
      errorHandler.handleError(error, true, 'Rendering legend view');
      // Provide fallback content
      const table = document.getElementById('legendTable');
      if (table) {
        table.innerHTML = '<tr><td colspan="4">Error loading shows. Please refresh the page.</td></tr>';
      }
    }
  },

  allShows: () => {
    try {
      const container = document.getElementById('allList');
      if (!container) {
        throw new Error('All shows container element not found');
      }
      
      const selected = utils.getSelectedPlatforms();
      const includeNonRet = document.getElementById('show-nonret')?.checked ?? false;
      
      const items = Object.keys(shows)
        .map(k => parseInt(k))
        .filter(n => !isNaN(n))
        .sort((a, b) => a - b)
        .filter(n => {
          const show = shows[n];
          return show && selected.has(show.c) && (includeNonRet || show.ret !== false);
        })
        .map(n => {
          const s = shows[n];
          if (!s) return 'Invalid show';
          
          const endDate = dataProcessing.endDateFor(s);
          const dateInfo = s.start ? ` <span class="meta">(S${s.s || '?'}: ${s.start}${endDate ? ' – ' + endDate : ''})</span>` : '';
          const statusClass = s.ret ? '' : 'ended';
          
          return `${utils.span(n, s.c)} <span class="${statusClass}">${s.t}</span>${dateInfo}`;
        });

      container.innerHTML = items.length > 0 ? items.join('<br>') : '<em>No shows match the current filters</em>';
    } catch (error) {
      errorHandler.handleError(error, true, 'Rendering all shows view');
      // Provide fallback content
      const container = document.getElementById('allList');
      if (container) {
        container.innerHTML = 'Error loading shows. Please refresh the page.';
      }
    }
  },

  weekView: () => {
    try {
      const wrap = document.getElementById('weekTable');
      if (!wrap) {
        throw new Error('Week table element not found');
      }
      
      const selected = utils.getSelectedPlatforms();
      const includeNonRet = document.getElementById('show-nonret')?.checked ?? false;
      const startOfWeek = dataProcessing.currentWeekStart();
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6);
      
      const weekRangeElement = document.getElementById('weekRange');
      if (weekRangeElement) {
        weekRangeElement.textContent = `${utils.formatDate(startOfWeek)} – ${utils.formatDate(endOfWeek)}`;
      }
      
      const dayMap = dataProcessing.byDay();
      let html = '<table><thead><tr>' + CONFIG.DAY_ORDER.map(d => `<th>${d}</th>`).join('') + '</tr></thead><tbody><tr>';
      
      for (let i = 0; i < 7; i++) {
        const dayDate = new Date(startOfWeek);
        dayDate.setDate(startOfWeek.getDate() + i);
        const dayName = CONFIG.DAY_ORDER[i];
        
        const items = (dayMap[dayName] || [])
          .filter(n => {
            const show = shows[n];
            return show && selected.has(show.c) && (includeNonRet || show.ret !== false);
          })
          .map(n => {
            const show = shows[n];
            if (!show) return 'Invalid show';
            
            const episode = dataProcessing.episodeForDate(show, dayDate);
            const statusClass = show.ret ? '' : 'ended';
            const episodeInfo = episode ? ` <span class="muted">(${episode})</span>` : '';
            
            return `${utils.span(n, show.c)} <span class="${statusClass}">${show.t}</span>${episodeInfo}`;
          });
          
        html += `<td class="shows">${items.length > 0 ? items.join('<br>') : '<em>No shows</em>'}</td>`;
      }
      html += '</tr></tbody></table>';
      wrap.innerHTML = html;
    } catch (error) {
      errorHandler.handleError(error, true, 'Rendering week view');
      // Provide fallback content
      const wrap = document.getElementById('weekTable');
      if (wrap) {
        wrap.innerHTML = '<p>Error loading week view. Please refresh the page.</p>';
      }
    }
  },

  editor: () => {
    try {
      const wrap = document.getElementById('editWrap');
      if (!wrap) {
        throw new Error('Editor wrapper element not found');
      }
      
      let html = '<table class="editor"><thead><tr><th>#</th><th>Title</th><th>Platform</th><th>Air Day</th><th>Season</th><th>Start</th><th>End</th><th>Eps</th><th>Returning</th></tr></thead><tbody>';
      
      const nums = Object.keys(shows)
        .map(k => parseInt(k))
        .filter(n => !isNaN(n))
        .sort((a, b) => a - b);
        
      nums.forEach(n => {
        const show = shows[n];
        if (!show) {
          html += `<tr><td>${n}</td><td colspan="8">Invalid show data</td></tr>`;
          return;
        }
        
        html += `<tr>
          <td>${n}</td>
          <td>${show.t}</td>
          <td>${utils.span(show.c, show.c + ' chip')}</td>
          <td>
            <select data-k="${n}" data-f="air">
              ${['', ...CONFIG.DAY_ORDER].map(d => 
                `<option value="${d}" ${show.air === d ? 'selected' : ''}>${d || '—'}</option>`
              ).join('')}
            </select>
          </td>
          <td><input type="number" min="1" max="50" data-k="${n}" data-f="s" value="${show.s ?? ''}" title="Season number (1-50)"></td>
          <td><input type="date" data-k="${n}" data-f="start" value="${show.start || ''}" title="Season start date"></td>
          <td><input type="date" data-k="${n}" data-f="end" value="${show.end || ''}" title="Season end date"></td>
          <td><input type="number" min="1" max="100" data-k="${n}" data-f="eps" value="${show.eps ?? ''}" title="Number of episodes (1-100)"></td>
          <td style="text-align: center"><input type="checkbox" data-k="${n}" data-f="ret" ${show.ret ? 'checked' : ''} title="Is this show returning?"></td>
        </tr>`;
      });
      
      html += '</tbody></table><div style="margin-top: 8px;"><button id="saveEdits" type="button" class="btn">Save Changes</button> <span class="muted">Saves locally in your browser</span></div>';
      wrap.innerHTML = html;
    } catch (error) {
      errorHandler.handleError(error, true, 'Rendering editor');
      // Provide fallback content
      const wrap = document.getElementById('editWrap');
      if (wrap) {
        wrap.innerHTML = '<p>Error loading editor. Please refresh the page.</p>';
      }
    }
  }
};

// Event handlers
const eventHandlers = {
  saveEdits: () => {
    try {
      const inputs = document.querySelectorAll('#editWrap [data-k]');
      const validationErrors = [];
      
      // Collect all changes and validate them first
      const changes = {};
      inputs.forEach(el => {
        const k = el.getAttribute('data-k');
        const f = el.getAttribute('data-f');
        let val = el.type === 'checkbox' ? el.checked : el.value;
        
        if (f === 's' || f === 'eps') {
          val = val ? parseInt(val, 10) : null;
        }
        
        if (!changes[k]) changes[k] = {};
        changes[k][f] = (val === '' ? '' : val);
      });
      
      // Validate each show's changes
      Object.entries(changes).forEach(([showId, updates]) => {
        const updatedShow = { ...shows[showId], ...updates };
        const validation = ShowValidation.validators.validateShow(updatedShow);
        
        if (!validation.isValid) {
          validation.errors.forEach(error => {
            validationErrors.push(`Show ${showId}: ${error.message}`);
          });
        }
      });
      
      // If there are validation errors, show them and don't save
      if (validationErrors.length > 0) {
        errorHandler.handleError(
          new ShowValidation.ShowValidationError(
            'Cannot save changes due to validation errors:\n' + validationErrors.join('\n'),
            'saveEdits',
            ShowValidation.ERROR_CODES.VALIDATION.INVALID_TYPE,
            changes
          ),
          true
        );
        return;
      }
      
      // Apply changes if validation passes
      Object.entries(changes).forEach(([showId, updates]) => {
        Object.assign(shows[showId], updates);
      });
      
      persistence.save();
      app.reRender();
      
    } catch (error) {
      errorHandler.handleError(error, true, 'Saving edits');
    }
  },

  loadPaste: () => {
    try {
      const txt = (document.getElementById('pasteJson').value || '').trim();
      if (!txt) {
        errorHandler.handleError(
          new ShowValidation.ShowValidationError(
            'Please enter JSON data to load',
            'pasteJson',
            ShowValidation.ERROR_CODES.VALIDATION.REQUIRED_FIELD
          ),
          true
        );
        return;
      }
      
      const parseResult = ShowValidation.safeOperations.safeJsonParse(txt, errorHandler);
      if (!parseResult.success) return;
      
      const data = parseResult.data;
      const validation = ShowValidation.validators.validateImportData(data);
      
      if (!validation.isValid) {
        errorHandler.handleError(
          new ShowValidation.ShowOperationError(
            'Invalid JSON data:\n' + validation.errors.map(e => e.message).join('\n'),
            'loadPaste',
            ShowValidation.ERROR_CODES.OPERATION.IMPORT_FAILED,
            { validationErrors: validation.errors }
          ),
          true
        );
        return;
      }
      
      persistence.applyPreload(data);
      persistence.save();
      app.reRender();
      
      errorHandler.showNotification('Season data loaded successfully from JSON', 'success');
      
      // Clear the paste area
      document.getElementById('pasteJson').value = '';
      
    } catch (error) {
      errorHandler.handleError(error, true, 'Loading pasted JSON');
    }
  },

  setMode: (mode) => {
    const allBtn = document.getElementById('btnAll');
    const weekBtn = document.getElementById('btnWeek');
    const allView = document.getElementById('viewAll');
    const weekView = document.getElementById('viewWeek');

    if (mode === 'all') {
      allView.classList.remove('hidden');
      weekView.classList.add('hidden');
      allBtn.classList.add('active');
      weekBtn.classList.remove('active');
      allBtn.setAttribute('aria-pressed', 'true');
      weekBtn.setAttribute('aria-pressed', 'false');
    } else {
      weekView.classList.remove('hidden');
      allView.classList.add('hidden');
      weekBtn.classList.add('active');
      allBtn.classList.remove('active');
      weekBtn.setAttribute('aria-pressed', 'true');
      allBtn.setAttribute('aria-pressed', 'false');
    }
  },

  weekNavigation: {
    prev: () => { 
      try {
        weekOffset--; 
        rendering.weekView(); 
      } catch (error) {
        errorHandler.handleError(error, true, 'Week navigation previous');
      }
    },
    current: () => { 
      try {
        weekOffset = 0; 
        rendering.weekView(); 
      } catch (error) {
        errorHandler.handleError(error, true, 'Week navigation current');
      }
    },
    next: () => { 
      try {
        weekOffset++; 
        rendering.weekView(); 
      } catch (error) {
        errorHandler.handleError(error, true, 'Week navigation next');
      }
    },
    jumpTo: (e) => {
      try {
        const v = e.target.value;
        if (!v) return;
        
        const dateValidation = ShowValidation.validators.validateDate(v, 'jump date');
        if (!dateValidation.isValid) {
          errorHandler.handleError(
            new ShowValidation.ShowValidationError(
              `Invalid date: ${dateValidation.errors.map(e => e.message).join(', ')}`,
              'jumpDate',
              ShowValidation.ERROR_CODES.VALIDATION.INVALID_FORMAT,
              v
            ),
            true
          );
          return;
        }
        
        const d = new Date(v + 'T00:00:00');
        const base = utils.startOfWeek(new Date());
        const target = utils.startOfWeek(d);
        const diffDays = Math.round((target - base) / (1000 * 60 * 60 * 24));
        weekOffset = Math.round(diffDays / 7);
        rendering.weekView();
      } catch (error) {
        errorHandler.handleError(error, true, 'Week navigation jump');
      }
    }
  },

  importExport: {
    import: () => {
      try {
        const fileInput = document.getElementById('importFile');
        if (fileInput) {
          fileInput.click();
        } else {
          throw new Error('Import file input not found');
        }
      } catch (error) {
        errorHandler.handleError(error, true, 'Import file selection');
      }
    },
    
    handleFileImport: (e) => {
      try {
        const file = e.target.files?.[0];
        if (!file) {
          errorHandler.handleError(
            new ShowValidation.ShowValidationError(
              'No file selected for import',
              'importFile',
              ShowValidation.ERROR_CODES.VALIDATION.REQUIRED_FIELD
            ),
            true
          );
          return;
        }
        
        if (!file.type.includes('json') && !file.name.endsWith('.json')) {
          errorHandler.handleError(
            new ShowValidation.ShowValidationError(
              'Please select a JSON file',
              'importFile',
              ShowValidation.ERROR_CODES.VALIDATION.INVALID_FORMAT,
              file.name
            ),
            true
          );
          return;
        }
        
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const parseResult = ShowValidation.safeOperations.safeJsonParse(reader.result, errorHandler);
            if (!parseResult.success) return;
            
            const data = parseResult.data;
            const validation = ShowValidation.validators.validateImportData(data);
            
            if (!validation.isValid) {
              errorHandler.handleError(
                new ShowValidation.ShowOperationError(
                  'Invalid file data:\n' + validation.errors.map(e => e.message).join('\n'),
                  'handleFileImport',
                  ShowValidation.ERROR_CODES.OPERATION.IMPORT_FAILED,
                  { fileName: file.name, validationErrors: validation.errors }
                ),
                true
              );
              return;
            }
            
            persistence.applyPreload(data);
            persistence.save();
            app.reRender();
            
            errorHandler.showNotification(`Successfully imported data from ${file.name}`, 'success');
            
            // Clear the file input
            e.target.value = '';
            
          } catch (error) {
            errorHandler.handleError(error, true, `Reading file: ${file.name}`);
          }
        };
        
        reader.onerror = () => {
          errorHandler.handleError(
            new ShowValidation.ShowOperationError(
              `Failed to read file: ${file.name}`,
              'handleFileImport',
              ShowValidation.ERROR_CODES.OPERATION.IMPORT_FAILED,
              { fileName: file.name }
            ),
            true
          );
        };
        
        reader.readAsText(file);
        
      } catch (error) {
        errorHandler.handleError(error, true, 'File import process');
      }
    },

    export: () => {
      try {
        const out = {};
        const exportErrors = [];
        
        Object.keys(shows).forEach(k => {
          const { s, start, end, eps, air, ret } = shows[k];
          const showData = { s, start, end, eps, air, ret };
          
          // Validate each show before export
          const validation = ShowValidation.validators.validateShow(showData);
          if (!validation.isValid) {
            exportErrors.push(`Show ${k}: ${validation.errors.map(e => e.message).join(', ')}`);
          } else {
            out[k] = showData;
          }
        });
        
        if (exportErrors.length > 0) {
          console.warn('Some shows had validation errors during export:', exportErrors);
          errorHandler.showNotification(
            `Export completed with warnings. Check console for details.`,
            'warning'
          );
        }
        
        if (Object.keys(out).length === 0) {
          errorHandler.handleError(
            new ShowValidation.ShowOperationError(
              'No valid show data to export',
              'export',
              ShowValidation.ERROR_CODES.OPERATION.EXPORT_FAILED
            ),
            true
          );
          return;
        }
        
        const jsonData = JSON.stringify(out, null, 2);
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        const filename = `tv-show-data-${timestamp}.json`;
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        
        errorHandler.showNotification(`Exported ${Object.keys(out).length} shows to ${filename}`, 'success');
        
      } catch (error) {
        errorHandler.handleError(
          new ShowValidation.ShowOperationError(
            `Export failed: ${error.message}`,
            'export',
            ShowValidation.ERROR_CODES.OPERATION.EXPORT_FAILED
          ),
          true
        );
      }
    }
  }
};

// Initialize error handler
const errorHandler = new ShowValidation.ErrorHandler();

// Main application object
const app = {
  init: () => {
    try {
      persistence.applyPreload(PRELOAD_SEASON_DATA);
      persistence.load();
      rendering.editor();
      app.reRender();
      app.bindEvents();
    } catch (error) {
      errorHandler.handleError(error, true, 'Application initialization');
    }
  },

  reRender: () => {
    try {
      rendering.legend();
      rendering.allShows();
      rendering.weekView();
    } catch (error) {
      errorHandler.handleError(error, true, 'Re-rendering views');
    }
  },

  bindEvents: () => {
    // View toggle buttons
    document.getElementById('btnAll').addEventListener('click', () => eventHandlers.setMode('all'));
    document.getElementById('btnWeek').addEventListener('click', () => eventHandlers.setMode('week'));

    // Platform filters
    CONFIG.PLATFORMS.forEach(platform => {
      document.getElementById(`pf-${platform}`).addEventListener('change', app.reRender);
    });

    // Other filters
    document.getElementById('show-nonret').addEventListener('change', app.reRender);
    
    ['use-estimates', 'est-abc', 'est-nbc', 'est-cbs', 'est-fox'].forEach(id => {
      document.getElementById(id).addEventListener('change', app.reRender);
    });

    // Week navigation
    document.getElementById('prevWeek').addEventListener('click', eventHandlers.weekNavigation.prev);
    document.getElementById('thisWeek').addEventListener('click', eventHandlers.weekNavigation.current);
    document.getElementById('nextWeek').addEventListener('click', eventHandlers.weekNavigation.next);
    document.getElementById('jumpDate').addEventListener('change', eventHandlers.weekNavigation.jumpTo);

    // Import/Export
    document.getElementById('importBtn').addEventListener('click', eventHandlers.importExport.import);
    document.getElementById('importFile').addEventListener('change', eventHandlers.importExport.handleFileImport);
    document.getElementById('exportBtn').addEventListener('click', eventHandlers.importExport.export);

    // Editor events (delegated)
    document.addEventListener('click', (e) => {
      if (e.target.id === 'saveEdits') {
        eventHandlers.saveEdits();
      } else if (e.target.id === 'loadPaste') {
        eventHandlers.loadPaste();
      }
    });
  }
};

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', app.init);
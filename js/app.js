'use strict';

const app = document.getElementById('app');
const notice = document.getElementById('notice');
const offline = document.getElementById('offline');
const report = document.getElementById('report');
let dirty = false;
let saving = false;
let noticeTimeout;

function notify(message, isError = false) {
  clearTimeout(noticeTimeout);
  notice.textContent = message;
  notice.classList.toggle('error', isError);
  if (!isError) noticeTimeout = setTimeout(() => { notice.textContent = ''; }, 4500);
}

function button(label, className, handler) {
  const control = element('button', label, className);
  control.type = 'button';
  control.addEventListener('click', handler);
  return control;
}

function heading(label, title, description, action) {
  const header = element('header', undefined, 'page-heading');
  const copy = element('div');
  copy.append(element('p', label, 'eyebrow'), element('h1', title), element('p', description, 'intro'));
  header.append(copy);
  if (action) header.append(action);
  return header;
}

function allowLeave() {
  return !saving && (!dirty || window.confirm('Leave this inspection and discard unsaved changes?'));
}

window.addEventListener('beforeunload', event => {
  if (!dirty && !saving) return;
  event.preventDefault();
  event.returnValue = true;
});

async function showHome() {
  if (!allowLeave()) return;
  dirty = false;
  report.replaceChildren();
  notice.textContent = '';
  const start = button('New inspection', 'primary', () => showEditor(newDraft()));
  const shell = heading('Inspection register', 'Factory inspections',
    'Run an inspection, record corrective actions and reopen saved records.', start);
  const panel = element('section', undefined, 'panel');
  const toolbar = element('div', undefined, 'register-toolbar');
  const title = element('h2', 'Saved inspections');
  const search = element('input');
  search.type = 'search';
  search.placeholder = 'Area, inspector or job';
  search.setAttribute('aria-label', 'Search inspections');
  toolbar.append(title, search);
  const list = element('div', undefined, 'register-list');
  panel.append(toolbar, list);
  app.replaceChildren(shell, panel, element('p', 'Records are saved in this browser. Keep a PDF copy of completed inspections.', 'storage-note'));

  let records;
  try {
    records = await inspectionDB.list();
  } catch (error) {
    start.disabled = true;
    list.append(element('p', 'Records could not be opened. Check that browser storage is available and reload.', 'empty'));
    console.error(error);
    return;
  }
  records.sort((first, second) => second.updatedAt.localeCompare(first.updatedAt));

  function renderList() {
    const query = search.value.trim().toLowerCase();
    const matching = records.filter(record => [record.area, record.inspector, record.job]
      .some(field => field.toLowerCase().includes(query)));
    list.replaceChildren();
    if (!matching.length) {
      const empty = element('div', undefined, 'empty');
      empty.append(element('strong', records.length ? 'No matching inspections' : 'No inspections saved yet'));
      if (!records.length) empty.append(element('p', 'Start an inspection to create your first record.'));
      list.append(empty);
      return;
    }
    for (const record of matching) {
      const complete = record.status === 'complete';
      const row = element('div', undefined, 'register-row');
      const info = element('div', undefined, 'record-info');
      info.append(element('strong', record.area || 'Untitled inspection'),
        element('span', [displayDate(record.date), record.inspector, record.job].filter(Boolean).join(' · ')));
      const actions = element('div', undefined, 'row-actions');
      actions.append(element('span', complete ? 'Completed' : 'Draft', complete ? 'pill complete' : 'pill'),
        button(complete ? 'View report' : 'Open draft', 'secondary',
          () => complete ? showCompleted(record) : showEditor(record)));
      row.append(info, actions);
      list.append(row);
    }
  }

  search.addEventListener('input', renderList);
  renderList();
}

function newDraft() {
  const date = new Date();
  const checklist = {
    name: CHECKLIST.name,
    version: CHECKLIST.version,
    groups: CHECKLIST.groups.map(group => ({
      name: group.name,
      checks: group.checks.map(label => ({ label, result: '', action: '' })),
    })),
  };
  return {
    id: crypto.randomUUID(),
    date: new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10),
    area: '', inspector: '', job: '', notes: '', status: 'draft', revision: 0, checklist,
  };
}

function formField(label, control, required = false) {
  const field = element('label', undefined, 'field');
  field.append(element('span', label + (required ? ' *' : '')), control);
  return field;
}

function showEditor(initial) {
  let record = structuredClone(initial);
  dirty = false;
  notice.textContent = '';
  const back = button('← Inspections', 'back', showHome);
  const header = heading('Inspection form', initial.revision ? 'Edit draft' : 'New inspection',
    'Record a result for each check. A failed check needs a corrective action.');
  const form = element('form', undefined, 'inspection-form');
  const details = element('section', undefined, 'panel form-panel');
  details.append(element('h2', 'Inspection details'));
  const fields = element('div', undefined, 'fields');
  const area = element('select');
  area.add(new Option('Choose an area', ''));
  for (const option of new Set([...FACTORY_AREAS, record.area].filter(Boolean))) area.add(new Option(option));
  area.value = record.area;
  area.required = true;
  const date = element('input');
  date.type = 'date';
  date.value = record.date;
  date.required = true;
  const inspector = element('input');
  inspector.value = record.inspector;
  inspector.maxLength = 120;
  inspector.required = true;
  const job = element('input');
  job.value = record.job;
  job.maxLength = 120;
  fields.append(formField('Factory area', area, true), formField('Inspection date', date, true),
    formField('Inspector', inspector, true), formField('Job / batch reference', job));
  details.append(fields);
  form.append(details);

  const answers = [];
  const progress = element('p', '', 'progress');
  const checklistHeader = element('div', undefined, 'checklist-heading');
  checklistHeader.append(element('h2', record.checklist.name), progress);
  form.append(checklistHeader);
  for (const group of record.checklist.groups) {
    const panel = element('section', undefined, 'panel form-panel check-panel');
    panel.append(element('h3', group.name));
    for (const check of group.checks) {
      const fieldset = element('fieldset', undefined, 'check');
      fieldset.append(element('legend', check.label));
      const options = element('div', undefined, 'choices');
      const name = 'result-' + answers.length;
      const action = element('textarea');
      action.maxLength = 3000;
      action.rows = 2;
      action.value = check.action;
      const actionField = formField('Corrective action', action, true);
      for (const [value, label] of Object.entries(RESULTS)) {
        const radio = element('input');
        radio.type = 'radio';
        radio.name = name;
        radio.value = value;
        radio.required = true;
        radio.checked = check.result === value;
        const choice = element('label', undefined, 'choice ' + value);
        choice.append(radio, element('span', label));
        options.append(choice);
      }
      const refreshAction = () => {
        const failed = form.elements.namedItem(name).value === 'fail';
        actionField.hidden = !failed;
        action.required = failed;
        action.setCustomValidity('');
      };
      options.addEventListener('change', refreshAction);
      fieldset.append(options, actionField);
      panel.append(fieldset);
      answers.push({ name, action, refreshAction });
    }
    form.append(panel);
  }

  const notes = element('textarea');
  notes.rows = 3;
  notes.maxLength = 5000;
  notes.value = record.notes;
  const notesPanel = element('section', undefined, 'panel form-panel');
  notesPanel.append(formField('Inspection notes', notes));
  form.append(notesPanel);

  const status = element('p', record.revision ? 'Draft saved on this device' : 'Unsaved inspection', 'save-status');
  const actions = element('div', undefined, 'form-actions');
  const draft = button('Save draft', 'secondary', () => persist(false));
  const complete = button('Complete inspection', 'primary');
  complete.type = 'submit';
  actions.append(status, draft, complete);
  form.append(actions);
  app.replaceChildren(back, header, form);

  function updateProgress() {
    const answered = answers.filter(({ name }) => form.elements.namedItem(name).value).length;
    progress.textContent = answered + ' of ' + answers.length + ' answered';
  }

  async function persist(finish) {
    if (saving) return;
    let index = 0;
    const groups = record.checklist.groups.map(group => ({
      name: group.name,
      checks: group.checks.map(check => {
        const { name, action } = answers[index++];
        const result = form.elements.namedItem(name).value;
        return { label: check.label, result, action: result === 'fail' ? action.value.trim() : '' };
      }),
    }));
    const pending = {
      ...record,
      area: area.value,
      date: date.value,
      inspector: inspector.value.trim(),
      job: job.value.trim(),
      notes: notes.value.trim(),
      checklist: { ...record.checklist, groups },
      status: finish ? 'complete' : 'draft',
      updatedAt: new Date().toISOString(),
    };
    const controls = Array.from(form.elements).filter(control => control.tagName !== 'FIELDSET');
    saving = true;
    for (const control of controls) control.disabled = true;
    notice.textContent = '';
    try {
      record = await inspectionDB.save(pending, record.revision);
      dirty = false;
      status.textContent = 'Draft saved on this device';
      if (finish) showCompleted(record);
      else notify('Draft saved.');
    } catch (error) {
      dirty = true;
      status.textContent = 'Changes not saved';
      notify(error.message || 'Unable to save. Check browser storage and try again.', true);
    } finally {
      saving = false;
      for (const control of controls) control.disabled = false;
    }
  }

  answers.forEach(({ refreshAction }) => refreshAction());
  updateProgress();
  form.addEventListener('input', event => {
    dirty = true;
    status.textContent = 'Unsaved changes';
    event.target.setCustomValidity('');
    updateProgress();
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    inspector.setCustomValidity(inspector.value.trim() ? '' : 'Enter the inspector’s name.');
    for (const { name, action } of answers) {
      action.setCustomValidity(form.elements.namedItem(name).value === 'fail' && !action.value.trim()
        ? 'Describe the corrective action.' : '');
    }
    if (form.reportValidity()) persist(true);
  });
}

function showCompleted(record) {
  const back = button('← Inspections', 'back', showHome);
  const panel = element('article', undefined, 'panel report-card');
  renderReport(panel, record);
  renderReport(report, record);
  const header = heading('Completed inspection', 'Inspection report',
    'Choose Save as PDF in the print dialog to keep or share a copy.',
    button('Print / save PDF', 'primary', () => printReport(record)));
  app.replaceChildren(back, header, panel);
  window.scrollTo(0, 0);
}

function setupOffline() {
  if (!('serviceWorker' in navigator)) {
    offline.textContent = 'Offline unavailable';
    return;
  }
  const setReady = () => {
    if (!navigator.serviceWorker.controller) return;
    offline.textContent = 'Offline ready';
    offline.classList.add('ready');
  };
  navigator.serviceWorker.addEventListener('controllerchange', setReady);
  setReady();
  navigator.serviceWorker.register('./sw.js').then(registration => {
    const observe = worker => {
      if (!worker) return;
      const update = () => {
        if (worker.state === 'redundant' && !navigator.serviceWorker.controller) {
          offline.textContent = 'Offline setup failed';
        }
      };
      worker.addEventListener('statechange', update);
      update();
    };
    observe(registration.installing);
    registration.addEventListener('updatefound', () => observe(registration.installing));
  }).catch(error => {
    if (!navigator.serviceWorker.controller) offline.textContent = 'Offline setup failed';
    console.error(error);
  });
}

if (window.isSecureContext && location.protocol !== 'file:') {
  setupOffline();
  showHome();
} else {
  offline.textContent = 'Offline unavailable';
  app.replaceChildren(heading('Setup required', 'Open the hosted app',
    'Use the inspection app’s HTTPS address or follow the local preview instructions included in the project.'));
}

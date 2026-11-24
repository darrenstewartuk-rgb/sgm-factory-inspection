'use strict';

function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}

function displayDate(date) {
  return date ? new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeZone: 'UTC' })
    .format(new Date(date + 'T00:00:00Z')) : '—';
}

function summarise(record) {
  const totals = { pass: 0, fail: 0, na: 0, open: 0 };
  for (const group of record.checklist.groups) {
    for (const check of group.checks) totals[check.result || 'open']++;
  }
  return totals;
}

function renderReport(container, record) {
  const header = element('header', undefined, 'report-header');
  header.append(element('p', 'SGM Windows Manufacturing Ltd', 'report-brand'),
    element('h1', 'Factory inspection report'),
    element('p', 'Reference ' + record.id.toUpperCase(), 'report-reference'));

  const metadata = element('dl', undefined, 'report-meta');
  for (const [label, value] of [
    ['Factory area', record.area],
    ['Inspection date', displayDate(record.date)],
    ['Inspected by', record.inspector],
    ['Job / batch', record.job || '—'],
    ['Checklist', record.checklist.name + ' · v' + record.checklist.version],
    ['Status', 'Completed'],
  ]) {
    const field = element('div');
    field.append(element('dt', label), element('dd', value));
    metadata.append(field);
  }

  const totals = summarise(record);
  const summary = element('p', totals.pass + ' pass · ' + totals.fail + ' fail · ' + totals.na + ' N/A', 'report-summary');
  const sections = record.checklist.groups.map(group => {
    const section = element('section', undefined, 'report-group');
    section.append(element('h2', group.name));
    for (const check of group.checks) {
      const item = element('div', undefined, 'report-check');
      const heading = element('div', undefined, 'report-check-head');
      heading.append(element('h3', check.label), element('span', RESULTS[check.result], 'result ' + check.result));
      item.append(heading);
      if (check.action) item.append(element('p', 'Corrective action: ' + check.action, 'preserve'));
      section.append(item);
    }
    return section;
  });
  container.replaceChildren(header, metadata, summary, ...sections);
  if (record.notes) {
    const notes = element('section', undefined, 'report-group');
    notes.append(element('h2', 'Inspection notes'), element('p', record.notes, 'preserve'));
    container.append(notes);
  }
}

function printReport(record) {
  renderReport(document.getElementById('report'), record);
  const title = document.title;
  document.title = 'SGM Inspection ' + record.date + ' ' + record.area.replace(/[^a-z0-9 -]/gi, '');
  try {
    window.print();
  } finally {
    document.title = title;
  }
}

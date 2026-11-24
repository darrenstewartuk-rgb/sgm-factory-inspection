'use strict';

const CHECKLIST = {
  name: 'Starter checklist',
  version: '1',
  groups: [
    {
      name: 'Housekeeping and access',
      checks: [
        'Work areas are tidy and waste is stored in the designated containers.',
        'Walkways, emergency exits and access to fire equipment are clear.',
      ],
    },
    {
      name: 'Equipment and handling',
      checks: [
        'Machine guards and safety devices appear present and undamaged.',
        'Required personal protective equipment is available and in use.',
        'Glass and frames are stored securely on suitable racks or stillages.',
      ],
    },
    {
      name: 'Production quality',
      checks: [
        'A sample matches the job specification and can be identified by its job reference.',
        'Sampled welds, joints, finishes and visible surfaces meet the applicable quality standard.',
        'Sampled hardware and accessories match the job specification where applicable.',
        'Non-conforming items are identified and segregated for review.',
      ],
    },
  ],
};

const FACTORY_AREAS = ['Unit 1', 'Unit 2', 'Unit 3', 'Unit 4', 'Unit 5', 'Unit 6', 'Despatch', 'Other'];
const RESULTS = { pass: 'Pass', fail: 'Fail', na: 'N/A' };

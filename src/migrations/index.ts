import * as migration_20260629_060924_initial from './20260629_060924_initial';

export const migrations = [
  {
    up: migration_20260629_060924_initial.up,
    down: migration_20260629_060924_initial.down,
    name: '20260629_060924_initial'
  },
];

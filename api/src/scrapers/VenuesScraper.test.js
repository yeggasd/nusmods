import path from 'path';
import VenuesScraper from './VenuesScraper';

describe('VenuesScraper', () => {
  const scraper = new VenuesScraper();
  const FIELDS = ['school_id', 'name', 'type', 'owned_by'];

  describe('save', () => {
    beforeEach(async () => {
      const rootDir = path.resolve(__dirname, '../../');
      const migrationConfig = { directory: path.join(rootDir, 'migrations') };
      const seedConfig = { directory: path.join(rootDir, 'seeds') };
      await scraper.db.migrate.rollback(migrationConfig);
      await scraper.db.migrate.latest(migrationConfig);
      await scraper.db.seed.run(seedConfig);
    });

    it('should start out with empty db', async () => {
      expect(await scraper.db.table('venues').select(FIELDS)).toEqual([]);
    });

    it('should insert all venues if db is empty', async () => {
      const testData = [
        { school_id: 1, name: 'test', type: 'room', owned_by: 'me' },
        { school_id: 1, name: 'test1', type: 'room', owned_by: 'me' },
      ];
      await scraper.save([], testData);
      expect(await scraper.db.table('venues').select(FIELDS)).toEqual(testData);
    });

    it('should merge venues if db exists', async () => {
      const existingData = [
        { school_id: 1, name: 'test', type: 'room', owned_by: 'me' },
        { school_id: 1, name: 'test1', type: 'room', owned_by: 'me' },
      ];
      await scraper.db.table('venues').insert(existingData);
      const testData = [{ school_id: 1, name: 'test', type: 'room', owned_by: 'me' }];
      await scraper.save(existingData, testData);
      expect(await scraper.db.table('venues').select(FIELDS)).toEqual([existingData[0]]);
    });
  });

  describe('convertToRow', () => {
    it('should convert object to sql row equivalent', async () => {
      const row = scraper.convertToRow({
        roomcode: 'test',
        roomname: 'some room',
        dept: 'subway',
      });
      expect(() => scraper.db.table('venues').insert(row)).not.toThrow();
    });

    it('should warn if there is extra props', async () => {
      scraper.log.warn = jest.fn();
      scraper.convertToRow({
        roomcode: 'test',
        roomname: 'some room',
        dept: 'subway',
        surprise: '!',
      });
      expect(scraper.log.warn).toBeCalled();
    });
  });
});

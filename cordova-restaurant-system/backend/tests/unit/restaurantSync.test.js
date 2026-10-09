const fs = require('fs');

jest.mock('../../src/utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

const { syncToRestaurantTs } = require('../../src/services/restaurantSync.service');

const source = 'export const RESTAURANT_CUSTOMIZATIONS = {\n};\n\nexport function getAllStaticRestaurants() {}\n';

describe('restaurant coordinate sync', () => {
  let existsSpy;
  let readSpy;
  let writeSpy;

  beforeEach(() => {
    existsSpy = jest.spyOn(fs, 'existsSync').mockReturnValue(true);
    readSpy = jest.spyOn(fs, 'readFileSync').mockReturnValue(source);
    writeSpy = jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {});
  });

  afterEach(() => {
    existsSpy.mockRestore();
    readSpy.mockRestore();
    writeSpy.mockRestore();
  });

  test('omits both coordinates when either one is invalid', () => {
    expect(syncToRestaurantTs({ slug: 'test-cafe', name: 'Test Cafe', latitude: 'not-a-number', longitude: 123.94 })).toBe(true);
    const output = writeSpy.mock.calls[0][1];
    expect(output).not.toMatch(/latitude:|longitude:|NaN/);
  });

  test('writes a complete finite coordinate pair, including zero', () => {
    expect(syncToRestaurantTs({ slug: 'test-cafe', name: 'Test Cafe', latitude: 0, longitude: 123.94 })).toBe(true);
    const output = writeSpy.mock.calls[0][1];
    expect(output).toContain('latitude: 0,');
    expect(output).toContain('longitude: 123.94,');
  });
});

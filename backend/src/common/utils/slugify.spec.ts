import { slugify } from './slugify';

describe('slugify', () => {
  it('devrait convertir en minuscules', () => {
    expect(slugify('HELLO')).toBe('hello');
  });

  it('devrait remplacer les espaces par des tirets', () => {
    expect(slugify('hello world')).toBe('hello-world');
  });

  it('devrait supprimer les accents', () => {
    expect(slugify('éléphant à vélo')).toBe('elephant-a-velo');
    expect(slugify('Garçon de café')).toBe('garcon-de-cafe');
  });

  it('devrait supprimer les caractères non alphanumériques', () => {
    expect(slugify('hello @world!')).toBe('hello-world');
  });

  it('devrait condenser les tirets multiples', () => {
    expect(slugify('hello---world')).toBe('hello-world');
    expect(slugify('hello...world')).toBe('hello-world');
  });

  it('devrait supprimer les tirets de début et de fin', () => {
    expect(slugify('-hello-world-')).toBe('hello-world');
    expect(slugify('   hello-world   ')).toBe('hello-world');
  });
});

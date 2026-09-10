import { hasMajorChange } from './has-major-change';

describe('hasMajorChange', () => {
  it('retourne false si aucun champ majeur n est present dans la mise a jour', () => {
    const existing = { nom: 'A', telephone: '123' };
    const incoming = { telephone: '456' };
    expect(hasMajorChange(existing, incoming, ['nom'])).toBe(false);
  });

  it('retourne false si le champ majeur est present mais identique', () => {
    const existing = { nom: 'A', telephone: '123' };
    const incoming = { nom: 'A', telephone: '456' };
    expect(hasMajorChange(existing, incoming, ['nom'])).toBe(false);
  });

  it('retourne true si un champ majeur a reellement change', () => {
    const existing = { nom: 'A', telephone: '123' };
    const incoming = { nom: 'B', telephone: '123' };
    expect(hasMajorChange(existing, incoming, ['nom'])).toBe(true);
  });

  it('compare les tableaux par contenu, pas par reference ni par ordre', () => {
    const existing = { specialites: ['Sport', 'Fitness'] };
    expect(hasMajorChange(existing, { specialites: ['Fitness', 'Sport'] }, ['specialites'])).toBe(false);
    expect(hasMajorChange(existing, { specialites: ['Sport'] }, ['specialites'])).toBe(true);
  });
});

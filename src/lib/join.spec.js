import join from './join';


describe('join', () => {
  describe('for arrays of length 1', () => {
    it('should return the first element', () => {
      const meanings = [42];
      const customJoin = join('foo', 'bar');
      const results = `The meaning of life, the universe, and everything is ${customJoin(meanings)}.`;
      expect(results).toBe('The meaning of life, the universe, and everything is 42.');
    });
  });

  describe('for arrays of length 2', () => {
    it('should join the two elements using only penultimate separator', () => {
      const beverages = ['coffee', 'tea'];
      const orJoin = join(', ', ' or ');
      const results = `Do you prefer ${orJoin(beverages)}?`;
      expect(results).toBe('Do you prefer coffee or tea?');
    });
  });

  describe('for arrays of length N', () => {
    it('should join the elements, add the penultimate separator at position N-1', () => {
      const guests = ['the strippers', 'JFK', 'Stalin'];
      const andJoin = join(', ', ' and ');
      const results = `We invited ${andJoin(guests)}.`;
      expect(results).toBe('We invited the strippers, JFK, and Stalin.');
    });
  });
});

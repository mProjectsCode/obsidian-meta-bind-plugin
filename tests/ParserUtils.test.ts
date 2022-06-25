import {CharPair, ParserUtils} from '../src/utils/ParserUtils';

test('isStringAt', () => {
	expect(ParserUtils.isStringAt('aaa', 'a', 2)).toEqual(true);
	expect(ParserUtils.isStringAt('aba', 'b', 1)).toEqual(true);
	expect(ParserUtils.isStringAt('aba', 'ba', 1)).toEqual(true);
	expect(ParserUtils.isStringAt('aba', 'a', 1)).toEqual(false);
	expect(ParserUtils.isStringAt('aaa', 'ab', 0)).toEqual(false);
});

test('sliceInBetween', () => {
	expect(ParserUtils.sliceInBetween('a[asd]a', new CharPair('[', ']'))).toEqual('asd');
	expect(ParserUtils.sliceInBetween('[asd]', new CharPair('[', ']'))).toEqual('asd');
	expect(ParserUtils.sliceInBetween('aasda', new CharPair('[', ']'))).toEqual('');
	expect(ParserUtils.sliceInBetween('a[asda', new CharPair('[', ']'))).toEqual('');
	expect(ParserUtils.sliceInBetween('aasd]a', new CharPair('[', ']'))).toEqual('');

	expect(ParserUtils.sliceInBetween('a[(asd]a', new CharPair('[(', ']'))).toEqual('asd');
	expect(ParserUtils.sliceInBetween('[(asd]', new CharPair('[(', ']'))).toEqual('asd');
	expect(ParserUtils.sliceInBetween('aasda', new CharPair('[(', ']'))).toEqual('');
	expect(ParserUtils.sliceInBetween('a[(asda', new CharPair('[(', ']'))).toEqual('');
	expect(ParserUtils.sliceInBetween('aasd]a', new CharPair('[(', ']'))).toEqual('');

	expect(() => ParserUtils.sliceInBetween('', new CharPair('[', ']'))).toThrow();
	expect(() => ParserUtils.sliceInBetween('aasd]a', new CharPair('', ']'))).toThrow();
	expect(() => ParserUtils.sliceInBetween('aasd]a', new CharPair('[', ''))).toThrow();
	expect(() => ParserUtils.sliceInBetween('aasd]a', new CharPair('[', '['))).toThrow();

});

test('split', () => {
	expect(ParserUtils.split('a:aa', ':')).toEqual(['a', 'aa']);
	expect(ParserUtils.split('a->aa', '->')).toEqual(['a', 'aa']);
	expect(ParserUtils.split('a[b:b]:aa', ':', [new CharPair('[', ']')])).toEqual(['a', 'aa']);
	expect(ParserUtils.split('a[(b:b)]:aa', ':', [new CharPair('[(', ')]')])).toEqual(['a', 'aa']);
	expect(ParserUtils.split('a[(b:b{b)]c}c)]:aa', ':', [
		new CharPair('[(', ')]'),
		new CharPair('{', '}'),
	])).toEqual(['a', 'aa']);
	expect(ParserUtils.split('a[(b:b[(b:c)]:c)]:aa', ':', [
		new CharPair('[(', ')]'),
		new CharPair('{', '}'),
	])).toEqual(['a', 'aa']);
	expect(ParserUtils.split('a[(b->b[(b->c)]->c)]->aa', '->', [
		new CharPair('[(', ')]'),
		new CharPair('{', '}'),
	])).toEqual(['a', 'aa']);

	expect(() => ParserUtils.split('', ':')).toThrow();
	expect(() => ParserUtils.split('a', '')).toThrow();
	expect(() => ParserUtils.split('a', ':', [
		new CharPair('[(', '[('),
	])).toThrow();
	expect(() => ParserUtils.split('a:aa', ':', [
		new CharPair('[(', '[('),
	])).toThrow();
	expect(() => ParserUtils.split('a:aa', ':', [
		new CharPair('[(', ')]'),
		new CharPair('[(', '}'),
	])).toThrow();
	expect(() => ParserUtils.split('a:aa', ':', [
		new CharPair('[(', ')]'),
		new CharPair('{', '[('),
	])).toThrow();
});


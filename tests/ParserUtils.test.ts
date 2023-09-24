import { EnclosingPair, ParserUtils } from '../src/utils/ParserUtils';

test('isStringAt', () => {
	expect(ParserUtils.isStringAt('aaa', 'a', 2)).toEqual(true);
	expect(ParserUtils.isStringAt('aba', 'b', 1)).toEqual(true);
	expect(ParserUtils.isStringAt('aba', 'ba', 1)).toEqual(true);
	expect(ParserUtils.isStringAt('aba', 'a', 1)).toEqual(false);
	expect(ParserUtils.isStringAt('aaa', 'ab', 0)).toEqual(false);
});

test('contains', () => {
	expect(ParserUtils.contains('aaa', 'a')).toEqual(true);
	expect(ParserUtils.contains('aba', 'b')).toEqual(true);
	expect(ParserUtils.contains('aba', 'ba')).toEqual(true);
	expect(ParserUtils.contains('aba', 'ac')).toEqual(false);
	expect(ParserUtils.contains('aaa', 'b')).toEqual(false);
});

test('numberOfOccurrences', () => {
	expect(ParserUtils.numberOfOccurrences('aaa', 'a')).toEqual(3);
	expect(ParserUtils.numberOfOccurrences('aba', 'b')).toEqual(1);
	expect(ParserUtils.numberOfOccurrences('aba', 'ba')).toEqual(1);
	expect(ParserUtils.numberOfOccurrences('aba', 'ac')).toEqual(0);
	expect(ParserUtils.numberOfOccurrences('aaa', 'b')).toEqual(0);
});

describe('removeInBetween', () => {
	test('single length opening and closing strings', () => {
		expect(ParserUtils.removeInBetween('a[asd]c', new EnclosingPair('[', ']'))).toEqual('ac');
		expect(ParserUtils.removeInBetween('[asd]', new EnclosingPair('[', ']'))).toEqual('');
		expect(ParserUtils.removeInBetween('aasda', new EnclosingPair('[', ']'))).toEqual('aasda');
		expect(ParserUtils.removeInBetween('a[asda', new EnclosingPair('[', ']'))).toEqual('a[asda');
		expect(ParserUtils.removeInBetween('aasd]a', new EnclosingPair('[', ']'))).toEqual('aasd]a');
		expect(ParserUtils.removeInBetween('aa]sd[a', new EnclosingPair('[', ']'))).toEqual('aa]sd[a');
		expect(ParserUtils.removeInBetween('aa]sd[a]', new EnclosingPair('[', ']'))).toEqual('aa]sd');
		expect(ParserUtils.removeInBetween('aa[a]sda]', new EnclosingPair('[', ']'))).toEqual('aasda]');
		expect(ParserUtils.removeInBetween('aa[a]sd[a]', new EnclosingPair('[', ']'))).toEqual('aasd');
	});

	test('multi length opening and single closing strings', () => {
		expect(ParserUtils.removeInBetween('a[(asd]c', new EnclosingPair('[(', ']'))).toEqual('ac');
		expect(ParserUtils.removeInBetween('[(asd]', new EnclosingPair('[(', ']'))).toEqual('');
		expect(ParserUtils.removeInBetween('aasda', new EnclosingPair('[(', ']'))).toEqual('aasda');
		expect(ParserUtils.removeInBetween('a[(asda', new EnclosingPair('[(', ']'))).toEqual('a[(asda');
		expect(ParserUtils.removeInBetween('aasd]a', new EnclosingPair('[(', ']'))).toEqual('aasd]a');
		expect(ParserUtils.removeInBetween('aa]sd[(a', new EnclosingPair('[(', ']'))).toEqual('aa]sd[(a');
		expect(ParserUtils.removeInBetween('aa]sd[(a]', new EnclosingPair('[(', ']'))).toEqual('aa]sd');
		expect(ParserUtils.removeInBetween('aa[(a]sda]', new EnclosingPair('[(', ']'))).toEqual('aasda]');
		expect(ParserUtils.removeInBetween('aa[(a]sd[(a]', new EnclosingPair('[(', ']'))).toEqual('aasd');
	});

	test('multi length opening and closing strings', () => {
		expect(ParserUtils.removeInBetween('a[(asd--]c', new EnclosingPair('[(', '--]'))).toEqual('ac');
		expect(ParserUtils.removeInBetween('[(asd--]', new EnclosingPair('[(', '--]'))).toEqual('');
		expect(ParserUtils.removeInBetween('aasda', new EnclosingPair('[(', '--]'))).toEqual('aasda');
		expect(ParserUtils.removeInBetween('a[(asda', new EnclosingPair('[(', '--]'))).toEqual('a[(asda');
		expect(ParserUtils.removeInBetween('aasd--]a', new EnclosingPair('[(', '--]'))).toEqual('aasd--]a');
		expect(ParserUtils.removeInBetween('aa--]sd[(a', new EnclosingPair('[(', '--]'))).toEqual('aa--]sd[(a');
		expect(ParserUtils.removeInBetween('aa--]sd[(a--]', new EnclosingPair('[(', '--]'))).toEqual('aa--]sd');
		expect(ParserUtils.removeInBetween('aa[(a--]sda--]', new EnclosingPair('[(', '--]'))).toEqual('aasda--]');
		expect(ParserUtils.removeInBetween('aa[(a--]sd[(a--]', new EnclosingPair('[(', '--]'))).toEqual('aasd');
	});

	test('same opening and closing strings', () => {
		expect(ParserUtils.removeInBetween('a"asd"c', new EnclosingPair('"'))).toEqual('ac');
		expect(ParserUtils.removeInBetween('"asd"', new EnclosingPair('"'))).toEqual('');
		expect(ParserUtils.removeInBetween('aasda', new EnclosingPair('"'))).toEqual('aasda');
		expect(ParserUtils.removeInBetween('a"asda', new EnclosingPair('"'))).toEqual('a"asda');
		expect(ParserUtils.removeInBetween('aasd"a', new EnclosingPair('"'))).toEqual('aasd"a');
		expect(ParserUtils.removeInBetween('aa"s"d"a"', new EnclosingPair('"'))).toEqual('aad');
		expect(ParserUtils.removeInBetween('aa"s"d"a', new EnclosingPair('"'))).toEqual('aad"a');
		expect(ParserUtils.removeInBetween('"a"a"s"d"a', new EnclosingPair('"'))).toEqual('ad"a');
	});

	test('expect errors', () => {
		expect(() => ParserUtils.getInBetween('', new EnclosingPair('[', ']'))).toThrow();
		expect(() => ParserUtils.getInBetween('aasd]a', new EnclosingPair('', ']'))).toThrow();
	});
});

describe('getInBetween', () => {
	test('single length opening and closing strings', () => {
		expect(ParserUtils.getInBetween('a[asd]a', new EnclosingPair('[', ']'))).toEqual('asd');
		expect(ParserUtils.getInBetween('[asd]', new EnclosingPair('[', ']'))).toEqual('asd');
		expect(ParserUtils.getInBetween('aasda', new EnclosingPair('[', ']'))).toEqual('');
		expect(ParserUtils.getInBetween('a[asda', new EnclosingPair('[', ']'))).toEqual('');
		expect(ParserUtils.getInBetween('aasd]a', new EnclosingPair('[', ']'))).toEqual('');
		expect(ParserUtils.getInBetween('aa]sd[a', new EnclosingPair('[', ']'))).toEqual('');
		expect(ParserUtils.getInBetween('aa]sd[a]', new EnclosingPair('[', ']'))).toEqual('a');
		expect(ParserUtils.getInBetween('aa[a]sda]', new EnclosingPair('[', ']'))).toEqual('a');
		expect(ParserUtils.getInBetween('aa[a]sd[a]', new EnclosingPair('[', ']'))).toEqual(['a', 'a']);
		expect(ParserUtils.getInBetween('aa[a[sd]a]', new EnclosingPair('[', ']'))).toEqual('a[sd]a');
		expect(ParserUtils.getInBetween('slider(addLabels, minValue(10), maxValue(60))', new EnclosingPair('(', ')'))).toEqual(
			'addLabels, minValue(10), maxValue(60)'
		);
	});

	test('multi length opening and single closing strings', () => {
		expect(ParserUtils.getInBetween('a[(asd]a', new EnclosingPair('[(', ']'))).toEqual('asd');
		expect(ParserUtils.getInBetween('[(asd]', new EnclosingPair('[(', ']'))).toEqual('asd');
		expect(ParserUtils.getInBetween('aasda', new EnclosingPair('[(', ']'))).toEqual('');
		expect(ParserUtils.getInBetween('a[(asda', new EnclosingPair('[(', ']'))).toEqual('');
		expect(ParserUtils.getInBetween('aasd]a', new EnclosingPair('[(', ']'))).toEqual('');
		expect(ParserUtils.getInBetween('aa]sd[(a', new EnclosingPair('[(', ']'))).toEqual('');
		expect(ParserUtils.getInBetween('aa]sd[(a]', new EnclosingPair('[(', ']'))).toEqual('a');
		expect(ParserUtils.getInBetween('aa[(a]sda]', new EnclosingPair('[(', ']'))).toEqual('a');
		expect(ParserUtils.getInBetween('aa[(a]sd[(a]', new EnclosingPair('[(', ']'))).toEqual(['a', 'a']);
		expect(ParserUtils.getInBetween('aa[(a[(sd]a]', new EnclosingPair('[(', ']'))).toEqual('a[(sd]a');
	});

	test('multi length opening and closing strings', () => {
		expect(ParserUtils.getInBetween('a[(asd--]a', new EnclosingPair('[(', '--]'))).toEqual('asd');
		expect(ParserUtils.getInBetween('[(asd--]', new EnclosingPair('[(', '--]'))).toEqual('asd');
		expect(ParserUtils.getInBetween('aasda', new EnclosingPair('[(', '--]'))).toEqual('');
		expect(ParserUtils.getInBetween('a[(asda', new EnclosingPair('[(', '--]'))).toEqual('');
		expect(ParserUtils.getInBetween('aasd--]a', new EnclosingPair('[(', '--]'))).toEqual('');
		expect(ParserUtils.getInBetween('aa--]sd[(a', new EnclosingPair('[(', '--]'))).toEqual('');
		expect(ParserUtils.getInBetween('aa--]sd[(a--]', new EnclosingPair('[(', '--]'))).toEqual('a');
		expect(ParserUtils.getInBetween('aa[(a--]sda--]', new EnclosingPair('[(', '--]'))).toEqual('a');
		expect(ParserUtils.getInBetween('aa[(a--]sd[(a--]', new EnclosingPair('[(', '--]'))).toEqual(['a', 'a']);
		expect(ParserUtils.getInBetween('aa[(a[(sd--]a--]', new EnclosingPair('[(', '--]'))).toEqual('a[(sd--]a');
	});

	test('same opening and closing strings', () => {
		expect(ParserUtils.getInBetween('a"asd"a', new EnclosingPair('"'))).toEqual('asd');
		expect(ParserUtils.getInBetween('"asd"', new EnclosingPair('"'))).toEqual('asd');
		expect(ParserUtils.getInBetween('aasda', new EnclosingPair('"'))).toEqual('');
		expect(ParserUtils.getInBetween('a"asda', new EnclosingPair('"'))).toEqual('');
		expect(ParserUtils.getInBetween('aasd"a', new EnclosingPair('"'))).toEqual('');
		expect(ParserUtils.getInBetween('aa"s"d"a"', new EnclosingPair('"'))).toEqual(['s', 'a']);
		expect(ParserUtils.getInBetween('aa"s"d"a', new EnclosingPair('"'))).toEqual('s');
		expect(ParserUtils.getInBetween('"a"a"s"d"a', new EnclosingPair('"'))).toEqual(['a', 's']);
	});

	test('expect errors', () => {
		expect(() => ParserUtils.getInBetween('', new EnclosingPair('[', ']'))).toThrow();
		expect(() => ParserUtils.getInBetween('aasd]a', new EnclosingPair('', ']'))).toThrow();
	});
});

describe('split', () => {
	test('simple split, single length separator', () => {
		expect(ParserUtils.split('a:aa', ':')).toEqual(['a', 'aa']);
	});

	test('simple split, multi length separator', () => {
		expect(ParserUtils.split('a->aa', '->')).toEqual(['a', 'aa']);
	});

	test('single length separator, single ignore', () => {
		expect(ParserUtils.split('a[b:b]:aa', ':', new EnclosingPair('[', ']'))).toEqual(['a[b:b]', 'aa']);
	});

	test('single length separator, single ignore 2', () => {
		expect(ParserUtils.split('a[]:aa', ':', new EnclosingPair('[', ']'))).toEqual(['a[]', 'aa']);
	});

	test('single length separator, single ignore 3', () => {
		expect(ParserUtils.split('a[:]:aa', ':', new EnclosingPair('[', ']'))).toEqual(['a[:]', 'aa']);
	});

	test('single length separator, single ignore, wrong order', () => {
		expect(ParserUtils.split('a]b:b[:aa', ':', new EnclosingPair('[', ']'))).toEqual(['a]b', 'b[', 'aa']);
	});

	test('single length separator, single multi length ignore', () => {
		expect(ParserUtils.split('a[(b:b)]:aa', ':', new EnclosingPair('[(', ')]'))).toEqual(['a[(b:b)]', 'aa']);
	});

	test('single length separator, single length self closing ignore', () => {
		expect(ParserUtils.split('a"b:b":aa', ':', new EnclosingPair('"'))).toEqual(['a"b:b"', 'aa']);
	});

	test('single length separator, multi length stacked ignore', () => {
		expect(ParserUtils.split('a[(b:b[(b:c)]:c)]:aa', ':', new EnclosingPair('[(', ')]'))).toEqual(['a[(b:b[(b:c)]:c)]', 'aa']);
	});

	test('multi length separator, multi length stacked ignore', () => {
		expect(ParserUtils.split('a[(b->b[(b->c)]->c)]->aa', '->', new EnclosingPair('[(', ')]'))).toEqual(['a[(b->b[(b->c)]->c)]', 'aa']);
	});

	describe('expect errors', () => {
		test('empty arguments', () => {
			expect(() => ParserUtils.split('', ':')).toThrow();
			expect(() => ParserUtils.split('a', '')).toThrow();
		});
	});
});

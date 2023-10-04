module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'jsdom',
	moduleDirectories: ['node_modules', 'src'],
	verbose: true,
	setupFilesAfterEnv: ['<rootDir>/tests/CustomMatchers/jest.custom_matchers.setup.ts'],
};

# Unit Tests for HealthFitnessPro Front Page

This directory contains all unit tests for the front page JavaScript functionality.

## Structure

```
tests/
├── jest.config.js       # Jest configuration
├── jest.setup.js        # Global test setup and initialization
├── script.test.js       # Tests for script.js functions
└── README.md           # This file
```

## Overview

The test suite validates the `loadExercises()` function in `script.js`, which is responsible for fetching exercise data from the backend API.

## Test Coverage

The tests cover:
- ✅ Fetching all exercises when no filter is provided
- ✅ Fetching exercises filtered by body part (CHEST, BACK, LEGS, SHOULDERS, BICEPS, TRICEPS, ABS)
- ✅ Proper data transformation from API response format to application format
- ✅ Storage of exercises in the global `exercises` array
- ✅ Error handling for network failures
- ✅ Handling of empty responses
- ✅ Processing multiple exercises in a single response

## Installation

1. Install dependencies:
```bash
npm install
```

This will install:
- **Jest** - Testing framework
- **babel-jest** - JavaScript transpiler for Jest
- **jest-environment-jsdom** - DOM environment for browser-like testing

## Running Tests

From the project root directory:

### Run all tests once:
```bash
npm test
```

### Run tests in watch mode (re-run on file changes):
```bash
npm run test:watch
```

### Generate coverage report:
```bash
npm run test:coverage
```

### Debug tests:
```bash
npm run test:debug
```

## Test Structure

All tests are located in this directory:
- `script.test.js` - Tests for `script.js` exercise loading functions

## Key Test Examples

### Example 1: Testing successful exercise fetch
```javascript
test('should fetch all exercises when no body part is specified', async () => {
  const mockData = [{
    id: '1',
    name: 'Bench Press',
    target: 'Chest',
    equipment: 'Barbell',
    instructions: 'Lie on bench, press bar up',
    gifUrl: 'http://example.com/bench-press.gif'
  }];

  fetch.mockResolvedValueOnce({
    json: jest.fn().mockResolvedValueOnce(mockData)
  });

  const result = await loadExercises();
  expect(fetch).toHaveBeenCalledWith('http://127.0.0.1:8000/exercises');
});
```

### Example 2: Testing error handling
```javascript
test('should handle fetch errors gracefully', async () => {
  const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  fetch.mockRejectedValueOnce(new Error('Network error'));

  const result = await loadExercises();
  expect(consoleErrorSpy).toHaveBeenCalled();
});
```

## Mocking Strategy

The tests use Jest's mocking capabilities to:
1. **Mock the fetch API** - Simulates backend responses without making actual API calls
2. **Spy on console methods** - Captures console output for verification
3. **Clear mocks between tests** - Ensures test isolation

## Notes for Development

- The `script.js` is loaded and exported in `jest.setup.js`
- The `exercises` global variable is initialized and shared across tests
- All API calls are mocked, so the backend doesn't need to be running for tests

## Future Test Enhancements

Consider adding tests for:
- DOM manipulation functions (if added to script.js)
- Button click handlers
- Navigation functionality
- UI state management
- Integration tests with the HTML elements

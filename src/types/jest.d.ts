// Déclarations de types pour Jest
declare namespace Jest {
  interface Matchers<R> {
    toBeInTheDocument(): R;
    toBeVisible(): R;
    toBeInViewport(): R;
    toHaveTextContent(text: string | RegExp): R;
    toHaveAttribute(attr: string, value?: any): R;
    toHaveClass(...classNames: string[]): R;
    toHaveStyle(css: string | Record<string, any>): R;
    toBeDisabled(): R;
    toBeEnabled(): R;
    toBeEmptyDOMElement(): R;
    toBeChecked(): R;
    toBePartiallyChecked(): R;
    toBeInvalid(): R;
    toBeRequired(): R;
    toBeValid(): R;
    toContainElement(element: HTMLElement | null): R;
    toContainHTML(htmlText: string): R;
    toHaveDisplayValue(value: string | string[] | RegExp): R;
    toHaveFormValues(expectedValues: Record<string, any>): R;
    toHaveValue(value?: string | string[] | number | null): R;
    toHaveFocus(): R;
    toHaveBeenCalled(): R;
    toHaveBeenCalledTimes(expected: number): R;
    toHaveBeenCalledWith(...args: any[]): R;
    toHaveBeenLastCalledWith(...args: any[]): R;
    toHaveBeenNthCalledWith(nth: number, ...args: any[]): R;
    toHaveReturned(): R;
    toHaveReturnedTimes(times: number): R;
    toHaveReturnedWith(value: any): R;
    toHaveLastReturnedWith(value: any): R;
    toHaveNthReturnedWith(n: number, value: any): R;
    toHaveLength(length: number): R;
    toHaveProperty(keyPath: string | string[], value?: any): R;
    toBeCloseTo(number: number, numDigits?: number): R;
    toBeDefined(): R;
    toBeFalsy(): R;
    toBeGreaterThan(number: number): R;
    toBeGreaterThanOrEqual(number: number): R;
    toBeLessThan(number: number): R;
    toBeLessThanOrEqual(number: number): R;
    toBeInstanceOf(classType: any): R;
    toBeNull(): R;
    toBeTruthy(): R;
    toBeUndefined(): R;
    toBeNaN(): R;
    toContain(item: any): R;
    toContainEqual(item: any): R;
    toEqual(value: any): R;
    toMatch(regexp: RegExp | string): R;
    toMatchObject(object: Record<string, any> | any[]): R;
    toMatchSnapshot(propertyMatchers?: Record<string, any>, name?: string): R;
    toStrictEqual(value: any): R;
    toThrow(error?: string | Error | RegExp | (() => any)): R;
    toThrowError(error?: string | Error | RegExp | (() => any)): R;
    toThrowErrorMatchingSnapshot(hint?: string): R;
    toThrowErrorMatchingInlineSnapshot(snapshot?: string): R;
    toMatchSnapshot(propertyMatchers?: Record<string, any>, name?: string): R;
    toMatchInlineSnapshot(snapshot?: string): R;
  }
}

// Déclarations globales pour les fonctions de test
declare var describe: {
  (name: string, fn: () => void): void;
  each: (table: any, tag?: string) => (name: string, fn: (...args: any[]) => any, timeout?: number) => void;
  only: {
    (name: string, fn: () => void): void;
    each: (table: any, tag?: string) => (name: string, fn: (...args: any[]) => any, timeout?: number) => void;
  };
  skip: {
    (name: string, fn: () => void): void;
    each: (table: any, tag?: string) => (name: string, fn: (...args: any[]) => any, timeout?: number) => void;
  };
  concurrent: {
    (name: string, fn: () => Promise<any>): void;
    each: (table: any, tag?: string) => (name: string, fn: (...args: any[]) => any, timeout?: number) => void;
    only: {
      (name: string, fn: () => Promise<any>): void;
      each: (table: any, tag?: string) => (name: string, fn: (...args: any[]) => any, timeout?: number) => void;
    };
    skip: {
      (name: string, fn: () => Promise<any>): void;
      each: (table: any, tag?: string) => (name: string, fn: (...args: any[]) => any, timeout?: number) => void;
    };
  };
};

declare var it: {
  (name: string, fn: (...args: any[]) => any, timeout?: number): void;
  each: (table: any, tag?: string) => (name: string, fn: (...args: any[]) => any, timeout?: number) => void;
  only: {
    (name: string, fn: (...args: any[]) => any, timeout?: number): void;
    each: (table: any, tag?: string) => (name: string, fn: (...args: any[]) => any, timeout?: number) => void;
  };
  skip: {
    (name: string, fn: (...args: any[]) => any, timeout?: number): void;
    each: (table: any, tag?: string) => (name: string, fn: (...args: any[]) => any, timeout?: number) => void;
  };
  todo: (name: string) => void;
};

declare var test: typeof it;

declare var expect: {
  (actual: any): Jest.Matchers<any>;
  any(constructor: any): any;
  anything(): any;
  arrayContaining(arr: any[]): any;
  assertions(count: number): void;
  extend(matchers: Record<string, any>): void;
  hasAssertions(): void;
  objectContaining(obj: Record<string, any>): any;
  stringContaining(str: string): any;
  stringMatching(regexp: RegExp | string): any;
  addSnapshotSerializer(serializer: any): void;
  addEqualityTesters(testers: Array<(a: any, b: any) => boolean | undefined>): void;
};

declare var beforeAll: (fn: () => void | Promise<void>, timeout?: number) => void;
declare var afterAll: (fn: () => void | Promise<void>, timeout?: number) => void;
declare var beforeEach: (fn: () => void | Promise<void>, timeout?: number) => void;
declare var afterEach: (fn: () => void | Promise<void>, timeout?: number) => void;

declare var jest: {
  autoMockOff(): typeof jest;
  autoMockOn(): typeof jest;
  clearAllMocks(): typeof jest;
  clearAllTimers(): void;
  createMockFromModule(moduleName: string): any;
  deepUnmock(moduleName: string): typeof jest;
  disableAutomock(): typeof jest;
  doMock(moduleName: string, factory?: () => any, options?: { virtual?: boolean }): typeof jest;
  dontMock(moduleName: string): typeof jest;
  enableAutomock(): typeof jest;
  fn: {
    (implementation?: (...args: any[]) => any): jest.Mock;
    <T>(implementation: (...args: any[]) => T): jest.Mock<T>;
  };
  genMockFromModule(moduleName: string): any;
  isMockFunction(fn: any): fn is jest.Mock;
  isolateModules(fn: () => void): typeof jest;
  mock(moduleName: string, factory?: () => any, options?: { virtual?: boolean }): typeof jest;
  mock<T>(moduleName: string, factory?: () => T, options?: { virtual?: boolean }): typeof jest;
  mocked: {
    <T>(item: T, options?: { shallow: false }): T & { [K in keyof T]: T[K] };
    <T>(item: T, options: { shallow: true }): T & { [K in keyof T]: T[K] };
  };
  requireActual(moduleName: string): any;
  requireMock(moduleName: string): any;
  resetAllMocks(): typeof jest;
  resetModules(): typeof jest;
  restoreAllMocks(): typeof jest;
  retryTimes(numRetries: number): typeof jest;
  runAllImmediates(): void;
  runAllTicks(): void;
  runAllTimers(): void;
  runOnlyPendingTimers(): void;
  setMock(moduleName: string, moduleExports: any): typeof jest;
  setSystemTime(now?: number | Date): void;
  setTimeout(timeout: number): typeof jest;
  spyOn(object: any, methodName: string, accessType?: 'get' | 'set'): jest.SpyInstance;
  unmock(moduleName: string): typeof jest;
  useFakeTimers(implementation?: 'modern' | 'legacy'): typeof jest;
  useRealTimers(): typeof jest;
};

declare namespace jest {
  interface Mock<T = any> extends Function, MockInstance<T> {
    new (...args: any[]): T;
    (...args: any[]): any;
  }

  interface MockInstance<T = any> {
    mock: MockContext<T>;
    mockClear(): void;
    mockReset(): void;
    mockRestore(): void;
    mockImplementation(fn: (...args: any[]) => any): Mock<T>;
    mockImplementationOnce(fn: (...args: any[]) => any): Mock<T>;
    mockName(name: string): Mock<T>;
    mockReturnThis(): Mock<T>;
    mockReturnValue(value: any): Mock<T>;
    mockReturnValueOnce(value: any): Mock<T>;
    mockResolvedValue(value: any): Mock<Promise<any>>;
    mockResolvedValueOnce(value: any): Mock<Promise<any>>;
    mockRejectedValue(value: any): Mock<Promise<any>>;
    mockRejectedValueOnce(value: any): Mock<Promise<any>>;
    mockReturnThis(): Mock<T>;
    getMockName(): string;
  }

  interface MockContext<T = any> {
    calls: any[][];
    instances: T[];
    invocationCallOrder: number[];
    results: Array<{ type: 'return' | 'throw'; value: any }>;
  }

  interface SpyInstance<T = any> extends MockInstance<T> {
    mockRestore(): void;
  }
}

// Déclaration pour les fonctions d'assertion
declare function fail(error?: any): never;

// Déclaration pour les fonctions de test asynchrones
declare function test(name: string, fn: (done: (error?: any) => void) => any, timeout?: number): void;

// Déclaration pour les fonctions de test concurrents
declare function concurrent(name: string, fn: () => Promise<any>): void;

// Déclaration pour les fonctions de test de performance
declare function benchmark(name: string, fn: () => void): void;

// Déclaration pour les fonctions de test de charge
declare function loadTest(name: string, fn: () => void): void;

// Déclaration pour les fonctions de test de charge
declare function stressTest(name: string, fn: () => void): void;

// Déclaration pour les fonctions de test de charge
declare function performanceTest(name: string, fn: () => void): void;

// Déclaration pour les fonctions de test de charge
declare function integrationTest(name: string, fn: () => void): void;

// Déclaration pour les fonctions de test de charge
declare function e2eTest(name: string, fn: () => void): void;

// Déclaration pour les fonctions de test de charge
declare function smokeTest(name: string, fn: () => void): void;

// Déclaration pour les fonctions de test de charge
declare function regressionTest(name: string, fn: () => void): void;

// Déclaration pour les fonctions de test de charge
declare function securityTest(name: string, fn: () => void): void;

// Déclaration pour les fonctions de test de charge
declare function accessibilityTest(name: string, fn: () => void): void;

// Déclaration pour les fonctions de test de charge
declare function visualTest(name: string, fn: () => void): void;

// Déclaration pour les fonctions de test de charge
declare function apiTest(name: string, fn: () => void): void;

// Déclaration pour les fonctions de test de charge
declare function unitTest(name: string, fn: () => void): void;

// Déclaration pour les fonctions de test de charge
declare function componentTest(name: string, fn: () => void): void;

// Déclaration pour les fonctions de test de charge
declare function contractTest(name: string, fn: () => void): void;

// Déclaration pour les fonctions de test de charge
declare function mutationTest(name: string, fn: () => void): void;

// Déclaration pour les fonctions de test de charge
declare function propertyTest(name: string, fn: () => void): void;

// Déclaration pour les fonctions de test de charge
declare function snapshotTest(name: string, fn: () => void): void;

// Déclaration pour les fonctions de test de charge
declare function specTest(name: string, fn: () => void): void;

// Déclaration pour les fonctions de test de charge
declare function storyTest(name: string, fn: () => void): void;

// Déclaration pour les fonctions de test de charge
declare function testStep(name: string, fn: () => void): void;

// Déclaration pour les fonctions de test de charge
declare function testCase(name: string, fn: () => void): void;

// Déclaration pour les fonctions de test de charge
declare function testSuite(name: string, fn: () => void): void;

// Déclaration pour les fonctions de test de charge
declare function testFixture(name: string, fn: () => void): void;

// Déclaration pour les fonctions de test de charge
declare function testHarness(name: string, fn: () => void): void;

// Déclaration pour les fonctions de test de charge
declare function testRunner(name: string, fn: () => void): void;

// Déclaration pour les fonctions de test de charge
declare function testFramework(name: string, fn: () => void): void;

// Déclaration pour les fonctions de test de charge
declare function testEnvironment(name: string, fn: () => void): void;

// Déclaration pour les fonctions de test de charge
declare function testReporter(name: string, fn: () => void): void;

// Déclaration pour les fonctions de test de charge
declare function testRunnerOptions(name: string, fn: () => void): void;

// Déclaration pour les fonctions de test de charge
declare function testRunnerConfig(name: string, fn: () => void): void;

// Déclaration pour les fonctions de test de charge
declare function testRunnerContext(name: string, fn: () => void): void;

// Déclaration pour les fonctions de test de charge
declare function testRunnerHooks(name: string, fn: () => void): void;

// Déclaration pour les fonctions de test de charge
declare function testRunnerPlugins(name: string, fn: () => void): void;

// Déclaration pour les fonctions de test de charge
declare function testRunnerUtils(name: string, fn: () => void): void;

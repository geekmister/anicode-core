import { Step } from './types';

export type GeneratorType = Generator<Step, void, unknown>;
export type GeneratorFn<T> = (input: T) => GeneratorType;
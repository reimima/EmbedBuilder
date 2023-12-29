/* eslint-disable @typescript-eslint/no-explicit-any */

export type NonAbstractConstructor<ReturnType = unknown> = new (...args: any[]) => ReturnType;

export type Constructor<ReturnType = unknown> =
    | NonAbstractConstructor<ReturnType>
    | (abstract new (...args: any[]) => ReturnType);

export type ClassDecorator<Target extends Constructor, ReturnType = unknown> = (
    target: Target,
) => ReturnType;

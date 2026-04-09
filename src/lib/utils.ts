import { clsx, type ClassValue } from "clsx";
import type { Action } from "svelte/action";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, "child"> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, "children"> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };

export const portal: Action<HTMLElement, HTMLElement | string | undefined> = (
	node,
	target = "body"
) => {
	if (typeof document === "undefined") {
		return {};
	}

	let currentTarget =
		typeof target === "string" ? document.querySelector(target) : target;

	if (currentTarget) {
		currentTarget.appendChild(node);
	}

	return {
		update(nextTarget) {
			const resolvedTarget =
				typeof nextTarget === "string" ? document.querySelector(nextTarget) : nextTarget;

			if (!resolvedTarget || resolvedTarget === currentTarget) {
				return;
			}

			resolvedTarget.appendChild(node);
			currentTarget = resolvedTarget;
		},
		destroy() {
			node.remove();
		}
	};
};

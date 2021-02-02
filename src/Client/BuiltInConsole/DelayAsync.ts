const RunService = game.GetService("RunService");

export function fspawn(fn: () => void) {
	return coroutine.wrap(fn)();
}

/**
 * Delays execution for a set amount of time
 *
 * ```ts
 * // Example usage:
 * delayAsync(10).then(() => {
 * 	print("Waited 10 seconds to execute this!");
 * });
 * ```
 *
 * You can also do
 *
 * ```ts
 * await delayAsync(10);
 * print("Waited 10 seconds!");
 * ```
 *
 * ----
 * This can also be cancelled.
 *
 * @param timeout The timeout
 * @param useRenderStepped To use renderStepped - for plugins iirc?
 */
export default function delayAsync(timeout?: number, useRenderStepped?: boolean): Promise<[number, number]> {
	return new Promise((resolve, _, onCancel) => {
		fspawn(() => {
			const endTime = tick() + (timeout !== undefined ? timeout : 1 / 60);
			let ticking = true;

			onCancel(() => {
				ticking = false;
			});

			while (tick() < endTime && ticking) {
				if (useRenderStepped) {
					RunService.RenderStepped.Wait();
				} else {
					RunService.Stepped.Wait();
				}
			}

			if (tick() >= endTime) {
				resolve([tick(), time()]);
			}
		});
	});
}

export function waitUntilDescendantOfGame(instance: Instance): Promise<Instance> {
	return Promise.defer((resolve) => {
		while (!instance.IsDescendantOf(game)) {
			RunService.Stepped.Wait();
		}
		resolve(instance.Parent!);
	});
}

/**
 * Replacement for `game.Debris:AddItem(x)`.
 * @param instance The instance to destroy
 * @param seconds The time to destroy it in
 */
export async function destroyAsync(instance: Instance, seconds = 0) {
	if (seconds > 0) {
		await delayAsync(seconds);
	}

	instance.IsDescendantOf(game) && instance.Destroy();
}

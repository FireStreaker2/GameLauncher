import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron";

const handler = {
	send(channel: string, value: unknown) {
		ipcRenderer.send(channel, value);
	},
	recieve: (channel: string, fn) => {
		let validChannels = ["execute"];
		if (validChannels.includes(channel)) {
			ipcRenderer.on(channel, (event, ...args) => fn(...args));
		}
	},
	on(channel: string, callback: (...args: unknown[]) => void) {
		const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
			callback(...args);
		ipcRenderer.on(channel, subscription);

		return () => {
			ipcRenderer.removeListener(channel, subscription);
		};
	},
};

contextBridge.exposeInMainWorld("ipc", handler);

export type IpcHandler = typeof handler;

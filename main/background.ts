import path from "path";
import { app, ipcMain } from "electron";
import serve from "electron-serve";
import { createWindow } from "./helpers";
import { exec } from "child_process";

const isProd = process.env.NODE_ENV === "production";

if (isProd) {
	serve({ directory: "app" });
} else {
	app.setPath("userData", `${app.getPath("userData")} (development)`);
}

(async () => {
	await app.whenReady();

	const mainWindow = createWindow("main", {
		width: 1000,
		height: 600,
		webPreferences: {
			preload: path.join(__dirname, "preload.js"),
			nodeIntegration: false,
			contextIsolation: true,
		},
	});

	if (isProd) {
		await mainWindow.loadURL("app://./home");
	} else {
		const port = process.argv[2];
		await mainWindow.loadURL(`http://localhost:${port}/`);
	}
})();

app.on("window-all-closed", () => {
	app.quit();
});

ipcMain.on("message", async (event, arg) => {
	event.reply("message", `${arg} World!`);
});

ipcMain.on("execute", (event, command: string) => {
	exec(command, (error, stdout, stderr) => {
		console.log(stdout);
	});
});

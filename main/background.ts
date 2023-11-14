import path from "path";
import { app, ipcMain } from "electron";
import serve from "electron-serve";
import { createWindow } from "./helpers";
import { spawn, ChildProcess } from "child_process";

type Data = string | Buffer;

const isProd = process.env.NODE_ENV === "production";
let runningProcess: ChildProcess = null;
let output: string[] = [];

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
		icon: path.join(__dirname, "/icon.svg"),
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
	if (runningProcess) {
		event.reply("execute-response", { error: "process is already running" });
		return;
	}

	runningProcess = spawn(command, [], { shell: true });

	runningProcess.stdout.on("data", (data: Data) => {
		output.push(data.toString());
	});

	runningProcess.stderr.on("data", (data: Data) => {
		output.push(data.toString());
	});

	runningProcess.on("close", (code: number) => {
		output.push(`[GAMELAUNCHER]: Closed with code ${code}`);
		runningProcess = null;
	});
});

ipcMain.on("stop", (event) => {
	if (runningProcess) {
		runningProcess.kill("SIGTERM");
		runningProcess = null;
		output = [];
		event.reply("stop-response", { message: "terminated" });
	} else {
		event.reply("stop-response", { message: "no process to stop" });
	}
});

ipcMain.on("get-logs", (event) => {
	runningProcess
		? event.reply("get-logs-response", output)
		: event.reply("get-logs-response", ["no current running game"]);
});

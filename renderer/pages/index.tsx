import { useState } from "react";

const run = (path: string) => {
	window.ipc.send("execute", path);
};

const Index: React.FC = () => {
	const [path, setPath] = useState("");

	const handleSubmit = (event: any) => {
		event.preventDefault();
	};

	return (
		<>
			<main>
				<form onSubmit={handleSubmit}>
					<input
						placeholder="path to executable"
						onChange={(event) => setPath(event.target.value.trim())}
					/>
					<input placeholder="other commands" />

					<button onClick={() => run(path)}>submit</button>
				</form>

				<h1>{path}</h1>
        <button>show logs</button>
			</main>
		</>
	);
};

export default Index;

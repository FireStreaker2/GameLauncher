import { FormEvent, useState } from "react";
import Head from "next/head";
import {
	Button,
	Code,
	Flex,
	FormControl,
	FormLabel,
	Icon,
	IconButton,
	Input,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	Text,
	useColorMode,
	useDisclosure,
	useToast,
} from "@chakra-ui/react";
import { SunIcon, MoonIcon } from "@chakra-ui/icons";
import {
	IoMdNotificationsOff,
	IoMdNotifications,
	IoLogoGameControllerB,
} from "react-icons/io";

const Index: React.FC = () => {
	const toast = useToast();
	const { colorMode, toggleColorMode } = useColorMode();
	const {
		isOpen: isNotifcationOpen,
		onOpen: onNotifcationOpen,
		onClose: onNotifcationClose,
	} = useDisclosure();
	const {
		isOpen: isLogsOpen,
		onOpen: onLogsOpen,
		onClose: onLogsClose,
	} = useDisclosure();
	const [path, setPath] = useState("");
	const [logs, setLogs] = useState<string[]>([]);
	const [isActive, setIsActive] = useState(false);
	const [showNotifications, setShowNotifications] = useState(true);

	const submit = (event?: FormEvent<HTMLFormElement>) => {
		event?.preventDefault();

		if (navigator.userAgent.toLowerCase().indexOf(" electron/") === -1) {
			toast({
				title: "Error",
				description: "Not an Electron environment!",
				status: "error",
				duration: 5000,
				isClosable: true,
			});
			return;
		}

		if (isActive) {
			setIsActive(false);
			window.ipc.send("stop", "");
			if (showNotifications) onNotifcationOpen();
		} else if (path === "") {
			toast({
				title: "Error",
				description: "Please enter a valid string",
				status: "error",
				duration: 5000,
				isClosable: true,
			});
		} else if (!isActive) {
			setIsActive(true);
			window.ipc.send("execute", path);
			if (showNotifications) onNotifcationOpen();
		}
	};

	return (
		<>
			<Head>
				<meta charSet="UTF-8" />
				<meta httpEquiv="X-UA-Compatible" content="IE=edge" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<meta
					name="description"
					content="Simple game launcher made with Next, Electron, and Chakra"
				/>
				<meta name="keywords" content="FireStreaker2, GameLauncher" />
				<meta name="copyright" content="FireStreaker2" />
				<meta property="og:title" content="GameLauncher" />
				<meta property="og:type" content="website" />
				<meta
					property="og:description"
					content="Simple game launcher made with Next, Electron, and Chakra"
				/>
				<meta name="theme-color" content="#000000" />
				<meta name="twitter:card" content="summary_large_image" />

				<title>GameLauncher</title>
				<link rel="icon" type="image/x-icon" href="/icon.svg" />
			</Head>
			<Flex h="100vh" direction="column" alignItems="center" textAlign="center">
				<Flex direction="column" m="6rem">
					<Text fontSize="6xl">GameLauncher</Text>
					<Text>
						Launch games now, quickly and easily{" "}
						<Icon as={IoLogoGameControllerB} />
					</Text>
				</Flex>

				<form onSubmit={submit}>
					<FormControl
						isRequired
						onSubmit={(event) => event.preventDefault()}
						w="30rem"
					>
						<Flex direction="column">
							<FormLabel>Script to execute</FormLabel>
							<Input
								textAlign="center"
								placeholder="/usr/bin/osu!"
								onChange={(event) => setPath(event.target.value.trim())}
							/>
							<Button
								mt="0.5rem"
								onClick={() => submit()}
								bg={isActive ? "red.500" : "green.500"}
							>
								{!isActive ? "Run" : "Stop"}
							</Button>
						</Flex>
					</FormControl>
				</form>

				<Flex
					bg="gray.500"
					w="30rem"
					h="5rem"
					justifyContent="center"
					rounded="10px"
					alignItems="center"
					m="5rem"
				>
					<Button
						isDisabled={!isActive}
						bg="gray.600"
						onClick={() => {
							onLogsOpen();
							window.ipc.send("get-logs", "");

							window.ipc.on("get-logs-response", (data: string[]) => {
								setLogs(data);
							});
						}}
					>
						Show Logs
					</Button>
					<Flex>
						<IconButton
							onClick={toggleColorMode}
							aria-label="Change Theme"
							icon={colorMode === "dark" ? <SunIcon /> : <MoonIcon />}
							ml="1rem"
							mr="1rem"
						/>
						<IconButton
							onClick={() => {
								showNotifications
									? setShowNotifications(false)
									: setShowNotifications(true);
							}}
							aria-label="Toggle Popups"
							icon={
								showNotifications ? (
									<IoMdNotificationsOff />
								) : (
									<IoMdNotifications />
								)
							}
						/>
					</Flex>
				</Flex>

				<Modal isOpen={isNotifcationOpen} onClose={onNotifcationClose}>
					<ModalOverlay />
					<ModalContent>
						<ModalHeader>
							{isActive ? "Game is now running..." : "Game has been stopped"}
						</ModalHeader>
						<ModalCloseButton />
						<ModalBody wordBreak="break-all">
							<Text>
								<Code>{path}</Code>{" "}
								{isActive
									? "is now running! If nothing happens try re-running the program."
									: "has been stopped."}
							</Text>
						</ModalBody>

						<ModalFooter>
							<Button onClick={onNotifcationClose}>Close</Button>
						</ModalFooter>
					</ModalContent>
				</Modal>

				<Modal isOpen={isLogsOpen} onClose={onLogsClose}>
					<ModalOverlay />
					<ModalContent>
						<ModalHeader>Game Logs</ModalHeader>
						<ModalCloseButton />
						<ModalBody wordBreak="break-all">
							<Text mb="0.5rem">
								Logs for <Code>{path}</Code>:
							</Text>

							<Code>
								{logs
									? logs.map((item) => (
											<Text>{`${new Date().toLocaleTimeString("en-US", {
												hour12: false,
												hour: "2-digit",
												minute: "2-digit",
												second: "2-digit",
											})} ${item} \n`}</Text>
									  ))
									: "No Logs"}
							</Code>
						</ModalBody>

						<ModalFooter>
							<Button onClick={onLogsClose}>Close</Button>
						</ModalFooter>
					</ModalContent>
				</Modal>
			</Flex>
		</>
	);
};

export default Index;

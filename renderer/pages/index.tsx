import { FormEvent, useState } from "react";
import Head from "next/head";
import {
	Button,
	Code,
	Flex,
	FormControl,
	FormLabel,
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
import { IoMdNotificationsOff, IoMdNotifications } from "react-icons/io";

const Index: React.FC = () => {
	const toast = useToast();
	const { colorMode, toggleColorMode } = useColorMode();
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [path, setPath] = useState("");
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
			if (showNotifications) onOpen();
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
			if (showNotifications) onOpen();
		}
	};

	return (
		<>
			<Head>
				<title>GameLauncher</title>
			</Head>
			<Flex h="100vh" direction="column" alignItems="center" textAlign="center">
				<Flex direction="column" m="6rem">
					<Text fontSize="6xl">GameLauncher</Text>
					<Text>Launch games now, quickly and easily</Text>
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
							<Button mt="0.5rem" onClick={() => submit()}>
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
					<Button isDisabled={!isActive}>Show Logs</Button>
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

				<Modal isOpen={isOpen} onClose={onClose}>
					<ModalOverlay />
					<ModalContent>
						<ModalHeader>
							{isActive ? "Game is now running..." : "Game has been stopped"}
						</ModalHeader>
						<ModalCloseButton />
						<ModalBody>
							{isActive ? (
								<Text>
									<Code>{path}</Code> is now running! If nothing happens try
									re-running the program.
								</Text>
							) : (
								<Text>
									<Code>{path}</Code> has been stopped.
								</Text>
							)}
						</ModalBody>

						<ModalFooter>
							<Button onClick={onClose}>Close</Button>
						</ModalFooter>
					</ModalContent>
				</Modal>
			</Flex>
		</>
	);
};

export default Index;

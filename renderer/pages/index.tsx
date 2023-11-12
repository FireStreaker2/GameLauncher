import { FormEvent, useState } from "react";
import Head from "next/head";
import {
	Button,
	Code,
	Flex,
	FormControl,
	FormLabel,
	Input,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	Text,
	useDisclosure,
	useToast,
} from "@chakra-ui/react";

const Index: React.FC = () => {
	const toast = useToast();
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [path, setPath] = useState("");
	const [isActive, setIsActive] = useState(false);

	const submit = (event?: FormEvent<HTMLFormElement>) => {
		event?.preventDefault();

		if (isActive) {
			setIsActive(false);
			onOpen();

			window.ipc.send("stop", "");
		} else if (path === "") {
			toast({
				title: "Error",
				description: "Please enter a valid string",
				status: "error",
				duration: 5000,
				isClosable: true,
			});
		} else if (!isActive) {
			window.ipc.send("execute", path);
			setIsActive(true);
			onOpen();
		}
	};

	return (
		<>
			<Head>
				<title>GameLauncher</title>
			</Head>
			<Flex h="100vh" direction="column" alignItems="center" textAlign="center">
				<Flex direction="column" m="5rem">
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

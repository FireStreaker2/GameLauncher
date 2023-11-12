import { useEffect } from "react";
import { useRouter } from "next/router";

const NotFound: React.FC = () => {
	const router = useRouter();

	useEffect(() => {
		router.push("/");
	});

	return <></>;
};

export default NotFound;

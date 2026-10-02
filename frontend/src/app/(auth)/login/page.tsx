import { LottieAnimation } from "@/components/lottie-animations/_lottie-animations";
import loginAnimation from "@/./../public/animations/Animation - 1747682284852 copy.json";
import { LoginForm } from "@/components/shared/auth-forms/login-forms";
export default async function LoginPage() {
	return (
		<div className="bg-linear-to-b from-indigo-200 to-white min-h-screen fixed top-0 left-0 w-full h-full">
			<div className="grid place-content-center min-h-screen">
				<div className="bg-white w-full  shadow-2xl flex rounded-md overflow-hidden">
					<div className=" rounded-l-md ">
						<LottieAnimation
							animationData={loginAnimation}
							loop={true}
							autoplay={true}
							style={{ width: 400, height: 400 }}
						/>
					</div>
					<div className="bbg-linear-to-br from-indigo-500 to-indigo-100  p-8 flex flex-col justify-center">
						<LoginForm />
					</div>
				</div>
			</div>
		</div>
	);
}

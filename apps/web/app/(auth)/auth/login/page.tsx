import FormWrapper from "@/app/(auth)/auth/components/FormWrapper";
import Testimonial from "@/app/(auth)/auth/components/Testimonial";
import { SigninForm } from "@/app/(auth)/auth/login/components/SigninForm";
import { Metadata } from "next";

import {
  AZURE_OAUTH_ENABLED,
  GITHUB_OAUTH_ENABLED,
  GOOGLE_OAUTH_ENABLED,
  SIGNUP_ENABLED,
} from "@formbricks/lib/constants";

export const metadata: Metadata = {
  title: "Login",
  description: "Open-source Experience Management. Free & open source.",
};

export default function SignInPage() {
  return (
    <div className="grid min-h-screen w-full bg-gradient-to-tr from-slate-100 to-slate-50 lg:grid-cols-5">
      <div className="col-span-2 hidden lg:flex">
        <Testimonial />
      </div>
      <div className="col-span-3 flex flex-col items-center justify-center">
        <FormWrapper>
          <SigninForm
            publicSignUpEnabled={SIGNUP_ENABLED}
            googleOAuthEnabled={GOOGLE_OAUTH_ENABLED}
            githubOAuthEnabled={GITHUB_OAUTH_ENABLED}
            azureOAuthEnabled={AZURE_OAUTH_ENABLED}
          />
        </FormWrapper>
      </div>
    </div>
  );
}

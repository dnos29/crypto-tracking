import supabase from "@/utils/supabase";
import { SettingsForm } from "./settings.form";
import { currentUser } from "@clerk/nextjs";
import { HeaderPage } from "@/components/header.page";

export default async function Page(){
  const clerkUser = await currentUser();
  // clerkUser?.emailAddresses?.[0]?.emailAddress
  const {data: users, error} = await supabase.from('users').select().eq('userid', clerkUser?.id).limit(1);
  return (
    <>
    <HeaderPage>
      <p className="text-center">
        User settings
      </p>
    </HeaderPage>
    <SettingsForm user={users?.[0]}  />
    </>
  )
}
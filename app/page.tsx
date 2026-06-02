import { redirect } from "next/navigation";
import { getValidSession } from "@/lib/session";

export default async function RootPage() {
  const session = await getValidSession();
  if (!session) {
    redirect("/login");
  }
  if (session.isLoggedIn) {
    redirect("/dashboard");
  } else {
    redirect("/login");
  }
}
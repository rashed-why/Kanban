import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BoardPageView } from "@/components/board/board-page-view";
import { getServerSession } from "@/lib/get-server-session";

type BoardPageProps = {
  params: Promise<{ boardId: string }>;
};

export const metadata: Metadata = {
  title: "Board",
  description: "Kanban board",
};

export default async function BoardPage({ params }: BoardPageProps) {
  const user = await getServerSession();

  if (!user) {
    redirect("/auth/login");
  }

  const { boardId } = await params;

  return <BoardPageView boardId={boardId} userId={user.id} userName={user.name} />;
}

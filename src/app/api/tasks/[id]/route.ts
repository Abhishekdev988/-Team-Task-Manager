import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const role = (session.user as any).role;

    const { status, title, description, assigneeId } = await req.json();

    const existingTask = await prisma.task.findUnique({ where: { id } });
    if (!existingTask) return NextResponse.json({ message: "Not Found" }, { status: 404 });

    // Members can only update status of their assigned tasks
    if (role !== 'ADMIN' && existingTask.assigneeId !== userId) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const updateData: any = {};
    if (status) updateData.status = status;

    // Admins can update everything
    if (role === 'ADMIN') {
      if (title) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (assigneeId !== undefined) updateData.assigneeId = assigneeId;
    }

    const task = await prisma.task.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error('[PUT /api/tasks/[id]] ERROR:', error);
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await prisma.task.delete({ where: { id } });
    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    console.error('[DELETE /api/tasks/[id]] ERROR:', error);
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const role = (session.user as any).role;

  try {
    let projects;
    if (role === 'ADMIN') {
      // Admin sees all projects they own or are member of
      projects = await prisma.project.findMany({
        where: {
          OR: [
            { ownerId: userId },
            { members: { some: { userId } } }
          ]
        },
        include: {
          owner: { select: { name: true, email: true } },
          _count: { select: { tasks: true, members: true } }
        }
      });
    } else {
      projects = await prisma.project.findMany({
        where: {
          members: { some: { userId } }
        },
        include: {
          owner: { select: { name: true, email: true } },
          _count: { select: { tasks: true, members: true } }
        }
      });
    }

    return NextResponse.json(projects);
  } catch (error) {
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ message: "Unauthorized - Admin only" }, { status: 401 });
  }

  const userId = (session.user as any).id;

  try {
    const { name, description, memberIds } = await req.json();

    if (!name) {
      return NextResponse.json({ message: "Project name is required" }, { status: 400 });
    }

    const project = await prisma.project.create({
      data: {
        name,
        description,
        ownerId: userId,
        members: {
          create: [
            { userId }, // Add owner as a member
            ...(memberIds || []).map((id: string) => ({ userId: id }))
          ]
        }
      }
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}

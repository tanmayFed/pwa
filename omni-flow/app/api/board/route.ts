import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET() {
  try {
    // 🔍
    const board = await prisma.board.findFirst({
      include: {
        columns: {
          include: {
            tasks: {
              orderBy: {
                position: "asc",
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    // Handle an empty database state gracefully
    if (!board) {
      return NextResponse.json(
        { error: "No workspace boards found!" },
        { status: 404 },
      );
    }

    //SIMULATE THE CHAOS NETWORK: Forced 1.5-second latency delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    return NextResponse.json(board);
  } catch (error) {
    console.error("🔴 Database connection error during GET /api/board:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  const { id, columnId, position } = await request.json();

  const updatedTask = await prisma.task.update({
    where: { id },
    data: {
      columnId,
      position,
    },
  });

  return NextResponse.json(updatedTask);
}

export async function POST(request: Request) {
  try {
    const { title, content, columnId, position } = await request.json();

    const newTask = await prisma.task.create({
      data: {
        title,
        content: content || "",
        columnId,
        position,
      },
    });

    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();

    await prisma.task.delete({
      where: { id: id },
    });

    return NextResponse.json({
      success: true,
      message: "Task removed cleanly",
    });
  } catch (error) {
    console.error("Database deletion route error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

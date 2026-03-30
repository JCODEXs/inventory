/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { db } from "~/server/db";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: { token: string } }
) {
  const { token } = params;
  const inventory = await db.inventory.findFirst({
    where: {
      publicToken: token,
    },
    include: {
      areas: true,
      items: {
        include: {
          loans: {
            where: { returned: false },
          },
        },
      },
    },
  });

  if (!inventory) {
    return NextResponse.json(
      { error: "Not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    id: inventory.id,
    name: inventory.name,
    areas: inventory.areas,
    items: inventory.items,
  });
}
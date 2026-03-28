import { promises as fs } from "node:fs";
import { NextResponse } from "next/server";
import { getPrototypeFilePath } from "@/lib/prototype-data";

type Params = Promise<{ slug: string; asset: string }>;

export async function GET(_request: Request, context: { params: Params }) {
  const { slug, asset } = await context.params;

  if (asset !== "code" && asset !== "screen") {
    return NextResponse.json({ error: "Asset not found." }, { status: 404 });
  }

  try {
    const filePath = getPrototypeFilePath(slug, asset === "code" ? "code.html" : "screen.png");
    const file = await fs.readFile(filePath);

    if (asset === "code") {
      return new Response(file, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
        },
      });
    }

    return new Response(file, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json({ error: "Prototype file not found." }, { status: 404 });
  }
}

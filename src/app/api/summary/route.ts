import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getPersonaById } from "@/data/personas";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const { conditions, personaId } = await req.json();

    const persona = getPersonaById(personaId);
    if (!persona) {
      return NextResponse.json({ error: "Unknown persona" }, { status: 400 });
    }

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 200,
      system: persona.systemPrompt,
      messages: [
        {
          role: "user",
          content: `Give me the surf report based on these conditions:\n\n${conditions}`,
        },
      ],
    });

    const text =
      message.content[0].type === "text" ? message.content[0].text : "";

    return NextResponse.json({ text });
  } catch (error) {
    console.error("Persona summary error:", error);
    return NextResponse.json(
      { error: "Failed to generate summary" },
      { status: 500 }
    );
  }
}

import { GoogleGenAI, Type } from "@google/genai";
import { NextResponse } from "next/server";
import { isRateLimited, getClientIdentifier } from "@/lib/rate-limit";

export const runtime = "nodejs";

const MODEL = "gemini-2.5-flash";
const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // ~8MB raw, base64 is larger

const SYSTEM_INSTRUCTION = `You extract structured fields from a photo or scan of an academic certificate for CertiProof, a credential verification platform.

Read the document and extract exactly these fields:
- studentName: the credential holder's full name
- studentId: their student/roll/registration number
- institution: the issuing university or organization
- credentialType: the degree, program, or certificate title
- issueDate: the issuance date, normalized to ISO format YYYY-MM-DD if possible

If a field is not legible or not present, return an empty string for it — never guess or fabricate a value.

Also provide a one-sentence "assessment": a plain, honest note on document plausibility (e.g. layout looks like a standard certificate, text appears consistent, or specific concerns like inconsistent fonts/dates). This is a soft signal only, not a fraud verdict — the on-chain hash check is the actual authenticity proof.`;

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    studentName: { type: Type.STRING },
    studentId: { type: Type.STRING },
    institution: { type: Type.STRING },
    credentialType: { type: Type.STRING },
    issueDate: { type: Type.STRING },
    assessment: { type: Type.STRING },
  },
  required: ["studentName", "studentId", "institution", "credentialType", "issueDate", "assessment"],
};

function getClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
}

export async function POST(request: Request) {
  const identifier = getClientIdentifier(request);
  if (isRateLimited(identifier)) {
    return NextResponse.json(
      { error: "Too many document checks right now — please wait a moment and try again." },
      { status: 429, headers: { "Retry-After": "30" } }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { imageBase64, mimeType } = body as { imageBase64?: unknown; mimeType?: unknown };

  if (typeof imageBase64 !== "string" || typeof mimeType !== "string") {
    return NextResponse.json({ error: "Missing image data." }, { status: 400 });
  }
  if (!mimeType.startsWith("image/")) {
    return NextResponse.json({ error: "Only image files are supported." }, { status: 400 });
  }
  if (imageBase64.length > MAX_IMAGE_BYTES * 1.4) {
    return NextResponse.json({ error: "Image is too large (max ~8MB)." }, { status: 413 });
  }

  const client = getClient();
  if (!client) {
    return NextResponse.json(
      {
        error:
          "AI document analysis isn't connected yet. Add GEMINI_API_KEY to .env.local and restart the dev server.",
      },
      { status: 503 }
    );
  }

  try {
    const response = await client.models.generateContent({
      model: MODEL,
      contents: [
        {
          role: "user",
          parts: [
            { inlineData: { mimeType, data: imageBase64 } },
            { text: "Extract the certificate fields from this document." },
          ],
        },
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
        maxOutputTokens: 512,
      },
    });

    const text = response.text;
    if (!text) {
      return NextResponse.json(
        { error: "Couldn't read that document. Try a clearer photo." },
        { status: 502 }
      );
    }

    const parsed = JSON.parse(text) as {
      studentName: string;
      studentId: string;
      institution: string;
      credentialType: string;
      issueDate: string;
      assessment: string;
    };

    return NextResponse.json({
      fields: {
        studentName: parsed.studentName,
        studentId: parsed.studentId,
        institution: parsed.institution,
        credentialType: parsed.credentialType,
        issueDate: parsed.issueDate,
      },
      assessment: parsed.assessment,
    });
  } catch (error) {
    console.error("extract-certificate error:", error);
    return NextResponse.json(
      { error: "AI extraction failed. Check the server logs and your API key." },
      { status: 502 }
    );
  }
}

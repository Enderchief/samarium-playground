import type { Output } from "../types";

export async function post({ request }: { request: Request }) {
  const content = await request.text();

  const res = await fetch(`${import.meta.env.URL}/execute`, {
    method: "POST",
    body: JSON.stringify({
      language: "samarium",
      version: request.headers.get("x-sm-version") || "*",
      files: [
        {
          content,
        },
      ],
    }),
    headers: { "content-type": "application/json" },
  });

  if (!res.ok)
    return new Response(JSON.stringify(await res.json()), {
      status: 400,
    });

  const out = await res.json();

  return new Response(JSON.stringify(out), {
    headers: { "content-type": "application/json" },
  });
}

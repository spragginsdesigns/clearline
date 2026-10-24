import alertsJson from "../../../../data/alerts.json";
import samplesJson from "../../../../data/samples.json";
import substancesJson from "../../../../data/substances.json";

// The open dataset, served as static files at /data/<name>.json.
const FILES: Record<string, unknown> = {
  "samples.json": samplesJson,
  "substances.json": substancesJson,
  "alerts.json": alertsJson,
};

export function generateStaticParams() {
  return Object.keys(FILES).map((file) => ({ file }));
}

export async function GET(_request: Request, ctx: RouteContext<"/data/[file]">) {
  const { file } = await ctx.params;
  if (!(file in FILES)) return new Response("Not found", { status: 404 });
  return Response.json(FILES[file], {
    headers: { "Content-Disposition": `inline; filename="${file}"`, "Access-Control-Allow-Origin": "*" },
  });
}

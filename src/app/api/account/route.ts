

export async function GET() {
  return Response.json(
    { error: "Account functionality is disabled." },
    { status: 404 }
  );
}

export async function PATCH() {
  return Response.json(
    { error: "Account functionality is disabled." },
    { status: 404 }
  );
}
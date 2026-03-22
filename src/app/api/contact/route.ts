import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { name, email, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { message: "Missing fields" },
        { status: 400 }
      );
    }

	if (!process.env.WP_API_KEY) {
      return NextResponse.json(
        { message: "Missing WP_API_KEY on server" },
        { status: 500 }
      );
    }

    // Build URL-encoded body like: form_fields[KEY]=value&id=1792
    const body = new URLSearchParams();
    body.append("id", "1792");
    body.append("form_fields[LbH5NxasXM-2]", email);
    body.append("form_fields[ys0GeZISRs-1]", name);
    body.append("form_fields[yhGx3FOwr2-4]", message);

const response = await fetch(
  "https://www.wpmake.net/wp-json/everest-forms/v1/entry/save",
  {
    method: "POST",
	redirect: "manual",
	headers: {
		"Content-Type": "application/x-www-form-urlencoded",
		"x-api-key": process.env.WP_API_KEY || "",
		"api-key": process.env.WP_API_KEY || "",
	},
    body: body.toString(),
  }
);

    const text = await response.text();

	console.log("Upstream status:", response.status);
    console.log("Upstream body:", text);
    let data: any = null;
    try {
      data = JSON.parse(text);
    } catch {
       data = { raw: text };
    }

    if (!response.ok) {
      return NextResponse.json(
        { message: data?.message || text || "Submission failed" },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("CONTACT ERROR", err);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}

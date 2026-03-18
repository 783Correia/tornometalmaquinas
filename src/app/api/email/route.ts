import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendOrderConfirmation, sendAdminNewOrder, sendPaymentApproved, sendShippingNotification, sendContactMessage } from "@/lib/email/resend";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, data } = body;

    // Contact form is public, other types require authentication
    if (type !== "contact") {
      const authHeader = req.headers.get("cookie") || "";
      const { data: { user } } = await supabase.auth.getUser(
        req.cookies.get("sb-lozduuvplbfiduaigjth-auth-token")?.value
      );

      if (!user) {
        // Allow internal calls (from same origin) by checking referer
        const referer = req.headers.get("referer") || "";
        const origin = req.headers.get("origin") || "";
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://tornometalevertonlopes.com.br";

        if (!referer.startsWith(siteUrl) && !origin.startsWith(siteUrl) && !referer.includes("localhost") && !origin.includes("localhost")) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
      }
    }

    switch (type) {
      case "order_confirmation":
        await Promise.all([
          sendOrderConfirmation(data),
          sendAdminNewOrder(data),
        ]);
        break;
      case "payment_approved":
        await sendPaymentApproved(data);
        break;
      case "shipping":
        await sendShippingNotification(data);
        break;
      case "contact":
        if (!data?.name || !data?.email || !data?.message) {
          return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
        }
        await sendContactMessage(data);
        break;
      default:
        return NextResponse.json({ error: "Invalid email type" }, { status: 400 });
    }

    return NextResponse.json({ sent: true });
  } catch (err) {
    console.error("Email API error:", err);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
